import React, { Component } from "react";
import Joyride from "react-joyride";
import LoadingModal from "./LoadingModal";
import InputModal from "./InputModal";
import {
  submitTweet as _submitTweet,
  getTweetStatus,
  zilliqa
} from "./zilliqa";
import { Link } from "react-router-dom";
import { TwitterTweetEmbed } from "react-twitter-embed";
import { CURRENT_URI } from "./utils";
const { units, BN } = require("@zilliqa-js/util");

export default class SubmitTweet extends Component {
  constructor(props) {
    super(props);
    this.handleChange = this.handleChange.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.submitTweet = this.submitTweet.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
    this.getTweetVerification = this.getTweetVerification.bind(this);
    this.clearState = this.clearState.bind(this);
    this.isValidUser = this.isValidUser.bind(this);
    this.handlePrivateKeySubmitted = this.handlePrivateKeySubmitted.bind(this);
    this.state = {
      showLoading: false,
      showInput: false,
      tweetId: "",
      errMsg: null,
      submittedTweet: false,
      verifiedTweet: false,
      balance: 0,
      privateKey: props.privateKey
    };
  }

  async updateBalance() {
    const address = this.props.getAddress();
    if (!address) {
      this.setState({ balance: "Address not specified. Please enter private key when submitting tweet" });
      return;
    }
    const data = await zilliqa.blockchain.getBalance(address);
    const { balance } = data.result;
    const zilBalance = units.fromQa(new BN(balance), units.Units.Zil);
    this.setState({ balance: zilBalance });
  }

  async getTweetVerification(id, isTransactionId, address) { 
    const requestBody = isTransactionId ? {txnId: id, address} : {tweetId: id, address};
    try {
      const response = await fetch(`${CURRENT_URI}/api/v1/submit-tweet`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
        credentials: "include"
      });
      if (response.status === 401) {
        window.$('#loadingModal').modal("hide");
        window.$('body').removeClass('modal-open');
        window.$('.modal-backdrop').remove();
        this.props.onLogout(true);
        return;
      }
      const data = await response.json();
      return data;
    } catch (e) {
      throw new Error("Failed to verify tweet. Please try again.");
    }
  }

  isValidTweetId(tweetId) {
    return tweetId.length >= 18 && /^(0|[1-9]\d*)$/.test(tweetId);
  }

  async isValidUser(tweetId) {
    const username = localStorage.getItem("authenticatedUsername");
    if (!username) {
      this.props.onLogout(true);
      return false;
    }
    try {
      const response = await fetch(`${CURRENT_URI}/api/v1/verify-username`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, tweetId }),
        credentials: "include"
      });
      if (response.status === 401) {
        window.$('#loadingModal').modal("hide");
        window.$('body').removeClass('modal-open');
        window.$('.modal-backdrop').remove();
        this.props.onLogout(true);
        return false;
      } else if (response.status === 200) {
        return true;
      }
      return false;
    } catch (e) {
      console.error(e);
      throw new Error("Failed to verify tweet. Please try again.");
    }
  }

  async submitTweet() {
    const { tweetId } = this.state;
    if (tweetId === "") {
      this.setState({ errMsg: "Tweet ID cannot be empty", showLoading: true });
      return;
    }

    if (!this.isValidTweetId(tweetId)) {
      this.setState({
        errMsg:
          "Invalid tweet ID. Please look at instructions to see what a tweet ID is.",
        showLoading: true
      });
      return;
    }

    let isValidUser = false;
    try {
      isValidUser = await this.isValidUser(tweetId); 
    } catch (e) {
      console.error(e);
      this.setState({
        errMsg:
          "An error occurred, please try again",
        showLoading: true
      });
      return;
    }
    if (!isValidUser) {
      this.setState({
        errMsg:
          "You cannot submit someone else's tweet!",
        showLoading: true
      });
      return;
    }
    const { isVerified, isRegistered } = await getTweetStatus(tweetId);
    if (isVerified) {
      this.setState({
        errMsg: "Tweet ID already submitted. Please submit another tweet ID.",
        showLoading: true
      });
      return;
    }

    if (!this.state.privateKey) {
      this.setState({
        showInput: true
      });
      return;
    }

    const privateKey = this.state.privateKey;

    try {
      this.setState({ showLoading: true });
      let id = tweetId, isTransactionId = false, address = this.props.getAddress();
      if (!isRegistered) {
        const submitData = await _submitTweet(privateKey, tweetId);
        id = submitData.id;
        isTransactionId = true;
        const submittedTweet = (submitData.receipt.event_logs[0]._eventname === "add_new_tweet_sucessful");
        if (!submittedTweet) {
          throw Error(this.props.getMessage(submitData));
        }
      }
      this.setState({ submittedTweet: true });
      const data = await this.getTweetVerification(id, isTransactionId, address);
      const verifiedTweet = (data.receipt.event_logs[0]._eventname === "verify_tweet_successful");
      if (!verifiedTweet) {
        throw Error(this.props.getMessage(data));
      } else {
        this.setState({ verifiedTweet });
      }
    } catch (e) {
      this.setState({ errMsg: e.message });
    }
  }

  handleChange(e) {
    this.setState({ tweetId: e.target.value });
  }

  handleInstructionsClick(e) {
    e.preventDefault();
    const $container = window.$("html,body");
    const $scrollTo = window.$(".instructions-section");
    $container.animate({
      scrollTop:
        $scrollTo.offset().top -
        $container.offset().top +
        $container.scrollTop()
    });
  }

  componentDidMount() {
    this.updateBalance();

    this.updateBalanceInterval = setInterval(() => {
      this.updateBalance();
    }, 10000);

    window.$(".submit-tweet-form").submit(e => {
      e.preventDefault();
    });
  }

  componentWillUnmount() {
    clearInterval(this.updateBalanceInterval);
  }

  clearState() {
    this.setState({
      showLoading: false,
      showInput: false,
      tweetId: "",
      errMsg: null,
      submittedTweet: false,
      verifiedTweet: false
    });
  }

  handleClose() {
    const { submittedTweet, verifiedTweet } = this.state;
    if (submittedTweet && verifiedTweet) {
      this.updateBalance();
    }
    this.clearState();
  }

  componentDidUpdate(prevState) {
    const { showLoading, showInput } = this.state;
    if (showLoading && !prevState.showLoading) {
      const modal = window
        .$("#loadingModal")
        .modal({ backdrop: "static", keyboard: false });
      modal.modal("show");
      window.$("#loadingModal").on("hidden.bs.modal", this.handleClose);
    } else if (showLoading) {
      window.$("#loadingModal").on("hidden.bs.modal", this.handleClose);    
    } 

    if (showInput) {
      const modal = window
        .$("#inputModal")
        .modal({ backdrop: "static", keyboard: false });  
      modal.modal("show");
      window.$("#inputModal").on("hidden.bs.modal", this.handleClose)
    }

    if (this.props.showAlert) {
      window.$("#alert").on("closed.bs.alert", this.props.handleAlertClose);
    }
  }

  handlePrivateKeySubmitted(privateKey) {
    window.$('#inputModal').modal("hide");
    window.$('body').removeClass('modal-open');
    window.$('.modal-backdrop').remove();
    this.setState({
      showInput: false,
      privateKey: privateKey
    });
    this.submitTweet()
  }

  render() {
    const {
      balance,
      submittedTweet,
      verifiedTweet,
      errMsg,
      tweetId,
      showLoading,
      showInput
    } = this.state;

    const validTweetId = this.isValidTweetId(tweetId);

    const loadingPercentages = [0, 50, 100];
    const msg = "\nPlease be patient, do not close this window.";
    let fromLoadingPercent = loadingPercentages[0];
    let toLoadingPercent = loadingPercentages[1];
    let loadingText = "Submitting tweet to contract..." + msg;

    if (submittedTweet && verifiedTweet) { 
      fromLoadingPercent = loadingPercentages[2];
      toLoadingPercent = loadingPercentages[2];
      loadingText = "Tweet is verified. Rewarded ZILs!";
    } else if (submittedTweet) {
      fromLoadingPercent = loadingPercentages[1];
      toLoadingPercent = loadingPercentages[2];
      loadingText = "Verifying tweet hashtag..." + msg;
    }

    const steps = [
      {
        target: ".balance",
        content:
          "You can view your testnet wallet's address here.",
        disableBeacon: true
      }
    ];
    let privateKey;
    if (!this.state.privateKey) {
      privateKey = this.props.getPrivateKey();
    } else {
      privateKey = this.state.privateKey;
    }
    return (
      <div>
        {showInput ? (
          <InputModal
            title="Submit Private Key"
            handleInput={this.handlePrivateKeySubmitted}
          />
        ) : null}
        {showLoading ? (
          <LoadingModal
            errorText={errMsg}
            title="Submitting tweet"
            loadingText={loadingText}
            fromLoadingPercent={fromLoadingPercent}
            toLoadingPercent={toLoadingPercent}
          />
        ) : null}
        <header className="masthead-submit">
          <div className="container h-100">
            <div className="row h-100">
              <div className="balance">
                <p> Balance: {balance} ZILs</p>
                <Link to="/wallet"> Click here for account details</Link>
              </div>
              <div className="col-lg-12 my-auto">
                {this.props.showAlert ? (<div className="alert alert-primary alert-dismissible fade show" id="alert" role="alert">
                  <p>{this.props.alertText}</p>
                  <strong>{privateKey}</strong>
                  <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>) : null}
                <div className="header-content mx-auto">
                  <h1 className="mb-5">Enter your tweet ID</h1>
                  <h2 className="mb-6">
                    Your tweet must include the hashtag,{" "}
                    <a
                      target="_blank"
                      rel="noopener noreferrer"
                      href="https://twitter.com/intent/tweet?hashtags=BuildOnZIL&tw_p=tweetbutton&text=Hello+world&via=zilliqa"
                    >
                      #BuildOnZIL
                    </a>
                  </h2>
                  <div className="row my-auto w-100">
                    <form
                      action="#"
                      className="submit-tweet-form form-inline justify-content-center w-100 mt-5"
                    >
                      <input
                        onChange={this.handleChange}
                        onKeyPress={e => {
                          if (e.key === "Enter") this.submitTweet();
                        }}
                        value={this.state.tweetId}
                        className="form-control mt-2 mb-2 mr-sm-3 pl-3"
                        type="text"
                        placeholder="1083722408815546368"
                      />
                      <div className="submit-tweet-btn shiny-button">
                        <button
                          type="button"
                          onClick={this.submitTweet}
                          className="btn shiny-button-content"
                        >
                          Submit
                        </button>
                      </div>
                    </form>
                  </div>
                  <div className="cta-container col-lg-12 text-center">
                    {validTweetId ? (
                      <span>
                        <TwitterTweetEmbed tweetId={tweetId} />
                      </span>
                    ) : (
                      <span>
                        <p>
                          A tweet ID is the series of numbers in a tweet's URL.
                          You're able to find the tweet URL in your browser's
                          search bar.
                        </p>
                        <img
                          className="mb-5"
                          src="/img/tweet-id.png"
                          alt="Tweet ID"
                        />
                        <br />
                        <a
                          onClick={this.handleInstructionsClick}
                          className="cta-link"
                          href=""
                        >
                          How does this work?
                        </a>
                      </span>
                    )}
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
                <div className="heading">
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
                        rel="noopener noreferrer"
                        href="https://twitter.com/intent/tweet?hashtags=BuildOnZIL&tw_p=tweetbutton&text=Hello+world&via=zilliqa"
                      >
                        #BuildOnZIL
                      </a>
                      .
                    </li>
                    <li>Submit the tweet ID here for verification.</li>
                    <li>Get test tokens for our test blockchain!</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }
}
