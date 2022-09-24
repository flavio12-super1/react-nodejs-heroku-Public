import React, { useContext } from "react";
import { Link } from "react-router-dom";
import spider from "./lurker-icons/spider.png";
import messages from "./lurker-icons/messages.png";
import explore from "./lurker-icons/explore.png";
import bell from "./lurker-icons/bell.png";
import market from "./lurker-icons/market.png";
import profile from "./lurker-icons/profile.png";
import { UserContext } from "./Lurker";

function Nav() {
  const username = localStorage.getItem("username");
  const userData = useContext(UserContext);
  const { notifications } = userData;
  return (
    <div>
      <nav id="innerNavDiv">
        <div>
          <Link to="/lurker/" className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={spider} alt="spider" />
            </div>
          </Link>
        </div>
        <div>
          <Link to="/lurker/messages" className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={messages} alt="messages" />
            </div>
          </Link>
        </div>
        <div>
          <Link to="/lurker/explore" className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={explore} alt="explore" />
            </div>
          </Link>
        </div>
        {/* start */}
        <div>
          <Link to="/lurker/notifications" className="navStyle">
            <div className="divImg">
              <img className="navIcons bell" src={bell} alt="notifications" />
              {notifications.length ? (
                <div id="notificationIcon">{notifications.length}</div>
              ) : null}
            </div>
          </Link>
        </div>
        {/* ened */}
        <div>
          <Link to="/lurker/market" className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={market} alt="market" />
            </div>
          </Link>
        </div>
        <div>
          <Link to={"/lurker/" + username} className="navStyle">
            <div className="divImg">
              <img className="navIcons" src={profile} alt="profile" />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
