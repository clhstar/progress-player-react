import React, { useEffect, useState, useRef, MouseEvent } from "react";

import playIcon from "./play.svg";
import pauseIcon from "./pause.svg";

type marksConfig = {
  percent: number;
  label: string;
  onSelect?: () => void;
  time: number;
};

interface ProgressPlayer {
  onPlay?: () => void;
  onPause?: () => void;
  width?: number | string;
  showPlayButton?: boolean;
  marks: Array<marksConfig>;
  finishToStart?: boolean;
  distanceAverage?: boolean;
}

const ProgressPlayer: React.FC<ProgressPlayer> = ({ width, showPlayButton, marks, onPlay, onPause, finishToStart, distanceAverage }) => {
  const currentKey = useRef<number>(0);
  const timeTimeout = useRef<Array<NodeJS.Timeout>>([]);
  const wrapper = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const [playStatus, setPlayStatus] = useState(false);

  if (distanceAverage) {
    let eachPercent = 100 / (marks.length - 1);
    let n = 0;
    for (let item of marks) {
      item.percent = n * eachPercent;
      n++;
    }
  }

  useEffect(() => {
    let player_content = document.getElementById("player_content");
    let icon_box = document.getElementById("icon_box");
    if (player_content && wrapper.current && icon_box) {
      if (typeof width === "number") {
        player_content.style.width = width + "px";
        wrapper.current.style.width = `calc(100% - ${icon_box.offsetWidth}px`;
      } else if (typeof width === "string") {
        player_content.style.width = width;
        wrapper.current.style.width = `calc(100% - ${icon_box.offsetWidth}px`;
      }
    }
    // console.log('playStatus', playStatus);
    slider.current && slider.current.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);
    return () => {
      document.removeEventListener("mouseup", mouseUp);
      slider.current && slider.current.removeEventListener("mousedown", mouseDown);
    };
  }, []);
  const mouseUp = () => {
    drag.current = false;
  };
  const mouseDown = () => {
    drag.current = true;
  };

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [playStatus]);

  const onMouseMove = (e: any, type?: string) => {
    if (drag.current || type === "click") {
      if (wrapper.current && fill.current && slider.current) {
        // console.log(e.pageX);
        if (type === "click") {
          fill.current.style.transition = "width 1s";
          slider.current.style.transition = "left 1s";
        } else {
          fill.current.style.transition = "";
          slider.current.style.transition = "";
        }
        if (e.pageX > wrapper.current.offsetLeft + wrapper.current.offsetWidth) {
          fill.current.style.width = slider.current.style.left = "100%";
        } else if (e.pageX < wrapper.current.offsetLeft) {
          fill.current.style.width = slider.current.style.left = "0%";
        }
        for (let item of marks) {
          if (
            e.pageX <= (item.percent * 0.01 + 0.05) * wrapper.current.offsetWidth + wrapper.current.offsetLeft &&
            e.pageX >= (item.percent * 0.01 - 0.05) * wrapper.current.offsetWidth + wrapper.current.offsetLeft
          ) {
            if (currentKey.current == item.percent) return;
            goToLabel(item.percent);
            changeSelectStyle(-1);
            playStatus && Pause();
            currentKey.current = item.percent;
          }
        }
        // else {
        //   slider.current.style.left =
        //     e.pageX -
        //     wrapper.current.offsetLeft -
        //     slider.current.offsetWidth / 2 +
        //     'px';
        //   fill.current.style.width = e.pageX - wrapper.current.offsetLeft + 'px';
        // }
      }
    }
  };

  useEffect(() => {
    return () => {
      console.log("结束定时器");
      timeTimeout.current.map((item) => {
        clearTimeout(item);
      });
      timeTimeout.current = [];
    };
  }, []);

  const Play = () => {
    console.log("播放");
    onPlay && onPlay();
    setPlayStatus(true);
    let currentTotalTimes = 0;
    clickLabel(currentKey.current);
    for (let item of marks) {
      if (item.percent >= currentKey.current) {
        currentTotalTimes += item.time;
        timeTimeout.current.push(
          setTimeout(() => {
            let nextIndex = marks.indexOf(item) + 1;
            if (nextIndex > marks.length - 1) {
              nextIndex = 0;
              finishToStart && goToLabel(marks[nextIndex].percent); //播放完是否回到起点
              currentKey.current = 0;
              setPlayStatus(false);
              changeSelectStyle(-1);
            } else {
              currentKey.current = marks[nextIndex].percent;
              clickLabel(marks[nextIndex].percent);
            }
          }, currentTotalTimes * 1000)
        );
      }
    }
  };

  const Pause = () => {
    console.log("暂停");
    onPause && onPause();
    setPlayStatus(false);
    timeTimeout.current.map((item) => {
      clearTimeout(item);
    });
    timeTimeout.current = [];
  };

  const goToLabel = (key: number) => {
    if (slider.current && fill.current) {
      slider.current.style.transition = "left 0.5s";
      fill.current.style.transition = "width 0.5s";
      slider.current.style.left = fill.current.style.width = key + "%";
    }
  };

  const changeSelectStyle = (current: number) => {
    for (let item of marks) {
      let currentDom = document.getElementById(`${item.percent}`);
      if (item.percent == current) {
        currentDom && (currentDom.className = "progress_player_select");
      } else {
        currentDom && (currentDom.className = "progress_player_unselect");
      }
    }
  };

  const clickLabel = (percent: number, e?: MouseEvent) => {
    e && e.stopPropagation();
    changeSelectStyle(percent);
    for (let item of marks) {
      if (item.percent === percent) {
        item.onSelect && item.onSelect();
        goToLabel(percent);
      }
    }
  };

  const renderLabel = (marks: Array<marksConfig>) => {
    let list = [];
    for (let item of marks) {
      let label = (
        <span
          className="progress_player_unselect"
          id={`${item.percent}`}
          key={item.percent}
          onClick={(e) => {
            currentKey.current = item.percent;
            clickLabel(item.percent, e);
            playStatus && Pause();
          }}
          style={{ left: `${item.percent}%` }}
        >
          {item.label}
        </span>
      );
      list.push(label);
    }
    return list;
  };
  return (
    <div className="progress_player_content" id="player_content">
      <div id="icon_box" className="progress_player_icon_box">
        {showPlayButton &&
          (playStatus ? (
            <img
              className="progress_player_icon_pause"
              src={pauseIcon}
              onClick={() => {
                Pause();
              }}
              alt="pause"
            />
          ) : (
            <img
              className="progress_player_icon_play"
              src={playIcon}
              onClick={() => {
                Play();
              }}
              alt="play"
            />
          ))}
      </div>
      <div ref={wrapper} className="progress_player_wrapper" onClick={(e) => onMouseMove(e, "click")}>
        <div ref={fill} className="progress_player_fill"></div>
        <div ref={slider} className="progress_player_slider"></div>
        <div className="progress_player_label_box">{renderLabel(marks)}</div>
      </div>
    </div>
  );
};

ProgressPlayer.defaultProps = {
  width: "800px",
  showPlayButton: true,
  finishToStart: true,
  distanceAverage: false,
};
export default ProgressPlayer;
