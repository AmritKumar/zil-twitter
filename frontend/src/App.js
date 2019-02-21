import React, { Component } from "react";
import TwitterLogin from "react-twitter-auth";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import Navbar from "./Navbar";
import HomeScreen from "./HomeScreen";
import Footer from "./Footer";
import WalletCreation from "./WalletCreation";
import SubmitTweet from "./SubmitTweet";

class BaseScreen extends Component {
  constructor() {
    super();

    this.state = { isAuthenticated: false, user: null, token: "" };
  }

  onSuccess = response => {
    const token = response.headers.get("x-auth-token");
    response.json().then(user => {
      if (token) {
        this.setState({ isAuthenticated: true, user: user, token: token });
      }
    });
  };

  onFailed = error => {
    alert(error);
  };

  logout = () => {
    this.setState({ isAuthenticated: false, token: "", user: null });
  };

  render() {
    // const authenticatedContent = (
    //   <div>
    //     <p>Authenticated</p>
    //     <div>{this.state.user.email}</div>
    //     <div>
    //       <button onClick={this.logout} className="button">
    //         Log out
    //       </button>
    //     </div>
    //   </div>
    // );

    const { isAuthenticated, user, token } = this.state;

    if (this.state.isAuthenticated) {
      return (
        <Redirect
          to={{
            pathname: "/submit",
            state: { user, token }
          }}
        />
      );
    }

    return (
      <span>
        <Navbar />
        <HomeScreen />
        <Footer />
      </span>
    );
  }
}

const App = () => {
  return (
    <Router>
      <span>
        <Navbar />
        <span>
          <Route exact path="/" component={HomeScreen} />
          <Route path="/create" component={WalletCreation} />
          <Route path="/submit" component={SubmitTweet} />
        </span>
        <Footer />
      </span>
    </Router>
  );
};

export default App;
