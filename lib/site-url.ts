export const getSiteUrl = () => {
  const url =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.NEXT_PUBLIC_VERCEL_URL ||
    process.env.VERCEL_URL;

  if (typeof url === "string" && url.trim().length > 0) {
    return url.startsWith("http") ? url : `https://${url}`;
  }

  return "https://zowkins.com";
};
