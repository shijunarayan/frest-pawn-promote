import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "./response";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { username } = JSON.parse(event.body || "{}");

    const command = new ForgotPasswordCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      Username: username,
    });

    const client = new CognitoIdentityProviderClient({});
    await client.send(command);
    return successResponse({ message: "Reset code sent" }, event);
  } catch (err) {
    console.error("ForgotPassword error:", err);
    return errorResponse({ message: "Unable to reset password" }, event, 500);
  }
};
