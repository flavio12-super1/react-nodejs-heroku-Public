import React, { useContext, useEffect, useState } from "react";
import Nav from "./Nav";
import "../styles/Lurker.css";
import axios from "axios";
import SocketContext from "./SocketContext";
import { createContext } from "react";
export const UserContext = createContext();
const myUsername = localStorage.getItem("username");
const postsId = localStorage.getItem("postsId");
const userID = localStorage.getItem("user_id");

function Lurker(props) {
  const userData = useContext(SocketContext);
  const { socket, uri } = userData;
  const [notifications, setNotifications] = useState([]);
  const [outGoingNotifications, setOutGoingNotifications] = useState([]);
  const [friendsList, setFriendsList] = useState([]);
  const [serversList, setServersList] = useState([]);

  function logOut() {
    axios
      .post(`${uri}/logout`, {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.msg === "error") {
          console.log("there was an error logging out");
        } else if (res.data.msg === "pass") {
          localStorage.setItem("status", "offline");
          window.location.href = `${uri}`;
        }
      });
  }

  useEffect(() => {
    socket.on("friendRequest", (message, userID) => {
      console.log("friend request from: " + message);
      const data = {
        username: message,
        userID: userID,
      };
      setNotifications((notifications) => [data, ...notifications]);
    });

    socket.on("friendRequestCancel", (username) => {
      let filteredArray = notifications.filter(
        (item) => item.message !== username
      );
      setNotifications(filteredArray);
    });

    function addFriend(myUsername, username, userID, postsId) {
      axios({
        method: "POST",
        data: {
          myUsername: myUsername,
          username: username,
          userID: userID,
          postsId: postsId,
        },
        withCredentials: true,
        url: `${uri}/addFriend`,
      }).then((res) => {
        if (res.data.msg === "error") {
          console.log("there was an error adding friend to friendsList");
        } else if (res.data.msg === "pass") {
          console.log("new friend added to friendsList");
        } else {
          console.log("page crashed");
        }
      });
    }

    socket.on("friendRequestAccepted", (username, userID, postsId) => {
      const data = {
        username: username,
        userID: userID,
        postsId: postsId,
      };
      let filteredArray = outGoingNotifications.filter(
        (item) => item.message !== username
      );
      setOutGoingNotifications(filteredArray);
      addFriend(myUsername, username, userID, postsId);
      setFriendsList((friendsList) => [data, ...friendsList]);
    });

    socket.on("friendRequestDenied", (username) => {
      let filteredArray = outGoingNotifications.filter(
        (item) => item.message !== username
      );
      setOutGoingNotifications(filteredArray);

      console.log("friend request was denied");
    });

    socket.on("friendRoomId", (username, userID, postsId) => {
      const data = {
        username: username,
        userID: userID,
        postsId: postsId,
      };
      addFriend(myUsername, username, userID, postsId);
      setFriendsList((friendsList) => [data, ...friendsList]);
    });

    axios({
      method: "POST",
      data: {
        username: myUsername,
      },
      withCredentials: true,
      url: `${uri}/getUserData`,
    }).then((res) => {
      if (res.data.msg === "error") {
        console.log("there was an error getting friendsList");
      } else if (res.data.msg === "pass") {
        setNotifications(res.data.notifications);
        setOutGoingNotifications(res.data.outGoingNotifications);
        setFriendsList(res.data.friendsList);
        setServersList(res.data.serversList);
        console.log(res.data);
      } else {
        console.log("page crashed");
      }
    });
    socket.on("requestUpdate", (username, data) => {
      if (data.emitEvent) {
        alert(`friend request to ${username} was successfull`);
        setOutGoingNotifications((outGoingNotifications) => [
          username,
          ...outGoingNotifications,
        ]);
      } else {
        alert(`the username ${username} does not exist`);
      }
    });
  }, []);

  function updateServerList(data) {
    setServersList(data);
  }

  function denyRequest(username, userID) {
    socket.emit("denyRequest", username, myUsername, userID);
    let filteredArray = notifications.filter(
      (item) => item.username !== username
    );
    setNotifications(filteredArray);
    alert("friend request denied");
  }

  function acceptRequest(username, userID) {
    socket.emit("acceptRequest", username, myUsername, userID, postsId);
    let filteredArray = notifications.filter(
      (item) => item.username !== username
    );
    setNotifications(filteredArray);
  }

  function emitRequest(username) {
    socket.emit("sendRequest", username, myUsername, userID);
  }

  function cancelRequest(username) {
    socket.emit("cancelRequest", username, myUsername);
    let filteredArray = outGoingNotifications.filter(
      (item) => item !== username
    );
    setOutGoingNotifications(filteredArray);

    alert("request cancled");
  }

  return (
    <div>
      <div id="outerDiv">
        <UserContext.Provider
          value={{
            myUsername,
            userID,
            postsId,
            notifications,
            serversList,
            updateServerList,
            denyRequest,
            acceptRequest,
            friendsList,
            emitRequest,
            outGoingNotifications,

            cancelRequest,
            socket,
            uri,
          }}
        >
          <div id="navDiv">
            <Nav />
            <button id="logOutBtn" onClick={logOut}>
              log out
            </button>
          </div>
          <div id="innerDivLurker">{props.page}</div>
        </UserContext.Provider>
      </div>
    </div>
  );
}

export default Lurker;
