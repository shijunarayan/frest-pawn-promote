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
    return successResponse(result.AuthenticationResult);
  } catch (err) {
    console.error("Login error:", err);
    return errorResponse(err);
  }
};
