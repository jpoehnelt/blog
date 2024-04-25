const path = require("path");
const fs = require("fs");

function code({ src }) {
  const content = fs.readFileSync(src, "utf8");

  const lang = path.extname(src).replace(".", "");

  return `\`\`\`${lang}
${content}
\`\`\`
`;
}

module.exports = code;
