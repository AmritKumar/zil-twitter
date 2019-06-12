import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import { isUserRegistered } from "./zilliqa";
import Navbar from "./Navbar";
import HomeScreen from "./HomeScreen";
import Footer from "./Footer";
import CreateWalletScreen from "./CreateWalletScreen";
import SubmitTweet from "./SubmitTweet";
import WalletScreen from "./WalletScreen";

class App extends Component {

  constructor(props) {
    super(props);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleFailed = this.handleFailed.bind(this);
    this.handlePrivateKeySet = this.handlePrivateKeySet.bind(this);
    this.logout = this.logout.bind(this);
    this.checkIfRegistered = this.checkIfRegistered.bind(this)
    this.state = { 
      isAuthenticated: !!localStorage.getItem("authenticatedUsername"),
      hasWallet: !!localStorage.getItem("hasWallet"),
      privateKey: null
    };
    this.checkIfRegistered();
  }

  async checkIfRegistered() {
    console.log("MM");
    const username = localStorage.getItem("authenticatedUsername");
    const isRegistered = await isUserRegistered(username);
    const noChange = this.state.hasWallet === isRegistered;
    if (noChange) {
      return;
    }
    if (isRegistered) {
      localStorage.setItem("hasWallet", "TRUE");
    } else {
      localStorage.removeItem("hasWallet");
    }
    this.setState({
      hasWallet: isRegistered
    });
  }

  handlePrivateKeySet(key) {
    this.setState({ privateKey: key });
  }

  handleSuccess(response) {
    response.json().then(json => {
      localStorage.setItem("authenticatedUsername", json.username);
      this.setState({ isAuthenticated: true });
    });
  }

  handleFailed(error) {
    console.error(error);
    window.$("#loadingModal").modal("show");
  }

  logout() {
    localStorage.removeItem("authenticatedUsername");
    this.setState({ isAuthenticated: false });
  }

  renderHomeScreen(props) {
    return (
      <HomeScreen
        {...props}
        errorText={
          "Login with Twitter failed. Please refresh your browser and try again."
        }
        onLoginSuccess={this.handleSuccess}
        onLoginFail={this.handleFailed}
      />
    );
  }

  renderCreateWalletScreen(props) {
    return (
      <CreateWalletScreen
        {...props}
        onLogout={this.logout}
        checkIfRegistered={this.checkIfRegistered}
        handlePrivateKeySet={this.handlePrivateKeySet}
      />
    );
  }

  renderSubmitScreen(props) {
    return (
      <SubmitTweet
        {...props}
        onLogout={this.logout}
        privateKey={this.state.privateKey}
      />
    );
  }

  renderWalletScreen(props) {
    return (
      <WalletScreen 
        {...props}
        privateKey={this.state.privateKey}
      />
    );
  }

  render() {
    const { isAuthenticated, hasWallet } = this.state;
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
              isAuthenticated && hasWallet ?
                this.renderSubmitScreen(props) :
                isAuthenticated ?
                  this.renderCreateWalletScreen(props) :
                  this.renderHomeScreen(props)  
            )}
          />
          <Route
            path="/create"
            component={props => (
              isAuthenticated ?
                this.renderCreateWalletScreen(props) :
                this.renderHomeScreen(props)
            )}
          />
          <Route
            path="/submit"
            component={props => (
              isAuthenticated ?
                this.renderSubmitScreen(props) :
                this.renderHomeScreen(props)
            )}
          />
          <Route
            path="/wallet"
            component={props => (
              isAuthenticated ?
                this.renderWalletScreen(props) :
                this.renderHomeScreen(props)
            )}
          />
          <Footer />
        </span>
      </Router>
    );
  }
}

export default App;
