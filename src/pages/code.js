import * as React from "react";

import Layout from "../components/layout";
import RecentPosts from "../components/recent-posts";
import Seo from "../components/seo";
import { graphql } from "gatsby";

const CodeIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`;
  const posts = data.allMarkdownRemark.nodes;

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts about code and software development" />
      <h1 id="about">Software developer</h1>
      <p className="lead">
        I am a <strong>Developer Relations Engineer</strong> at Google for
        Google Maps Platform with a background in geospatial applications and
        satellite imagery. Previously I worked at{" "}
        <a href="https://www.descarteslabs.com/">Descartes Labs</a> and the{" "}
        <a href="https://www.usgs.gov/">US Geological Survey</a>.
      </p>
      <p className="lead">
        Approximately two thirds of my work is supporting open source and much
        of that is within the{" "}
        <a href="https://github.com/googlemaps">
          Google Maps GitHub organization
        </a>
        . The remainder of my development work is internal to Google and focused
        on fixing bugs, enabling new features, and creating processes for a
        better development experience.
      </p>
      <h1 id="open-source-development-stats">Open source development stats</h1>
      <p>
        I am active on GitHub and track some of my development activity for open
        source.
      </p>
      <p>
        <img
          src="https://github-readme-stats.vercel.app/api?username=jpoehnelt&amp;show_icons=true&amp;&amp;theme=nord&amp;hide_border=true&amp;count_private=true&amp;hide=issues&amp;custom_title=Github%20Stats"
          alt="jpoehnelt&#39;s github stats"
        />
      </p>
      <p>
        <img
          src="https://github-readme-stats.vercel.app/api/wakatime?username=jpoehnelt&amp;layout=compact&amp;theme=nord&amp;hide_border=true&amp;custom_title=Other%20Stats"
          alt="jpoehnelt&#39;s wakatime stats"
        />
      </p>

      <RecentPosts posts={posts} />
    </Layout>
  );
};

export default CodeIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { type: { eq: "code" } } }
      sort: { fields: [frontmatter___date], order: DESC }
    ) {
      nodes {
        excerpt
        fields {
          slug
        }
        frontmatter {
          date(formatString: "MMMM DD, YYYY")
          title
          description
        }
      }
    }
  }
`;
