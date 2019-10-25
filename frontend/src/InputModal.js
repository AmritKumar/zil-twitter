import React, { Component } from "react";

export default class LoadingModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      input: "",
      keystore: ""
    };
    this.onChange = this.onChange.bind(this);
    this.onChangeFile = this.onChangeFile.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  readUploadedFileAsText(inputFile) {
    const temporaryFileReader = new FileReader();

    return new Promise((resolve, reject) => {
      temporaryFileReader.onerror = () => {
        temporaryFileReader.abort();
        reject(new Error("Problem parsing input file."));
      };

      temporaryFileReader.onload = () => {
        resolve(temporaryFileReader.result);
      };
      temporaryFileReader.readAsText(inputFile);
    });
  }

  async onChangeFile(e) {
    const file = e.target.files[0];

    const keystore = await this.readUploadedFileAsText(file);

    this.setState({
      keystore: keystore
    });

  }

  onChange(e) {
    this.setState({
      input: e.target.value
    });
  }

  handleSubmit() {
    this.props.handleInput({passphrase: this.state.input, keystore: this.state.keystore});
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
                className="submit-tweet-form form-inline w-100 mt-5">
                <p>To confirm your transaction please select your Keystore File and enter your passphrase.</p>
                <input onChange={this.onChangeFile}
                  className="form-control mt-2 mb-2 mr-sm-3 pl-3 border-0"
                  type="file"
                  placeholder="Private Key"
                />
                <input onChange={this.onChange}
                  onKeyPress={e => {
                    if (e.key === "Enter") this.handleSubmit();
                  }}
                  value={this.state.input}
                  className="form-control mt-2 mb-2 mr-sm-3 pl-3"
                  placeholder="Keystore Passphrase"
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
