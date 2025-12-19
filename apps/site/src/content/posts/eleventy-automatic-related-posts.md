---
title: Eleventy Related Posts Using TF-IDF
description: >-
  Automating related posts in Eleventy with term frequency-inverse document
  frequency and eleventy-plugin-related.
pubDate: "2022-04-16"
tags:
  - code
  - eleventy
  - eleventy-plugin
  - tf-idf
  - blog
  - 11ty
---

One of the key features I was missing from my new blog written with [Eleventy](https://11ty.dev) was a widget for related posts. I had already implemented tags, which can serve a similar purpose, but I wanted to experiment with something more automated based upon the content of the post.

## Manual implementations

Here are a couple examples of approaches for more manual implementations.

- [Using frontmatter data](https://www.raymondcamden.com/2021/09/24/creating-a-manual-related-posts-feature-in-eleventy)
- [Matching on tag similarity](https://fossheim.io/writing/posts/eleventy-similar-posts/)

## Term Frequency-Inverse Document Frequency

I am far from a natural language expert, but tf-idf basically computes the importance of a word across a particular collection. For example, the word "the" is going to be incredible common and not significant to any particular document. The inverse of this is that a word that is rare, but shared across documents, would provide a good indicator of similarity. Getting there requires a few steps though.

## Steps from document to related

### Serialize post

Typically a blog post, article, or some other document will have multiple parts (title, excerpt, tags, body, etc) that may need to be transformed and standardized. For example, the following joins some of these components as a single string.

```js
[data.title, data.excerpt, ...data.tags].join(" ");
```

### Tokenize

Tokenize the document string. For example splitting on spaces would be a naive way to tokenize a string.

### Stemming and lemmatization

Use a stemmer to chop off parts of each word. In this case, `cars`, `car's`, `cars'` all become `car`. This is typically a fairly crude heuristic.

Lemmatization is the next step and more advanced. For example, `am`, `are`, `is` all become `be` for instance.

### Compute tf-idf

For this task, I'm using the package, [natural](https://www.npmjs.com/package/natural). A simple example is below.

```js
import { TfIdf } from "natural";

const tfidf = new TfIdf();

tfidf.addDocument("this document is about node.");
tfidf.addDocument("this document is about ruby.");
tfidf.addDocument("this document is about ruby and node.");

tfidf.tfidfs("node ruby", function (i, measure) {
  console.log("document #" + i + " is " + measure);
});
```

## Wrapping it into two libraries

While the package, [natural](https://www.npmjs.com/package/natural), is great for natural language processing, it didn't really offer the interface and abstraction that I wanted to share.

### related-documents

The first layer is the package [related-documents](https://www.npmjs.com/package/related-documents) with the following interface.

```js
import { Related } from "related-documents";

const documents = [
  { title: "ruby", text: "this lorem ipsum blah foo" },
  ...
];

const options = {
  serializer: (document: any) => [document.title, document.text],
  weights: [10, 1],
};

const related = new Related(documents, options);

related.rank(documents[0]);
// [{absolute: 0-1, relative: 0-INF, document}]
```

The output of the above is the following.

```js
{
    "absolute": 4.849271710192877,
    "document": {
        "text": "this document is about ruby and node.",
        "title": "ruby and node",
    },
    "relative": 0.20786000940717744,
}
```

The key features layered above the package natural include:

- weights for different parts of the document
- serialization support
- sensible defaults for tokenization and stemming

The source is available on [GitHub](https://github.com/jpoehnelt/related-documents), and can be installed with the following.

```bash
npm i related-documents
```

[Reference docs](https://jpoehnelt.github.io/related-documents/classes/Related.html) are also available.

### eleventy-plugin-related

To improve the experience for Eleventy developers, I added one more layer to the onion, [eleventy-plugin-related](https://www.npmjs.com/package/eleventy-plugin-related). What's one more dependency in the JavaScript world! 😄

The basic usage is as follows.

```js
eleventyConfig.addFilter(
  "related",
  require("eleventy-plugin-related").related({
    serializer: (doc) => [doc.title, doc.description ?? "", doc.text ?? ""],
    weights: [10, 1, 3],
  }),
);
```

Eleventy gives a ton of flexibility and some times the boundaries of what is a plugin and what is just a node library are not very clear. It's definitely the case here and additional usage and feature requests will give some better definition.

## Implementation here

So how am I using these two libraries in my blog?

- Joining the title and excerpts into a single string
- Equal weights between the title/excerpt and tags

```js
const related = require("eleventy-plugin-related").related({
  serializer: ({ data: { title, excerpt, tags } }) => [
    [title, excerpt].join(" "),
    (tags || []).join(" "),
  ],
  weights: [1, 1],
});

eleventyConfig.addFilter("relatedPosts", function (doc, docs) {
  return related(doc, docs).filter(({ relative }) => relative > 0.1);
});
```

Obviously there are some inefficiencies here combining tags into a single string and then tokenizing the later.

However the results are fairly promising, although the tags are probably doing much of the work at this point with the small number of posts.
