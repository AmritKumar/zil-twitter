import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from "./Navbar";
import HomeScreen from "./HomeScreen";
import Footer from "./Footer";
import CreateWalletScreen from "./CreateWalletScreen";
import SubmitTweet from "./SubmitTweet";
import WalletScreen from "./WalletScreen";
const CP = require("@zilliqa-js/crypto");

class App extends Component {

  constructor(props) {
    super(props);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleFailed = this.handleFailed.bind(this);
    this.logout = this.logout.bind(this);
    this.handleWalletStateChange = this.handleWalletStateChange.bind(this);
    this.getAddress = this.getAddress.bind(this);
    this.getPrivateKey = this.getPrivateKey.bind(this);
    this.state = { 
      isAuthenticated: !!localStorage.getItem("authenticatedUsername"),
      hasWallet: !!localStorage.getItem("walletAddress"),
      privateKey: null
    };
  }

  getPrivateKey() {
    // TOOD: Display modal asking for input
    if (this.state.privateKey) {
      return this.state.privateKey;
    }
    return "b9d2af1847c8ca1e698515b68fd7540b641e5c8a531175f3b7b71de2db4f3f76";
  }

  getAddress() {
    const address = localStorage.getItem("walletAddress");
    if (address) {
      return address;
    } else {
      const privateKey = this.getPrivateKey();
      const address = CP.getAddressFromPrivateKey(privateKey);
      localStorage.setItem("walletAddress", address);
    }
  }

  handleWalletStateChange(walletAddressExists, privateKey) {
    if (privateKey) {
      this.setState({ 
        hasWallet: walletAddressExists,
        privateKey
      });
    } else {
      this.setState({ hasWallet: walletAddressExists });
    }
  }

  handleSuccess(response) {
    response.json().then(json => {
      localStorage.setItem("authenticatedUsername", json.username);
      this.setState({isAuthenticated: true });
    });
  }

  handleFailed() {
    // TODO: Display modal 
    return;
  }

  logout() {
    // TODO: Display modal
    localStorage.removeItem("authenticatedUsername");
    this.setState({
      isAuthenticated: false
    });
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
        handleWalletStateChange={this.handleWalletStateChange}
      />
    );
  }

  renderSubmitScreen(props) {
    return (
      <SubmitTweet
        {...props}
        onLogout={this.logout}
        getPrivateKey={this.getPrivateKey}
        getAddress={this.getAddress}
      />
    );
  }

  renderWalletScreen(props) {
    return (
      <WalletScreen 
        {...props}
        getPrivateKey={this.getPrivateKey}
        getAddress={this.getAddress}
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
              isAuthenticated && hasWallet ?
                this.renderSubmitScreen(props) :
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
