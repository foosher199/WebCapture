const sharp = require('sharp');
const sizes = [16, 32, 48, 128];

async function convertIcons() {
  for (const size of sizes) {
    await sharp('icons/icon.svg')
      .resize(size, size)
      .png()
      .toFile(`icons/icon${size}.png`);
  }
}

convertIcons().catch(console.error); 