import * as sharp from 'sharp';

export async function resizeImage(desitnation, path) {
  const newImage = sharp(`${desitnation}/${path}`).resize(500);
  await newImage.toFile(`${desitnation}/tiny-${path}`, function (error) {
    if (error) return null;
    return {
      destination: desitnation,
      filename: '/tiny-' + path,
    };
  });
}
