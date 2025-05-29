import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Stack, StackProps, CfnOutput, RemovalPolicy, Tags } from "aws-cdk-lib";
import * as cdk from "aws-cdk-lib";
import * as dynamodb from "aws-cdk-lib/aws-dynamodb";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import { Runtime } from "aws-cdk-lib/aws-lambda";

interface InfrastructureStackProps extends StackProps {
  envName: string;
  corsOrigins: string[];
  tags: Record<string, string>;
  customDomain?: string;
}

export class InfrastructureStack extends Stack {
  constructor(scope: Construct, id: string, props: InfrastructureStackProps) {
    super(scope, id, props);

    const { envName, corsOrigins, customDomain } = props;

    // 🧠 Apply tags dynamically
    for (const [key, value] of Object.entries(props.tags)) {
      Tags.of(this).add(key, value);
    }

    const createTable = (
      name: string,
      partitionKey: string,
      sortKey?: string
    ) => {
      return new dynamodb.Table(this, name, {
        tableName: name,
        partitionKey: {
          name: partitionKey,
          type: dynamodb.AttributeType.STRING,
        },
        sortKey: sortKey
          ? { name: sortKey, type: dynamodb.AttributeType.STRING }
          : undefined,
        billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        removalPolicy: cdk.RemovalPolicy.DESTROY, // change to RETAIN in prod
      });
    };

    // 🎯 Tables
    const userRolesTable = createTable("UserRolesTable", "tenantId", "userId");
    const rolesTable = createTable("RolesTable", "tenantId", "roleId");
    const capabilitiesTable = createTable(
      "CapabilitiesTable",
      "tenantId",
      "id"
    );
    const menuConfigTable = createTable("MenuConfigTable", "tenantId");

    // 📌 Give all Lambdas full access to their respective tables (refactorable)
    const allTables = [
      userRolesTable,
      rolesTable,
      capabilitiesTable,
      menuConfigTable,
    ];

    // 🧑‍💻 Cognito User Pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `frest-pawn-userpool-${envName}`,
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
      },
      customAttributes: {
        tenantId: new cognito.StringAttribute({ mutable: false }),
      },
      autoVerify: { email: true },
      removalPolicy: RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: {
        userPassword: true,
        adminUserPassword: true,
      },
    });

    const cognitoPolicy = new iam.PolicyStatement({
      actions: [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminUpdateUserAttributes",
        "cognito-idp:AdminInitiateAuth",
        "cognito-idp:AdminRespondToAuthChallenge",
      ],
      resources: [userPool.userPoolArn],
    });

    const lambdaEnvironment = {
      REGION: props.env?.region || "ap-south-1",
      CORS_ORIGINS: props.corsOrigins.join(","), // ✅ inject here
      ENV_NAME: props.envName, // optional, but helpful
      USER_ROLES_TABLE: userRolesTable.tableName,
      ROLES_TABLE: rolesTable.tableName,
      CAPABILITIES_TABLE: capabilitiesTable.tableName,
      MENU_CONFIG_TABLE: menuConfigTable.tableName,
    };

    // 📦 Export env vars for use elsewhere
    for (const [key, value] of Object.entries(lambdaEnvironment)) {
      new cdk.CfnOutput(this, key, {
        value,
      });
    }

    // 🧬 Lambda Functions
    const createLambda = (name: string, folder: string, handler: string) => {
      const fn = new NodejsFunction(this, `${name}Lambda`, {
        entry: path.join(__dirname, `../../services/${folder}/${handler}.ts`),
        handler: "handler",
        runtime: Runtime.NODEJS_LATEST,
        environment: {
          ...lambdaEnvironment,
          USER_POOL_ID: userPool.userPoolId,
          USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        },
        bundling: {
          minify: true,
          sourceMap: true,
          tsconfig: path.join(__dirname, "../../tsconfig.json"),
        },
      });
      fn.addToRolePolicy(cognitoPolicy);
      return fn;
    };
    const lambdas = {
      // === Auth-Service Lambdas ===
      registerLambda: createLambda("Register", "auth-service", "register"),
      confirmLambda: createLambda("Confirm", "auth-service", "confirm"),
      loginLambda: createLambda("Login", "auth-service", "login"),
      refreshLambda: createLambda("Refresh", "auth-service", "refresh"),
      forgotPasswordLambda: createLambda(
        "ForgotPassword",
        "auth-service",
        "initiateForgotPassword"
      ),
      confirmForgotPasswordLambda: createLambda(
        "ConfirmForgotPassword",
        "auth-service",
        "confirmForgotPassword"
      ),

      // === Access-Control Lambdas ===
      getUserRoles: createLambda(
        "GetUserRoles",
        "access-control",
        "user-roles"
      ),
      postUserRoles: createLambda(
        "PostUserRoles",
        "access-control",
        "user-roles-post"
      ),
      patchUserRoles: createLambda(
        "PatchUserRoles",
        "access-control",
        "user-roles-patch"
      ),
      getMyRoles: createLambda(
        "GetCurrentUserRoles",
        "access-control",
        "user-roles-me"
      ),
      getAllRoles: createLambda("GetAllRoles", "access-control", "roles"),
      putCustomRoles: createLambda(
        "PutCustomRoles",
        "access-control",
        "roles-put"
      ),
      postCustomRoles: createLambda(
        "PostCustomRoles",
        "access-control",
        "roles-post"
      ),

      getMenu: createLambda("GetMenu", "access-control", "menu"),
      getMenuConfig: createLambda(
        "GetMenuConfig",
        "access-control",
        "menu-config"
      ),
      patchMenuConfig: createLambda(
        "PatchMenuConfig",
        "access-control",
        "menu-config-patch"
      ),
      getCapabilities: createLambda(
        "GetCapabilities",
        "access-control",
        "capabilities"
      ),
    };

    // Assign permission to all tables
    allTables.forEach((table) => {
      Object.values(lambdas).forEach((fn) => {
        table.grantReadWriteData(fn);
      });
    });

    // === API Gateway ===
    const api = new apigateway.RestApi(this, "FrestPawnAPI", {
      restApiName: "Frest Pawn API",
      description: `Warehouse SaaS API for ${envName}`,
    });

    // === All Routes ===
    const routeMap = [
      // Auth
      { path: "register", method: "POST", lambda: lambdas.registerLambda },
      { path: "confirm", method: "POST", lambda: lambdas.confirmLambda },
      { path: "login", method: "POST", lambda: lambdas.loginLambda },
      { path: "refresh", method: "POST", lambda: lambdas.refreshLambda },
      {
        path: "forgot/initiate",
        method: "POST",
        lambda: lambdas.forgotPasswordLambda,
      },
      {
        path: "forgot/reset",
        method: "POST",
        lambda: lambdas.confirmForgotPasswordLambda,
      },
      // Access Control
      { path: "menu", method: "GET", lambda: lambdas.getMenu },
      {
        path: "config/menu",
        method: "GET",
        lambda: lambdas.getMenuConfig,
      },
      {
        path: "config/menu",
        method: "PATCH",
        lambda: lambdas.patchMenuConfig,
      },
      {
        path: "capabilities",
        method: "GET",
        lambda: lambdas.getCapabilities,
      },
      {
        path: "users/roles",
        method: "GET",
        lambda: lambdas.getMyRoles,
      },
      { path: "roles", method: "GET", lambda: lambdas.getAllRoles },
      {
        path: "users/{userId}/roles",
        method: "GET",
        lambda: lambdas.getUserRoles,
      },
      {
        path: "user/roles",
        method: "POST",
        lambda: lambdas.postUserRoles,
      },
      {
        path: "users/{userId}/roles",
        method: "PATCH",
        lambda: lambdas.patchUserRoles,
      },
      { path: "custom/roles", method: "POST", lambda: lambdas.postCustomRoles },
      { path: "custom/roles", method: "PUT", lambda: lambdas.putCustomRoles },
    ];

    const addedCorsTo: Set<string> = new Set();

    for (const { path: routePath, method, lambda } of routeMap) {
      const segments = routePath.split("/");
      let resource = api.root;

      for (const segment of segments) {
        resource =
          resource.getResource(segment) ?? resource.addResource(segment);
      }

      resource.addMethod(method, new apigateway.LambdaIntegration(lambda));

      const fullPath = segments.join("/");
      if (!addedCorsTo.has(fullPath)) {
        resource.addCorsPreflight({
          allowOrigins: corsOrigins,
          allowMethods: apigateway.Cors.ALL_METHODS,
          allowHeaders: ["Content-Type"],
          allowCredentials: true,
        });
        addedCorsTo.add(fullPath);
      }
    }

    // 🌐 Optional: Custom domain support
    if (customDomain) {
      const certArn =
        "arn:aws:acm:your-region:your-account:certificate/your-cert-id"; // ToDo: replace when ready
      const domain = new apigateway.DomainName(this, "CustomDomain", {
        domainName: customDomain,
        certificate: acm.Certificate.fromCertificateArn(
          this,
          "DomainCert",
          certArn
        ),
      });

      new apigateway.BasePathMapping(this, "BasePathMapping", {
        domainName: domain,
        restApi: api,
      });

      new CfnOutput(this, `${envName}CustomDomain`, {
        value: `https://${customDomain}`,
        description: "Custom domain URL",
        exportName: `FrestPawnCustomDomain-${envName}`,
      });
    }

    // === Output API URL ===
    new CfnOutput(this, `${envName}ApiUrl`, {
      value: api.url,
      description: "API Gateway URL",
      exportName: `FrestPawnAPIEndpoint-${envName}`,
    });

    // === Output Table Names ===
    new CfnOutput(this, `${envName}CapabilitiesTable`, {
      value: capabilitiesTable.tableName,
      exportName: `CapabilitiesTable-${envName}`,
    });

    new CfnOutput(this, `${envName}RolesTable`, {
      value: rolesTable.tableName,
      exportName: `RolesTable-${envName}`,
    });

    new CfnOutput(this, `${envName}UserRolesTable`, {
      value: userRolesTable.tableName,
      exportName: `UserRolesTable-${envName}`,
    });

    new CfnOutput(this, `${envName}MenuConfigTable`, {
      value: menuConfigTable.tableName,
      exportName: `MenuConfigTable-${envName}`,
    });
  }
}
