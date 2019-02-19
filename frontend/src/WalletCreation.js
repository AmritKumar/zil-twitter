import React, { Component } from "react";
import TwitterLogin from "react-twitter-auth";
import { Redirect } from "react-router-dom";
import "whatwg-fetch";
import { registerUser as _registerUser } from "./zilliqa";
const CP = require("@zilliqa-js/crypto");

export default class WalletCreation extends Component {
  constructor() {
    super();
    this.generateWallet = this.generateWallet.bind(this);
    this.requestFunds = this.requestFunds.bind(this);
    this.registerUser = this.registerUser.bind(this);
    this.state = {
      successRequestFund: null,
      successRegisterUser: null,
      privkey: null
    };
  }

  storePrivateKey(privateKey) {
    localStorage.setItem("privateKey", privateKey);
  }

  async generateWallet() {
    const { username } = this.props.location.state.user;
    const privkey = CP.schnorr.generatePrivateKey();
    this.setState({ privkey });
    this.storePrivateKey(privkey);
    await this.requestFunds(privkey);
    await this.registerUser(privkey, username);
  }

  async registerUser(privkey, username) {
    if (this.state.successRequestFund) {
      const address = CP.getAddressFromPrivateKey(privkey);
      const receipt = await _registerUser(privkey, address, username);
      this.setState({ successRegisterUser: receipt.success });
    }
  }

  async requestFunds(privkey) {
    const { user, token } = this.props.location.state;
    const { id: userId, username } = user;
    const address = CP.getAddressFromPrivateKey(privkey);

    const response = await fetch("http://localhost:4000/api/v1/request-funds", {
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
    const receipt = await response.json();
    console.log(receipt);
    this.setState({ successRequestFund: receipt.success });
    return receipt;
  }

  render() {
    if (this.state.successRequestFund && this.state.successRegisterUser) {
      return (
        <Redirect
          to={{
            pathname: "/submit",
            state: {
              ...this.props.location.state
            }
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
        {this.state.successRequestFund === null
          ? "Requesting funds..."
          : this.state.successRequestFund
          ? "Successfully requested funds"
          : "Failed requested funds"}
        {"\n"}
        {this.state.successRegisterUser === null
          ? "Registering user..."
          : this.state.successRegisterUser
          ? "Successfully register user"
          : "Failed register user"}
      </div>
    );
  }
}
