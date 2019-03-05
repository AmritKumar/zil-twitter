import React from "react";
import TwitterLogin from "react-twitter-auth";
import { Link } from "react-router-dom";
import { CURRENT_URI } from "./utils";

const loginUrl = `${CURRENT_URI}/api/v1/auth/twitter`;
const requestTokenUrl = `${CURRENT_URI}/api/v1/auth/twitter/reverse`;

const Navbar = props => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light fixed-top"
      id="mainNav"
    >
      <div className="container">
        <Link className="navbar-brand js-scroll-trigger" to="/">
          SocialPay
        </Link>
        <button
          className="navbar-toggler navbar-toggler-right"
          type="button"
          data-toggle="collapse"
          data-target="#navbarResponsive"
          aria-controls="navbarResponsive"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="mr-2">Menu</span>
          <i className="fas fa-bars" />
        </button>
        <div className="collapse navbar-collapse" id="navbarResponsive">
          <ul className="navbar-nav ml-auto">
            <li className="nav-item">
              <a
                className="nav-link js-scroll-trigger"
                href="https://zilliqa.com/about-us.html"
              >
                About
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link js-scroll-trigger"
                href="https://docs.google.com/forms/d/e/1FAIpQLSfwHlcQrSzaly9Jc78cDAF-oAjJLskToZT_kGgzz2JUvy6w2A/viewform"
              >
                Financial Grant
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link js-scroll-trigger"
                href="https://zilliqa.com/for-developers.html"
              >
                How to build this?
              </a>
            </li>
            <li className="nav-item">
              <a
                className="nav-link js-scroll-trigger"
                href="https://forum.zilliqa.com/"
              >
                Contact
              </a>
            </li>
            {/*<li className="nav-item">
                <a className="nav-link js-scroll-trigger" href="#contact">
                  Sign In
                </a>
              </li>*/}
            {!props.isAuthenticated ? (
              <li className="nav-item">
                <TwitterLogin
                  loginUrl={loginUrl}
                  onFailure={props.onLoginFail}
                  onSuccess={props.onLoginSuccess}
                  requestTokenUrl={requestTokenUrl}
                  className="twitter-login"
                >
                  <a className="nav-link js-scroll-trigger" href="#sign-in">
                    Sign In
                  </a>
                </TwitterLogin>
              </li>
            ) : (
              <li className="nav-item">
                <a
                  onClick={props.onLogout}
                  className="nav-link js-scroll-trigger"
                  href="#logout"
                >
                  Logout
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
