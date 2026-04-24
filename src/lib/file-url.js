export function resolveFileUrl(path) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_FILE_BASE_URL || "http://localhost:4000";

  return `${baseUrl}${path}`;
}
