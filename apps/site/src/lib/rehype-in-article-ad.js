import { visit } from "unist-util-visit";
import { h } from "hastscript";

const AD_CLIENT = "ca-pub-1251836334060830";
const AD_SLOT = "3423675305";

/** First ad appears before this h2 number (1-indexed). */
const FIRST_AD_AT_H2 = 2;
/** After the first ad, insert another every N h2s. */
const H2_INTERVAL = 3;

/** Fallback: insert after every N paragraphs when there are fewer than 2 h2s. */
const FIRST_AD_AT_P = 2;
const P_INTERVAL = 5;

/** Hard cap on the number of ads per post. */
const MAX_ADS = 2;

function createAdNode() {
  return h("div", { class: "in-article-ad" }, [
    h("ins", {
      class: "adsbygoogle",
      style: "display:block; text-align:center;",
      "data-ad-layout": "in-article",
      "data-ad-format": "fluid",
      "data-ad-client": AD_CLIENT,
      "data-ad-slot": AD_SLOT,
    }),
  ]);
}

function collectInsertions(tree, tag, firstAt, interval, after) {
  let count = 0;
  const insertions = [];

  visit(tree, "element", (node, index, parent) => {
    if (node.tagName !== tag) return;
    if (insertions.length >= MAX_ADS) return;
    count++;

    const shouldInsert =
      count === firstAt ||
      (count > firstAt && (count - firstAt) % interval === 0);

    if (shouldInsert && parent && typeof index === "number") {
      // "before" → insert at index; "after" → insert at index + 1
      insertions.push({ parent, index: after ? index + 1 : index });
    }
  });

  return insertions;
}

/**
 * Rehype plugin that inserts AdSense in-article ad units.
 *
 * - Posts with ≥ 2 h2s: ads before h2 #2, then every 3 h2s (#5, #8, …)
 * - Posts with < 2 h2s: fallback to after paragraph #4, then every 5 paragraphs
 */
export default function rehypeInArticleAd() {
  return (tree) => {
    // Count h2s first to decide strategy
    let h2Count = 0;
    visit(tree, "element", (node) => {
      if (node.tagName === "h2") h2Count++;
    });

    const insertions =
      h2Count >= 2
        ? collectInsertions(tree, "h2", FIRST_AD_AT_H2, H2_INTERVAL, false)
        : collectInsertions(tree, "p", FIRST_AD_AT_P, P_INTERVAL, true);

    // Splice in reverse order so earlier indices stay valid
    for (let i = insertions.length - 1; i >= 0; i--) {
      const { parent, index } = insertions[i];
      parent.children.splice(index, 0, createAdNode());
    }
  };
}
