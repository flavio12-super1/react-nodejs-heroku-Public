import React from "react";
import axios from "axios";
import { useState, useContext } from "react";
import SocketContext from "./SocketContext";
import { useNavigate } from "react-router-dom";

const UserRegister = ({ stateChanger, errorMessages }) => {
  const userData = useContext(SocketContext);
  const { uri } = userData;
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  function handleCheck(val) {
    return errorMessages.indexOf(val) > -1;
  }

  const Register = () => {
    if (username && password && email) {
      axios({
        method: "POST",
        data: {
          email: email,
          username: username,
          password: password,
        },
        withCredentials: true,
        url: `${uri}/register`,
      })
        .then((res) => {
          if (res.data.msg === "pass") {
            window.location.href = `${uri}/login`;
          } else {
            const error = res.data.msg;
            if (!handleCheck(error)) {
              stateChanger((errorMessages) => [error, ...errorMessages]);
            }
          }
        })
        .catch(function (error) {
          console.log(error);
        });
    } else {
      const error = "please fill in all inputs";
      if (!handleCheck(error)) {
        stateChanger((errorMessages) => [error, ...errorMessages]);
      }
    }
  };
  return (
    <div>
      <div>Welcome new user</div>
      <div>
        <input
          type="email"
          value={email}
          placeholder="enter a email"
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>
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
      <button onClick={Register} className="accountDataInnerDivButton">
        register
      </button>
    </div>
  );
};

const RenderMessage = ({ stateChanger, errorMessages }) => {
  function removeMessage(data) {
    console.log(errorMessages);
    let filteredArray = errorMessages.filter((item) => item !== data);
    stateChanger(filteredArray);
  }

  return (
    <div className="errorDiv">
      {errorMessages.map((data, index) => (
        <div key={index}>
          <div className="innerErrorDiv">
            <div className="innerErrorDivText">{data}</div>
            <div>
              <button
                onClick={removeMessage.bind(this, data)}
                className="innerErrorDivButton"
              >
                x
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

function Register() {
  let navigate = useNavigate();
  const [errorMessages, setErrorMessages] = useState([]);

  function handleClick() {
    navigate("/login");
  }

  return (
    <div id="innerDiv">
      <div id="accountDataDiv">
        <div className="accountDataInnerDiv">
          <UserRegister
            stateChanger={setErrorMessages}
            errorMessages={errorMessages}
          />
          {errorMessages.length > 0 ? (
            <RenderMessage
              stateChanger={setErrorMessages}
              errorMessages={errorMessages}
            />
          ) : null}
        </div>
      </div>
      <div className="buttonDiv">
        <button className="button" onClick={handleClick}>
          login
        </button>
      </div>
    </div>
  );
}

export default Register;
