import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as path from "path";

export class InfrastructureStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ✅ Cognito User Pool
    const userPool = new cognito.UserPool(this, "UserPool", {
      userPoolName: "frest-pawn-userpool",
      selfSignUpEnabled: true,
      signInAliases: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireSymbols: false,
        requireDigits: true,
        requireLowercase: true,
        requireUppercase: false,
      },
      accountRecovery: cognito.AccountRecovery.EMAIL_ONLY,
    });

    const userPoolClient = new cognito.UserPoolClient(this, "UserPoolClient", {
      userPool,
      authFlows: {
        userPassword: true, // ✅ Enables USER_PASSWORD_AUTH
      },
    });

    // ✅ Lambda Function for Login
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

    const registerLambda = new lambda.Function(this, "RegisterFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "register.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../services/auth-service")
      ),
      environment: {
        USER_POOL_ID: userPool.userPoolId,
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId, // ← You’ll wire this up in CDK below
      },
    });

    const confirmLambda = new lambda.Function(this, "ConfirmFunction", {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: "confirm.handler",
      code: lambda.Code.fromAsset(
        path.join(__dirname, "../../services/auth-service")
      ),
      environment: {
        USER_POOL_CLIENT_ID: userPoolClient.userPoolClientId,
      },
    });

    // ✅ API Gateway
    const api = new apigateway.RestApi(this, "FrestPawnAPI", {
      restApiName: "Frest Pawn API",
      description: "Warehouse SaaS API for authentication and more",
    });

    // ✅ /login endpoint
    const login = api.root.addResource("login");
    login.addMethod("POST", new apigateway.LambdaIntegration(loginLambda));
    login.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowHeaders: ["Content-Type"],
      allowMethods: ["POST"],
    });

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

    // ✅ /register endpoint
    const register = api.root.addResource("register");
    register.addMethod(
      "POST",
      new apigateway.LambdaIntegration(registerLambda)
    );
    register.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowHeaders: ["Content-Type"],
      allowMethods: ["POST"],
    });

    // ✅ /confirm endpoint
    const confirm = api.root.addResource("confirm");
    confirm.addMethod("POST", new apigateway.LambdaIntegration(confirmLambda));
    confirm.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowHeaders: ["Content-Type"],
      allowMethods: ["POST"],
    });

    // ✅ /forgot password endpoint
    const forgot = api.root.addResource("forgot");

    // ✅ /forgot/initiate
    const initiate = forgot.addResource("initiate");
    initiate.addMethod(
      "POST",
      new apigateway.LambdaIntegration(forgotPasswordLambda)
    );
    initiate.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowHeaders: ["Content-Type"],
      allowMethods: ["POST"],
    });

    // ✅ /forgot/confirm
    const reset = forgot.addResource("reset");
    reset.addMethod(
      "POST",
      new apigateway.LambdaIntegration(confirmForgotPasswordLambda)
    );
    reset.addCorsPreflight({
      allowOrigins: apigateway.Cors.ALL_ORIGINS,
      allowHeaders: ["Content-Type"],
      allowMethods: ["POST"],
    });
  }
}
