import React from "react";
import { Link } from "react-router-dom";
import users from "./lurker-icons/users.png";
import explore from "./lurker-icons/explore.png";

function Nav() {
  const navDiv = {
    display: "flex",
    flexDirection: "column",
  };
  const navStyle = {
    color: "white",
  };

  return (
    <div>
      <nav style={navDiv}>
        <div className="myLink">
          <Link to="/lurker/messages" style={navStyle}>
            <div>
              <img className="navIcons" src={users} alt="messages" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/explore" style={navStyle}>
            <div>
              <img className="navIcons" src={explore} alt="explore" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/notifications" style={navStyle}>
            <div>
              <img
                className="navIcons"
                src="https://cdn4.iconfinder.com/data/icons/ionicons/512/icon-ios7-bell-512.png"
                alt="notifications"
              />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/market" style={navStyle}>
            <div>
              <img
                className="navIcons"
                src="https://ekaminvento.com/pub/media/seller/Marketplace.png"
                alt="market"
              />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/settings" style={navStyle}>
            <div>
              <img
                className="navIcons"
                src="https://cdn-icons-png.flaticon.com/512/126/126472.png"
                alt="settings"
              />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
