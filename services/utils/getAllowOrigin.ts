export function getAllowOrigin(requestOrigin?: string): string {
  const allowedOrigins =
    process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()) || [];

  if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  if (allowedOrigins.length > 0) {
    return allowedOrigins[0]; // fallback to first configured
  }

  throw new Error("No valid CORS origins configured");
}
