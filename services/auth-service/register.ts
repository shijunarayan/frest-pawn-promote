import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyHandler } from "aws-lambda";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const {
      username,
      email,
      phone,
      password,
      requirePasswordReset = false,
    } = JSON.parse(event.body || "{}");

    if (!username || !password || (!email && !phone)) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Username, password, and at least one contact (email or phone) are required.",
        }),
      };
    }

    // Create user with confirmation code
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: process.env.USER_POOL_ID!,
      Username: username,
      MessageAction: "RESEND",
      UserAttributes: [
        ...(email ? [{ Name: "email", Value: email }] : []),
        ...(phone ? [{ Name: "phone_number", Value: phone }] : []),
      ],
    });

    await client.send(createUserCommand);

    // Set password for the user
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: process.env.USER_POOL_ID!,
      Username: username,
      Password: password,
      Permanent: !requirePasswordReset,
    });

    await client.send(setPasswordCommand);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User created successfully" }),
    };
  } catch (err: any) {
    console.error("Register error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};
