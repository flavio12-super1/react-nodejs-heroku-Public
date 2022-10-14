import React, { useContext, useEffect, useRef, useState } from "react";
import CreatePost from "./CreatePost";
import "../../styles/Lurker.css";
import "../../styles/Homepage.css";
import axios from "axios";
import { UserContext } from "../Lurker";
function Homepage() {
  const homePageRef = useRef();
  const createPostRef = useRef();

  const userData = useContext(UserContext);
  const { myUsername, postsId, socket, friendsList, uri } = userData;

  const [image, setImage] = useState([]);

  // const [postMessageId, setPostMessageId] = useState("");
  const [createPostState, setCreatePostState] = useState(false);

  let friendPostsId = [postsId];
  const [posts, setPosts] = useState([]);

  let arr = [
    "dont forget to say hi to your fbi agent",
    "remember to say hi to mark zukerberg",
    "big brother is always watching :eyes:",
    "becarefull what you say, the nsa might see it :spiral-eyes:",
  ];

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

  // const replyToPost = (postMessageId) => {
  //   console.log("reply made to: " + postMessageId);
  //   setPostMessageId(postMessageId);
  // };

  // useEffect(() => {
  //   if (postMessageId != "") {
  //     let postInnerText = document.getElementById(postMessageId).innerText;
  //     console.log(postInnerText);
  //   }
  // }, [postMessageId]);

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

  const DivEditable = () => {
    return (
      <CreatePost
        onMessageSubmit={onMessageSubmit}
        closeCreatePost={closeCreatePost}
      />
    );
  };

  useEffect(() => {
    setPosts([]);
    if (friendsList.length >= 0) {
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
      // <div key={index} className="postsCss">
      <div key={index} className="postsCss">
        <div id={data._id}>
          <div className="username">{data.name}: </div>
          <div>{renderChatMessages(data.message)}</div>
          <div>{renderDataImg(data.images)}</div>
        </div>
        {/* <div className="container-reply button-reply">
          <button onClick={() => replyToPost(data._id)}>reply</button>
        </div> */}
      </div>
    ));
  };

  return (
    <div>
      <div id="topDiv" ref={homePageRef}>
        <div id="topPortion">
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
          <div style={{ marginTop: "25px", marginLeft: "5px" }}>
            <h1 style={{ margin: "0px" }}>Homepage</h1>
          </div>
        </div>
        <div id="bottomPortion">{renderPosts()}</div>
      </div>

      <div id="outerDivHomepage" ref={createPostRef}>
        {createPostState ? <DivEditable /> : null}
      </div>
    </div>
  );
}

export default Homepage;
