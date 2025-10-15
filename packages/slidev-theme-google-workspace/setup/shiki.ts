import { defineShikiSetup, type ShikiSetupReturn } from "@slidev/types";

const shikiConfig: ShikiSetupReturn = {
  themes: {
    light: "min-light",
    dark: "min-light",
  },
};

export default defineShikiSetup(() => shikiConfig);
