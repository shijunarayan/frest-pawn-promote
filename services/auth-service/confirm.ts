import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
  AdminConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyHandler } from "aws-lambda";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const {
      username,
      code,
      adminConfirm = false,
    } = JSON.parse(event.body || "{}");

    if (!username) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Username is required." }),
      };
    }

    if (adminConfirm) {
      const command = new AdminConfirmSignUpCommand({
        UserPoolId: process.env.USER_POOL_ID!,
        Username: username,
      });
      await client.send(command);
      return {
        statusCode: 200,
        body: JSON.stringify({ message: "User confirmed by admin." }),
      };
    }

    if (!code) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          error: "Confirmation code is required when adminConfirm is false.",
        }),
      };
    }

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      Username: username,
      ConfirmationCode: code,
    });

    await client.send(command);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "User confirmed successfully." }),
    };
  } catch (err: any) {
    console.error("Confirm error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message || "Internal server error" }),
    };
  }
};
