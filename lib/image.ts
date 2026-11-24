export const resizeImage = (url: string, size: string) =>
  url.replace("/t/p/original/", `/t/p/${size}/`);