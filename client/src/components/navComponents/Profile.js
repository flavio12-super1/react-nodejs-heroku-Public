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
    </div>
  );
}

export default Profile;
