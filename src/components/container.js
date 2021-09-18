import React from "react";

const Container = ({ children, className }) => (
  <div className={`container ${className}`}>{children}</div>
);

export default Container;