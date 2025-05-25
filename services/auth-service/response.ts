export function successResponse(data: unknown, origin = "*", statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify({ success: true, data }),
  };
}

export function errorResponse(error: unknown, origin = "*", statusCode = 500) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "Internal server error";

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "*",
    },
    body: JSON.stringify({ success: false, error: message }),
  };
}
