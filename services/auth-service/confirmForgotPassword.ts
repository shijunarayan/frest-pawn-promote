import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "./response";

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { username, code, newPassword } = JSON.parse(event.body || "{}");

    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
    });

    const client = new CognitoIdentityProviderClient({});
    await client.send(command);
    return successResponse({ message: "Password updated successfully" });
  } catch (err) {
    console.error("ConfirmForgotPassword error:", err);
    return errorResponse(err);
  }
};
