import React, { useEffect, useContext, useState } from "react";
import "../../styles/Chat.css";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import SlateInput from "./SlateInput";
import { UserContext } from "../Lurker";
import SocketContext from "../SocketContext";
import axios from "axios";

function Chat(props) {
  let { id } = useParams();
  id ??= "";
  let navigate = useNavigate();

  const [room, setRoom] = useState({ room: id });
  const [chat, setChat] = useState(Array());
  const [image, setImage] = useState([]);

  const username = localStorage.getItem("username");
  const socket = useContext(SocketContext);
  const userData = useContext(UserContext);
  const { friendsList } = userData;

  // function getMessages(roomID) {
  //   axios({
  //     method: "POST",
  //     data: {
  //       roomID: roomID,
  //     },
  //     withCredentials: true,
  //     url: "https://react-nodejs-heroku-public.herokuapp.com/getMessages",
  //   })
  //     .then((res) => {
  //       console.log(res.data.data);
  //       setChat(res.data.data);
  //     })
  //     .catch((err) => console.log(err));
  // }

  useEffect(() => {
    if (room != null) {
      socket.emit("joinRoom", room);
      console.log("joined: " + room.room + " successfuly");
      setChat([]);
      navigate("/lurker/messages/" + room.room);
      axios({
        method: "POST",
        data: {
          roomID: room.room,
        },
        withCredentials: true,
        url: "https://react-nodejs-heroku-public.herokuapp.com/getMessages",
      })
        .then((res) => {
          console.log(res.data.data);
          setChat(res.data.data);
        })
        .catch((err) => console.log(err));
    }
  }, [room]);

  useEffect(() => {
    socket.on("message", (data) => {
      setChat((chat) => [...chat, data]);
      console.log(
        "message returned: " + data.message + " images returned: " + data.images
      );
    });
    // getMessages(room.room);
  }, []);

  function joinRoom(e) {
    setRoom({ room: e.target.id });
    // getMessages(e.target.id);
  }

  function updateRoom(e, myCallback) {
    socket.emit("leaveRoom", room);
    console.log("left: " + room.room);
    myCallback(e);
  }

  const onMessageSubmit = (messages) => {
    const data = {
      name: username,
      message: messages,
      images: image,
      room: room.room,
    };
    socket.emit("message", data);
    console.log(
      "message sent: " +
        data.message +
        " images sent: " +
        data.images +
        " to room: " +
        data.room
    );
    setImage([]);
  };

  const parseMessage = (myMessage) => {
    myMessage = JSON.stringify(myMessage.children[0].text);

    return JSON.parse(myMessage);
  };

  const renderChatMessages = (allMsg) => {
    return allMsg.map((msg, index) => (
      <div key={index}>
        <div>
          <div className="messageOuterDiv">
            <div className="messageDiv">{parseMessage(msg)}</div>
          </div>
        </div>
      </div>
    ));
  };

  const renderDataImg = (allImg) => {
    return allImg.map((img, index) => (
      <div key={index}>
        <img src={img} className="myImage" alt="" />
      </div>
    ));
  };

  const renderChat = () => {
    return chat.map((data, index) => (
      <div key={index}>
        <div>
          <div className="username">{data.name}: </div>
          <div>{renderChatMessages(data.message)}</div>
          <div>{renderDataImg(data.images)}</div>
        </div>
      </div>
    ));
  };

  const DirectMessages = () => {
    return (
      <div className="roomDiv">
        <button id="room1" onClick={(e) => updateRoom(e, joinRoom)}>
          room 1
        </button>
        <button id="room2" onClick={(e) => updateRoom(e, joinRoom)}>
          room 2
        </button>
        <button id="room3" onClick={(e) => updateRoom(e, joinRoom)}>
          room 3
        </button>
      </div>
    );
  };
  const friendsMap = () => {
    return friendsList.map((data, index) => (
      <div key={index}>
        <button id={data.userID} onClick={(e) => updateRoom(e, joinRoom)}>
          {data.username}
        </button>
      </div>
    ));
  };
  const DirectMessagesFriends = () => {
    if (friendsList.length == 0) {
      return (
        <div className="roomDiv">
          <span>you have 0 friends : (</span>
        </div>
      );
    } else {
      return <div className="roomDiv">{friendsMap()}</div>;
    }
  };

  //code for uploading an image
  //start

  //update array
  const imagePreview = (dataURL) => {
    console.log(dataURL);
    setImage((image) => [dataURL, ...image]);
  };

  //copy screen shot in
  function handlePaste(event) {
    let index;
    var items = (event.clipboardData || event.originalEvent.clipboardData)
      .items;
    for (index in items) {
      var item = items[index];
      if (item.kind === "file") {
        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = function (event) {
          let imgURL = event.target.result;
          imagePreview(imgURL);
        };

        reader.readAsDataURL(blob);
      }
    }
  }

  //upload from internet ... inbeded drag from internet

  function preventDefault(event) {
    event.preventDefault();
    event.stopPropagation();
  }

  function imageHandler(e) {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.readyState === 2) {
        imagePreview(reader.result);
        e.target.value = "";
      }
    };
    reader.readAsDataURL(e.target.files[0]);
  }

  function handleDrop(e) {
    var dt = e.dataTransfer,
      files = dt.files;

    // drag and drop from the interent if not from finder
    if (files.length === 0) {
      var imageUrl = e.dataTransfer.getData("text/html");
      var rex = /src="?([^"\s]+)"?\s*/;
      var url;
      url = rex.exec(imageUrl);
      imagePreview(url[1]);
    } else {
      handleFiles(files);
    }
  }

  function handleFiles(files) {
    for (var i = 0, len = files.length; i < len; i++) {
      if (validateImage(files[i])) previewAnduploadImage(files[i]);
    }
  }

  function validateImage(image) {
    var validTypes = ["image/jpeg", "image/png", "image/gif"];
    if (validTypes.indexOf(image.type) === -1) {
      alert("Invalid File Type");
      return false;
    }

    return true;
  }

  function previewAnduploadImage(image) {
    let reader = new FileReader();
    reader.onload = function (e) {
      let dataURL = e.target.result;
      imagePreview(dataURL);
    };
    reader.readAsDataURL(image);
  }

  // render images from array
  const renderImages = () => {
    return image.map((dataURL, index) => (
      <div key={index}>
        <img src={dataURL} className="myImage" alt="" />
      </div>
    ));
  };
  //end
  //code for uploading an image

  return (
    <div
      onDragOver={(event) => {
        preventDefault(event);
      }}
      onDrop={(event) => {
        preventDefault(event);
        handleDrop(event);
      }}
      onPaste={(event) => {
        handlePaste(event);
      }}
    >
      {id ? (
        <div style={{ display: "flex" }}>
          <DirectMessages />
          <DirectMessagesFriends />
          <div className="box">
            <div className="header">
              <div>you are in room: {room.room}</div>
            </div>
            <div className="content">
              <div>{renderChat()}</div>
            </div>
            <div className="footer">
              <div>
                <div id="imageWrapper">{renderImages()}</div>
              </div>
              <div id="outerFormDiv">
                <div id="form">
                  <SlateInput onMessageSubmit={onMessageSubmit} />
                </div>
                <div className="iconDiv">
                  <input
                    type="file"
                    name="image-upload"
                    id="input"
                    accept="image/*"
                    onChange={(event) => imageHandler(event)}
                  />
                  <div>
                    <label htmlFor="input" className="image-upload">
                      <i className="material-icons">add_photo_alternate</i>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex" }}>
          <DirectMessages />
          <DirectMessagesFriends />
          <div>please join room</div>
        </div>
      )}
    </div>
  );
}

export default Chat;
