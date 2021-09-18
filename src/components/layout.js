import "./global.scss";

import * as React from "react";

import Container from "./container";
import { Link } from "gatsby";
import Navbar from "./navbar";

const Layout = ({ location, title, children }) => {
  const rootPath = `${__PATH_PREFIX__}/`;
  const isRootPath = location.pathname === rootPath;
  let header;

  if (isRootPath) {
    header = (
      <h1 className="main-heading">
        <Link to="/">{title}</Link>
      </h1>
    );
  } else {
    header = (
      <Link className="header-link-home" to="/">
        {title}
      </Link>
    );
  }

  return (
    <div className="global-wrapper" data-is-root-path={isRootPath}>
      <Navbar title={title}></Navbar>
      <main>
        <Container>{children}</Container>
      </main>
      <footer className={"py-2"}>
        <Container>© {new Date().getFullYear()} Justin Poehnelt</Container>
      </footer>
    </div>
  );
};

export default Layout;
