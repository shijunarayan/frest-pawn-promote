import { getAllowOrigin } from "@/services/utils/getAllowOrigin";
import { APIGatewayProxyEvent } from "aws-lambda";

export function successResponse(
  data: unknown,
  event: APIGatewayProxyEvent,
  statusCode = 200,
  multiValueHeaders?: Record<string, string[]>
) {
  const origin = event.headers?.origin || event.headers?.Origin;
  const allowOrigin = getAllowOrigin(origin);

  if (multiValueHeaders) {
    return {
      statusCode,
      multiValueHeaders: {
        "Access-Control-Allow-Origin": [allowOrigin],
        "Access-Control-Allow-Credentials": ["true"],
        "Access-Control-Allow-Headers": ["Content-Type"],
        "Content-Type": ["application/json"],
        ...multiValueHeaders,
      },
      body: JSON.stringify(data),
    };
  }

  return {
    statusCode,
    headers: {
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  };
}

export function errorResponse(
  error: unknown,
  event: APIGatewayProxyEvent,
  statusCode = 500
) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
      ? error
      : "Internal server error";

  const origin = event.headers?.origin || event.headers?.Origin;
  const allowOrigin = getAllowOrigin(origin);

  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": allowOrigin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Headers": "Content-Type",
    },
    body: JSON.stringify({ success: false, error: message }),
  };
}
