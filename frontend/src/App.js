import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from "./Navbar";
import HomeScreen from "./HomeScreen";
import Footer from "./Footer";
import CreateWalletScreen from "./CreateWalletScreen";
import SubmitTweet from "./SubmitTweet";
import WalletScreen from "./WalletScreen";

class App extends Component {
  constructor() {
    super();
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleFailed = this.handleFailed.bind(this);
    this.logout = this.logout.bind(this);
    this.storeAuth = this.storeAuth.bind(this);
    this.validateAuth = this.validateAuth.bind(this);
    this.state = { isAuthenticated: false, user: null, token: "" };
  }

  storeAuth(user, token) {
    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  }

  getAuth() {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    return { user, token };
  }

  handleSuccess(response) {
    const token = response.headers.get("x-auth-token");
    response.json().then(user => {
      if (token) {
        this.setState({ isAuthenticated: true, user: user, token: token });
        this.storeAuth(user, token);
        // this.props.onSuccessLogin({ user, token });
      }
    });
  }

  handleFailed(error) {
    console.error(error);
    window.$("#loadingModal").modal("show");
  }

  logout() {
    this.setState({ isAuthenticated: false, token: "", user: null });
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  }

  localValidateAuth(user, token) {
    try {
      const isObject = typeof user === "object" && user !== null;
      if (!isObject) throw new Error("user is not object");
      if (!user.username) throw new Error("user.username is not present");
      if (!user.id) throw new Error("user.id is not present");
      if (!token) throw new Error("token is not present");
      return true;
    } catch (e) {
      return false;
    }
  }

  async validateAuth() {
    try {
      const { user, token } = this.getAuth();
      const isValid = this.localValidateAuth(user, token);
      if (!isValid) {
        throw new Error("Invalid auth state");
      }
      const { isAuthenticated } = this.state;
      const response = await fetch(
        "http://34.214.190.158/api/v1/authenticate",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-auth-token": token
          }
        }
      );
      if (!response.ok) {
        this.setState({ isAuthenticated: false });
        this.logout();
      } else {
        this.setState({ isAuthenticated: true, user, token });
      }
    } catch (e) {
      console.error(e);
    }
  }

  componentDidMount() {
    this.validateAuth();
  }

  render() {
    const { isAuthenticated, user, token } = this.state;

    return (
      <Router>
        <span>
          <Navbar
            isAuthenticated={isAuthenticated}
            onLoginSuccess={this.handleSuccess}
            onLoginFail={this.handleFailed}
            onLogout={this.logout}
          />
          <Route
            exact
            path="/"
            render={props => (
              <HomeScreen
                {...props}
                errorText={
                  "Login with Twitter failed. Please refresh your browser and try again."
                }
                isAuthenticated={isAuthenticated}
                onLoginSuccess={this.handleSuccess}
                onLoginFail={this.handleFailed}
                user={user}
                token={token}
              />
            )}
          />
          <Route
            path="/create"
            component={props => (
              <CreateWalletScreen
                {...props}
                isAuthenticated={isAuthenticated}
                onLogout={this.logout}
              />
            )}
          />
          <Route
            path="/submit"
            component={props => (
              <SubmitTweet {...props} isAuthenticated={isAuthenticated} />
            )}
          />
          <Route
            path="/wallet"
            component={props => (
              <WalletScreen {...props} isAuthenticated={isAuthenticated} />
            )}
          />
          <Footer />
        </span>
      </Router>
    );
  }
}

export default App;
