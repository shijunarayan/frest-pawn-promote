import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import { Construct } from "constructs";
import * as path from "path";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";
import { Stack, StackProps, CfnOutput, RemovalPolicy, Tags } from "aws-cdk-lib";

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

    const lambdaEnvironment = {
      REGION: props.env?.region || "ap-south-1",
      CORS_ORIGINS: props.corsOrigins.join(","), // ✅ inject here
      ENV_NAME: props.envName, // optional, but helpful
    };

    // 🧑‍💻 Cognito User Pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: `frest-pawn-userpool-${envName}`,
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true,
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

    // 🧬 Lambda Functions
    const createLambda = (name: string, folder: string, handler: string) => {
      const fn = new lambda.Function(this, name, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: `${handler}.handler`,
        code: lambda.Code.fromAsset(
          path.join(__dirname, `../../services/${folder}`)
        ),
        environment: {
          ...lambdaEnvironment,
          USER_POOL_ID: userPool.userPoolId,
          USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        },
      });
      fn.addToRolePolicy(cognitoPolicy);
      return fn;
    };

    // === Auth-Service Lambdas ===
    const loginLambda = createLambda("LoginFunction", "auth-service", "login");
    const registerLambda = createLambda(
      "RegisterFunction",
      "auth-service",
      "register"
    );
    const confirmLambda = createLambda(
      "ConfirmFunction",
      "auth-service",
      "confirm"
    );
    const forgotPasswordLambda = createLambda(
      "ForgotPasswordFunction",
      "auth-service",
      "forgot.initiateForgotPassword"
    );
    const confirmForgotPasswordLambda = createLambda(
      "ConfirmForgotPasswordFunction",
      "auth-service",
      "forgot.confirmForgotPassword"
    );
    const sessionLambda = createLambda(
      "SessionFunction",
      "auth-service",
      "session"
    );

    // === Access-Control Lambdas ===
    const lambdas = {
      getMenu: createLambda("GetMenu", "access-control", "menu"),
      getRoles: createLambda("GetRoles", "access-control", "roles"),
      getUserRole: createLambda("GetUserRole", "access-control", "user-role"),
      getMenuConfig: createLambda(
        "GetMenuConfig",
        "access-control",
        "menu-config"
      ),
      getCapabilities: createLambda(
        "GetCapabilities",
        "access-control",
        "capabilities"
      ),
      postUserRoles: createLambda(
        "PostUserRoles",
        "access-control",
        "user-roles.post"
      ),
      patchUserRoles: createLambda(
        "PatchUserRoles",
        "access-control",
        "user-roles.patch"
      ),
      postRoles: createLambda("PostRoles", "access-control", "roles.post"),
      patchRoleCapabilities: createLambda(
        "PatchRoleCapabilities",
        "access-control",
        "role-capabilities.patch"
      ),
    };

    // === API Gateway ===
    const api = new apigateway.RestApi(this, "FrestPawnAPI", {
      restApiName: "Frest Pawn API",
      description: `Warehouse SaaS API for ${envName}`,
    });

    // === All Routes ===
    const routeMap = [
      // Auth
      { path: "login", method: "POST", lambda: loginLambda },
      { path: "register", method: "POST", lambda: registerLambda },
      { path: "confirm", method: "POST", lambda: confirmLambda },
      { path: "forgot/initiate", method: "POST", lambda: forgotPasswordLambda },
      {
        path: "forgot/reset",
        method: "POST",
        lambda: confirmForgotPasswordLambda,
      },
      { path: "session", method: "GET", lambda: sessionLambda },

      // Access Control
      { path: "access-control/menu", method: "GET", lambda: lambdas.getMenu },
      { path: "access-control/roles", method: "GET", lambda: lambdas.getRoles },
      {
        path: "access-control/user-roles/{username}",
        method: "GET",
        lambda: lambdas.getUserRole,
      },
      {
        path: "access-control/menu-config",
        method: "GET",
        lambda: lambdas.getMenuConfig,
      },
      {
        path: "access-control/capabilities",
        method: "GET",
        lambda: lambdas.getCapabilities,
      },
      {
        path: "access-control/user-roles",
        method: "POST",
        lambda: lambdas.postUserRoles,
      },
      {
        path: "access-control/user-roles/{username}",
        method: "PATCH",
        lambda: lambdas.patchUserRoles,
      },
      {
        path: "access-control/roles",
        method: "POST",
        lambda: lambdas.postRoles,
      },
      {
        path: "access-control/role-capabilities/{roleId}",
        method: "PATCH",
        lambda: lambdas.patchRoleCapabilities,
      },
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
  }
}
