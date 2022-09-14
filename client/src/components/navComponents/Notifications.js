import React, { useContext, useEffect, useState } from "react";
import "./styles/Notifications.css";
import io from "socket.io-client";
import { UserContext } from "../Lurker";
import SocketContext from "../SocketContext";

function Notifications(props) {
  const socket = useContext(SocketContext);
  const userData = useContext(UserContext);
  const {
    notifications,
    denyRequest,
    acceptRequest,
    emitRequest,
    outGoingNotifications,
    cancelRequest,
  } = userData;

  function SendRequest() {
    const [username, setUsername] = useState("");

    return (
      <div>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <button
          onClick={() => {
            setUsername("");
            emitRequest(username);
          }}
        >
          send
        </button>
      </div>
    );
  }

  const renderNotifications = () => {
    return notifications.map((data, index) => (
      <div key={index} className="notificationsIndividualDivs">
        <div className="btn">{data.username}</div>
        <button
          className="btn"
          onClick={() => acceptRequest(data.username, data.userID)}
        >
          accept
        </button>
        <button
          className="btn"
          onClick={() => denyRequest(data.username, data.userID)}
        >
          deny
        </button>
      </div>
    ));
  };

  const renderOutgoingNotifications = () => {
    return outGoingNotifications.map((username, index) => (
      <div key={index} className="notificationsIndividualDivs">
        <div className="btn">{username}</div>
        <button className="btn" onClick={() => cancelRequest(username)}>
          cancel
        </button>
      </div>
    ));
  };

  const [tab, setTab] = useState("tab0");

  return (
    <div id="notificationsDiv">
      <div id="outerDiv1">
        <div id="friendsIcon" className="btn">
          Friends
        </div>
        <div id="buttonDiv1">
          <div className="btn">
            <button onClick={() => setTab("tab1")}>pending</button>
          </div>
          <div className="btn">
            <button onClick={() => setTab("tab2")}>add friend</button>
          </div>
        </div>
      </div>
      {tab == "tab0" ? (
        <div className="tabDiv">
          <span>
            Press friend button to add a new friend or pending to accept one
          </span>
        </div>
      ) : tab == "tab1" ? (
        <div className="tabDiv">
          {notifications.length == 0 ? (
            <div className="innerNotificationsDiv">
              <span>you have 0 pending requests</span>
            </div>
          ) : (
            <div className="innerNotificationsDiv">
              <div>incoming requests: </div>
              <div>{renderNotifications().reverse()}</div>
            </div>
          )}
          {outGoingNotifications.length == 0 ? (
            <div className="innerNotificationsDiv">
              <span>you have 0 pending requests</span>
            </div>
          ) : (
            <div className="innerNotificationsDiv">
              <div>outgoing requests: </div>
              <div>{renderOutgoingNotifications().reverse()}</div>
            </div>
          )}
        </div>
      ) : (
        <div className="tabDiv">
          <div>
            <span>Enter username to send a friend request</span>
          </div>
          <div id="addFriendDiv">
            <SendRequest />
          </div>
        </div>
      )}
    </div>
  );
}

export default Notifications;
