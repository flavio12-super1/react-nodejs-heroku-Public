import React from "react";
import logo from "./logo.svg";
import "./App.css";
import axios from "axios";

function App() {
  function getInfo() {
    axios
      .post("http://localhost:80/getInfo", {
        withCredentials: true,
      })
      .then((res) => {
        alert(res.data);
      });
  }

  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.tsx</code> and save to reload.
        </p>
        Learn React
        <button onClick={getInfo}>get info</button>
      </header>
    </div>
  );
}

export default App;
