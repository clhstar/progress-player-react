## progress-player 组件

progress-player 使用 React Hooks 和 typescript 开发 实现时间进度播放功能

### 安装

```javascript
npm install progress-player --save
```

### React 版本兼容

```javascript
    "react": ">=16.8.0",
    "react-dom": ">=16.8.0"
```

### 使用

```javascript
// 加载样式
import "progress-player/dist/main.css";
// 引入组件
import { ProgressPlayer } from "progress-player";

const marks = [
  {
    percent: 0,
    label: "报警",
    onSelect: (e) => {
      console.log(e);
      console.log("报警");
    },
    time: 2,
  },
  {
    percent: 30,
    label: "处理",
    onSelect: () => {
      console.log("处理");
    },
    time: 0,
  },
  {
    percent: 60,
    label: "扑救",
    onSelect: () => {
      console.log("扑救");
    },
    time: 4,
  },
  {
    percent: 100,
    label: "结束",
    onSelect: () => {
      console.log("结束");
    },
    time: 3,
  },
];

<ProgressPlayer marks={marks} />;
```

Api

| 参数            | 说明               |       类型       | 默认值 |
| --------------- | ------------------ | :--------------: | :----: |
| marks           | 见下表             |      object      |   无   |
| width           | 宽                 | string or number | 800px  |
| height          | 高                 | string or number |  80px  |
| className       | 类名               |      string      |   无   |
| finishToStart   | 结束时是否回到起点 |     Boolean      |  true  |
| onPlay          | 播放时调用         |     function     |   无   |
| onPause         | 停止时调用         |     function     |   无   |
| onTrigger       | 选中时的回调       |   function (e)   |   无   |
| distanceAverage | 是否平均分         |     boolean      | false  |
| playIcon        | 播放图标           |   reactElement   |   无   |
| pauseIcon       | 暂停图标           |   reactElement   |   无   |
| showPlayButton  | 是否显示播放按钮   |     boolean      |  true  |

marks

| 参数         | 说明           |        类型        |
| ------------ | -------------- | :----------------: |
| percent      | 必须为`number` |       number       |
| label        | 下标名称       |       string       |
| time         | 时间(单位 s)   |       number       |
| onSelect     | 被选中时调用   | function:(e)=>void |
| [自定义名称] | 额外自定义属性 |         无         |

### 一些本地开发命令

```bash
//启动本地环境
npm run start

//build可发布静态文件
npm run build

//发布到 npm
npm run publish
```
