import path from "path";
import dotenv from "dotenv";

dotenv.config({ path: path.resolve(process.cwd(), "../../.env") });

export const CONFIG = {
  baseUrl: "https://jpoehnelt.com/posts",
  paths: {
    build: path.resolve(process.cwd(), "../../apps/site/build/posts"),
    source: path.resolve(process.cwd(), "../../apps/site/src/content/posts"),
  },
  keys: {
    devto: process.env.DEVTO_API_KEY,
    medium: process.env.MEDIUM_INTEGRATION_TOKEN,
  },
};
