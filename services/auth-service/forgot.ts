import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  ForgotPasswordCommand,
  ConfirmForgotPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "./response";
import { getAllowOrigin } from "./utils/cors";

const client = new CognitoIdentityProviderClient({});

export const initiateForgotPassword: APIGatewayProxyHandler = async (event) => {
  const allowOrigin = getAllowOrigin(event);

  try {
    const { username } = JSON.parse(event.body || "{}");

    const command = new ForgotPasswordCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      Username: username,
    });

    await client.send(command);
    return successResponse({ message: "Reset code sent" }, allowOrigin);
  } catch (err) {
    console.error("ForgotPassword error:", err);
    return errorResponse(err, allowOrigin);
  }
};

export const confirmForgotPassword: APIGatewayProxyHandler = async (event) => {
  const allowOrigin = getAllowOrigin(event);

  try {
    const { username, code, newPassword } = JSON.parse(event.body || "{}");

    const command = new ConfirmForgotPasswordCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      Username: username,
      ConfirmationCode: code,
      Password: newPassword,
    });

    await client.send(command);
    return successResponse(
      { message: "Password updated successfully" },
      allowOrigin
    );
  } catch (err) {
    console.error("ConfirmForgotPassword error:", err);
    return errorResponse(err, allowOrigin);
  }
};
