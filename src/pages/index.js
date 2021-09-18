import * as React from "react";

import Layout from "../components/layout";
import RecentPosts from "../components/recent-posts";
import Seo from "../components/seo";
import { graphql } from "gatsby";

const Index = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`;
  const posts = data.allMarkdownRemark.nodes;

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="All posts" />
      <h1>About me</h1>
      <p className="lead">
        I am a Developer Relations Engineer at Google, ultra runner, and DIYer.
      </p>
      <RecentPosts posts={posts}></RecentPosts>
    </Layout>
  );
};

export default Index;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(sort: { fields: [frontmatter___date], order: DESC }) {
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
