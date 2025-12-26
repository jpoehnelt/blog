import { TfIdf } from "natural";

const tfidf = new TfIdf();

tfidf.addDocument("this document is about node.");
tfidf.addDocument("this document is about ruby.");
tfidf.addDocument("this document is about ruby and node.");

tfidf.tfidfs("node ruby", function (i, measure) {
  console.log("document #" + i + " is " + measure);
});
