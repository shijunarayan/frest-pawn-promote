import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { client } from "@/services/utils/dynamodb";
import { PutCommand } from "@aws-sdk/lib-dynamodb";

export const handler = withTenantContext(
  withCapability(
    Capabilities.MANAGE_ROLE_CAPABILITIES,
    async (event, { tenantId }) => {
      const body = JSON.parse(event.body || "{}");
      const { role, capabilities } = body;

      if (!role || !Array.isArray(capabilities)) {
        return errorResponse(
          "Missing or invalid 'role' or 'capabilities[]'",
          400
        );
      }

      await client.send(
        new PutCommand({
          TableName: process.env.ROLE_CAPABILITIES_TABLE!,
          Item: { tenantId, role, capabilities },
        })
      );

      return successResponse({
        message: "Role capabilities updated successfully.",
      });
    }
  )
);
