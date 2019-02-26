import TwitterLogin from "react-twitter-auth";
import { Redirect } from "react-router-dom";
import React, { Component } from "react";

const HomeScreen = props => {
  const { isAuthenticated, onLoginSuccess, onLoginFail, user, token } = props;

  const privateKey = localStorage.getItem("privateKey");

  if (isAuthenticated) {
    // if privateKey was generated before, redirect to the submitTweet page to be used
    if (privateKey) {
      return (
        <Redirect
          to={{
            pathname: "/submit",
            state: { isAuthenticated, user, token }
          }}
        />
      );
    }
    return (
      <Redirect
        to={{
          pathname: "/create",
          state: { isAuthenticated, user, token }
        }}
      />
    );
  }

  return (
    <header className="masthead">
      <div className="container h-100">
        <div className="row h-100">
          <div className="col-lg-5 my-auto">
            <div className="header-content mx-auto">
              <h1 className="mb-5">
                Get automatically paid test tokens for tweeting
              </h1>
              <h2>Demo blockchain application by Zilliqa</h2>
              <br />
              <TwitterLogin
                loginUrl="http://localhost:4000/api/v1/auth/twitter"
                onFailure={props.onLoginFail}
                onSuccess={props.onLoginSuccess}
                requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"
                className="twitter-login"
              >
                <div className="shiny-button">
                  <button className="btn shiny-button-content">
                    <i className="fab fa-twitter" />
                    JOIN SOCIAL PAY WITH TWITTER [DEMO]
                  </button>
                </div>
              </TwitterLogin>
            </div>
          </div>
          <div className="col-lg-7 my-auto">
            <img src="img/hero-img-min.svg" className="img-fluid" alt="" />
          </div>
          <div className="cta-container col-lg-12 text-center">
            <a className="cta-link" href="">
              Learn how to build such a blockchain application here.
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default HomeScreen;
