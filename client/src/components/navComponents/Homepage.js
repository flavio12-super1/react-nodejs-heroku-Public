import React, { useContext, useEffect, useRef, useState } from "react";
import CreatePost from "./CreatePost";
import "../../styles/Lurker.css";
import axios from "axios";
import { UserContext } from "../Lurker";
function Homepage() {
  //send message
  const homePageRef = useRef();
  const createPostRef = useRef();
  const userData = useContext(UserContext);
  const { myUsername, postsId, socket, friendsList, uri } = userData;
  const [image, setImage] = useState([]);
  const onMessageSubmit = (messages) => {
    const data = {
      name: myUsername,
      message: messages,
      images: image,
      room: postsId,
    };
    socket.emit("createPost", data);
    console.log(
      "message sent: " +
        data.message +
        " images sent: " +
        data.images +
        " to room: " +
        data.room
    );
    console.log(messages);
  };
  const [createPostState, setCreatePostState] = useState(false);

  const topDiv = {
    position: "absolute",
    width: "-webkit-fill-available",
    height: "100%",
    display: "flex",
    zIndex: "1",
    flexFlow: "column",
    flexGrow: "1",
  };

  const topPortion = {
    flexBasis: "auto",
    flexGrow: "0",
    flexShrink: "1",
  };

  const bottomPortion = {
    flexBasis: "0px",
    flexGrow: "1",
    flexShrink: "1",
    overflow: "auto",
  };

  const outerDiv = {
    height: "100vh",
    width: "-webkit-fill-available",
    position: "relative",
    top: "0",
    display: "flex",
    justifyContent: "center",
    left: "0",
    visibility: "hidden",
    zIndex: "0",
    backgroundColor: "#00000054",
  };

  function createPost() {
    console.log("postDiv");
    createPostRef.current.style.visibility = "visible";
    createPostRef.current.style.zIndex = "1";
    homePageRef.current.style.filter = "blur(3px)";
    setCreatePostState(true);
  }

  function closeCreatePost() {
    console.log("closed postDiv");
    createPostRef.current.style.visibility = "hidden";
    createPostRef.current.style.zIndex = "0";
    homePageRef.current.style.filter = "blur(0px)";
    setCreatePostState(false);
  }

  const DivEditable = () => {
    return (
      <CreatePost
        onMessageSubmit={onMessageSubmit}
        closeCreatePost={closeCreatePost}
      />
    );
  };

  let friendPostsId = [postsId];

  const [posts, setPosts] = useState([]);
  useEffect(() => {
    setPosts([]);
    if (friendsList.length > 0) {
      for (let i = 0; i < friendsList.length; i++) {
        friendPostsId.push(friendsList[i].postsId);
      }
      console.log(friendPostsId);
      axios({
        method: "POST",
        data: {
          friendPostsId: friendPostsId,
        },
        withCredentials: true,
        url: `${uri}/getUserPosts`,
      }).then((res) => {
        console.log(res.data);
        setPosts(res.data);
      });
    }
  }, [friendsList]);

  const postsCss = {
    margin: "5px",
    border: "solid",
    backgroundColor: "#06000a",
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

  //render chat
  const renderPosts = () => {
    return posts.map((data, index) => (
      <div key={index} style={postsCss}>
        <div>
          <div className="username">{data.name}: </div>
          <div>{renderChatMessages(data.message)}</div>
          <div>{renderDataImg(data.images)}</div>
        </div>
      </div>
    ));
  };

  return (
    <div>
      <div style={topDiv} ref={homePageRef}>
        <div style={topPortion}>
          <div className="lurkerNav">
            <div className="navInnerText" class="btn">
              create post
            </div>
            <div className="navButtonDiv">
              <div class="btn">
                <button onClick={createPost.bind()}>+</button>
              </div>
            </div>
          </div>
          <h2>Homepage</h2>
        </div>
        <div style={bottomPortion}>{renderPosts()}</div>
      </div>

      <div style={outerDiv} ref={createPostRef}>
        {createPostState ? <DivEditable /> : null}
      </div>
    </div>
  );
}

export default Homepage;
