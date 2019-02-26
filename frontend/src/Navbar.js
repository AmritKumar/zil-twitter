import React from "react";
import TwitterLogin from "react-twitter-auth";
import { Link } from "react-router-dom";

const Navbar = props => {
  return (
    <nav
      className="navbar navbar-expand-lg navbar-light fixed-top"
      id="mainNav"
    >
      <div className="container">
        <Link className="navbar-brand js-scroll-trigger" to="/">
          SocialPlay
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
              <a className="nav-link js-scroll-trigger" href="#download">
                About
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#download">
                Financial Grant
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#download">
                How to build this?
              </a>
            </li>
            <li className="nav-item">
              <a className="nav-link js-scroll-trigger" href="#features">
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
                  loginUrl="http://localhost:4000/api/v1/auth/twitter"
                  onFailure={props.onLoginFail}
                  onSuccess={props.onLoginSuccess}
                  requestTokenUrl="http://localhost:4000/api/v1/auth/twitter/reverse"
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
