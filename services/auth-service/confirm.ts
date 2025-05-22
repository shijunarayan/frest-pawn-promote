import {
  CognitoIdentityProviderClient,
  ConfirmSignUpCommand,
} from "@aws-sdk/client-cognito-identity-provider";
import { APIGatewayProxyHandler } from "aws-lambda";

const client = new CognitoIdentityProviderClient({});

export const handler: APIGatewayProxyHandler = async (event) => {
  try {
    const { email, code } = JSON.parse(event.body || "{}");

    if (!email || !code) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Email and code are required." }),
      };
    }

    const command = new ConfirmSignUpCommand({
      ClientId: process.env.USER_POOL_CLIENT_ID!,
      Username: email,
      ConfirmationCode: code,
    });

    await client.send(command);

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ message: "Email confirmed successfully!" }),
    };
  } catch (err: any) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: err.message || "Confirmation failed." }),
    };
  }
};
