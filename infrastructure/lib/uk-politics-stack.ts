import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import { Construct } from 'constructs';

export class UKPoliticsStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create DynamoDB table for caching
    const cacheTable = new dynamodb.Table(this, 'CacheTable', {
      partitionKey: { name: 'cacheKey', type: dynamodb.AttributeType.STRING },
      timeToLiveAttribute: 'ttl',
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
    });

    // Create CloudWatch Logs role for API Gateway
    const apiGatewayLogsRole = new iam.Role(this, 'ApiGatewayLogsRole', {
      assumedBy: new iam.ServicePrincipal('apigateway.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          'service-role/AmazonAPIGatewayPushToCloudWatchLogs'
        ),
      ],
    });

    // Create Lambda function
    const backendFunction = new lambda.Function(this, 'BackendFunction', {
      runtime: lambda.Runtime.NODEJS_20_X,
      handler: 'dist/handlers/api.handler',
      code: lambda.Code.fromAsset('../backend'),
      timeout: cdk.Duration.seconds(30),
      memorySize: 1024,
      environment: {
        NODE_ENV: 'production',
        CACHE_TABLE_NAME: cacheTable.tableName,
      },
      logRetention: logs.RetentionDays.ONE_WEEK,
    });

    // Grant DynamoDB permissions to Lambda
    cacheTable.grantReadWriteData(backendFunction);

    // Add permissions for Lambda to call external APIs
    backendFunction.addToRolePolicy(new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['execute-api:Invoke'],
      resources: ['*'],
    }));

    // Create API Gateway
    const api = new apigateway.RestApi(this, 'BackendApi', {
      description: 'UK Politics App API',
      deployOptions: {
        stageName: 'dev',
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
        tracingEnabled: true,
        metricsEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: ['https://votevitals.com'],  // Only allow votevitals.com
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.days(1),
      },
    });

    // Create API resources
    const apiRoot = api.root;
    
    // /api
    const apiResource = apiRoot.addResource('api');
    
    // /api/parliament
    const parliamentResource = apiResource.addResource('parliament');
    
    // /api/parliament/members
    const membersResource = parliamentResource.addResource('members');
    const memberEarningsResource = membersResource.addResource('earnings');
    const memberByIdResource = membersResource.addResource('{id}');

    // /api/parliament/bills
    const billsResource = parliamentResource.addResource('bills');
    const billByIdResource = billsResource.addResource('{id}');

    // Create Lambda integration with response configuration
    const lambdaIntegration = new apigateway.LambdaIntegration(backendFunction, {
      proxy: true,
      allowTestInvoke: true,
      integrationResponses: [
        {
          statusCode: '200',
          responseParameters: {
            'method.response.header.Access-Control-Allow-Origin': "'https://votevitals.com'",
            'method.response.header.Access-Control-Allow-Headers': "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'",
            'method.response.header.Access-Control-Allow-Methods': "'GET,OPTIONS'",
          },
        },
      ],
    });

    // Add methods to resources with proper response configuration
    const resources = [
      membersResource,
      memberEarningsResource,
      memberByIdResource,
      billsResource,
      billByIdResource,
    ];

    resources.forEach(resource => {
      resource.addMethod('GET', lambdaIntegration, {
        methodResponses: [
          {
            statusCode: '200',
            responseParameters: {
              'method.response.header.Access-Control-Allow-Origin': true,
              'method.response.header.Access-Control-Allow-Headers': true,
              'method.response.header.Access-Control-Allow-Methods': true,
            },
          },
        ],
      });
    });

    // Create log group for API Gateway
    const logGroup = new logs.LogGroup(this, 'ApiGatewayLogs', {
      retention: logs.RetentionDays.ONE_WEEK,
    });

    // Add account settings for API Gateway logging
    const apiGatewayAccountConfig = new apigateway.CfnAccount(this, 'ApiGatewayAccount', {
      cloudWatchRoleArn: apiGatewayLogsRole.roleArn,
    });

    // Grant permissions to the API Gateway role
    logGroup.grantWrite(apiGatewayLogsRole);

    // Ensure the API Gateway account config is created before the API
    api.node.addDependency(apiGatewayAccountConfig);

    // Output values
    new cdk.CfnOutput(this, 'ApiUrl', { value: api.url });
  }
}