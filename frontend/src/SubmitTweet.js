import React, { Component } from "react";
import {
  sendTransactionId,
  registerUser,
  submitTweet as _submitTweet
} from "./zilliqa";
const CP = require("@zilliqa-js/crypto");
const privkey =
  "75f1943b7abfa635824f7a0e75d14244c2f7b5c2be81aa16f6e0c2f3e05a0508";

export default class SubmitTweet extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.submitTweet = this.submitTweet.bind(this);
    this.sendTransactionId = this.sendTransactionId.bind(this);
    this.state = {
      tweetId: ""
    };
  }

  getPrivateKey() {
    // return localStorage.getItem("privateKey");
    return privkey;
  }

  async sendTransactionId(txnId) {
    const { token, user } = this.props.location.state;
    // const { username } = user;
    const response = await fetch("http://localhost:4000/api/v1/submit-tweet", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-auth-token": token
      },
      body: JSON.stringify({
        txnId,
        username: user.username,
        twitterToken: user.token
      })
    });
  }

  async submitTweet() {
    const privateKey = this.getPrivateKey();
    const address = CP.getAddressFromPrivateKey(privateKey);
    const { txnId } = await _submitTweet(privateKey, this.state.tweetId);
    await this.sendTransactionId(txnId);
  }

  handleChange(e) {
    this.setState({ tweetId: e.target.value });
  }

  render() {
    return (
      <div>
        <input
          type="text"
          placeholder="Enter your tweet ID here"
          onChange={this.handleChange}
          value={this.state.tweetId}
        />
        <button onClick={this.submitTweet}>Submit Tweet</button>
      </div>
    );
  }
}
