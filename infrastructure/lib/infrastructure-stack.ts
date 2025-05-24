import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as iam from "aws-cdk-lib/aws-iam";

import * as path from "path";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const customMessageLambda = new lambda.Function(
      this,
      "CustomMessageLambda",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        code: lambda.Code.fromAsset("../services/auth-service/custom-message"),
        handler: "index.handler",
        timeout: cdk.Duration.seconds(10),
      }
    );

    customMessageLambda.addToRolePolicy(
      new iam.PolicyStatement({
        actions: ["sns:Publish", "ses:SendEmail"],
        resources: ["*"], // you can restrict this later
      })
    );

    // ✅ Cognito User Pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "frest-pawn-userpool",
      selfSignUpEnabled: true,
      signInAliases: { username: true },
      autoVerify: {
        email: true,
        phone: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: false,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
      lambdaTriggers: {
        customMessage: customMessageLambda,
      },
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: {
        userPassword: true, // ✅ Enables USER_PASSWORD_AUTH
      },
    });

    // Shared permissions for all Lambda functions
    const cognitoPolicy = new iam.PolicyStatement({
      actions: [
        "cognito-idp:AdminCreateUser",
        "cognito-idp:AdminSetUserPassword",
        "cognito-idp:AdminUpdateUserAttributes",
      ],
      resources: [userPool.userPoolArn],
    });

    // Lambda Function: Login
    const loginLambda = new lambda.Function(this, "LoginFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "login.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../services/auth-service")
      ),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });
    loginLambda.addToRolePolicy(cognitoPolicy);

    // Lambda Function: Register
    const registerLambda = new lambda.Function(this, "RegisterFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "register.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../services/auth-service")
      ),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });
    registerLambda.addToRolePolicy(cognitoPolicy);

    // Lambda Function: Confirm
    const confirmLambda = new lambda.Function(this, "ConfirmFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "confirm.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../services/auth-service")
      ),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
      },
    });
    confirmLambda.addToRolePolicy(cognitoPolicy);

    // Lambda Function: Forgot Password (initiate)
    const forgotPasswordLambda = new lambda.Function(
      this,
      "ForgotPasswordFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "forgot.initiateForgotPassword",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../services/auth-service")
        ),
        environment: {
          USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        },
      }
    );
    forgotPasswordLambda.addToRolePolicy(cognitoPolicy);

    // Lambda Function: Confirm Forgot Password
    const confirmForgotPasswordLambda = new lambda.Function(
      this,
      "ConfirmForgotPasswordFunction",
      {
        runtime: lambda.Runtime.NODEJS_18_X,
        handler: "forgot.confirmForgotPassword",
        code: lambda.Code.fromAsset(
          path.join(__dirname, "../../services/auth-service")
        ),
        environment: {
          USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
        },
      }
    );
    confirmForgotPasswordLambda.addToRolePolicy(cognitoPolicy);

    // API Gateway
    const api = new apigateway.RestApi(this, "FrestPawnAPI", {
      restApiName: "Frest Pawn API",
      description: "Warehouse SaaS API for authentication and more",
    });

    const forgotResource = api.root.addResource("forgot");

    const routeMap = [
      { path: "login", lambda: loginLambda },
      { path: "register", lambda: registerLambda },
      { path: "confirm", lambda: confirmLambda },
      { path: "forgot/initiate", lambda: forgotPasswordLambda },
      { path: "forgot/reset", lambda: confirmForgotPasswordLambda },
    ];

    for (const { path, lambda } of routeMap) {
      const segments = path.split("/");
      const resource = segments.reduce((parent, segment) => {
        return parent.getResource(segment) ?? parent.addResource(segment);
      }, api.root);

      resource.addMethod("POST", new apigateway.LambdaIntegration(lambda));
      resource.addCorsPreflight({
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: ["Content-Type"],
      });
    }
  }
}
