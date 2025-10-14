const slugify = require("slugify");

// https://icones.js.org/
const icons = {
  "apps script": { class: "i-vscode-icons-file-type-appscript", ratio: 1 },
  cloudflare: { class: "i-logos-cloudflare-icon", ratio: 1 },
  "cloudflare workers": { class: "i-logos-cloudflare-icon", ratio: 1 },
  // gemini: { class: "i-logos-google-gemini", ratio: 4 },
  gmail: { class: "i-logos-google-gmail", ratio: 1 },
  "google calendar": { class: "i-logos-google-calendar", ratio: 1 },
  calendar: { class: "i-logos-google-calendar", ratio: 1 },
  "google cloud": { class: "i-logos-google-cloud", ratio: 1 },
  "google drive": { class: "i-logos-google-drive", ratio: 1 },
  drive: { class: "i-logos-google-drive", ratio: 1 },
  "google maps": { class: "i-logos-google-maps", ratio: 1 },
  "google meet": { class: "i-logos-google-meet", ratio: 1 },
  meet: { class: "i-logos-google-meet", ratio: 1 },
  firebase: { class: "i-logos-firebase", ratio: 1 },
  aws: { class: "i-logos-aws", ratio: 1 },
  docker: { class: "i-logos-docker-icon", ratio: 1 },
  github: { class: "i-logos-github-octocat", ratio: 1 },
  google: { class: "i-logos-google-icon", ratio: 1 },
  html: { class: "i-logos-html-5", ratio: 1 },
  javascript: { class: "i-logos-javascript", ratio: 1 },
  kubernetes: { class: "i-logos-kubernetes", ratio: 1 },
  linux: { class: "i-logos-linux", ratio: 1 },
  microsoft: { class: "i-logos-microsoft", ratio: 1 },
  nodejs: { class: "i-logos-nodejs", ratio: 1 },
  npm: { class: "i-logos-npm", ratio: 1 },
  python: { class: "i-logos-python", ratio: 1 },
  react: { class: "i-logos-react", ratio: 1 },
  rust: { class: "i-skill-icons-rust", ratio: 1 },
  typescript: { class: "i-logos-typescript-icon", ratio: 1 },
  nginx: { class: "i-logos-nginx", ratio: 1 },
  debian: { class: "i-logos-debian", ratio: 1 },
  node: { class: "i-logos-nodejs-icon", ratio: 1 },
  vscode: { class: "i-logos-visual-studio-code", ratio: 1 },
  svelte: { class: "i-logos-svelte-icon", ratio: 1 },
  sendgrid: { class: "i-logos-sendgrid-icon", ratio: 1 },
  playwright: { class: "i-logos-playwright", ratio: 1 },
  eleventy: { class: "i-vscode-icons-file-type-eleventy", ratio: 1 },
  "11ty": { class: "i-vscode-icons-file-type-eleventy", ratio: 1 },
  wasm: { class: "i-vscode-icons-file-type-wasm", ratio: 1 },
  run: { class: "i-ic-sharp-directions-run", ratio: 1 },
  code: { class: "i-ic-sharp-terminal", ratio: 1 },
  webhook: { class: "i-logos-webhook", ratio: 1 },
  pnpm: { class: "i-logos-pnpm", ratio: 1 },
  link: { class: "i-ic-sharp-link", ratio: 1 },
  pdf: { class: "i-vscode-icons-file-type-pdf2", ratio: 1 },
  post: { class: "i-ic-outline-article fill-green", ratio: 1 },
  "cpp": { class: "i-vscode-icons-file-type-cpp2", ratio: 1 },
  nvm: { class: "i-logos-nvm", ratio: 2 },
};

function getIcon(tag) {
  tag = tag.replace(/#/g, "").toLowerCase();

  const logo = icons[tag] ?? icons[tag.replace(/-/g, " ")];

  if (logo) {
    return `<i class="${logo.class} h-6" style="width: ${
      1.5 * logo.ratio
    }rem;"></i>`;
  }
}

function createTag(tag) {
  const parts = [];

  const icon = getIcon(tag);

  if (icon) {
    parts.push(
      `<a class="p-category tag" href="/tag/${slugify(tag)}/" title="#${tag}">`,
    );
    parts.push(icon);
  } else {
    parts.push(
      `<a class="p-category tag" href="/tag/${slugify(tag)}/" title="#${tag}">`,
    );

    parts.push(`<span>#${tag}</span>`);
  }

  parts.push("</a>");

  return [icon ? 0 : 1, parts.join("")];
}

function tagShortCode(tags) {
  if (!tags) {
    return "";
  }

  return `<div class="flex flex-wrap gap-2 mb-4">${tags
    .map((tag) => createTag(tag))
    .sort()
    .map(([, tag]) => tag)
    .join("")}</div>`;
}

module.exports = tagShortCode;
