import { copySync } from "fs-extra/esm";
import { existsSync } from "node:fs";
import path from "path";
import sharp from "sharp";

function getDests(baseDir) {
  return [
    { size: 16, path: path.join(baseDir, "public", "img", "logo-16.png") },
    { size: 32, path: path.join(baseDir, "public", "img", "logo-32.png") },
    { size: 48, path: path.join(baseDir, "public", "img", "logo-48.png") },
    { size: 128, path: path.join(baseDir, "public", "img", "logo-128.png") },
    { size: 256, path: path.join(baseDir, "public", "icons", "logo.ico") },
    { path: path.join(baseDir, "public", "icons", "logo.svg") },
  ];
}

async function generateIcons(inputPath, baseDir = process.cwd()) {
  inputPath = inputPath.trim();

  if (!existsSync(inputPath)) {
    console.error(`Logo file does not exist: ${inputPath}`);
    return;
  }

  const dests = getDests(baseDir);

  try {
    for (const dest of dests) {
      if (dest.size) {
        await sharp(inputPath).resize(dest.size, dest.size).toFile(dest.path);
      } else {
        copySync(inputPath, dest.path);
      }
      console.log(`Generated: ${dest.path}`);
    }
    console.log("All icons generated successfully!");
  } catch (error) {
    console.error("Error generating icons:", error);
  }
}

export { generateIcons };
