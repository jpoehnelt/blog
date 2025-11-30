const imageModules = import.meta.glob(
  "./images/**/*.{png,jpg,jpeg,gif,svg,webp}",
  { eager: true, query: { enhanced: true } },
);

export const images: Record<string, any> = {};

for (const [path, module] of Object.entries(imageModules)) {
  const imagePath = path.replace("./images/", "");
  images[imagePath] = (module as any).default;
}
