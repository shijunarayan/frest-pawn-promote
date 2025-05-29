import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, PutCommand } from "@aws-sdk/lib-dynamodb";
import * as fs from "fs";
import * as path from "path";
import { config } from "dotenv";
import "dotenv/config";
import "../env-config"; // Load environment variables

const client = DynamoDBDocumentClient.from(new DynamoDBClient({}));

// Ensure we load the .env from the monorepo root
config({ path: path.resolve(__dirname, "../../.env") });

const TENANT_ID = "demo-tenant";

async function seedJson(filePath: string): Promise<any[]> {
  const data = fs.readFileSync(path.resolve(__dirname, filePath), "utf-8");
  return JSON.parse(data);
}

async function seedTable(tableName: string, items: any[]) {
  console.log(`Start seed for ${tableName}`);
  for (const item of items) {
    const record = { tenantId: TENANT_ID, ...item };
    await client.send(
      new PutCommand({
        TableName: tableName,
        Item: record,
      })
    );
  }
  console.log(`End seed for ${tableName}`);
}

async function runSeed() {
  try {
    // Adjust the file paths if needed based on where you place seed-data.ts
    const capabilities = await seedJson("./capabilities.json");
    const rawRoles = await seedJson("./roles.json");

    // Convert { roleId: capabilities[] } → [{ tenantId, roleId, capabilities }]
    const rolesData = rawRoles.map(({ roleId, label, ...rest }) => ({
      tenantId: TENANT_ID,
      roleId,
      label,
      ...rest,
    }));

    await seedTable(process.env.CAPABILITIES_TABLE!, capabilities);
    await seedTable(process.env.ROLES_TABLE!, rolesData);

    const menuConfig = await seedJson("./menu-config.demo-tenant.json");
    // Menu config is a single item
    await client.send(
      new PutCommand({
        TableName: process.env.MENU_CONFIG_TABLE!,
        Item: {
          tenantId: TENANT_ID,
          ...menuConfig,
        },
      })
    );
    console.log("✅ Inserted menu config");

    console.log("🎉 Seeding complete.");
  } catch (err) {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  }
}

runSeed();
