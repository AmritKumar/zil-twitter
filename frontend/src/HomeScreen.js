import React, { Component } from "react";

export default class HomeScreen extends Component {
  render() {
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
                <div className="shiny-button">
                  <button className="btn shiny-button-content">
                    <i className="fab fa-twitter" />
                    JOIN SOCIAL PAY WITH TWITTER [DEMO]
                  </button>
                </div>
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
  }
}
