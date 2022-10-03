import React, { useContext, useEffect, useState } from "react";
import axios from "axios";
import SocketContext from "../SocketContext";
import { useParams } from "react-router-dom";

function Profile(props) {
  const [isLoading, setLoading] = useState(true);
  const [access, setAccess] = useState("dennied");
  const userData = useContext(SocketContext);
  const { uri } = userData;
  const { username } = useParams();
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    axios({
      method: "POST",
      data: {
        username: username,
      },
      withCredentials: true,
      url: `${uri}/getUserInfo`,
    }).then((res) => {
      if (res.data.msg === "pass" && res.data.access === "allowed") {
        setAccess("allowed");
        console.log(res.data.data);
        setPosts(res.data.data);
        // setPosts((posts) => [...posts, data]);
      } else if (res.data.msg === "pass" && res.data.access === "dennied") {
        setAccess("dennied");
      } else if (res.data.msg === "failed") {
        setAccess("failed");
      } else {
        setAccess("error");
      }
      setLoading(false);
    });
  }, [username]);

  useEffect(() => {
    console.log("posts was updated");
  }, [posts]);

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

  //render posts
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

  if (isLoading) {
    return <div></div>;
  }

  return (
    <div>
      <h2>User Profile component in working progress</h2>
      {access == "allowed" ? (
        <div>you have access to make edits</div>
      ) : access == "dennied" ? (
        <div>you dont have access to make edits</div>
      ) : access == "failed" ? (
        <div>user doesnt exists</div>
      ) : (
        <div>there was a server error</div>
      )}
      <div>username: {username}</div>
      <div>
        number of posts: {posts.length}
        <br />
        posts: {renderPosts()}
      </div>
    </div>
  );
}

export default Profile;
