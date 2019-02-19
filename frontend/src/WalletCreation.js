import React, { Component } from "react";
import TwitterLogin from "react-twitter-auth";
import { Redirect } from "react-router-dom";
import "whatwg-fetch";
const CP = require("@zilliqa-js/crypto");

export default class WalletCreation extends Component {
  constructor() {
    super();
    this.generateWallet = this.generateWallet.bind(this);
    this.requestFunds = this.requestFunds.bind(this);
    this.state = {
      successRequestFund: false,
      privkey: null
    };
  }

  storePrivateKey(privateKey) {
    localStorage.setItem("privateKey", privateKey);
  }

  generateWallet() {
    const privkey = CP.schnorr.generatePrivateKey();
    this.requestFunds(privkey);
    this.setState({ privkey }, () => {
      this.storePrivateKey(privkey);
    });
  }

  async requestFunds(privkey) {
    const { user, token } = this.props.location.state;
    const { id: userId, username } = user;
    const address = CP.getAddressFromPrivateKey(privkey);

    const data = await fetch("http://localhost:4000/api/v1/request-funds", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({
        username,
        address
      })
    });
    if (data.success) {
      this.setState({ successRequestFund: true });
    }
    return data;
  }

  render() {
    if (this.state.successRequestFund) {
      return (
        <Redirect
          to={{
            pathname: "/submit"
          }}
        />
      );
    }
    return (
      <div>
        <button onClick={this.generateWallet}>Create Wallet</button>
        {this.state.privkey ? (
          <div>
            <p>Address: {CP.getAddressFromPrivateKey(this.state.privkey)}</p>
            <p>Private key: {this.state.privkey}</p>
          </div>
        ) : null}
      </div>
    );
  }
}
