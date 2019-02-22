import React from "react";
import { Circle } from "rc-progress";

const LoadingModal = props => {
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
            <div className="loader mb-3">
              <Circle
                percent={props.loadingPercent}
                strokeWidth="5"
                strokeColor="#42e8e0"
              />
            </div>
            <span>{props.loadingText}</span>
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              data-dismiss="modal"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
export default LoadingModal;
