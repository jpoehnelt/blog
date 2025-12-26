await Promise.all(
  items.map((bytes) =>
    // call WASM function
    compress_(bytes, {
      quality: qualityToInt(quality),
      format: item.mimeType.split("/").pop(),
      width: parseInt(width ?? "0"),
      height: parseInt(height ?? "0"),
    }),
  ),
);
