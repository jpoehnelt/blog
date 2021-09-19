import * as React from "react";

import Layout from "../components/layout";
import RecentPosts from "../components/recent-posts";
import Seo from "../components/seo";
import { graphql } from "gatsby";

const RunIndex = ({ data, location }) => {
  const siteTitle = data.site.siteMetadata?.title || `Title`;
  const posts = data.allMarkdownRemark.nodes;

  return (
    <Layout location={location} title={siteTitle}>
      <Seo title="Blog posts about running" />
      <h1>Ultra running</h1>
      <p className="lead">
        Since about 2017, I have become a more avid runner thanks to
        encouragement from my absolutely wonderful partner. So far I have
        competed in about 15 ultras, with distances up to 100 miles.
      </p>

      <h2>Upcoming races</h2>
      <ul>
        <li>2021-10-02 Crested Butte 50k</li>
        <li>2021-11-20 Dead Horse Ultra 50m</li>
        <li>2022-01-29 Arches Ultra 50k</li>
        <li>2022-02-19 Moab Red Hot 50k</li>
        <li>2022-03-26 Behind the Rocks 50k</li>
      </ul>
      <h2>Notable races</h2>
      <ul>
        <li>
          2021-09-11 Mogollon Monster 100m - 11th (
          <a
            href="https://justin.poehnelt.com/mogollon-monster-100/"
            title="Race report for Mogollon Monster 100"
          >
            Race report
          </a>
          )
        </li>
        <li>2021-06-26 Bears Ears Ultra 50m - 3rd</li>
      </ul>
      <h2>Recent activity</h2>
      <p>I track all my runs on Strava!</p>
      <iframe
        frameborder="0"
        allowtransparency="true"
        scrolling="no"
        className="strava"
        src="https://www.strava.com/athletes/2170160/activity-summary/013e1f953c1f06d6e2bd44ea49d7aedc43324cd9"
      ></iframe>
      <RecentPosts posts={posts} />
    </Layout>
  );
};

export default RunIndex;

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allMarkdownRemark(
      filter: { frontmatter: { type: { eq: "run" } } }
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
