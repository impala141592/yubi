import React from "react";

const ProgressBar = ({ isOptimizing }) => {
  return (
    <div className="progress-bar">
      <div
        className={`progress-bar-inner ${isOptimizing ? "optimizing" : ""}`}
      ></div>
    </div>
  );
};

export default ProgressBar;
