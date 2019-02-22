import React, { Component } from "react";
import {
  sendTransactionId,
  registerUser,
  submitTweet as _submitTweet,
  getTweetVerification
} from "./zilliqa";
const CP = require("@zilliqa-js/crypto");
const privkey =
  "7906a5bdccf93556b8f2bc326d9747ad5252a303b9e064412e32e8feadff8a08";

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
    const data = await response.json();
    return data;
  }

  async submitTweet() {
    const { tweetId } = this.state;
    const privateKey = this.getPrivateKey();
    const address = CP.getAddressFromPrivateKey(privateKey);
    const { txnId } = await _submitTweet(privateKey, tweetId);
    const verifyTxn = await this.sendTransactionId(txnId);
    const verifyTxnId = verifyTxn.id;
    const tweetIsVerified = await getTweetVerification(verifyTxnId, tweetId);
    console.log(verifyTxn, tweetIsVerified);
  }

  handleChange(e) {
    this.setState({ tweetId: e.target.value });
  }

  render() {
    return (
      <div>
        <header className="masthead-submit">
          <div className="container h-100">
            <div className="row h-100">
              <div className="balance">Balance: 20 ZILs</div>
              <div className="col-lg-12 my-auto">
                <div className="header-content mx-auto">
                  <h1 className="mb-5">Enter your tweet ID</h1>
                  <h2 className="mb-6">
                    Your tweet must include the hashtag,{" "}
                    <a
                      target="_blank"
                      href="https://twitter.com/intent/tweet?hashtags=BuiltWithZil&tw_p=tweetbutton&text=Hello+world&via=zilliqa"
                    >
                      #BuiltWithZil
                    </a>
                  </h2>
                  <div className="row my-auto w-100">
                    <form
                      action=""
                      className="form-inline justify-content-center w-100 mt-5"
                    >
                      <input
                        onChange={this.handleChange}
                        value={this.state.tweetId}
                        className="form-control mt-2 mb-2 mr-sm-3 pl-3"
                        type="text"
                        placeholder="1083722408815546368"
                      />
                      <div className="submit-tweet-btn shiny-button">
                        <button
                          onClick={this.submitTweet}
                          className="btn shiny-button-content"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="cta-container col-lg-12 text-center">
                    <a className="cta-link" href="">
                      How does this work?
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <section className="instructions-section">
          <div className="container">
            <div className="row h-100">
              <div className="col-lg-7 mx-auto my-auto">
                <p className="heading">
                  <strong className="ml-4">Instructions</strong>
                  <ol>
                    <li>Register or Sign in with your Twitter account.</li>
                    <li>
                      Note down the private key for your blockchain wallet
                      generated for future use.
                    </li>
                    <li>
                      Tweet something with the hashtag{" "}
                      <a
                        target="_blank"
                        href="https://twitter.com/intent/tweet?hashtags=BuiltWithZil&tw_p=tweetbutton&text=Hello+world&via=zilliqa"
                      >
                        #BuildWithZil
                      </a>
                      .
                    </li>
                    <li>Submit the tweet ID here for verification.</li>
                    <li>Get test tokens for our test blockchain!</li>
                  </ol>
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
