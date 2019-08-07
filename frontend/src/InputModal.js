import React, { Component } from "react";

export default class LoadingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: ""
    };
    this.onChange = this.onChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onChange(e) {
    this.setState({
      input: e.target.value
    });
  }

  handleSubmit() {
    this.props.handleInput(this.state.input);
  }

  render() {
    return (
      <div
        className="modal loading-modal fade"
        id="inputModal"
        tabIndex="-1"
        role="dialog"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog" role="document">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" id="exampleModalLabel">
                {this.props.title}
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
              <form action="#"
                className="submit-tweet-form form-inline justify-content-center w-100 mt-5">
                <input onChange={this.onChange}
                  onKeyPress={e => {
                      if (e.key === "Enter") this.handleSubmit();
                  }}
                  value={this.state.input}
                  className="form-control mt-2 mb-2 mr-sm-3 pl-3"
                  type="password"
                />
              </form>
            </div>
            <div className="modal-footer">
              <button
                type="button"
                onClick={this.handleSubmit}
                className="btn btn-secondary"
                data-dismiss="modal"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
