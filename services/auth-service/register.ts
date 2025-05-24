import {
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  CognitoIdentityProviderClient,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyHandler } from "aws-lambda";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const body = JSON.parse(event.body || "{}");

    const {
      username,
      password,
      email,
      phone,
      requirePasswordReset = false,
      sendInvite = false,
    } = body;

    if (!username || (!sendInvite && !password)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Username and password are required (unless sending invite).",
        }),
      };
    }

    const userAttributes = [
      ...(email ? [{ Name: "email", Value: email }] : []),
      ...(phone ? [{ Name: "phone_number", Value: phone }] : []),
    ];

    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: process.env.USER_POOL_ID!,
      Username: username,
      MessageAction: sendInvite ? undefined : "SUPPRESS",
      UserAttributes: userAttributes,
    });

    console.log("Creating user:", { username, sendInvite });
    await client.send(createUserCommand);

    if (!sendInvite) {
      const passwordCommand = new AdminSetUserPasswordCommand({
        UserPoolId: process.env.USER_POOL_ID!,
        Username: username,
        Password: password,
        Permanent: !requirePasswordReset,
      });

      await client.send(passwordCommand);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User created successfully" }),
    };
  } catch (err: any) {
    console.error("Register error:", JSON.stringify(err, null, 2));
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: err.message || "Internal server error",
      }),
    };
  }
};
