import React, { Component } from "react";

import Register from "./Register";
import Login from "./Login";
import "../styles/Home.css";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isToggleOn: this.props.state,
    };
  }

  componentDidMount() {}

  handleClick = () => {
    this.setState((prevState) => ({
      isToggleOn: !prevState.isToggleOn,
    }));
  };

  render() {
    return (
      <div>
        <div id="outerDiv">
          <div id="spiderDiv">
            <img
              id="spiderImg"
              src="https://cdn.iconscout.com/icon/premium/png-256-thumb/spider-300-1047059.png"
              alt="logo"
            />
            <div id="name">Lurker</div>
            <div id="title">A place for nerds</div>
            <div id="description">
              Our mission is to give users full control of what content they
              decide to interact with, that includes your ads.
            </div>
          </div>

          <div id="interactDiv">
            <div id="innerDiv">
              <div id="accountDataDiv">
                {this.state.isToggleOn ? <Register /> : <Login />}
              </div>

              <div id="buttonDiv">
                <button id="button" onClick={this.handleClick}>
                  {this.state.isToggleOn ? "login" : "register"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Home;
