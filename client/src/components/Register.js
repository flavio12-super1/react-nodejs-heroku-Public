import React from "react";
import axios from "axios";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const register = () => {
    axios({
      method: "POST",
      data: {
        email: email,
        username: username,
        password: password,
      },
      withCredentials: true,
      url: "https://react-nodejs-heroku-public.herokuapp.com/register",
    })
      .then((res) => {
        if (res.data.msg == "pass") {
          window.location.href =
            "https://react-nodejs-heroku-public.herokuapp.com/login";
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
      <div>Welcome new user</div>
      <div>
        <input
          type="email"
          value={email}
          placeholder="enter a valid email(optional)"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
      <div>
        <input
          type="text"
          value={username}
          placeholder="create a unique username*"
          onChange={(e) => setUsername(e.target.value)}
        />
      </div>
      <div>
        <input
          type="password"
          value={password}
          placeholder="create a strong password*"
          onChange={(e) => setPassword(e.target.value)}
        />
      </div>
      <button onClick={register}>register</button>
    </div>
  );
}

export default Register;
