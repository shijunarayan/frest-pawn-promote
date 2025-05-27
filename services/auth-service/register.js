"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const client_cognito_identity_provider_1 = require("@aws-sdk/client-cognito-identity-provider");
const response_1 = require("./response");
const tokenUtils_1 = require("../utils/tokenUtils");
const accessControl_1 = require("../utils/accessControl");
const capabilities_1 = require("../access-control/constants/capabilities");
const client = new client_cognito_identity_provider_1.CognitoIdentityProviderClient({});
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const handler = async (event) => {
    try {
        const { tenantId } = await (0, tokenUtils_1.getTenantContext)(event);
        const allowed = await (0, accessControl_1.hasCapability)(event, capabilities_1.Capabilities.MANAGE_USERS);
        if (!allowed) {
            return {
                statusCode: 403,
                body: JSON.stringify({ message: "Forbidden" }),
            };
        }
        const { username, email, phone, password } = JSON.parse(event.body || "{}");
        if (!username || !email || !password) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    message: "Missing username, email or password",
                }),
            };
        }
        const command = new client_cognito_identity_provider_1.AdminCreateUserCommand({
            UserPoolId: USER_POOL_ID,
            Username: username,
            TemporaryPassword: password,
            MessageAction: "SUPPRESS",
            UserAttributes: [
                { Name: "email", Value: email },
                { Name: "phone_number", Value: phone },
                { Name: "custom:tenantId", Value: tenantId },
            ],
        });
        await client.send(command);
        return (0, response_1.successResponse)({ message: "User created", username });
    }
    catch (err) {
        console.error("Register error:", err);
        return (0, response_1.errorResponse)(err);
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVnaXN0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJyZWdpc3Rlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxnR0FHbUQ7QUFDbkQseUNBQTREO0FBQzVELG9EQUF1RDtBQUN2RCwwREFBdUQ7QUFDdkQsMkVBQXdFO0FBRXhFLE1BQU0sTUFBTSxHQUFHLElBQUksZ0VBQTZCLENBQUMsRUFBRSxDQUFDLENBQUM7QUFDckQsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBcUIsQ0FBQztBQUVoRCxNQUFNLE9BQU8sR0FBMkIsS0FBSyxFQUFFLEtBQUssRUFBRSxFQUFFO0lBQzdELElBQUksQ0FBQztRQUNILE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxNQUFNLElBQUEsNkJBQWdCLEVBQUMsS0FBSyxDQUFDLENBQUM7UUFFbkQsTUFBTSxPQUFPLEdBQUcsTUFBTSxJQUFBLDZCQUFhLEVBQUMsS0FBSyxFQUFFLDJCQUFZLENBQUMsWUFBWSxDQUFDLENBQUM7UUFDdEUsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1lBQ2IsT0FBTztnQkFDTCxVQUFVLEVBQUUsR0FBRztnQkFDZixJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxXQUFXLEVBQUUsQ0FBQzthQUMvQyxDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksSUFBSSxDQUFDLENBQUM7UUFFNUUsSUFBSSxDQUFDLFFBQVEsSUFBSSxDQUFDLEtBQUssSUFBSSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3JDLE9BQU87Z0JBQ0wsVUFBVSxFQUFFLEdBQUc7Z0JBQ2YsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQ25CLE9BQU8sRUFBRSxxQ0FBcUM7aUJBQy9DLENBQUM7YUFDSCxDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sT0FBTyxHQUFHLElBQUkseURBQXNCLENBQUM7WUFDekMsVUFBVSxFQUFFLFlBQVk7WUFDeEIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsaUJBQWlCLEVBQUUsUUFBUTtZQUMzQixhQUFhLEVBQUUsVUFBVTtZQUN6QixjQUFjLEVBQUU7Z0JBQ2QsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLEVBQUU7Z0JBQy9CLEVBQUUsSUFBSSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsS0FBSyxFQUFFO2dCQUN0QyxFQUFFLElBQUksRUFBRSxpQkFBaUIsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFO2FBQzdDO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsTUFBTSxNQUFNLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO1FBRTNCLE9BQU8sSUFBQSwwQkFBZSxFQUFDLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDO0lBQ2hFLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsRUFBRSxHQUFHLENBQUMsQ0FBQztRQUN0QyxPQUFPLElBQUEsd0JBQWEsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUM1QixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBMUNXLFFBQUEsT0FBTyxXQTBDbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlIYW5kbGVyIH0gZnJvbSBcImF3cy1sYW1iZGFcIjtcbmltcG9ydCB7XG4gIENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50LFxuICBBZG1pbkNyZWF0ZVVzZXJDb21tYW5kLFxufSBmcm9tIFwiQGF3cy1zZGsvY2xpZW50LWNvZ25pdG8taWRlbnRpdHktcHJvdmlkZXJcIjtcbmltcG9ydCB7IGVycm9yUmVzcG9uc2UsIHN1Y2Nlc3NSZXNwb25zZSB9IGZyb20gXCIuL3Jlc3BvbnNlXCI7XG5pbXBvcnQgeyBnZXRUZW5hbnRDb250ZXh0IH0gZnJvbSBcIi4uL3V0aWxzL3Rva2VuVXRpbHNcIjtcbmltcG9ydCB7IGhhc0NhcGFiaWxpdHkgfSBmcm9tIFwiLi4vdXRpbHMvYWNjZXNzQ29udHJvbFwiO1xuaW1wb3J0IHsgQ2FwYWJpbGl0aWVzIH0gZnJvbSBcIi4uL2FjY2Vzcy1jb250cm9sL2NvbnN0YW50cy9jYXBhYmlsaXRpZXNcIjtcblxuY29uc3QgY2xpZW50ID0gbmV3IENvZ25pdG9JZGVudGl0eVByb3ZpZGVyQ2xpZW50KHt9KTtcbmNvbnN0IFVTRVJfUE9PTF9JRCA9IHByb2Nlc3MuZW52LkNPR05JVE9fVVNFUl9QT09MX0lEITtcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXI6IEFQSUdhdGV3YXlQcm94eUhhbmRsZXIgPSBhc3luYyAoZXZlbnQpID0+IHtcbiAgdHJ5IHtcbiAgICBjb25zdCB7IHRlbmFudElkIH0gPSBhd2FpdCBnZXRUZW5hbnRDb250ZXh0KGV2ZW50KTtcblxuICAgIGNvbnN0IGFsbG93ZWQgPSBhd2FpdCBoYXNDYXBhYmlsaXR5KGV2ZW50LCBDYXBhYmlsaXRpZXMuTUFOQUdFX1VTRVJTKTtcbiAgICBpZiAoIWFsbG93ZWQpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDQwMyxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiBcIkZvcmJpZGRlblwiIH0pLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBjb25zdCB7IHVzZXJuYW1lLCBlbWFpbCwgcGhvbmUsIHBhc3N3b3JkIH0gPSBKU09OLnBhcnNlKGV2ZW50LmJvZHkgfHwgXCJ7fVwiKTtcblxuICAgIGlmICghdXNlcm5hbWUgfHwgIWVtYWlsIHx8ICFwYXNzd29yZCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzQ29kZTogNDAwLFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgICAgbWVzc2FnZTogXCJNaXNzaW5nIHVzZXJuYW1lLCBlbWFpbCBvciBwYXNzd29yZFwiLFxuICAgICAgICB9KSxcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgY29tbWFuZCA9IG5ldyBBZG1pbkNyZWF0ZVVzZXJDb21tYW5kKHtcbiAgICAgIFVzZXJQb29sSWQ6IFVTRVJfUE9PTF9JRCxcbiAgICAgIFVzZXJuYW1lOiB1c2VybmFtZSxcbiAgICAgIFRlbXBvcmFyeVBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgIE1lc3NhZ2VBY3Rpb246IFwiU1VQUFJFU1NcIixcbiAgICAgIFVzZXJBdHRyaWJ1dGVzOiBbXG4gICAgICAgIHsgTmFtZTogXCJlbWFpbFwiLCBWYWx1ZTogZW1haWwgfSxcbiAgICAgICAgeyBOYW1lOiBcInBob25lX251bWJlclwiLCBWYWx1ZTogcGhvbmUgfSxcbiAgICAgICAgeyBOYW1lOiBcImN1c3RvbTp0ZW5hbnRJZFwiLCBWYWx1ZTogdGVuYW50SWQgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICBhd2FpdCBjbGllbnQuc2VuZChjb21tYW5kKTtcblxuICAgIHJldHVybiBzdWNjZXNzUmVzcG9uc2UoeyBtZXNzYWdlOiBcIlVzZXIgY3JlYXRlZFwiLCB1c2VybmFtZSB9KTtcbiAgfSBjYXRjaCAoZXJyKSB7XG4gICAgY29uc29sZS5lcnJvcihcIlJlZ2lzdGVyIGVycm9yOlwiLCBlcnIpO1xuICAgIHJldHVybiBlcnJvclJlc3BvbnNlKGVycik7XG4gIH1cbn07XG4iXX0=