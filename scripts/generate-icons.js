const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const sizes = [16, 32, 64, 192, 512];
const svgPath = path.join(__dirname, "../src/logo.svg");
const publicDir = path.join(__dirname, "../public");

async function generateIcons() {
  const svg = fs.readFileSync(svgPath);

  // Generate PNG icons
  for (const size of sizes) {
    await sharp(svg)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, `logo${size}.png`));

    // Use the 32x32 version as favicon
    if (size === 32) {
      fs.copyFileSync(
        path.join(publicDir, "logo32.png"),
        path.join(publicDir, "favicon.ico")
      );
    }
  }

  console.log("Icons generated successfully!");
}

generateIcons().catch(console.error);
