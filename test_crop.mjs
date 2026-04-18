import { Jimp } from "jimp";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkIcon() {
  try {
    const inputPath = path.join(__dirname, 'public', 'logo-512.png');
    const buffer = fs.readFileSync(inputPath);
    const image = await Jimp.read(buffer);
    
    // Asumsikan masih ada margin dari crop sebelumnya. Kita crop lagi 80%-nya.
    const cropRatio = 0.80; // Ambil 80% area tengah
    const cropSize = Math.floor(image.bitmap.width * cropRatio);
    const offset = Math.floor((image.bitmap.width - cropSize) / 2);
    
    console.log(`Final deep crop at: size=${cropSize}, offset=${offset}`);
    
    image.crop({ x: offset, y: offset, w: cropSize, h: cropSize });
    
    // Resize back to 512
    const img512 = image.clone().resize({ w: 512, h: 512 });
    fs.writeFileSync(path.join(__dirname, 'public', 'logo-512.png'), await img512.getBuffer("image/png"));
    
    const img192 = image.clone().resize({ w: 192, h: 192 });
    fs.writeFileSync(path.join(__dirname, 'public', 'logo-192.png'), await img192.getBuffer("image/png"));
    
    const transPath = path.join(__dirname, 'public', 'logo-transparent.png');
    if (fs.existsSync(transPath)) {
       const bufferT = fs.readFileSync(transPath);
       const imageT = await Jimp.read(bufferT);
       const tOffset = Math.floor((imageT.bitmap.width - Math.floor(imageT.bitmap.width * cropRatio)) / 2);
       imageT.crop({ x: tOffset, y: tOffset, w: Math.floor(imageT.bitmap.width * cropRatio), h: Math.floor(imageT.bitmap.height * cropRatio) });
       fs.writeFileSync(path.join(__dirname, 'public', 'logo-transparent.png'), await imageT.resize({ w: 512, h: 512 }).getBuffer("image/png"));
       console.log("transparent logo also deep cropped!");
    }
  } catch (err) {
    console.error(err);
  }
}

checkIcon();
