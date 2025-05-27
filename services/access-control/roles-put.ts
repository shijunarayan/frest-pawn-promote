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
  withCapability(Capabilities.MANAGE_ROLES, async (event, { tenantId }) => {
    const body = JSON.parse(event.body || "{}");
    const { roleId, label } = body;

    if (!roleId || !label) {
      return errorResponse("Missing roleId or label", 400);
    }

    await client.send(
      new PutCommand({
        TableName: process.env.ROLES_TABLE!,
        Item: { tenantId, roleId, label },
      })
    );

    return successResponse({ message: "Role saved successfully." });
  })
);
