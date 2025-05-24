import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "./response";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { username, code } = JSON.parse(event.body || "{}");

    const command = new ConfirmSignUpCommand({
      Username: username,
      ConfirmationCode: code,
      ClientId: process.env.USER_POOL_CLIENT_ID!,
    });

    await client.send(command);
    return successResponse({ message: "User confirmed successfully" });
  } catch (err) {
    console.error("Confirm error:", err);
    return errorResponse(err);
  }
};
