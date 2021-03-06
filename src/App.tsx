import React from "react";
import logo from "./logo.svg";
import "./App.css";
import { ProgressPlayer } from "./main";
import "./components/main.scss";
function App() {
  const marks = [
    {
      percent: 0,
      label: "报警",
      time: 0.5,
      value: 0,
    },
    {
      percent: 10,
      label: "处理",
      time: 0.5,
      showLabel: false,
      value: 1,
    },
    {
      percent: 10,
      label: "处理",
      time: 0.5,
      value: 2,
    },
    {
      percent: 60,
      label: "扑救",
      time: 0.5,
      value: 3,
    },
    {
      percent: 100,
      label: "结束",
      time: 0.5,
      value: 4,
    },
  ];
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
          Learn React
        </a>
      </header>
      <ProgressPlayer value={4} labelPosition="middle" distanceAverage marks={marks} />
    </div>
  );
}

export default App;
