import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "./response";

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

    return {
      statusCode: 200,
      headers: {
        "Set-Cookie": [
          `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
          `idToken=${IdToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
          `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
        ].join(", "),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ success: true }),
    };
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse(err);
  }
};
