"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const response_1 = require("./response");
const cors_1 = require("./utils/cors");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({});
const handler = async (event) => {
    const allowOrigin = (0, cors_1.getAllowOrigin)(event);
    console.log("allowed origins: ", allowOrigin);
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
                    `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                    `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                    `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
                ].join(", "),
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ success: true }),
        };
    }
    catch (err) {
        console.error("Login error:", err);
        return (0, response_1.errorResponse)(err, allowOrigin);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FHbUQ7QUFDbkQseUNBQTJDO0FBQzNDLHVDQUE4QztBQUU5QyxNQUFNLE1BQU0sR0FBRyxJQUFJLGdFQUE2QixDQUFDLEVBQUUsQ0FBQyxDQUFDO0FBRTlDLE1BQU0sT0FBTyxHQUEyQixLQUFLLEVBQUUsS0FBSyxFQUFFLEVBQUU7SUFDN0QsTUFBTSxXQUFXLEdBQUcsSUFBQSxxQkFBYyxFQUFDLEtBQUssQ0FBQyxDQUFDO0lBQzFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW1CLEVBQUUsV0FBVyxDQUFDLENBQUM7SUFFOUMsSUFBSSxDQUFDO1FBQ0gsTUFBTSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFOUQsTUFBTSxPQUFPLEdBQUcsSUFBSSxzREFBbUIsQ0FBQztZQUN0QyxRQUFRLEVBQUUsb0JBQW9CO1lBQzlCLFFBQVEsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLG1CQUFvQjtZQUMxQyxjQUFjLEVBQUUsRUFBRSxRQUFRLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUU7U0FDM0QsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLEdBQUcsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBQzFDLE1BQU0sTUFBTSxHQUFHLE1BQU0sQ0FBQyxvQkFBb0IsQ0FBQztRQUUzQyxJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7WUFDWixPQUFPLElBQUEsd0JBQWEsRUFBQywwQ0FBMEMsQ0FBQyxDQUFDO1FBQ25FLENBQUM7UUFFRCxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFFdEQsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFO2dCQUNQLFlBQVksRUFBRTtvQkFDWixlQUFlLFdBQVcseURBQXlEO29CQUNuRixXQUFXLE9BQU8seURBQXlEO29CQUMzRSxnQkFBZ0IsWUFBWSwyREFBMkQ7aUJBQ3hGLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQztnQkFDWixjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyw2QkFBNkIsRUFBRSxXQUFXO2dCQUMxQyxrQ0FBa0MsRUFBRSxNQUFNO2dCQUMxQyw4QkFBOEIsRUFBRSxjQUFjO2FBQy9DO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDeEMsQ0FBQztJQUNKLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxjQUFjLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDbkMsT0FBTyxJQUFBLHdCQUFhLEVBQUMsR0FBRyxFQUFFLFdBQVcsQ0FBQyxDQUFDO0lBQ3pDLENBQUM7QUFDSCxDQUFDLENBQUM7QUF6Q1csUUFBQSxPQUFPLFdBeUNsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgfSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtcbiAgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQsXG4gIEluaXRpYXRlQXV0aENvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY29nbml0by1pZGVudGl0eS1wcm92aWRlclwiO1xuaW1wb3J0IHsgZXJyb3JSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5pbXBvcnQgeyBnZXRBbGxvd09yaWdpbiB9IGZyb20gXCIuL3V0aWxzL2NvcnNcIjtcblxuY29uc3QgY2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHt9KTtcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgY29uc3QgYWxsb3dPcmlnaW4gPSBnZXRBbGxvd09yaWdpbihldmVudCk7XG4gIGNvbnNvbGUubG9nKFwiYWxsb3dlZCBvcmlnaW5zOiBcIiwgYWxsb3dPcmlnaW4pO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCBcInt9XCIpO1xuXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBJbml0aWF0ZUF1dGhDb21tYW5kKHtcbiAgICAgIEF1dGhGbG93OiBcIlVTRVJfUEFTU1dPUkRfQVVUSFwiLFxuICAgICAgQ2xpZW50SWQ6IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQhLFxuICAgICAgQXV0aFBhcmFtZXRlcnM6IHsgVVNFUk5BTUU6IHVzZXJuYW1lLCBQQVNTV09SRDogcGFzc3dvcmQgfSxcbiAgICB9KTtcblxuICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGNsaWVudC5zZW5kKGNvbW1hbmQpO1xuICAgIGNvbnN0IHRva2VucyA9IHJlc3VsdC5BdXRoZW50aWNhdGlvblJlc3VsdDtcblxuICAgIGlmICghdG9rZW5zKSB7XG4gICAgICByZXR1cm4gZXJyb3JSZXNwb25zZShcIkF1dGhlbnRpY2F0aW9uIGZhaWxlZDogTWlzc2luZyB0b2tlbiBzZXRcIik7XG4gICAgfVxuXG4gICAgY29uc3QgeyBBY2Nlc3NUb2tlbiwgSWRUb2tlbiwgUmVmcmVzaFRva2VuIH0gPSB0b2tlbnM7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIlNldC1Db29raWVcIjogW1xuICAgICAgICAgIGBhY2Nlc3NUb2tlbj0ke0FjY2Vzc1Rva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9Tm9uZTsgUGF0aD0vOyBNYXgtQWdlPTM2MDBgLFxuICAgICAgICAgIGBpZFRva2VuPSR7SWRUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPU5vbmU7IFBhdGg9LzsgTWF4LUFnZT0zNjAwYCxcbiAgICAgICAgICBgcmVmcmVzaFRva2VuPSR7UmVmcmVzaFRva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9Tm9uZTsgUGF0aD0vOyBNYXgtQWdlPTYwNDgwMGAsXG4gICAgICAgIF0uam9pbihcIiwgXCIpLFxuICAgICAgICBcIkNvbnRlbnQtVHlwZVwiOiBcImFwcGxpY2F0aW9uL2pzb25cIixcbiAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW5cIjogYWxsb3dPcmlnaW4sXG4gICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHNcIjogXCJ0cnVlXCIsXG4gICAgICAgIFwiQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVyc1wiOiBcIkNvbnRlbnQtVHlwZVwiLFxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgc3VjY2VzczogdHJ1ZSB9KSxcbiAgICB9O1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiTG9naW4gZXJyb3I6XCIsIGVycik7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoZXJyLCBhbGxvd09yaWdpbik7XG4gIH1cbn07XG4iXX0=