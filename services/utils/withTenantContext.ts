import { APIGatewayProxyEvent, APIGatewayProxyHandler } from "aws-lambda";
import { getTenantContext } from "./tokenUtils";
import { TenantContext } from "@/types/context";
import { errorResponse } from "@/services/auth-service/response";

export function withTenantContext(
  handler: (event: APIGatewayProxyEvent, context: TenantContext) => Promise<any>
): APIGatewayProxyHandler {
  return async (event) => {
    try {
      const tenantContext = await getTenantContext(event);

      if (!tenantContext) {
        return errorResponse("Unauthorized or missing tenant info", event, 401);
      }

      return await handler(event, tenantContext);
    } catch (err: any) {
      console.error(
        "withTenantContext: Unhandled error in Lambda handler:",
        err
      );
      console.error("withTenantContext: Error during request:", {
        body: event.body,
        headers: event.headers,
      });
      return errorResponse("Internal Server Error", event, 500);
    }
  };
}
