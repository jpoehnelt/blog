import Article from "../components/Article";
import Page from "../components/Page";
import PropTypes from "prop-types";
import React from "react";
import Seo from "../components/Seo";
import { ThemeContext } from "../layouts";
import { graphql } from "gatsby";

const PageTemplate = props => {
  const page = props.data.page;

  return (
    <React.Fragment>
      <ThemeContext.Consumer>
        {theme => (
          <Article theme={theme}>
            <Page page={page} theme={theme} />
          </Article>
        )}
      </ThemeContext.Consumer>

      <Seo data={page} />
    </React.Fragment>
  );
};

PageTemplate.propTypes = {
  data: PropTypes.object.isRequired
};

export default PageTemplate;

//eslint-disable-next-line no-undef
export const pageQuery = graphql`
  query PageByPath($slug: String!) {
    page: markdownRemark(fields: { slug: { eq: $slug } }) {
      id
      html
      htmlAst
      frontmatter {
        title
        cover {
          childImageSharp {
            resize(width: 300) {
              src
            }
          }
        }
        tags
      }
    }
  }
`;
