import * as cdk from "aws-cdk-lib";
import { InfrastructureStack } from "../lib/infrastructure-stack";
import { environments } from "../env-config";

const app = new cdk.App();
const envName = app.node.tryGetContext("env") || "dev";

const selectedEnv = environments[envName];

if (!selectedEnv) {
  throw new Error(
    `Invalid environment '${envName}'. Valid options: ${Object.keys(
      environments
    ).join(", ")}`
  );
}

const customDomain = app.node.tryGetContext("domainName");

const stackName = `FrestPawnInfra-${envName}`;

new InfrastructureStack(app, stackName, {
  env: {
    account: selectedEnv.account,
    region: selectedEnv.region,
  },
  envName: selectedEnv.envName,
  corsOrigins: selectedEnv.cors,
  tags: selectedEnv.tags,
  ...(customDomain && { customDomain }),
});
