import React, { Component } from "react";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect
} from "react-router-dom";
import Navbar from "./Navbar";
import HomeScreen from "./HomeScreen";
import Footer from "./Footer";
import CreateWalletScreen from "./CreateWalletScreen";
import SubmitTweet from "./SubmitTweet";

class App extends Component {
  constructor() {
    super();
    this.handleSuccessLogin = this.handleSuccessLogin.bind(this);
  }

  handleSuccessLogin() {
    this.setState({ isAuthenticated: true });
  }

  render() {
    return (
      <Router>
        <span>
          <Navbar />
          <Route
            exact
            path="/"
            component={props => (
              <HomeScreen {...props} onSuccessLogin={this.handleSuccessLogin} />
            )}
          />
          <Route path="/create" component={CreateWalletScreen} />
          <Route path="/submit" component={SubmitTweet} />
          <Footer />
        </span>
      </Router>
    );
  }
}

export default App;
