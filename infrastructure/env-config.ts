export interface EnvironmentSettings {
  envName: string;
  account: string;
  region: string;
  cors: string[];
  tags: Record<string, string>;
}

export const environments: Record<string, EnvironmentSettings> = {
  dev: {
    envName: "dev",
    account: "016927778613",
    region: "ap-south-1",
    cors: [
      "http://localhost:3000",
      "https://frestgate.local",
      "https://main.dz7xcaktnrert.amplifyapp.com",
    ],
    tags: {
      Project: "FrestPawnPromote",
      Env: "dev",
      Owner: "ShijuNarayan",
      CostCenter: "WarehouseSaaS",
    },
  },
  stage: {
    envName: "stage",
    account: "016927778613",
    region: "ap-south-1",
    cors: ["https://stage.yourdomain.com"],
    tags: {
      Project: "FrestPawnPromote",
      Env: "stage",
      Owner: "ShijuNarayan",
      CostCenter: "WarehouseSaaS",
    },
  },
  prod: {
    envName: "prod",
    account: "016927778613",
    region: "ap-south-1",
    cors: ["https://app.yourdomain.com"],
    tags: {
      Project: "FrestPawnPromote",
      Env: "prod",
      Owner: "ShijuNarayan",
      CostCenter: "WarehouseSaaS",
    },
  },
};

export const currentEnv = environments[process.env.ENV || "dev"];
