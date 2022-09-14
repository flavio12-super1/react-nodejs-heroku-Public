import React, { useContext, useEffect, useState } from "react";
import Nav from "./Nav";
import "../styles/Lurker.css";
import axios from "axios";
import SocketContext from "./SocketContext";
import { createContext } from "react";
export const UserContext = createContext();
const myUsername = localStorage.getItem("username");
const userID = localStorage.getItem("user_id");

function Lurker(props) {
  function logOut() {
    axios
      .post("https://react-nodejs-heroku-public.herokuapp.com/logout", {
        withCredentials: true,
      })
      .then((res) => {
        if (res.data.msg == "error") {
          console.log("there was an error logging out");
        } else if (res.data.msg == "pass") {
          localStorage.setItem("status", "offline");
          window.location.href =
            "https://react-nodejs-heroku-public.herokuapp.com/";
        }
      });
  }

  const socket = useContext(SocketContext);
  const [notifications, setNotifications] = useState(Array());
  const [outGoingNotifications, setOutGoingNotifications] = useState(Array());
  const [friendsList, setFriendsList] = useState(Array());

  useEffect(() => {
    socket.on("private message", (message, userID) => {
      console.log(message);
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
    function addFriend(myUsername, username, userID) {
      axios({
        method: "POST",
        data: {
          myUsername: myUsername,
          username: username,
          userID: userID,
        },
        withCredentials: true,
        url: "https://react-nodejs-heroku-public.herokuapp.com/addFriend",
      }).then((res) => {
        if (res.data.msg == "error") {
          console.log("there was an error adding friend to friendsList");
        } else if (res.data.msg == "pass") {
          console.log("new friend added to friendsList");
        } else {
          console.log("page crashed");
        }
      });
    }
    socket.on("friendRequestAccepted", (username, userID) => {
      const data = {
        username: username,
        userID: userID,
      };
      let filteredArray = outGoingNotifications.filter(
        (item) => item.message !== username
      );
      setOutGoingNotifications(filteredArray);
      addFriend(myUsername, username, userID);
      setFriendsList((friendsList) => [data, ...friendsList]);
    });
    socket.on("friendRequestDenied", (username) => {
      let filteredArray = outGoingNotifications.filter(
        (item) => item.message !== username
      );
      setOutGoingNotifications(filteredArray);

      alert("friend request was denied");
    });
    socket.on("friendRoomId", (username, userID) => {
      const data = {
        username: username,
        userID: userID,
      };
      addFriend(myUsername, username, userID);
      setFriendsList((friendsList) => [data, ...friendsList]);
    });
    axios({
      method: "POST",
      data: {
        username: myUsername,
      },
      withCredentials: true,
      url: "https://react-nodejs-heroku-public.herokuapp.com/getFriendsList",
    }).then((res) => {
      if (res.data.msg == "error") {
        console.log("there was an error getting friendsList");
      } else if (res.data.msg == "pass") {
        setNotifications(res.data.notifications);
        setOutGoingNotifications(res.data.outGoingNotifications);
        setFriendsList(res.data.friendsList);
        console.log(res.data);
      } else {
        console.log("page crashed");
      }
    });
  }, []);

  const outerDiv = {
    display: "flex",
  };
  const innerDiv = {
    backgroundColor: "#464646",
    width: " -webkit-fill-available",
    color: "white",
    padding: "5px",
  };
  console.log(myUsername);

  function denyRequest(username, userID) {
    socket.emit("denyRequest", username, myUsername, userID);
    let filteredArray = notifications.filter(
      (item) => item.username !== username
    );
    setNotifications(filteredArray);
    alert("friend request denied");
  }

  function acceptRequest(username, userID) {
    socket.emit("acceptRequest", username, myUsername, userID);
    let filteredArray = notifications.filter(
      (item) => item.username !== username
    );
    setNotifications(filteredArray);
  }
  function emitRequest(username) {
    socket.emit("sendRequest", username, myUsername, userID);
    setOutGoingNotifications((outGoingNotifications) => [
      username,
      ...outGoingNotifications,
    ]);
    //here
    alert("you made a request");
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
      <div style={outerDiv}>
        <div id="navDiv">
          <Nav />
          <button id="logOutBtn" onClick={logOut}>
            log out
          </button>
        </div>

        <UserContext.Provider
          value={{
            notifications,
            denyRequest,
            acceptRequest,
            friendsList,
            emitRequest,
            outGoingNotifications,
            cancelRequest,
          }}
        >
          <div id="innerDivLurker">{props.page}</div>
        </UserContext.Provider>
      </div>
    </div>
  );
}

export default Lurker;
