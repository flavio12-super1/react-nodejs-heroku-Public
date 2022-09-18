import React from "react";
import axios from "axios";
import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import SocketContext from "./SocketContext";

function Login() {
  const userData = useContext(SocketContext);
  const { uri } = userData;
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const Login = () => {
    axios({
      method: "POST",
      data: {
        username: username,
        password: password,
      },
      withCredentials: true,
      url: `${uri}/login`,
    })
      .then((res) => {
        if (res.data.msg == "pass") {
          console.log(res.data.user);
          localStorage.setItem("user_id", res.data.user._id);
          localStorage.setItem("username", res.data.user.username);
          localStorage.setItem("email", res.data.user.emailAddress);
          localStorage.setItem("status", "online");
          window.location.href = `${uri}/lurker`;
        } else if (res.data.msg == "wait") {
          alert("you have been rate limited, please wait a minute");
        } else {
          console.log(res.data.msg);
        }
      })
      .catch(function (error) {
        console.log(error);
      });
  };

  return (
    <div className="accountDataInnerDiv">
      <div>Please long in</div>
      <div>
        <input
          type="text"
          value={username}
          placeholder="enter your username"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          placeholder="enter your password"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={Login}>Login</button>
    </div>
  );
}

export default Login;
