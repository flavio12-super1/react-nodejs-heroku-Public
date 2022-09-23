import React, { useEffect } from "react";
import "./styles/App.css";
import Chat from "./components/navComponents/Chat";
import Explore from "./components/navComponents/Explore";
import Market from "./components/navComponents/Market";
import Notifications from "./components/navComponents/Notifications";
import Settings from "./components/navComponents/Settings";

import Home from "./components/Home";
import Lurker from "./components/Lurker";

import Error from "./components/Error";
import TempHome from "./components/TempHome";

import SocketContext from "./components/SocketContext";
import io from "socket.io-client";

import { Routes, Route } from "react-router-dom";
import Register from "./components/Register";
import Login from "./components/Login";
import Homepage from "./components/navComponents/Homepage";

//docs.google.com/document/d/1wHyHjqZIPTr8vkmKXYiMbnNqHJdCe8EQ0mkBzN0kg-g/edit
//https://www.youtube.com/watch?v=NbgJgmabjQI

const socket = io();

function App() {
  //initialize socket.io
  useEffect(() => {
    socket.on("connect", () => {
      console.log("socket is connected");
    });
    socket.on("disconnect", (reason) => {
      console.log("socket is disconnected: " + reason);
    });
    socket.on("connect_error", (err) => {
      console.log(`connect_error due to ${err.message}`);
    });
    return () => {
      socket.off("connect");
      socket.off("disconnect");
    };
  }, []);
  //check for url
  var currentUrl = window.location.href;
  var partStr = currentUrl.slice(0, 5);
  var uri = "";
  if (partStr === "https") {
    uri = "https://react-nodejs-heroku-public.herokuapp.com";
  } else {
    uri = "http://localhost:8000";
  }
  console.log(uri);

  return (
    <div className="App">
      <SocketContext.Provider value={{ socket, uri }}>
        <Routes>
          <Route path="*" element={<Error />} />
          <Route path="/" element={<TempHome />} />
          <Route path="/register" element={<Home page={<Register />} />} />
          <Route path="/login" element={<Home page={<Login />} />} />
          <Route path="/lurker" element={<Lurker page={<Homepage />} />} />

          <Route path="/lurker/messages" element={<Lurker page={<Chat />} />} />
          <Route
            path="/lurker/messages/:id"
            element={<Lurker page={<Chat />} />}
          />
          <Route
            path="/lurker/explore"
            element={<Lurker page={<Explore />} />}
          />
          <Route
            path="/lurker/notifications"
            element={<Lurker page={<Notifications />} />}
          />
          <Route path="/lurker/market" element={<Lurker page={<Market />} />} />
          <Route
            path="/lurker/settings"
            element={<Lurker page={<Settings />} />}
          />
        </Routes>
      </SocketContext.Provider>
    </div>
  );
}

export default App;
