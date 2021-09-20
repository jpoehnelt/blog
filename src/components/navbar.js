import Container from "./container";
import { Link } from "gatsby";
import React from "react";
import { StaticImage } from "gatsby-plugin-image";

export default ({ title }) => {
  const [navbarOpen, setNavbarOpen] = React.useState(false);
  const links = ["Code", "Run"].map((l) => (
    <Link
      key={l}
      to={`/${l.toLowerCase()}`}
      className={
        "px-3 tracking-wide hover:underline w-full md:w-auto text-center md:text-right"
      }
    >
      {l}
    </Link>
  ));

  return (
    <>
      <nav className="relative mb-8 text-xl shadow-md bg-brand text-gray-50">
        <Container className="flex flex-col md:flex-row items-center">
          <div className="w-full relative flex justify-between md:w-auto md:static md:block md:justify-start">
            <Link
              className="inline-block text-3xl mr-4 py-2 whitespace-no-wrap flex justify-center items-center"
              to="/"
            >
              <StaticImage
                className="rounded-full"
                layout="fixed"
                formats={["auto", "webp", "avif"]}
                src="../images/profile-pic.png"
                width={50}
                height={50}
                quality={95}
                alt="Justin Poehnelt"
              />
              <div className="ml-3">{title}</div>
            </Link>
            <button
              aria-label="Toggle navigation"
              className="cursor-pointer leading-none px-3 py-1 rounded bg-transparent block md:hidden outline-none focus:outline-none"
              type="button"
              onClick={() => setNavbarOpen(!navbarOpen)}
            >
              <svg viewBox="0 0 100 80" width="40" height="40" className={"fill-current"}>
                <rect width="100" height="8" rx="8"></rect>
                <rect y="30" width="100" height="8" rx="8"></rect>
                <rect y="60" width="100" height="8" rx="8"></rect>
              </svg>
            </button>
          </div>

          <div
            className={
              "flex-grow flex-col md:flex-row list-none md:justify-end md:align-stretch gap-y-2 my-2 md:py-0 w-full md:w-auto" +
              (navbarOpen ? " flex" : " hidden md:flex")
            }
          >
            {links}
          </div>
        </Container>
      </nav>
    </>
  );
};
