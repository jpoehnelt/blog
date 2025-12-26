// See `memoize` from https://justin.poehnelt.com/posts/apps-script-memoization/
const predictMemoized = memoize(predict);

function _debug() {
  Logger.log(
    predictMemoized(
      "What was the first computer program to return 'Hello World'?",
    ),
  );
}
