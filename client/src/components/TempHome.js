import React from "react";
import { Link } from "react-router-dom";
import axios from "axios";
function TempHome() {
  const status = localStorage.getItem("status");
  const Image = () => {
    axios({
      method: "POST",
      withCredentials: true,
      url: `/image`,
    }).then((res) => {
      if (res.data.msg === "error") {
        console.log("there was an error getting image");
      } else {
        console.log(res.data);
      }
    });
  };
  return (
    <div>
      <h1>tempHome</h1>
      <h3>about lurker</h3>
      <p>...</p>
      <p>This website is still in working progress and will see many updates</p>
      {status === "online" ? (
        <div>
          <button>
            <Link to="/lurker">open app</Link>
          </button>
          <button onClick={Image}>get image url</button>
        </div>
      ) : (
        <div>
          <button>
            <Link to="/login">log in</Link>
          </button>
          <button>
            <Link to="/register">register</Link>
          </button>
        </div>
      )}
    </div>
  );
}

export default TempHome;
