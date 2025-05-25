import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { errorResponse } from "./response";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { username, password } = JSON.parse(event.body || "{}");

    const command = new InitiateAuthCommand({
      AuthFlow: "USER_PASSWORD_AUTH",
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      AuthParameters: { USERNAME: username, PASSWORD: password },
    });

    const result = await client.send(command);
    const tokens = result.AuthenticationResult;

    if (!tokens) {
      return errorResponse("Authentication failed: Missing token set");
    }

    const { AccessToken, IdToken, RefreshToken } = tokens;

    const allowOrigin = process.env.CORS_ORIGINS?.split(",")[0] || "*";

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": [
          `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
          `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
          `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
        ].join(", "),
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": allowOrigin,
        "Access-Control-Allow-Credentials": "true",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse(err);
  }
};
