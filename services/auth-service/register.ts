import { APIGatewayProxyHandler } from "aws-lambda";
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { successResponse, errorResponse } from "./response";
import { getAllowOrigin } from "./utils/cors";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  const allowOrigin = getAllowOrigin(event);

  try {
    const {
      username,
      password,
      email,
      phone,
      requirePasswordReset,
      sendInvite,
    } = JSON.parse(event.body || "{}");

    const userAttributes = [
      ...(email ? [{ Name: "email", Value: email }] : []),
      ...(phone ? [{ Name: "phone_number", Value: phone }] : []),
    ];

    const createCommand = new AdminCreateUserCommand({
      UserPoolId: process.env.USER_POOL_ID!,
      Username: username,
      MessageAction: sendInvite ? undefined : "SUPPRESS",
      UserAttributes: userAttributes,
    });

    await client.send(createCommand);

    if (!sendInvite) {
      const passwordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: process.env.USER_POOL_ID!,
        Username: username,
        Password: password,
        Permanent: !requirePasswordReset,
      });

      await client.send(passwordCommand);
    }

    return successResponse(
      { message: "User created successfully" },
      allowOrigin,
      201
    );
  } catch (err) {
    console.error("Register error:", err);
    return errorResponse(err, allowOrigin);
  }
};
