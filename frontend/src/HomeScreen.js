import TwitterLogin from "react-twitter-auth";
import React, { Component } from "react";
import { CURRENT_URI } from "./utils";

const loginUrl = `${CURRENT_URI}/api/v1/auth/twitter`;
const requestTokenUrl = `${CURRENT_URI}/api/v1/auth/twitter/reverse`;

export default class HomeScreen extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {handleAlertClose, showAlert} = this.props;
    if (showAlert) {
      window.$("#alert").on("closed.bs.alert", handleAlertClose);
    }
  }

  render() {
    const { showAlert, alertText } = this.props;
    return (
      <div>
      <header className="masthead">
        <div className="container h-100">
          <div className="row h-100">
            <div className="col-lg-5 my-auto">
              {showAlert ? (<div className="alert alert-primary alert-dismissible fade show" role="alert" id="alert">
                <strong>{alertText}</strong>
                <button type="button" className="close" data-dismiss="alert" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>) : null}
              <div className="header-content mx-auto">
                <h1 className="mb-5">
                  Get automatically paid test tokens for tweeting
                </h1>
                <h2>Demo blockchain application by Zilliqa</h2>
                <br />
                <TwitterLogin
                  loginUrl={loginUrl}
                  onFailure={this.props.onLoginFail}
                  onSuccess={this.props.onLoginSuccess}
                  requestTokenUrl={requestTokenUrl}
                  credentials="include"
                  className="twitter-login btn shiny-button-content"
                >
                  <div className="shiny-button">
                    <a className="btn shiny-button-content">
                      <i className="fab fa-twitter mr-2" />
                      JOIN SOCIAL PAY WITH TWITTER [DEMO]
                    </a>
                  </div>
                </TwitterLogin>
              </div>
            </div>
            <div className="col-lg-7 my-auto">
              <img src="img/hero-img-min.svg" className="img-fluid" alt="" />
            </div>
          </div>
        </div>
      </header>
      <div className="section py-5">
        <div className="container text-center">
          <h2 className="title mb-5">How to use SocialPay?</h2>

          <div className="row">
            <div className="col-12 text-center d-none d-md-block">
                <iframe width="560" height="315" src="https://www.youtube.com/embed/pagcITLyqLY" frameframeBorderborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
            </div>

              <div className="col-12 text-center d-block d-md-none">
                <iframe width="280" height="157" src="https://www.youtube.com/embed/pagcITLyqLY" frameBorder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
              </div>
          </div>

        </div>
      </div>
      </div>
    );
  }
}
