import React, { Component } from "react";
import { BrowserRouter as Router, Route } from "react-router-dom";
import Navbar from "./Navbar";
import HomeScreen from "./HomeScreen";
import Footer from "./Footer";
import CreateWalletScreen from "./CreateWalletScreen";
import SubmitTweet from "./SubmitTweet";
import WalletScreen from "./WalletScreen";
import InputModal from "./InputModal";
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
    this.handlePrivateKeySubmitted = this.handlePrivateKeySubmitted.bind(this);
    this.state = { 
      isAuthenticated: !!localStorage.getItem("authenticatedUsername"),
      hasWallet: !!localStorage.getItem("walletAddress"),
      privateKey: null,
      alertText: "",
      showAlert: false,
      showModal: true
    };
  }

  getPrivateKey(isUrgent) {
    if (this.state.privateKey) {
      return this.state.privateKey;
    } else if (isUrgent) {
      window.$('#inputModal').modal("toggle");
    }
    return null;
  }

  handlePrivateKeySubmitted(privateKey) {
    window.$('#inputModal').modal("hide");
    window.$('body').removeClass('modal-open');
    window.$('.modal-backdrop').remove();
    this.setState({
      privateKey: privateKey,
      showModal: false
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
    const { showAlert, alertText } = this.state;
    return (
      <SubmitTweet
        {...props}
        onLogout={this.logout}
        getPrivateKey={this.getPrivateKey}
        getAddress={this.getAddress}
        alertText={alertText}
        showAlert={showAlert}
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
    const { isAuthenticated, hasWallet, showModal } = this.state;
    return (
      <Router>
        <span>
          <Navbar
            isAuthenticated={isAuthenticated}
            onLoginSuccess={this.handleSuccess}
            onLoginFail={this.handleFailed}
            onLogout={this.logout}
          />
          {showModal ? (
            <InputModal
              title="Submit Private Key"
              handleInput={this.handlePrivateKeySubmitted}
            />
          ) : null}
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
