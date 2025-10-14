import { defineMermaidSetup } from "@slidev/types";

export default defineMermaidSetup(() => {
  return {
    theme: "base",
    themeVariables: {
      darkMode: false,
      background: "#FFFFFF",
      fontFamily: "'trebuchet ms', verdana, arial",
      fontSize: "16px",

      primaryColor: "#E8F0FE",
      primaryTextColor: "#202124",
      primaryBorderColor: "#4285F4", // Google Blue

      secondaryColor: "#FCE8E6",
      secondaryTextColor: "#202124",
      secondaryBorderColor: "#DB4437", // Google Red

      tertiaryColor: "#E6F4EA",
      tertiaryTextColor: "#202124",
      tertiaryBorderColor: "#0F9D58", // Google Green

      noteBkgColor: "#FEF7E0",
      noteTextColor: "#202124",
      noteBorderColor: "#F4B400", // Google Yellow

      lineColor: "#BDC1C6",
      textColor: "#202124",

      // Sequence diagram specific
      actorBkg: "#E8F0FE",
      actorBorder: "#4285F4", // Google Blue
      actorTextColor: "#202124",
      actorLineColor: "#BDC1C6",
      signalColor: "#0F9D58", // Google Green
      signalTextColor: "#202124",
    },
  };
});
