import React from "react";
import { Link } from "react-router-dom";
import users from "./lurker-icons/users.png";
import explore from "./lurker-icons/explore.png";
import bell from "./lurker-icons/bell.png";
import market from "./lurker-icons/market.png";
import gear from "./lurker-icons/gear.png";

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
              <img className="navIcons" src={bell} alt="notifications" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/market" style={navStyle}>
            <div>
              <img className="navIcons" src={market} alt="market" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/settings" style={navStyle}>
            <div>
              <img className="navIcons" src={gear} alt="settings" />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
