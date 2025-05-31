import { PutCommand, GetCommand } from "@aws-sdk/lib-dynamodb";
import { client } from "@/services/utils/dynamodb";
import { withTenantContext } from "@/services/utils/withTenantContext";
import { withCapability } from "@/services/utils/withCapability";
import { Capabilities } from "@/services/access-control/constants/capabilities";
import {
  successResponse,
  errorResponse,
} from "@/services/auth-service/response";
import { Role } from "@/types/role";

export const handler = withTenantContext(
  withCapability(
    Capabilities.MANAGE_ROLES,
    async (event, { tenantId, userId }) => {
      const body = JSON.parse(event.body || "{}");
      const { roleId, description, capabilities } = body;

      if (!roleId || !description || !Array.isArray(capabilities)) {
        return errorResponse(
          "Missing or invalid roleId, description, or capabilities.",
          event,
          400
        );
      }

      // Fetch existing role to check isSystem
      const existing = await client.send(
        new GetCommand({
          TableName: process.env.ROLES_TABLE!,
          Key: { tenantId, roleId },
        })
      );

      if (existing.Item?.isSystem) {
        return errorResponse("Cannot modify a system-defined role", event, 403);
      }

      const now = new Date().toISOString();

      const newRole: Role = {
        tenantId,
        roleId,
        description,
        isSystem: false,
        capabilities,
        createdAt: existing.Item?.createdAt ?? now,
        createdById: existing.Item?.createdById ?? userId,
        modifiedAt: now,
        modifiedById: userId,
      };

      await client.send(
        new PutCommand({
          TableName: process.env.ROLES_TABLE!,
          Item: newRole,
        })
      );

      return successResponse({ message: "Role saved successfully." }, event);
    }
  )
);
