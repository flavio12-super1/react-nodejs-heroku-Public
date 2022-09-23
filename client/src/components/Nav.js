import { Link } from "react-router-dom";
import spider from "./lurker-icons/spider.png";
import messages from "./lurker-icons/messages.png";
import explore from "./lurker-icons/explore.png";
import bell from "./lurker-icons/bell.png";
import market from "./lurker-icons/market.png";
import profile from "./lurker-icons/profile.png";

function Nav() {
  const username = localStorage.getItem("username");
  return (
    <div>
      <nav id="innerNavDiv">
        <div className="myLink">
          <Link to="/lurker/" className="navStyle">
            <div>
              <img className="navIcons" src={spider} alt="spider" />
            </div>
          </Link>
          <Link to="/lurker/messages" className="navStyle">
            <div>
              <img className="navIcons" src={messages} alt="messages" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/explore" className="navStyle">
            <div>
              <img className="navIcons" src={explore} alt="explore" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/notifications" className="navStyle">
            <div>
              <img className="navIcons" src={bell} alt="notifications" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to="/lurker/market" className="navStyle">
            <div>
              <img className="navIcons" src={market} alt="market" />
            </div>
          </Link>
        </div>
        <div className="myLink">
          <Link to={"/lurker/" + username} className="navStyle">
            <div>
              <img className="navIcons" src={profile} alt="profile" />
            </div>
          </Link>
        </div>
      </nav>
    </div>
  );
}

export default Nav;
