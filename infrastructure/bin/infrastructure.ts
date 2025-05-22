#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { InfrastructureStack } from "../lib/infrastructure-stack";

const app = new cdk.App();
const stack = new InfrastructureStack(app, "InfrastructureStack", {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION,
  },
});

cdk.Tags.of(stack).add("Project", "FrestPawnPromote");
cdk.Tags.of(stack).add("Env", "Dev");
cdk.Tags.of(stack).add("Owner", "Shijunarayan");
cdk.Tags.of(stack).add("CostCenter", "WarehouseSaaS");
