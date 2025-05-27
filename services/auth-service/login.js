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
            AuthParameters: {
                USERNAME: username,
                PASSWORD: password,
            },
        });
        const result = await client.send(command);
        const tokens = result.AuthenticationResult;
        if (!tokens) {
            return (0, response_1.errorResponse)("Authentication failed: Missing token set", 401);
        }
        const { AccessToken, IdToken, RefreshToken } = tokens;
        const allowOrigin = process.env.CORS_ORIGINS?.split(",")[0] || "*";
        return {
            statusCode: 200,
            headers: {
                "Set-Cookie": [
                    `accessToken=${AccessToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                    `idToken=${IdToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=3600`,
                    `refreshToken=${RefreshToken}; HttpOnly; Secure; SameSite=None; Path=/; Max-Age=604800`,
                ].join(","),
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": allowOrigin,
                "Access-Control-Allow-Credentials": "true",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ success: true }),
        };
    }
    catch (err) {
        if (err.name === "NotAuthorizedException" || // wrong password
            err.name === "UserNotFoundException" // user doesn't exist
        ) {
            return (0, response_1.errorResponse)("Invalid username or password", 401);
        }
        console.error("Login error:", err);
        return (0, response_1.errorResponse)("Internal server error", 500);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9naW4uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dpbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FHbUQ7QUFDbkQseUNBQTJDO0FBRTNDLE1BQU0sTUFBTSxHQUFHLElBQUksZ0VBQTZCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUMsTUFBTSxPQUFPLEdBQTJCLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM3RCxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQUUsUUFBUSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxJQUFJLENBQUMsQ0FBQztRQUU5RCxNQUFNLE9BQU8sR0FBRyxJQUFJLHNEQUFtQixDQUFDO1lBQ3RDLFFBQVEsRUFBRSxvQkFBb0I7WUFDOUIsUUFBUSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsbUJBQW9CO1lBQzFDLGNBQWMsRUFBRTtnQkFDZCxRQUFRLEVBQUUsUUFBUTtnQkFDbEIsUUFBUSxFQUFFLFFBQVE7YUFDbkI7U0FDRixDQUFDLENBQUM7UUFFSCxNQUFNLE1BQU0sR0FBRyxNQUFNLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDMUMsTUFBTSxNQUFNLEdBQUcsTUFBTSxDQUFDLG9CQUFvQixDQUFDO1FBRTNDLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztZQUNaLE9BQU8sSUFBQSx3QkFBYSxFQUFDLDBDQUEwQyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ3hFLENBQUM7UUFFRCxNQUFNLEVBQUUsV0FBVyxFQUFFLE9BQU8sRUFBRSxZQUFZLEVBQUUsR0FBRyxNQUFNLENBQUM7UUFDdEQsTUFBTSxXQUFXLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxZQUFZLEVBQUUsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEdBQUcsQ0FBQztRQUVuRSxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUU7Z0JBQ1AsWUFBWSxFQUFFO29CQUNaLGVBQWUsV0FBVyx5REFBeUQ7b0JBQ25GLFdBQVcsT0FBTyx5REFBeUQ7b0JBQzNFLGdCQUFnQixZQUFZLDJEQUEyRDtpQkFDeEYsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDO2dCQUNYLGNBQWMsRUFBRSxrQkFBa0I7Z0JBQ2xDLDZCQUE2QixFQUFFLFdBQVc7Z0JBQzFDLGtDQUFrQyxFQUFFLE1BQU07Z0JBQzFDLDhCQUE4QixFQUFFLGNBQWM7YUFDL0M7WUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUN4QyxDQUFDO0lBQ0osQ0FBQztJQUFDLE9BQU8sR0FBUSxFQUFFLENBQUM7UUFDbEIsSUFDRSxHQUFHLENBQUMsSUFBSSxLQUFLLHdCQUF3QixJQUFJLGlCQUFpQjtZQUMxRCxHQUFHLENBQUMsSUFBSSxLQUFLLHVCQUF1QixDQUFDLHFCQUFxQjtVQUMxRCxDQUFDO1lBQ0QsT0FBTyxJQUFBLHdCQUFhLEVBQUMsOEJBQThCLEVBQUUsR0FBRyxDQUFDLENBQUM7UUFDNUQsQ0FBQztRQUVELE9BQU8sQ0FBQyxLQUFLLENBQUMsY0FBYyxFQUFFLEdBQUcsQ0FBQyxDQUFDO1FBQ25DLE9BQU8sSUFBQSx3QkFBYSxFQUFDLHVCQUF1QixFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3JELENBQUM7QUFDSCxDQUFDLENBQUM7QUFqRFcsUUFBQSxPQUFPLFdBaURsQiIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgfSBmcm9tIFwiYXdzLWxhbWJkYVwiO1xuaW1wb3J0IHtcbiAgQ29nbml0b0lkZW50aXR5UHJvdmlkZXJDbGllbnQsXG4gIEluaXRpYXRlQXV0aENvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY29nbml0by1pZGVudGl0eS1wcm92aWRlclwiO1xuaW1wb3J0IHsgZXJyb3JSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5cbmNvbnN0IGNsaWVudCA9IG5ldyBDb2duaXRvSWRlbnRpdHlQcm92aWRlckNsaWVudCh7fSk7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVyOiBBUElHYXRld2F5UHJveHlIYW5kbGVyID0gYXN5bmMgKGV2ZW50KSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgeyB1c2VybmFtZSwgcGFzc3dvcmQgfSA9IEpTT04ucGFyc2UoZXZlbnQuYm9keSB8fCBcInt9XCIpO1xuXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBJbml0aWF0ZUF1dGhDb21tYW5kKHtcbiAgICAgIEF1dGhGbG93OiBcIlVTRVJfUEFTU1dPUkRfQVVUSFwiLFxuICAgICAgQ2xpZW50SWQ6IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9DTElFTlRfSUQhLFxuICAgICAgQXV0aFBhcmFtZXRlcnM6IHtcbiAgICAgICAgVVNFUk5BTUU6IHVzZXJuYW1lLFxuICAgICAgICBQQVNTV09SRDogcGFzc3dvcmQsXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgY2xpZW50LnNlbmQoY29tbWFuZCk7XG4gICAgY29uc3QgdG9rZW5zID0gcmVzdWx0LkF1dGhlbnRpY2F0aW9uUmVzdWx0O1xuXG4gICAgaWYgKCF0b2tlbnMpIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKFwiQXV0aGVudGljYXRpb24gZmFpbGVkOiBNaXNzaW5nIHRva2VuIHNldFwiLCA0MDEpO1xuICAgIH1cblxuICAgIGNvbnN0IHsgQWNjZXNzVG9rZW4sIElkVG9rZW4sIFJlZnJlc2hUb2tlbiB9ID0gdG9rZW5zO1xuICAgIGNvbnN0IGFsbG93T3JpZ2luID0gcHJvY2Vzcy5lbnYuQ09SU19PUklHSU5TPy5zcGxpdChcIixcIilbMF0gfHwgXCIqXCI7XG5cbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICBcIlNldC1Db29raWVcIjogW1xuICAgICAgICAgIGBhY2Nlc3NUb2tlbj0ke0FjY2Vzc1Rva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9Tm9uZTsgUGF0aD0vOyBNYXgtQWdlPTM2MDBgLFxuICAgICAgICAgIGBpZFRva2VuPSR7SWRUb2tlbn07IEh0dHBPbmx5OyBTZWN1cmU7IFNhbWVTaXRlPU5vbmU7IFBhdGg9LzsgTWF4LUFnZT0zNjAwYCxcbiAgICAgICAgICBgcmVmcmVzaFRva2VuPSR7UmVmcmVzaFRva2VufTsgSHR0cE9ubHk7IFNlY3VyZTsgU2FtZVNpdGU9Tm9uZTsgUGF0aD0vOyBNYXgtQWdlPTYwNDgwMGAsXG4gICAgICAgIF0uam9pbihcIixcIiksXG4gICAgICAgIFwiQ29udGVudC1UeXBlXCI6IFwiYXBwbGljYXRpb24vanNvblwiLFxuICAgICAgICBcIkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpblwiOiBhbGxvd09yaWdpbixcbiAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1DcmVkZW50aWFsc1wiOiBcInRydWVcIixcbiAgICAgICAgXCJBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzXCI6IFwiQ29udGVudC1UeXBlXCIsXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBzdWNjZXNzOiB0cnVlIH0pLFxuICAgIH07XG4gIH0gY2F0Y2ggKGVycjogYW55KSB7XG4gICAgaWYgKFxuICAgICAgZXJyLm5hbWUgPT09IFwiTm90QXV0aG9yaXplZEV4Y2VwdGlvblwiIHx8IC8vIHdyb25nIHBhc3N3b3JkXG4gICAgICBlcnIubmFtZSA9PT0gXCJVc2VyTm90Rm91bmRFeGNlcHRpb25cIiAvLyB1c2VyIGRvZXNuJ3QgZXhpc3RcbiAgICApIHtcbiAgICAgIHJldHVybiBlcnJvclJlc3BvbnNlKFwiSW52YWxpZCB1c2VybmFtZSBvciBwYXNzd29yZFwiLCA0MDEpO1xuICAgIH1cblxuICAgIGNvbnNvbGUuZXJyb3IoXCJMb2dpbiBlcnJvcjpcIiwgZXJyKTtcbiAgICByZXR1cm4gZXJyb3JSZXNwb25zZShcIkludGVybmFsIHNlcnZlciBlcnJvclwiLCA1MDApO1xuICB9XG59O1xuIl19