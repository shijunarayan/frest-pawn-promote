import { Stack, StackProps, CfnOutput, RemovalPolicy, Tags } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as acm from "aws-cdk-lib/aws-certificatemanager";
import * as path from "path";

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
    const createLambda = (name: string, handler: string) => {
      const fn = new lambda.Function(this, name, {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: handler,
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../services/auth-service")
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

    const loginLambda = createLambda("LoginFunction", "login.handler");
    const registerLambda = createLambda("RegisterFunction", "register.handler");
    const confirmLambda = createLambda("ConfirmFunction", "confirm.handler");
    const forgotPasswordLambda = createLambda(
      "ForgotPasswordFunction",
      "forgot.initiateForgotPassword"
    );
    const confirmForgotPasswordLambda = createLambda(
      "ConfirmForgotPasswordFunction",
      "forgot.confirmForgotPassword"
    );
    const sessionLambda = createLambda("SessionFunction", "session.handler");

    // 🌐 API Gateway
    const api = new apigateway.RestApi(this, "FrestPawnAPI", {
      restApiName: "Frest Pawn API",
      description: `Warehouse SaaS API for ${envName}`,
    });

    // Routes
    const routeMap = [
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
    ];

    for (const { path: routePath, method, lambda } of routeMap) {
      const segments = routePath.split("/");
      const resource = segments.reduce((parent, segment) => {
        return parent.getResource(segment) ?? parent.addResource(segment);
      }, api.root!);

      resource.addMethod(method, new apigateway.LambdaIntegration(lambda));
      resource.addCorsPreflight({
        allowOrigins: corsOrigins,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type"],
        allowCredentials: true,
      });
    }

    // 🔁 Output: API Gateway URL
    new CfnOutput(this, `${envName}ApiUrl`, {
      value: api.url,
      description: `API Gateway URL for ${envName} environment`,
      exportName: `FrestPawnAPIEndpoint-${envName}`,
    });

    // 🌐 Optional: Custom domain support
    if (customDomain) {
      const certArn =
        "arn:aws:acm:your-region:your-account:certificate/your-cert-id"; // replace when ready
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
  }
}
