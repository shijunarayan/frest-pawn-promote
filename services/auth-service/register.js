"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const response_1 = require("./response");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({});
const handler = async (event) => {
    try {
        const { username, password, email, phone, requirePasswordReset, sendInvite, } = JSON.parse(event.body || "{}");
        const userAttributes = [
            ...(email ? [{ Name: "email", Value: email }] : []),
            ...(phone ? [{ Name: "phone_number", Value: phone }] : []),
        ];
        const createCommand = new client_cognito_identity_provider_1.AdminCreateUserCommand({
            UserPoolId: process.env.USER_POOL_ID,
            Username: username,
            MessageAction: sendInvite ? undefined : "SUPPRESS",
            UserAttributes: userAttributes,
        });
        await client.send(createCommand);
        if (!sendInvite) {
            const passwordCommand = new client_cognito_identity_provider_1.AdminSetUserPasswordCommand({
                UserPoolId: process.env.USER_POOL_ID,
                Username: username,
                Password: password,
                Permanent: !requirePasswordReset,
            });
            await client.send(passwordCommand);
        }
        return (0, response_1.successResponse)({ message: "User created successfully" }, 201);
    }
    catch (err) {
        console.error("Register error:", err);
        return (0, response_1.errorResponse)(err);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdpc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FJbUQ7QUFDbkQseUNBQTREO0FBRTVELE1BQU0sTUFBTSxHQUFHLElBQUksZ0VBQTZCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFFOUMsTUFBTSxPQUFPLEdBQTJCLEtBQUssRUFBRSxLQUFLLEVBQUUsRUFBRTtJQUM3RCxJQUFJLENBQUM7UUFDSCxNQUFNLEVBQ0osUUFBUSxFQUNSLFFBQVEsRUFDUixLQUFLLEVBQ0wsS0FBSyxFQUNMLG9CQUFvQixFQUNwQixVQUFVLEdBQ1gsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFbkMsTUFBTSxjQUFjLEdBQUc7WUFDckIsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQztZQUNuRCxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDO1NBQzNELENBQUM7UUFFRixNQUFNLGFBQWEsR0FBRyxJQUFJLHlEQUFzQixDQUFDO1lBQy9DLFVBQVUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLFlBQWE7WUFDckMsUUFBUSxFQUFFLFFBQVE7WUFDbEIsYUFBYSxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxVQUFVO1lBQ2xELGNBQWMsRUFBRSxjQUFjO1NBQy9CLENBQUMsQ0FBQztRQUVILE1BQU0sTUFBTSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUVqQyxJQUFJLENBQUMsVUFBVSxFQUFFLENBQUM7WUFDaEIsTUFBTSxlQUFlLEdBQUcsSUFBSSw4REFBMkIsQ0FBQztnQkFDdEQsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsWUFBYTtnQkFDckMsUUFBUSxFQUFFLFFBQVE7Z0JBQ2xCLFFBQVEsRUFBRSxRQUFRO2dCQUNsQixTQUFTLEVBQUUsQ0FBQyxvQkFBb0I7YUFDakMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO1FBQ3JDLENBQUM7UUFFRCxPQUFPLElBQUEsMEJBQWUsRUFBQyxFQUFFLE9BQU8sRUFBRSwyQkFBMkIsRUFBRSxFQUFFLEdBQUcsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBekNXLFFBQUEsT0FBTyxXQXlDbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlIYW5kbGVyIH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7XG4gIENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LFxuICBBZG1pbkNyZWF0ZVVzZXJDb21tYW5kLFxuICBBZG1pblNldFVzZXJQYXNzd29yZENvbW1hbmQsXG59IGZyb20gXCJAYXdzLXNkay9jbGllbnQtY29nbml0by1pZGVudGl0eS1wcm92aWRlclwiO1xuaW1wb3J0IHsgc3VjY2Vzc1Jlc3BvbnNlLCBlcnJvclJlc3BvbnNlIH0gZnJvbSBcIi4vcmVzcG9uc2VcIjtcblxuY29uc3QgY2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHt9KTtcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7XG4gICAgICB1c2VybmFtZSxcbiAgICAgIHBhc3N3b3JkLFxuICAgICAgZW1haWwsXG4gICAgICBwaG9uZSxcbiAgICAgIHJlcXVpcmVQYXNzd29yZFJlc2V0LFxuICAgICAgc2VuZEludml0ZSxcbiAgICB9ID0gSlNPTi5wYXJzZShldmVudC5ib2R5IHx8IFwie31cIik7XG5cbiAgICBjb25zdCB1c2VyQXR0cmlidXRlcyA9IFtcbiAgICAgIC4uLihlbWFpbCA/IFt7IE5hbWU6IFwiZW1haWxcIiwgVmFsdWU6IGVtYWlsIH1dIDogW10pLFxuICAgICAgLi4uKHBob25lID8gW3sgTmFtZTogXCJwaG9uZV9udW1iZXJcIiwgVmFsdWU6IHBob25lIH1dIDogW10pLFxuICAgIF07XG5cbiAgICBjb25zdCBjcmVhdGVDb21tYW5kID0gbmV3IEFkbWluQ3JlYXRlVXNlckNvbW1hbmQoe1xuICAgICAgVXNlclBvb2xJZDogcHJvY2Vzcy5lbnYuVVNFUl9QT09MX0lEISxcbiAgICAgIFVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIE1lc3NhZ2VBY3Rpb246IHNlbmRJbnZpdGUgPyB1bmRlZmluZWQgOiBcIlNVUFBSRVNTXCIsXG4gICAgICBVc2VyQXR0cmlidXRlczogdXNlckF0dHJpYnV0ZXMsXG4gICAgfSk7XG5cbiAgICBhd2FpdCBjbGllbnQuc2VuZChjcmVhdGVDb21tYW5kKTtcblxuICAgIGlmICghc2VuZEludml0ZSkge1xuICAgICAgY29uc3QgcGFzc3dvcmRDb21tYW5kID0gbmV3IEFkbWluU2V0VXNlclBhc3N3b3JkQ29tbWFuZCh7XG4gICAgICAgIFVzZXJQb29sSWQ6IHByb2Nlc3MuZW52LlVTRVJfUE9PTF9JRCEsXG4gICAgICAgIFVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgICAgUGFzc3dvcmQ6IHBhc3N3b3JkLFxuICAgICAgICBQZXJtYW5lbnQ6ICFyZXF1aXJlUGFzc3dvcmRSZXNldCxcbiAgICAgIH0pO1xuXG4gICAgICBhd2FpdCBjbGllbnQuc2VuZChwYXNzd29yZENvbW1hbmQpO1xuICAgIH1cblxuICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2UoeyBtZXNzYWdlOiBcIlVzZXIgY3JlYXRlZCBzdWNjZXNzZnVsbHlcIiB9LCAyMDEpO1xuICB9IGNhdGNoIChlcnIpIHtcbiAgICBjb25zb2xlLmVycm9yKFwiUmVnaXN0ZXIgZXJyb3I6XCIsIGVycik7XG4gICAgcmV0dXJuIGVycm9yUmVzcG9uc2UoZXJyKTtcbiAgfVxufTtcbiJdfQ==