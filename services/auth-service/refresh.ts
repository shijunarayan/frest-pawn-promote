import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { errorResponse, successResponse } from "./response";

const cognito = new CognitoIdentityProviderClient({});
const CLIENT_ID = process.env.COGNITO_CLIENT_ID!;

export const handler: APIGatewayProxyHandler = async (event) => {
  const cookieHeader = event.headers.cookie || event.headers.Cookie || "";
  const refreshToken = cookieHeader
    .split(";")
    .map((c) => c.trim())
    .find((c) => c.startsWith("refreshToken="))
    ?.split("=")[1];

  if (!refreshToken) {
    return errorResponse(
      { success: false, error: "Missing refresh token" },
      event,
      401
    );
  }

  try {
    const result = await cognito.send(
      new InitiateAuthCommand({
        AuthFlow: "REFRESH_TOKEN_AUTH",
        ClientId: CLIENT_ID,
        AuthParameters: { REFRESH_TOKEN: refreshToken },
      })
    );

    const tokens = result.AuthenticationResult;

    return successResponse(
      { message: "Token refreshed successfully" },
      event,
      200,
      {
        "Set-Cookie": [
          `accessToken=${tokens?.AccessToken}; Path=/; HttpOnly; Secure; SameSite=Lax`,
          `idToken=${tokens?.IdToken}; Path=/; HttpOnly; Secure; SameSite=Lax`,
        ],
      }
    );
  } catch (err) {
    console.error("Token refresh error:", err);
    return {
      statusCode: 401,
      body: JSON.stringify({
        success: false,
        error: "Failed to refresh token",
      }),
    };
  }
};
