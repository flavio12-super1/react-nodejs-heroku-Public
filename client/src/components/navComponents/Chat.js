import React, { useEffect, useContext, useState, useRef } from "react";
import "../../styles/Chat.css";
import { createContext } from "react";
import io from "socket.io-client";
import { useParams, useNavigate } from "react-router-dom";
import SlateInput from "./SlateInput";
import { UserContext } from "../Lurker";
import axios from "axios";
export const EventContext = createContext();
function Chat(props) {
  let { id } = useParams();
  id ??= null;
  let navigate = useNavigate();

  const [room, setRoom] = useState({ room: id });
  const [roomName, setName] = useState({ name: "", roomNameID: "" });
  const [chat, setChat] = useState([]);
  const [image, setImage] = useState([]);

  const userData = useContext(UserContext);
  const {
    myUsername,
    userID,
    friendsList,
    serversList,
    updateServerList,
    socket,
    uri,
  } = userData;

  const myRef = useRef(null);

  function updateChat(data) {
    setChat((chat) => [data, ...chat]);
    console.log(
      "message returned from: " +
        data.name +
        " content: " +
        data.message +
        " images: " +
        data.images +
        " reply: " +
        data.messageReferance
    );
  }

  //update room
  useEffect(() => {
    if (room.room != null) {
      socket.emit("joinRoom", room);
      console.log("joined: " + room.room + " successfuly");
      setChat([]);
      setPostMessageId({ postMessageId: "" });
      navigate("/lurker/messages/" + room.room);

      axios({
        method: "POST",
        data: {
          roomID: room.room,
        },
        withCredentials: true,
        url: `${uri}/getMessages`,
      })
        .then((res) => {
          console.log(res.data);
          if (res.data.userMessages.length > 0) {
            console.log(res.data.userMessages);
            setChat(res.data.userMessages.reverse());
            console.log(serversList);
            var result = serversList.filter((obj) => {
              return obj.message == room.room;
            });
            console.log(result);
            setName({ name: result[0].serverName, roomNameID: result[0]._id });

            myRef.current.scrollIntoView({
              behavior: "smooth",
              block: "end",
            });
          }
        })
        .catch((err) => console.log(err));
    } else {
      console.log("user has joined no room");
    }
  }, [room]);

  useEffect(() => {
    if (serversList.length > 0) {
      console.log(serversList);
      console.log(room.room);
      if (room.room != null || room.room != undefined) {
        var result = serversList.filter((obj) => {
          return obj.message == room.room;
        });
        console.log(result);
        if (result.length > 0) {
          setName({
            name: result[0].serverName,
            roomNameID: result[0]._id,
          });
        }
      }
    }
  }, [serversList, room]);

  //recieve messages
  useEffect(() => {
    socket.on("message", (data) => {
      updateChat(data);
    });
  }, []);

  useEffect(() => {
    myRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
    console.log("chat was updated");
  }, [chat]);

  // const [roomName, setName] = useState({ name: "", roomNameID: "" });

  //join room
  function joinRoom(serverName, serverID, userID) {
    setName({ name: serverName, roomNameID: serverID });
    setRoom({ room: userID });
  }

  //update room
  function updateRoom(serverName, serverID, userID, myCallback) {
    if (room.room != null) {
      socket.emit("leaveRoom", room);
      console.log("left: " + room.room);
      myCallback(serverName, serverID, userID);
    } else {
      console.log("user has left no room because no room has been initialized");
      myCallback(serverName, serverID, userID);
    }
  }

  //send message
  const onMessageSubmit = (messages) => {
    const data = {
      name: myUsername,
      message: messages,
      images: image,
      room: room.room,
      messageReferance: postMessageId.postMessageId,
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

  //json parse each message
  const parseMessage = (myMessage) => {
    myMessage = JSON.stringify(myMessage.children[0].text);
    if (myMessage.length > 2) {
      return JSON.parse(myMessage);
    }
    return <br />;
  };

  //render each message
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

  //render images
  const renderDataImg = (allImg) => {
    return allImg.map((img, index) => (
      <div key={index}>
        <img src={img} className="myImage" alt="" />
      </div>
    ));
  };

  const [postMessageId, setPostMessageId] = useState({
    username: "",
    postMessageId: "",
  });

  const replyToPost = (username, postMessageId) => {
    setPostMessageId({ username: username, postMessageId: postMessageId });
  };

  useEffect(() => {
    if (postMessageId.postMessageId != "") {
      let postInnerText = document.getElementById(
        postMessageId.postMessageId
      ).innerText;
      console.log(`reply made to: ${postMessageId.username} ` + postInnerText);
    }
  }, [postMessageId]);

  function getColor(i) {
    let num = i;
    return "rgb(145, 255, " + Math.floor((1 - 1 / num) * 255) + ")";
  }

  //render chat
  const renderChat = () => {
    let i = 0;
    return chat.map((data, index) => (
      <div
        key={index}
        className={
          data._id == postMessageId.postMessageId ? "reply-message " : "message"
        }
        style={
          data.name != myUsername && data.messageReferanceText
            ? { backgroundColor: "#133363" }
            : { backgroundColor: getColor((i = i + 2)) }
        }
      >
        <div>
          <div>{data.messageReferanceText}</div>
          <div className="username">{data.name}</div>
          <div id={data._id}>{renderChatMessages(data.message)}</div>
          <div>{renderDataImg(data.images)}</div>
        </div>
        <div className="container-reply button-reply">
          <button onClick={() => replyToPost(data.name, data._id)}>
            reply
          </button>
        </div>
      </div>
    ));
  };

  const popupDiv = {
    position: "absolute",
    top: "0px",
    left: "0px",
    height: "0px",
    width: "0px",
    backgroundColor: "rgba(0, 0, 0, 0.48)",
  };
  const popupInnerDiv = {
    width: "100vw",
    height: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#00000087",
  };

  const backDrop = {
    position: "fixed",
    top: "0",
    bottom: "0",
    left: "0",
    right: "0",
  };

  const PopupForm = () => {
    const [serverName, setServerName] = useState("");
    const [serverID, setServerID] = useState("");
    const createServer = () => {
      axios({
        method: "POST",
        data: {
          serverName: serverName,
          user: { username: myUsername, userID: userID },
        },
        withCredentials: true,
        url: `${uri}/createServer`,
      })
        .then((res) => {
          console.log(res.data);
          if (res.data.serverName == serverName) {
            alert("server created successfuly");
            console.log(res.data);
            updateServerList((serversList) => [res.data, ...serversList]);
            // updateServerList(res.data);
            setPopup(false);
            updateRoom(
              joinRoom(res.data.serverName, res.data._id, res.data.message)
            );
          } else {
            alert("there was a problem creating server");
          }
        })
        .catch((err) => console.log(err));

      console.log("create server: " + serverName);
    };

    const joinServer = () => {
      axios({
        method: "POST",
        data: {
          serverID: serverID,
          user: { username: myUsername, userID: userID },
        },
        withCredentials: true,
        url: `${uri}/joinServer`,
      })
        .then((res) => {
          console.log(res.data);
          if (res.data._id == serverID) {
            alert("server successfuly joined");
            console.log(res.data);
            updateServerList((serversList) => [res.data, ...serversList]);
            // updateServerList(res.data);
            setPopup(false);
            updateRoom(
              joinRoom(res.data.serverName, res.data._id, res.data.message)
            );
          } else {
            alert("there was a problem joining server");
          }
        })
        .catch((err) => console.log(err));

      console.log("server joined: " + serverName);
    };

    return (
      <div>
        <div>
          <div>create server</div>
          <div>
            name
            <input
              type="text"
              placeholder="server name"
              value={serverName}
              onChange={(e) => setServerName(e.target.value)}
            />
          </div>
          <div>
            <button onClick={createServer}>create</button>
          </div>
        </div>

        <div>
          <div>
            <input
              type="text"
              placeholder="server id"
              value={serverID}
              onChange={(e) => setServerID(e.target.value)}
            />
          </div>
          <div>
            <button onClick={joinServer}>join</button>
          </div>
        </div>
      </div>
    );
  };

  const Popup = () => {
    console.log("popup ");
    return (
      <div style={popupInnerDiv}>
        <div style={backDrop} onClick={() => setPopup(false)}></div>
        <div
          style={{
            border: "solid red",
            backgroundColor: "gray",
            position: "absolute",
          }}
        >
          <PopupForm />
          <div>
            <button onClick={() => setPopup(false)}>close</button>
          </div>
        </div>
      </div>
    );
  };

  const [popup, setPopup] = useState(false);

  // function showPopup() {}

  //render servers
  const serversMap = () => {
    return serversList.map((data, index) => (
      <div key={index}>
        <button
          onClick={(e) =>
            updateRoom(data.serverName, data._id, data.message, joinRoom)
          }
        >
          {data.serverName}
        </button>
      </div>
    ));
  };
  const DirectMessages = () => {
    return (
      <div className="roomDiv">
        <div>{serversMap()}</div>
        <button onClick={() => setPopup(true)}>add server</button>
      </div>
    );
  };

  //render dms
  const friendsMap = () => {
    return friendsList.map((data, index) => (
      <div key={index}>
        <button onClick={(e) => updateRoom("", "", data.userID, joinRoom)}>
          {data.username}
        </button>
      </div>
    ));
  };
  const DirectMessagesFriends = () => {
    if (friendsList.length === 0) {
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

  const divEditable = () => {
    return (
      <EventContext.Provider
        value={{
          postMessageId,
        }}
      >
        <SlateInput onMessageSubmit={onMessageSubmit} />
      </EventContext.Provider>
    );

    // return <SlateInput onMessageSubmit={onMessageSubmit} />;
  };

  const replyStyle = {
    width: "-webkit-fill-available",
    backgroundColor: "#06000a",
  };

  const replyButtonDiv = {
    display: "flex",
    alignItems: "center",
    padding: "5px",
    paddingRight: "8px",
  };

  const replyBtn = {
    height: "17px",
    width: "17px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  };

  return (
    <div
      style={{ display: "flex" }}
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
      <DirectMessages />
      <DirectMessagesFriends />
      {id ? (
        <div className="box">
          {roomName.name != "" ? (
            <div className="header">
              <div>you are in room: {roomName.name}</div>
              <div>SERVER ID: {roomName.roomNameID}</div>
            </div>
          ) : null}
          <div className="content">
            <div ref={myRef}>
              <div>
                <h2>Dont be shy :)</h2>
              </div>
              {renderChat().reverse()}
            </div>
          </div>
          <div className="footer">
            <div style={replyStyle}>
              {postMessageId.postMessageId != "" ? (
                <div style={{ display: "flex" }}>
                  <div style={{ padding: "10px 0px 10px 5px", flexGrow: "1" }}>
                    replying to: {postMessageId.username}
                  </div>
                  <div style={replyButtonDiv}>
                    <button
                      style={replyBtn}
                      onClick={() => setPostMessageId({ postMessageId: "" })}
                    >
                      x
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            <div>
              <div id="imageWrapper">{renderImages()}</div>
            </div>
            <div id="outerFormDiv">
              <div id="form">{divEditable()}</div>

              {/* <div id="form">{divEditable()}</div> */}
              <div className="iconDiv">
                <input
                  type="file"
                  name="image-upload"
                  id="input"
                  accept="image/*"
                  onChange={(event) => imageHandler(event)}
                />
                <div id="labelDiv">
                  <label htmlFor="input" className="image-upload">
                    <i className="material-icons">add_photo_alternate</i>
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div>please join room</div>
      )}
      <div style={popupDiv}>{popup ? <Popup /> : null}</div>
    </div>
  );
}

export default Chat;
