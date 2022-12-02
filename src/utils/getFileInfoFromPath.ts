export function getFileInfo(path: string) {
  const partPath = path.split('\\');
  const fileName = partPath[partPath.length - 1];
  const destination = './' + partPath.slice(0, partPath.length - 1).join('/');
  return {
    filename: fileName,
    destination: destination,
  };
}
