import React from "react";
import { Link } from "react-router-dom";
function TempHome() {
  const status = localStorage.getItem("status");
  return (
    <div>
      <h1>tempHome</h1>
      <h3>about lurker</h3>
      <p>...</p>
      <br />
      <p>This website is still in working progress and will see many updates</p>
      {status === "online" ? (
        <div>
          <button>
            <Link to="/lurker">open app</Link>
          </button>
        </div>
      ) : (
        <div>
          <button>
            <Link to="/login">log in</Link>
          </button>
        </div>
      )}
    </div>
  );
}

export default TempHome;
