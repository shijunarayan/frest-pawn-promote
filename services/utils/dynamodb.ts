import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";

const rawClient = new DynamoDBClient({});
export const client = DynamoDBDocumentClient.from(rawClient);
