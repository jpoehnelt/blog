/**
 * A generic hash function that takes a string and computes a hash using the
 * specified algorithm.
 *
 * @param {string} str - The string to hash.
 * @param {Utilities.DigestAlgorithm} algorithm - The algorithm to use to
 *  compute the hash. Defaults to MD5.
 * @returns {string} The base64 encoded hash of the string.
 */
function hash(str, algorithm = Utilities.DigestAlgorithm.MD5) {
  const digest = Utilities.computeDigest(algorithm, str);

  return Utilities.base64Encode(digest);
}
