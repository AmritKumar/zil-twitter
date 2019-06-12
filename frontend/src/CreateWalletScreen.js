import React, { Component } from "react";
import { Redirect } from "react-router-dom";
import "whatwg-fetch";
import { registerUser as _registerUser, isUserRegistered } from "./zilliqa";
import LoadingModal from "./LoadingModal";
import { CURRENT_URI } from "./utils";
const CP = require("@zilliqa-js/crypto");

export default class CreateWalletScreen extends Component {
  constructor() {
    super();
    this.generateWallet = this.generateWallet.bind(this);
    this.generateKey = this.generateKey.bind(this);
    this.requestFunds = this.requestFunds.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.getUsername = this.getUsername.bind(this);
    this.state = {
      redirectBack: false,
      successRequestFund: null,
      successRegisterUser: null,
      privateKey: null,
      errMsg: null,
      showModal: false
    };
  }

  getUsername() {
    const username = localStorage.getItem("authenticatedUsername");
    if (username) {
      return username;
    } else {
      this.props.onLogout();
    }
  }

  async generateWallet() {
    await this.generateKey();
    const { privateKey } = this.state;
    await this.requestFunds(privateKey);
    const username = this.getUsername();
    await this.registerUser(privateKey, username);
    this.props.handlePrivateKeySet(privateKey);
  }

  async generateKey() {
    await this.props.checkIfRegistered();
    const privateKey = CP.schnorr.generatePrivateKey();
    this.setState({ privateKey });
  }

  async registerUser(privateKey, username) {
    if (this.state.successRequestFund) {
      const address = CP.getAddressFromPrivateKey(privateKey);
      try {
        const tx = await _registerUser(privateKey, address, username);
        localStorage.setItem("hasWallet", "TRUE");
        this.setState({ successRegisterUser: tx.receipt.success });
      } catch (e) {
        console.log(e);
        this.setState({ errMsg: e.message });
      }
    }
  }

  async requestFunds(privateKey) {
    const address = CP.getAddressFromPrivateKey(privateKey);

    try {
      const response = await fetch(`${CURRENT_URI}/api/v1/request-funds`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ address }),
        credentials: "same-origin"
      });
      // Cookie has expired
      if (response.status === 401) {
        this.props.onLogout();
        return;
      }
      const receipt = await response.json();
      console.log(receipt);
      this.setState({ successRequestFund: receipt.success });
      return receipt;
    } catch (e) {
      console.log(e);
      this.setState({
        errMsg: "Failed in requesting funds.\nPlease refresh and try again."
      });
    }
  }

  // async componentDidMount() {
  //   // ONLY WHEN IT HAS BEEN HIDDEN, can we say this
  //   window.$("#loadingModal").on("hidden.bs.modal", () => {
  //     if (this.state.errMsg) {
  //       this.props.onLogout();
  //       // this.setState({ redirectBack: true });
  //     } else {
  //       this.setState({ redirectToSubmitTweet: true, isRegistered });
  //     }
  //   });
  // }

  // componentDidUpdate(prevProps, prevState) {
  //   const { successRegisterUser, successRequestFund } = this.state;
  //   if (successRegisterUser && successRequestFund) {
  //     setTimeout(() => {
  //       // window.$("#loadingModal").modal("hide");
  //       this.setState({ showModal: false });
  //     }, 3000);
  //   }
  // }

  render() {
    const {
      successRegisterUser,
      successRequestFund,
      errMsg,
      privateKey,
      showModal
    } = this.state;

    const msg = "\nPlease be patient, do not close this window.";
    const loadingPercentages = [0, 33.33, 66.66, 100];
    let fromLoadingPercent = loadingPercentages[0];
    let toLoadingPercent = loadingPercentages[1];
    let loadingText = "Generating private key...";

    // TODO: SHOW PRIVATE KEY HERE, PAUSE AND ASK THEM TO NOTE DOWN
    if (privateKey) {
      loadingText = "Requesting funds for wallet..." + msg;
      fromLoadingPercent = loadingPercentages[1];
      toLoadingPercent = loadingPercentages[2];

      if (successRequestFund) {
        loadingText = "Registering wallet in contract..." + msg;
        fromLoadingPercent = loadingPercentages[2];
        toLoadingPercent = loadingPercentages[3];

        if (successRegisterUser) {
          loadingText =
            "Successfully registered wallet in contract. Redirecting you...";
          fromLoadingPercent = loadingPercentages[3];
          toLoadingPercent = loadingPercentages[3];
        }
      }
    }

    return (
      <header className="masthead-create">
        { showModal ? (<LoadingModal
          title="Your Testnet Wallet"
          fromLoadingPercent={fromLoadingPercent}
          toLoadingPercent={toLoadingPercent}
          loadingText={loadingText}
          errorText={errMsg}
        />) : null}
        <div className="container h-100">
          <div className="row h-100">
            <div className="col-lg-12 my-auto">
              <div className="header-content mx-auto">
                <h1 className="mb-5">Thanks for registering</h1>
                <h2>
                  You'll also need a Zilliqa testnet wallet address to store the
                  testnet tokens you have.
                  <br />
                  <br />
                  We will get you started with a wallet, loaded with 50 testnet
                  ZIL tokens.
                </h2>
                <br />
                <p className="warning">
                  Warning: This is a testnet application for demo purposes and
                  only handles testnet ZIL tokens. Please do not send any
                  interim ERC-20 tokens or mainnet tokens here.
                </p>
                <div onClick={this.generateWallet} className="shiny-button">
                  <button
                    type="button"
                    className="btn shiny-button-content"
                    data-toggle="modal"
                    data-target="#loadingModal"
                    data-backdrop="static"
                    data-keyboard="false"
                  >
                    Generate a free testnet wallet for me
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
