export function successResponse(data: unknown, statusCode = 200) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ success: true, data }),
  };
}

export function errorResponse(error: unknown, statusCode = 500) {
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
    },
    body: JSON.stringify({ success: false, error: message }),
  };
}
