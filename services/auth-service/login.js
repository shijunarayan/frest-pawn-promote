"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const response_1 = require("./response");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({});
const handler = async (event) => {
    try {
        const { username, password } = JSON.parse(event.body || "{}");
        const command = new client_cognito_identity_provider_1.InitiateAuthCommand({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.USER_POOL_CLIENT_ID,
            AuthParameters: { USERNAME: username, PASSWORD: password },
        });
        const result = await client.send(command);
        const tokens = result.AuthenticationResult;
        if (!tokens) {
            return (0, response_1.errorResponse)("Authentication failed: Missing token set");
        }
        const { AccessToken, IdToken, RefreshToken } = tokens;
        return {
            statusCode: 200,
            headers: {
                "Set-Cookie": [
                    `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
                    `idToken=${IdToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600`,
                    `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=604800`,
                ].join(", "),
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ success: true }),
        };
    }
    catch (err) {
        console.error("Login error:", err);
        return (0, response_1.errorResponse)(err);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FHbUQ7QUFDbkQseUNBQTREO0FBRTVELE1BQU0sTUFBTSxHQUFHLElBQUksZ0VBQTZCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUMsTUFBTSxPQUFPLEdBQTJCLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM3RCxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztRQUU5RCxNQUFNLE9BQU8sR0FBRyxJQUFJLHNEQUFtQixDQUFDO1lBQ3RDLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO1lBQzFDLGNBQWMsRUFBRSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRTtTQUMzRCxDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDO1FBRTNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNaLE9BQU8sSUFBQSx3QkFBYSxFQUFDLDBDQUEwQyxDQUFDLENBQUM7UUFDbkUsQ0FBQztRQUVELE1BQU0sRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLFlBQVksRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUV0RCxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsWUFBWSxFQUFFO29CQUNaLGVBQWUsV0FBVywyREFBMkQ7b0JBQ3JGLFdBQVcsT0FBTywyREFBMkQ7b0JBQzdFLGdCQUFnQixZQUFZLDZEQUE2RDtpQkFDMUYsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDO2dCQUNaLGNBQWMsRUFBRSxrQkFBa0I7YUFDbkM7WUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUN4QyxDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sR0FBRyxFQUFFLENBQUM7UUFDYixPQUFPLENBQUMsS0FBSyxDQUFDLGNBQWMsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNuQyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBbkNXLFFBQUEsT0FBTyxXQW1DbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlIYW5kbGVyIH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7XG4gIENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LFxuICBJbml0aWF0ZUF1dGhDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNvZ25pdG8taWRlbnRpdHktcHJvdmlkZXJcIjtcbmltcG9ydCB7IHN1Y2Nlc3NSZXNwb25zZSwgZXJyb3JSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCh7fSk7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBBUElHYXRld2F5UHJveHlIYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCBcInt9XCIpO1xuXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBJbml0aWF0ZUF1dGhDb21tYW5kKHtcbiAgICAgIEF1dGhGbG93OiBcIlVTRVJfUEFTU1dPUkRfQVVUSFwiLFxuICAgICAgQ2xpZW50SWQ6IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQhLFxuICAgICAgQXV0aFBhcmFtZXRlcnM6IHsgVVNFUk5BTUU6IHVzZXJuYW1lLCBQQVNTV09SRDogcGFzc3dvcmQgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZW5kKGNvbW1hbmQpO1xuICAgIGNvbnN0IHRva2VucyA9IHJlc3VsdC5BdXRoZW50aWNhdGlvblJlc3VsdDtcblxuICAgIGlmICghdG9rZW5zKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDogTWlzc2luZyB0b2tlbiBzZXRcIik7XG4gICAgfVxuXG4gICAgY29uc3QgeyBBY2Nlc3NUb2tlbiwgSWRUb2tlbiwgUmVmcmVzaFRva2VuIH0gPSB0b2tlbnM7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIlNldC1Db29raWVcIjogW1xuICAgICAgICAgIGBhY2Nlc3NUb2tlbj0ke0FjY2Vzc1Rva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9U3RyaWN0OyBQYXRoPS87IE1heC1BZ2U9MzYwMGAsXG4gICAgICAgICAgYGlkVG9rZW49JHtJZFRva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9U3RyaWN0OyBQYXRoPS87IE1heC1BZ2U9MzYwMGAsXG4gICAgICAgICAgYHJlZnJlc2hUb2tlbj0ke1JlZnJlc2hUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPVN0cmljdDsgUGF0aD0vOyBNYXgtQWdlPTYwNDgwMGAsXG4gICAgICAgIF0uam9pbihcIiwgXCIpLFxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IHN1Y2Nlc3M6IHRydWUgfSksXG4gICAgfTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihcIkxvZ2luIGVycm9yOlwiLCBlcnIpO1xuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycik7XG4gIH1cbn07XG4iXX0=