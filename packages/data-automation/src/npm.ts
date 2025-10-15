import axios from "axios";
import path from "path";
import fs from "fs";

const main = async () => {
  fs.writeFileSync(
    path.join("src", "_data", "npm.json"),
    JSON.stringify(
      (
        await axios.get("https://api.npms.io/v2/search?q=maintainer:jpoehnelt")
      ).data.results.map(({ searchScore, ...rest }: any) => rest),
      null,
      2,
    ),
  );
};

await main();
