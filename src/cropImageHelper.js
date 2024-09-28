export const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous"); // To avoid CORS issues
    image.src = url;
  });

export const getCroppedImg = async (imageSrc, pixelCrop) => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size to 300x300
  const desiredWidth = 300;
  const desiredHeight = 300;
  canvas.width = desiredWidth;
  canvas.height = desiredHeight;

  // Draw the cropped image onto the canvas and resize it to 300x300
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    desiredWidth,
    desiredHeight
  );

  // Return the resized image as a blob
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      resolve(blob);
    }, "image/jpeg");
  });
};
