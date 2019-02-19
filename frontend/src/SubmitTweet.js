import React, { Component } from "react";
import { registerUser, submitTweet as _submitTweet } from "./zilliqa";
const CP = require("@zilliqa-js/crypto");

export default class SubmitTweet extends Component {
  constructor() {
    super();
    this.handleChange = this.handleChange.bind(this);
    this.submitTweet = this.submitTweet.bind(this);
    this.state = {
      tweetId: ""
    };
  }

  getPrivateKey() {
    return localStorage.getItem("privateKey");
  }

  async submitTweet() {
    const privateKey = this.getPrivateKey();
    const address = CP.getAddressFromPrivateKey(privateKey);
    await registerUser(privateKey, address, "kenchangh");
    await _submitTweet(privateKey, this.state.tweetId);
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
