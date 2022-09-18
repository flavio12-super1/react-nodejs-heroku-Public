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
import * as io from "socket.io-client";

import { Routes, Route } from "react-router-dom";

//docs.google.com/document/d/1wHyHjqZIPTr8vkmKXYiMbnNqHJdCe8EQ0mkBzN0kg-g/edit
//https://www.youtube.com/watch?v=NbgJgmabjQI

function App() {
  const socket = io.connect();

  useEffect(() => {
    socket.on("connect", () => {
      console.log("socket is connected");
    });
    return () => {
      socket.disconnect();
    };
  }, []);

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
          <Route path="/register" element={<Home state={true} />} />
          <Route path="/login" element={<Home state={false} />} />
          <Route path="/Lurker" element={<Lurker />} />

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
