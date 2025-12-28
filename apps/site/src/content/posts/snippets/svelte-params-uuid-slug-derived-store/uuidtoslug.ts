const toBase64: (bytes: Uint8Array) => string = (() => {
  if (typeof Buffer !== "undefined") {
    return (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
  }
  return (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
})();

const fromBase64: (base64: string) => Uint8Array | Buffer = (() => {
  if (typeof Buffer !== "undefined") {
    return (base64: string) => Buffer.from(base64, "base64");
  }
  return (base64: string) =>
    Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
})();

/**
 * Returns the given uuid as a 22 character slug. This can be a regular v4
 * slug or a "nice" slug.
 */
export function uuidToSlug(id: string) {
  const bytes = uuid.parse(id);
  const base64 = toBase64(bytes);
  const slug = base64
    .replace(/\+/g, "-") // Replace + with - (see RFC 4648, sec. 5)
    .replace(/\//g, "_") // Replace / with _ (see RFC 4648, sec. 5)
    .substring(0, 22); // Drop '==' padding
  return slug;
}

/**
 * Returns the uuid represented by the given slug
 */
export function slugToUUID(slug: string) {
  const base64 = `${slug.replace(/-/g, "+").replace(/_/g, "/")}==`;
  return uuid.stringify(fromBase64(base64));
}
