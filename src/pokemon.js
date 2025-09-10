import { readFileSync, createWriteStream } from "fs";
import { PNG } from "pngjs";

const apply2BitPalette = (inputPngPath, palettePath, outputPngPath) => {
  // Read palette
  const palette = readFileSync(palettePath, "utf-8")
    .split("\n")
    .map((line) => {
      const [r, g, b] = line
        .trim()
        .replace("RGB", "")
        .split(",")
        .map((v) => parseInt(v.trim()));
      return { r, g, b };
    });

  // Read PNG into memory
  const pngBuffer = readFileSync(inputPngPath);

  // Parse PNG
  PNG.parse(pngBuffer, (err, png) => {
    const width = png.width;
    const height = png.height;

    const output = new PNG({ width, height, filterType: 0 });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) << 2;

        // Extract pixel index (0-3) from grayscale
        let pixelIndex = png.data[i] >> 6;

        let color;
        switch (pixelIndex) {
          case 0: // transparent
            output.data[i] = 0;
            output.data[i + 1] = 0;
            output.data[i + 2] = 0;
            output.data[i + 3] = 0;
            continue;
          case 1:
            color = palette[0];
            break;
          case 2:
            color = palette[1];
            break;
          case 3: // black
            color = { r: 0, g: 0, b: 0 };
            break;
        }

        output.data[i] = color.r;
        output.data[i + 1] = color.g;
        output.data[i + 2] = color.b;
        output.data[i + 3] = 255;
      }
    }

    // Write output PNG
    output.pack().pipe(createWriteStream(outputPngPath));
  });
};

export default apply2BitPalette;
