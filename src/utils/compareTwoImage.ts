import * as Jimp from 'jimp';

export async function CompareTwoImage(image1: string, image2: string) {
  if (image2 === null) return true;
  else if (image1 === null) return false;

  const img1 = await Jimp.read(image1);
  const img2 = await Jimp.read(image2);

  const distance = Jimp.distance(img1, img2);
  const diff = Jimp.diff(img1, img2);

  if (distance < 0.15 || diff.percent < 0.15) {
    return true;
  } else {
    return false;
  }
}
