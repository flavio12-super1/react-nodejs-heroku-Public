import React, { useEffect } from "react";
import "./styles/App.css";
import Chat from "./components/navComponents/Chat";
import Explore from "./components/navComponents/Explore";
import Market from "./components/navComponents/Market";
import Notifications from "./components/navComponents/Notifications";
import Servers from "./components/navComponents/Servers";
import Settings from "./components/navComponents/Settings";

import Home from "./components/Home";
import Lurker from "./components/Lurker";

import Error from "./components/Error";
import TempHome from "./components/TempHome";

import SocketContext from "./components/SocketContext";
import * as io from "socket.io-client";

import { Routes, Route } from "react-router-dom";

//docs.google.com/document/d/1wHyHjqZIPTr8vkmKXYiMbnNqHJdCe8EQ0mkBzN0kg-g/edit

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

  return (
    <div className="App">
      <SocketContext.Provider value={socket}>
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
            path="/lurker/servers"
            element={<Lurker page={<Servers />} />}
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
