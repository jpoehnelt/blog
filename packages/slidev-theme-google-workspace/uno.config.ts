import presetWebFonts from "@unocss/preset-web-fonts";
import { createLocalFontProcessor } from "@unocss/preset-web-fonts/local";
import { defineConfig } from "unocss";

export default defineConfig({
  presets: [
    presetWebFonts({
      provider: "none",
      fonts: {
        sans: "Google Sans Text",
        mono: "Google Sans Code",
      },
      processors: createLocalFontProcessor({}),
    }),
  ],
});
