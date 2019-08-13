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
    this.handleAlertClose = this.handleAlertClose.bind(this);
    this.getPrivateKey = this.getPrivateKey.bind(this);
    this.getMessage = this.getMessage.bind(this);
    this.state = {
      isAuthenticated: !!localStorage.getItem("authenticatedUsername"),
      hasWallet: !!localStorage.getItem("walletAddress"),
      privateKey: null,
      alertText: "",
      showAlert: false
    };
  }

  getPrivateKey() {
    return this.state.privateKey
  }

  handlePrivateKeySubmitted(privateKey) {
    this.setState({
      privateKey: privateKey
    });
  }

  handleAlertClose() {
    this.setState({
      showAlert: false,
      alertText: ""
    });
  }

  getAddress() {
    const address = localStorage.getItem("walletAddress");
    if (address) {
      return address;
    } else {
      const privateKey = this.getPrivateKey();
      if (!privateKey) {
        return null;
      }
      const address = CP.getAddressFromPrivateKey(privateKey);
      localStorage.setItem("walletAddress", address);
    }
  }

  handleWalletStateChange(walletAddressExists, privateKey) {
    if (privateKey) {
      this.setState({ 
        hasWallet: walletAddressExists,
        privateKey,
        showAlert: true,
        alertText: "Please store your private key securely! Without it you will not be able to access your wallet"
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

  getMessage(data) {
    const code = parseInt(data.receipt.event_logs[0].params.filter(
      param => param["vname"] === "code")[0]["value"]);
    switch(code) {
      case 0:
        return "This account is not an owner.";
      case 2:
        return "This user already has a wallet.";
      case 4:
        return "This user does not have a wallet.";
      case 5:
        return "This tweet has already been registered";
      case 7:
        return "This tweet does has not been registered";
      case 8:
        return "This tweet is invalid. Please make sure you have fulfilled all requirements.";
      case 9:
        return "You can only submit one tweet every 24 hours.";
    }
  }

  handleFailed() {
    this.setState({
      showAlert: true,
      alertText: "Login failed. Please try again"
    });
  }

  logout(isForced) {
    localStorage.removeItem("authenticatedUsername");
    if (isForced === true) {
      this.setState({
        showAlert: true,
        isAuthenticated: false,
        alertText: "Your session has expired. Please login again"
      });
    } else {
      this.setState({ isAuthenticated: false });
    }
  }

  renderHomeScreen(props) {
    const { showAlert, alertText } = this.state;
    return (
      <HomeScreen
        {...props}
        errorText={
          "Login with Twitter failed. Please refresh your browser and try again."
        }
        onLoginSuccess={this.handleSuccess}
        onLoginFail={this.handleFailed}
        alertText={alertText}
        showAlert={showAlert}
        handleAlertClose={this.handleAlertClose}
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
        getMessage={this.getMessage}
      />
    );
  }

  renderSubmitScreen(props) {
    const { showAlert, alertText } = this.state;
    return (
      <SubmitTweet
        {...props}
        onLogout={this.logout}
        getPrivateKey={this.getPrivateKey}
        getAddress={this.getAddress}
        alertText={alertText}
        showAlert={showAlert}
        handleAlertClose={this.handleAlertClose}
        getMessage={this.getMessage}
      />
    );
  }

  renderWalletScreen(props) {
    return (
      <WalletScreen 
        {...props}
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
