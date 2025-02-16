import { copySync } from "fs-extra/esm";
import path from "path";
import sharp from "sharp";

const dests = [
  { size: 16, path: path.join(process.cwd(), "public", "img", "logo-16.png") },
  { size: 32, path: path.join(process.cwd(), "public", "img", "logo-32.png") },
  { size: 48, path: path.join(process.cwd(), "public", "img", "logo-48.png") },
  {
    size: 128,
    path: path.join(process.cwd(), "public", "img", "logo-128.png"),
  },
  { size: 256, path: path.join(process.cwd(), "public", "icons", "logo.ico") },
];

async function generateIcons(inputPath) {
  if (!inputPath) {
    console.error("Please provide a path to the svg logo.");
    process.exit(1);
  }

  try {
    for (const { size, path } of dests) {
      await sharp(inputPath).resize(size, size).toFile(path);
      console.log(`Generated: ${path}`);
    }
    copySync(
      inputPath,
      path.join(process.cwd(), "public", "icons", "logo.svg")
    );
    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

export { generateIcons };
