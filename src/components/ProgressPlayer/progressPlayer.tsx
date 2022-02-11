import React, { useEffect, useState, useRef, MouseEvent, ReactElement, cloneElement } from "react";

import playIconSvg from "./play.svg";
import pauseIconSvg from "./pause.svg";

type labelPositionEnum = "left" | "middle" | "right";

const labelPositionValueMap: Record<labelPositionEnum, string> = {
  left: "translateX(-100%)",
  middle: "translateX(-50%)",
  right: "translateX(0%)",
};

type marksConfig = {
  percent: number;
  label: string;
  time: number;
  showLabel?: boolean;
  [key: string]: any;
  value?: string | number;
};

interface ProgressPlayer {
  onPlay?: () => void;
  onPause?: () => void;
  onTrigger?: (e: marksConfig | null) => void;
  width?: number | string;
  height?: number | string;
  className?: string;
  showPlayButton?: boolean;
  marks: Array<marksConfig>;
  finishToStart?: boolean;
  distanceAverage?: boolean;
  playIcon?: ReactElement;
  pauseIcon?: ReactElement;
  labelPosition?: labelPositionEnum;
  value?: string | number;
  showTooltip?: boolean;
}

/** ProgressPlayer组件
 * @example
 * ```tsx
 *  const marks = [
 *   {
 *     percent: 0,
 *     label: "报警",
 *     time: 1,
 *     value:0
 *   },
 *   {
 *     percent: 20,
 *     label: "处理",
 *     time: 1,
 *     showLabel: false,
 *     value:1
 *   },
 *   {
 *     percent: 40,
 *     label: "处理",
 *     time: 1,
 *     value:2
 *   },
 *   {
 *     percent: 100,
 *     label: "结束",
 *     time: 1,
 *     value:3
 *   },
 * ];
 *
 * <ProgressPlayer
 *   labelPosition="middle"
 *   distanceAverage
 *   marks={marks}
 *   value={1} //默认选中的值
 *   finishToStart={false}
 *   onTrigger={(config)=>{console.log("config",config)}}
 * />
 * ```
 */
const ProgressPlayer: React.FC<ProgressPlayer> = ({
  width,
  height,
  showPlayButton,
  marks,
  onPlay,
  onPause,
  onTrigger,
  className,
  finishToStart,
  distanceAverage,
  playIcon,
  pauseIcon,
  labelPosition,
  value,
  showTooltip,
}) => {
  const currentKey = useRef<number>(0);
  const timeTimeout = useRef<Array<NodeJS.Timeout>>([]);
  const wrapper = useRef<HTMLDivElement>(null);
  const fill = useRef<HTMLDivElement>(null);
  const slider = useRef<HTMLDivElement>(null);
  const tooltip = useRef<HTMLDivElement>(null);
  const drag = useRef(false);
  const isMouseOver = useRef(false);
  const [playStatus, setPlayStatus] = useState(false);
  const [tooltipText, setTooltipText] = useState("");
  if (distanceAverage) {
    let eachPercent = 100 / (marks.length - 1);
    let n = 0;
    for (let item of marks) {
      item.percent = n * eachPercent;
      n++;
    }
  }

  useEffect(() => {
    slider.current && slider.current.addEventListener("mousedown", mouseDown);
    document.addEventListener("mouseup", mouseUp);
    return () => {
      document.removeEventListener("mouseup", mouseUp);
      slider.current && slider.current.removeEventListener("mousedown", mouseDown);
    };
  }, []);

  useEffect(() => {
    if (showTooltip) {
      wrapper.current && wrapper.current.addEventListener("mouseover", mouseOver);
      wrapper.current && wrapper.current.addEventListener("mouseleave", mouseLeave);
    }
    return () => {
      if (showTooltip) {
        wrapper.current && wrapper.current.removeEventListener("mouseover", mouseOver);
        wrapper.current && wrapper.current.removeEventListener("mouseleave", mouseLeave);
      }
    };
  }, [showTooltip]);

  const mouseUp = () => {
    drag.current = false;
  };
  const mouseDown = () => {
    drag.current = true;
  };

  const mouseOver = () => {
    isMouseOver.current = true;
  };
  const mouseLeave = () => {
    isMouseOver.current = false;
    if (tooltip.current) {
      tooltip.current.style.display = "none";
    }
  };

  useEffect(() => {
    document.addEventListener("mousemove", onMouseMove);
    return () => {
      document.removeEventListener("mousemove", onMouseMove);
    };
  }, [playStatus]);

  const onMouseMove = (e: any, type?: string) => {
    if (drag.current || type === "click" || isMouseOver.current) {
      if (wrapper.current && fill.current && slider.current && tooltip.current) {
        // console.log(e.pageX);
        if (type === "click") {
          fill.current.style.transition = "width 1s";
          slider.current.style.transition = "left 1s";
        } else if (drag.current) {
          fill.current.style.transition = "";
          slider.current.style.transition = "";
        }
        const wrapperLeft = wrapper.current.getBoundingClientRect().left;
        if (e.pageX > wrapperLeft + wrapper.current.offsetWidth) {
          if (drag.current) {
            fill.current.style.width = slider.current.style.left = "100%";
          }
        } else if (e.pageX < wrapperLeft) {
          if (drag.current) {
            fill.current.style.width = slider.current.style.left = "0%";
          }
        }

        for (let i = 0; i < marks.length; i++) {
          let leftBuffer = marks[i - 1] ? ((marks[i].percent - marks[i - 1].percent) / 2) * 0.01 : 0;
          let rightBuffer = marks[i + 1] ? ((marks[i + 1].percent - marks[i].percent) / 2) * 0.01 : 0;
          if (
            e.pageX <= (marks[i].percent * 0.01 + rightBuffer) * wrapper.current.offsetWidth + wrapperLeft &&
            e.pageX >= (marks[i].percent * 0.01 - leftBuffer) * wrapper.current.offsetWidth + wrapperLeft
          ) {
            if (drag.current || type === "click") {
              if (currentKey.current == marks[i].percent) return;
              playStatus && Pause();
              currentKey.current = marks[i].percent;
              clickLabel(marks[i].percent);
            }
            if (isMouseOver.current) {
              setTooltipText(marks[i].label);
              tooltip.current.style.display = "block";
              tooltip.current.style.left = e.pageX - wrapperLeft + "px";
            }
            // changeSelectStyle(-1);
          }
        }
      }
    }
  };

  useEffect(() => {
    return () => {
      timeTimeout.current.map((item) => {
        clearTimeout(item);
      });
      timeTimeout.current = [];
    };
  }, []);

  useEffect(() => {
    const item = marks.find((item) => item.value === value);
    if (item) {
      goToLabel(item.percent);
    }
  }, [value]);

  const Play = () => {
    typeof onPlay === "function" && onPlay();
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
              Pause();
              nextIndex = 0;
              finishToStart && goToLabel(marks[nextIndex].percent); //播放完是否回到起点
              currentKey.current = 0;
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
    typeof onPause === "function" && onPause();
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
      let currentDom = document.getElementById(`progress_player_label-${item.percent}`);
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
        typeof onTrigger === "function" && onTrigger(item);
        goToLabel(percent);
      }
    }
  };

  const renderLabel = (marks: Array<marksConfig>) => {
    let list = [];
    for (let item of marks) {
      if (item.showLabel === false) continue;
      let label = (
        <div
          className="progress_player_unselect"
          id={`progress_player_label-${item.percent}`}
          key={`progress_player_label-${item.percent}`}
          onClick={(e) => {
            playStatus && Pause();
            currentKey.current = item.percent;
            clickLabel(item.percent, e);
          }}
          style={{ left: `${item.percent}%`, transform: labelPosition && labelPositionValueMap[labelPosition] }}
        >
          {/* <i className="progress_player_label_divider" /> */}
          <div className="progress_player_label_item">{item.label}</div>
        </div>
      );
      list.push(label);
    }
    return list;
  };
  return (
    <div className={`progress_player_content ${className || ""}`} style={{ height: height, width: width }} id="player_content">
      {showPlayButton && (
        <div id="progress_player_icon_box" className="progress_player_icon_box">
          {playStatus ? (
            <>
              {pauseIcon ? (
                cloneElement(pauseIcon, { onClick: () => Pause() })
              ) : (
                <img
                  className="progress_player_icon_pause"
                  src={pauseIconSvg}
                  onClick={() => {
                    Pause();
                  }}
                  alt="pause"
                />
              )}
            </>
          ) : (
            <>
              {playIcon ? (
                cloneElement(playIcon, { onClick: () => Play() })
              ) : (
                <img
                  className="progress_player_icon_play"
                  src={playIconSvg}
                  onClick={() => {
                    Play();
                  }}
                  alt="play"
                />
              )}
            </>
          )}
        </div>
      )}
      <div className="progress_player_wrapper_box">
        <div ref={wrapper} className="progress_player_wrapper" onClick={(e) => onMouseMove(e, "click")}>
          <div ref={fill} className="progress_player_fill"></div>
          <div ref={slider} className="progress_player_slider"></div>
          <div className="progress_player_label_box">{renderLabel(marks)}</div>
          <div ref={tooltip} className="progress_player_tooltip_box">
            {tooltipText}
          </div>
        </div>
      </div>
    </div>
  );
};

ProgressPlayer.defaultProps = {
  width: "800px",
  height: 65,
  showPlayButton: true,
  finishToStart: true,
  distanceAverage: false,
  labelPosition: "middle",
  showTooltip: false,
};
export default ProgressPlayer;
