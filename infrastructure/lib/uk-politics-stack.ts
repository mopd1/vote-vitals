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
        allowOrigins: [
          'https://votevitals.com',
          'https://www.votevitals.com',
          'https://vote-vitals.vercel.app',
          'https://*.vercel.app',  // Allow all Vercel preview deployments
          'http://localhost:3000'
        ],
        allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token',
          'Accept'
        ],
        allowCredentials: true,
        maxAge: cdk.Duration.days(1),
      },
    });

    // Create v1 API resources
    const v1 = api.root.addResource('v1');
    
    // Members endpoints
    const members = v1.addResource('members');
    const memberById = members.addResource('{id}');
    const memberInterests = memberById.addResource('interests');
    
    // Bills endpoints
    const bills = v1.addResource('bills');
    const billById = bills.addResource('{id}');
    
    // Votes endpoints
    const votes = v1.addResource('votes');
    const voteById = votes.addResource('{id}');

    // Create Lambda integration
    const lambdaIntegration = new apigateway.LambdaIntegration(backendFunction, {
      proxy: true,
      allowTestInvoke: true,
    });

    // Helper function to add methods to a resource
    const addMethods = (resource: apigateway.Resource, methods: string[]) => {
      methods.forEach(method => {
        resource.addMethod(method, lambdaIntegration, {
          methodResponses: [
            {
              statusCode: '200',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': true,
                'method.response.header.Access-Control-Allow-Headers': true,
                'method.response.header.Access-Control-Allow-Methods': true,
                'method.response.header.Access-Control-Allow-Credentials': true,
              },
              responseModels: {
                'application/json': apigateway.Model.EMPTY_MODEL,
              },
            },
            {
              statusCode: '400',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': true,
              },
            },
            {
              statusCode: '500',
              responseParameters: {
                'method.response.header.Access-Control-Allow-Origin': true,
              },
            },
          ],
        });
      });
    };

    // Add methods to resources
    addMethods(members, ['GET', 'POST']);
    addMethods(memberById, ['GET']);
    addMethods(memberInterests, ['GET']);
    addMethods(bills, ['GET']);
    addMethods(billById, ['GET']);
    addMethods(votes, ['GET']);
    addMethods(voteById, ['GET']);

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