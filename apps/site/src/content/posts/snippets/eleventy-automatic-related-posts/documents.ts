import { Related } from "related-documents";

const documents = [
  { title: "ruby", text: "this lorem ipsum blah foo" },
  // ...
];

const options = {
  serializer: (document: any) => [document.title, document.text],
  weights: [10, 1],
};

const related = new Related(documents, options);

related.rank(documents[0]);
// [{absolute: 0-1, relative: 0-INF, document}]
