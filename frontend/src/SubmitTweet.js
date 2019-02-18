import React, { Component } from "react";
import { submitTweet as _submitTweet } from "./zilliqa";

export default class SubmitTweet extends Component {
  constructor() {
    super();
    this.submitTweet = this.submitTweet.bind(this);
    this.state = {
      tweetId: ""
    };
  }

  getPrivateKey(privateKey) {
    return localStorage.getItem("privateKey", privateKey);
  }

  async submitTweet() {
    await _submitTweet(this.state.tweetId);
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
