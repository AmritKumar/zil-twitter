import React, { Component } from "react";
import { Circle } from "rc-progress";

export default class LoadingModal extends Component {
  constructor(props) {
    super(props);
    this.updateProgressBar = this.updateProgressBar.bind(this);
    this.state = {
      loadingTicks: 0,
      loadingPercent: props.fromLoadingPercent
    };
    this.updateProgressInterval = null;
  }

  updateProgressBar() {
    clearInterval(this.updateProgressInterval);

    const { fromLoadingPercent, toLoadingPercent } = this.props;
    this.setState({
      loadingPercent: fromLoadingPercent,
      loadingTicks: 0
    });

    const MAX_TICKS = 30;
    const incrementProgress =
      (toLoadingPercent - fromLoadingPercent) / MAX_TICKS;

    this.updateProgressInterval = setInterval(() => {
      if (this.state.loadingTicks >= MAX_TICKS) {
        clearInterval(this.updateProgressInterval);
      } else {
        let { loadingTicks, loadingPercent } = this.state;
        loadingTicks += 1;
        loadingPercent += incrementProgress;
        this.setState({ loadingPercent, loadingTicks });
      }
    }, 1000);
  }

  componentDidMount() {
    this.updateProgressBar();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.fromLoadingPercent !== this.props.fromLoadingPercent) {
      this.updateProgressBar();
    }
  }

  componentWillUnmount() {
    clearInterval(this.updateProgressInterval);
  }

  render() {
    const LOADING_COLOR = "#42e8e0";
    const ERROR_COLOR = "#c62828";
    const { loadingPercent } = this.state;
    const props = this.props;

    return (
      <div
        className="modal loading-modal fade"
        id="loadingModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {props.title}
              </h5>
              <button
                type="button"
                className="close"
                data-dismiss="modal"
                aria-label="Close"
              >
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div className="modal-body">
              <div className="loader mb-3 text-center">
                {loadingPercent === 100 ? <i className="fas fa-check" /> : null}
                {props.errorText ? <i className="fas fa-times" /> : null}
                <Circle
                  percent={props.errorText ? 100 : loadingPercent}
                  strokeWidth="5"
                  strokeColor={props.errorText ? ERROR_COLOR : LOADING_COLOR}
                />
              </div>
              <span className="text-center mr-5 ml-5">
                {props.errorText ? props.errorText : props.loadingText}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
