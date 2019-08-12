import React, { Component } from "react";
import { Link } from "react-router-dom";
const { units, BN } = require("@zilliqa-js/util");
const { zilliqa } = require("./zilliqa");

export default class Wallet extends Component {
  constructor() {
    super();
    this.updateBalance = this.updateBalance.bind(this);
    this.state = {
      balance: 0
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

  copyToClipboard(str) {
    const el = document.createElement("textarea");
    el.value = str;
    document.body.appendChild(el);
    el.select();
    document.execCommand("copy");
    document.body.removeChild(el);
  }

  componentDidMount() {
    this.updateBalance();

    this.updateBalanceInterval = setInterval(() => {
      this.updateBalance();
    }, 5000);
  }

  componentWillUnmount() {
    clearInterval(this.updateBalanceInterval);
  }

  render() {
    const { balance } = this.state;
    const address = this.props.getAddress();
    return (
      <header className="masthead-wallet">
        <div className="container h-100">
          <div className="row h-100">
            <div className="col-lg-12 my-auto">
              <div className="header-content mx-auto">
                <div className="card">
                  <div className="card-body">
                    <div style={{ marginBottom: 30 }}>
                      <Link to="/submit">
                        <i className="fas fa-arrow-left mr-2" />
                        Back to Submitting Tweet
                      </Link>
                    </div>
                    <h1>Wallet address</h1>
                    <p> You can use this wallet to ...... </p>
                    <div>
                      <div className="row">
                        <div className="col-lg-3">Balance</div>
                        <div className="col-lg-7">{balance} ZIL</div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3">Address</div>
                        <div className="col-lg-7">
                          <span>{address}</span>
                          <i
                            onClick={e => this.copyToClipboard(address)}
                            className="fas fa-paste pl-2"
                          />
                        </div>
                      </div>
                      <div className="row">
                        <div className="col-lg-3">Explorer</div>
                        <div className="col-lg-7">
                          <a
                            href={`https://viewblock.io/zilliqa/address/${
                              address
                            }?network=testnet`}
                          >
                            View on ViewBlock.io
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>
    );
  }
}
