import React, { Component } from "react";
import Joyride from "react-joyride";
import LoadingModal from "./LoadingModal";
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
    this.submitTweet = this.submitTweet.bind(this);
    this.updateBalance = this.updateBalance.bind(this);
    this.getTweetVerification = this.getTweetVerification.bind(this);
    this.clearState = this.clearState.bind(this);
    this.isValidUser = this.isValidUser.bind(this);
    this.shownIntro = localStorage.getItem("shownIntro");
    this.state = {
      showLoading: false,
      tweetId: "",
      errMsg: null,
      submittedTweet: false,
      verifiedTweet: false,
      balance: 0,
      runIntro: false,
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
      console.error(e);
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
        privateKey: this.props.getPrivateKey(true)
      });
      if (!this.state.privateKey) {
        return;
      }
    }

    const privateKey = this.state.privateKey;

    try {
      this.setState({ showLoading: true });
      let id = tweetId, isTransactionId = false, address = this.props.getAddress();
      if (!isRegistered) {
        const { txnId } = await _submitTweet(privateKey, tweetId);
        id = txnId;
        isTransactionId = true;
      }
      this.setState({ submittedTweet: true });
      const data = await this.getTweetVerification(id, isTransactionId, address);
      console.log(data);
      this.setState({ verifiedTweet: data.receipt.success });
    } catch (e) {
      console.error(e);
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

    if (!this.shownIntro) {
      setTimeout(() => {
        this.setState({ runIntro: true });
        localStorage.setItem("shownIntro", JSON.stringify(true));
      }, 1000);
    }

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
      tweetId: "",
      errMsg: null,
      submittedTweet: false,
      verifiedTweet: false,
    });
  }

  componentDidUpdate(prevState) {
    const {
      submittedTweet,
      verifiedTweet,
      showLoading
    } = this.state;
    if (submittedTweet && verifiedTweet) {
      // clear form
      setTimeout(() => {
        window.$("#loadingModal").modal("hide");
        this.updateBalance();
        this.clearState();
      }, 5000);
    }

    if (showLoading && !prevState.showLoading) {
      const modal = window
        .$("#loadingModal")
        .modal({ backdrop: "static", keyboard: false });
      modal.modal("show");
      window.$("#loadingModal").on("hidden.bs.modal", this.clearState);
    }
  }

  render() {
    const {
      balance,
      submittedTweet,
      verifiedTweet,
      errMsg,
      runIntro,
      tweetId,
      showLoading,
    } = this.state;

    const validTweetId = this.isValidTweetId(tweetId);

    const loadingPercentages = [0, 33.33, 66.66, 100];
    const msg = "\nPlease be patient, do not close this window.";
    let fromLoadingPercent = loadingPercentages[0];
    let toLoadingPercent = loadingPercentages[1];
    let loadingText = "Submitting tweet to contract..." + msg;

    if (submittedTweet && verifiedTweet) { 
      fromLoadingPercent = loadingPercentages[2];
      toLoadingPercent = loadingPercentages[3];
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
        {showLoading ? (
          <LoadingModal
            errorText={errMsg}
            title="Submitting tweet"
            loadingText={loadingText}
            fromLoadingPercent={fromLoadingPercent}
            toLoadingPercent={toLoadingPercent}
          />
        ) : null}
        <Joyride
          steps={steps}
          run={runIntro}
          styles={{
            options: {
              primaryColor: "#42e8e0"
            }
          }}
        />
        <header className="masthead-submit">
          <div className="container h-100">
            <div className="row h-100">
              <div className="balance">
                <Link to="/wallet">Balance: {balance} ZILs</Link>
              </div>
              <div className="col-lg-12 my-auto">
                {this.props.showAlert ? (<div className="alert alert-primary alert-dismissible fade show" role="alert">
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
