import { ProjectImage } from "@/types/editor";

// convrt pngimages to data url, like src path and file size
export const decodePngFile = async (file: File): Promise<ProjectImage> => {
  if (file.type !== 'image/png') {
    throw new Error('Only PNG files are supported.');
  }

  const dataURL = await fileToDataURL(file);
  const { width, height } = await getImageSize(dataURL);

  return {
    src: dataURL,
    originalW: width,
    originalH: height,
    name: file.name,
    lastModified: file.lastModified,
  };
};

const fileToDataURL = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file.'));
    reader.onload = () => resolve(String(reader.result));
    reader.readAsDataURL(file);
  });

const getImageSize = (src: string): Promise<{ width: number; height: number }> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.naturalWidth, height: img.naturalHeight });
    img.onerror = () => reject(new Error('Failed to decode image.'));
    img.src = src;
  });
