// utils/cropImage.ts

// Define a proper interface for the crop area
interface PixelCrop {
  x: number;
  y: number;
  width: number;
  height: number;
}

// Define an interface for the effects
interface ImageEffects {
  shadow: boolean;
  brightness: number;
}

export default async function getCroppedImg(
  imageSrc: string,
  pixelCrop: PixelCrop,
  effects: ImageEffects
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Unable to get canvas context");

  // Apply brightness filter
  ctx.filter = `brightness(${effects.brightness}%)`;

  // Apply shadow if enabled
  if (effects.shadow) {
    ctx.shadowColor = "rgba(0,0,0,0.5)";
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
  }

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error("Canvas is empty"));
        return;
      }
      resolve(blob);
    }, "image/png");
  });
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // Allow CORS for image processing
    image.src = url;
  });
}