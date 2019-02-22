import React, { Component } from "react";

export default class Navbar extends Component {
  render() {
    return (
      <nav
        className="navbar navbar-expand-lg navbar-light fixed-top"
        id="mainNav"
      >
        <div className="container">
          <a className="navbar-brand js-scroll-trigger" href="#page-top">
            SocialPay
          </a>
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
              <li className="nav-item">
                <a className="nav-link js-scroll-trigger" href="#contact">
                  Sign In
                </a>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    );
  }
}
