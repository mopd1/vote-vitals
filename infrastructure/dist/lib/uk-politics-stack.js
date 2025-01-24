"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UKPoliticsStack = void 0;
const cdk = require("aws-cdk-lib");
const lambda = require("aws-cdk-lib/aws-lambda");
const apigateway = require("aws-cdk-lib/aws-apigateway");
const iam = require("aws-cdk-lib/aws-iam");
const logs = require("aws-cdk-lib/aws-logs");
const dynamodb = require("aws-cdk-lib/aws-dynamodb");
class UKPoliticsStack extends cdk.Stack {
    constructor(scope, id, props) {
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
                iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonAPIGatewayPushToCloudWatchLogs'),
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
                allowOrigins: ['https://votevitals.com'], // Only allow votevitals.com
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
exports.UKPoliticsStack = UKPoliticsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWstcG9saXRpY3Mtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdWstcG9saXRpY3Mtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQsMkNBQTJDO0FBQzNDLDZDQUE2QztBQUM3QyxxREFBcUQ7QUFHckQsTUFBYSxlQUFnQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzVDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsb0NBQW9DO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3hELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3ZFLG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtTQUNsRCxDQUFDLENBQUM7UUFFSCw4Q0FBOEM7UUFDOUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ2xFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQywwQkFBMEIsQ0FBQztZQUMvRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsbURBQW1ELENBQ3BEO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCx5QkFBeUI7UUFDekIsTUFBTSxlQUFlLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNuRSxPQUFPLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxXQUFXO1lBQ25DLE9BQU8sRUFBRSwyQkFBMkI7WUFDcEMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLFlBQVksQ0FBQztZQUN6QyxPQUFPLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsRUFBRSxDQUFDO1lBQ2pDLFVBQVUsRUFBRSxJQUFJO1lBQ2hCLFdBQVcsRUFBRTtnQkFDWCxRQUFRLEVBQUUsWUFBWTtnQkFDdEIsZ0JBQWdCLEVBQUUsVUFBVSxDQUFDLFNBQVM7YUFDdkM7WUFDRCxZQUFZLEVBQUUsSUFBSSxDQUFDLGFBQWEsQ0FBQyxRQUFRO1NBQzFDLENBQUMsQ0FBQztRQUVILHVDQUF1QztRQUN2QyxVQUFVLENBQUMsa0JBQWtCLENBQUMsZUFBZSxDQUFDLENBQUM7UUFFL0MsbURBQW1EO1FBQ25ELGVBQWUsQ0FBQyxlQUFlLENBQUMsSUFBSSxHQUFHLENBQUMsZUFBZSxDQUFDO1lBQ3RELE1BQU0sRUFBRSxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUs7WUFDeEIsT0FBTyxFQUFFLENBQUMsb0JBQW9CLENBQUM7WUFDL0IsU0FBUyxFQUFFLENBQUMsR0FBRyxDQUFDO1NBQ2pCLENBQUMsQ0FBQyxDQUFDO1FBRUoscUJBQXFCO1FBQ3JCLE1BQU0sR0FBRyxHQUFHLElBQUksVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3JELFdBQVcsRUFBRSxxQkFBcUI7WUFDbEMsYUFBYSxFQUFFO2dCQUNiLFNBQVMsRUFBRSxLQUFLO2dCQUNoQixZQUFZLEVBQUUsVUFBVSxDQUFDLGtCQUFrQixDQUFDLElBQUk7Z0JBQ2hELGdCQUFnQixFQUFFLElBQUk7Z0JBQ3RCLGNBQWMsRUFBRSxJQUFJO2dCQUNwQixjQUFjLEVBQUUsSUFBSTthQUNyQjtZQUNELDJCQUEyQixFQUFFO2dCQUMzQixZQUFZLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxFQUFHLDRCQUE0QjtnQkFDdkUsWUFBWSxFQUFFLFVBQVUsQ0FBQyxJQUFJLENBQUMsV0FBVztnQkFDekMsWUFBWSxFQUFFO29CQUNaLGNBQWM7b0JBQ2QsWUFBWTtvQkFDWixlQUFlO29CQUNmLFdBQVc7b0JBQ1gsc0JBQXNCO2lCQUN2QjtnQkFDRCxnQkFBZ0IsRUFBRSxJQUFJO2dCQUN0QixNQUFNLEVBQUUsR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQzdCO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsdUJBQXVCO1FBQ3ZCLE1BQU0sT0FBTyxHQUFHLEdBQUcsQ0FBQyxJQUFJLENBQUM7UUFFekIsT0FBTztRQUNQLE1BQU0sV0FBVyxHQUFHLE9BQU8sQ0FBQyxXQUFXLENBQUMsS0FBSyxDQUFDLENBQUM7UUFFL0Msa0JBQWtCO1FBQ2xCLE1BQU0sa0JBQWtCLEdBQUcsV0FBVyxDQUFDLFdBQVcsQ0FBQyxZQUFZLENBQUMsQ0FBQztRQUVqRSwwQkFBMEI7UUFDMUIsTUFBTSxlQUFlLEdBQUcsa0JBQWtCLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1FBQ2xFLE1BQU0sc0JBQXNCLEdBQUcsZUFBZSxDQUFDLFdBQVcsQ0FBQyxVQUFVLENBQUMsQ0FBQztRQUN2RSxNQUFNLGtCQUFrQixHQUFHLGVBQWUsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFL0Qsd0JBQXdCO1FBQ3hCLE1BQU0sYUFBYSxHQUFHLGtCQUFrQixDQUFDLFdBQVcsQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUM5RCxNQUFNLGdCQUFnQixHQUFHLGFBQWEsQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7UUFFM0Qsd0RBQXdEO1FBQ3hELE1BQU0saUJBQWlCLEdBQUcsSUFBSSxVQUFVLENBQUMsaUJBQWlCLENBQUMsZUFBZSxFQUFFO1lBQzFFLEtBQUssRUFBRSxJQUFJO1lBQ1gsZUFBZSxFQUFFLElBQUk7WUFDckIsb0JBQW9CLEVBQUU7Z0JBQ3BCO29CQUNFLFVBQVUsRUFBRSxLQUFLO29CQUNqQixrQkFBa0IsRUFBRTt3QkFDbEIsb0RBQW9ELEVBQUUsMEJBQTBCO3dCQUNoRixxREFBcUQsRUFBRSx3RUFBd0U7d0JBQy9ILHFEQUFxRCxFQUFFLGVBQWU7cUJBQ3ZFO2lCQUNGO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCw4REFBOEQ7UUFDOUQsTUFBTSxTQUFTLEdBQUc7WUFDaEIsZUFBZTtZQUNmLHNCQUFzQjtZQUN0QixrQkFBa0I7WUFDbEIsYUFBYTtZQUNiLGdCQUFnQjtTQUNqQixDQUFDO1FBRUYsU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsRUFBRTtZQUMzQixRQUFRLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxpQkFBaUIsRUFBRTtnQkFDM0MsZUFBZSxFQUFFO29CQUNmO3dCQUNFLFVBQVUsRUFBRSxLQUFLO3dCQUNqQixrQkFBa0IsRUFBRTs0QkFDbEIsb0RBQW9ELEVBQUUsSUFBSTs0QkFDMUQscURBQXFELEVBQUUsSUFBSTs0QkFDM0QscURBQXFELEVBQUUsSUFBSTt5QkFDNUQ7cUJBQ0Y7aUJBQ0Y7YUFDRixDQUFDLENBQUM7UUFDTCxDQUFDLENBQUMsQ0FBQztRQUVILG1DQUFtQztRQUNuQyxNQUFNLFFBQVEsR0FBRyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLGdCQUFnQixFQUFFO1lBQ3pELFNBQVMsRUFBRSxJQUFJLENBQUMsYUFBYSxDQUFDLFFBQVE7U0FDdkMsQ0FBQyxDQUFDO1FBRUgsK0NBQStDO1FBQy9DLE1BQU0sdUJBQXVCLEdBQUcsSUFBSSxVQUFVLENBQUMsVUFBVSxDQUFDLElBQUksRUFBRSxtQkFBbUIsRUFBRTtZQUNuRixpQkFBaUIsRUFBRSxrQkFBa0IsQ0FBQyxPQUFPO1NBQzlDLENBQUMsQ0FBQztRQUVILDRDQUE0QztRQUM1QyxRQUFRLENBQUMsVUFBVSxDQUFDLGtCQUFrQixDQUFDLENBQUM7UUFFeEMsa0VBQWtFO1FBQ2xFLEdBQUcsQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLHVCQUF1QixDQUFDLENBQUM7UUFFaEQsZ0JBQWdCO1FBQ2hCLElBQUksR0FBRyxDQUFDLFNBQVMsQ0FBQyxJQUFJLEVBQUUsUUFBUSxFQUFFLEVBQUUsS0FBSyxFQUFFLEdBQUcsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO0lBQ3hELENBQUM7Q0FDRjtBQW5KRCwwQ0FtSkMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBjZGsgZnJvbSAnYXdzLWNkay1saWInO1xuaW1wb3J0ICogYXMgbGFtYmRhIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sYW1iZGEnO1xuaW1wb3J0ICogYXMgYXBpZ2F0ZXdheSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtYXBpZ2F0ZXdheSc7XG5pbXBvcnQgKiBhcyBpYW0gZnJvbSAnYXdzLWNkay1saWIvYXdzLWlhbSc7XG5pbXBvcnQgKiBhcyBsb2dzIGZyb20gJ2F3cy1jZGstbGliL2F3cy1sb2dzJztcbmltcG9ydCAqIGFzIGR5bmFtb2RiIGZyb20gJ2F3cy1jZGstbGliL2F3cy1keW5hbW9kYic7XG5pbXBvcnQgeyBDb25zdHJ1Y3QgfSBmcm9tICdjb25zdHJ1Y3RzJztcblxuZXhwb3J0IGNsYXNzIFVLUG9saXRpY3NTdGFjayBleHRlbmRzIGNkay5TdGFjayB7XG4gIGNvbnN0cnVjdG9yKHNjb3BlOiBDb25zdHJ1Y3QsIGlkOiBzdHJpbmcsIHByb3BzPzogY2RrLlN0YWNrUHJvcHMpIHtcbiAgICBzdXBlcihzY29wZSwgaWQsIHByb3BzKTtcblxuICAgIC8vIENyZWF0ZSBEeW5hbW9EQiB0YWJsZSBmb3IgY2FjaGluZ1xuICAgIGNvbnN0IGNhY2hlVGFibGUgPSBuZXcgZHluYW1vZGIuVGFibGUodGhpcywgJ0NhY2hlVGFibGUnLCB7XG4gICAgICBwYXJ0aXRpb25LZXk6IHsgbmFtZTogJ2NhY2hlS2V5JywgdHlwZTogZHluYW1vZGIuQXR0cmlidXRlVHlwZS5TVFJJTkcgfSxcbiAgICAgIHRpbWVUb0xpdmVBdHRyaWJ1dGU6ICd0dGwnLFxuICAgICAgYmlsbGluZ01vZGU6IGR5bmFtb2RiLkJpbGxpbmdNb2RlLlBBWV9QRVJfUkVRVUVTVCxcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBDbG91ZFdhdGNoIExvZ3Mgcm9sZSBmb3IgQVBJIEdhdGV3YXlcbiAgICBjb25zdCBhcGlHYXRld2F5TG9nc1JvbGUgPSBuZXcgaWFtLlJvbGUodGhpcywgJ0FwaUdhdGV3YXlMb2dzUm9sZScsIHtcbiAgICAgIGFzc3VtZWRCeTogbmV3IGlhbS5TZXJ2aWNlUHJpbmNpcGFsKCdhcGlnYXRld2F5LmFtYXpvbmF3cy5jb20nKSxcbiAgICAgIG1hbmFnZWRQb2xpY2llczogW1xuICAgICAgICBpYW0uTWFuYWdlZFBvbGljeS5mcm9tQXdzTWFuYWdlZFBvbGljeU5hbWUoXG4gICAgICAgICAgJ3NlcnZpY2Utcm9sZS9BbWF6b25BUElHYXRld2F5UHVzaFRvQ2xvdWRXYXRjaExvZ3MnXG4gICAgICAgICksXG4gICAgICBdLFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIExhbWJkYSBmdW5jdGlvblxuICAgIGNvbnN0IGJhY2tlbmRGdW5jdGlvbiA9IG5ldyBsYW1iZGEuRnVuY3Rpb24odGhpcywgJ0JhY2tlbmRGdW5jdGlvbicsIHtcbiAgICAgIHJ1bnRpbWU6IGxhbWJkYS5SdW50aW1lLk5PREVKU18yMF9YLFxuICAgICAgaGFuZGxlcjogJ2Rpc3QvaGFuZGxlcnMvYXBpLmhhbmRsZXInLFxuICAgICAgY29kZTogbGFtYmRhLkNvZGUuZnJvbUFzc2V0KCcuLi9iYWNrZW5kJyksXG4gICAgICB0aW1lb3V0OiBjZGsuRHVyYXRpb24uc2Vjb25kcygzMCksXG4gICAgICBtZW1vcnlTaXplOiAxMDI0LFxuICAgICAgZW52aXJvbm1lbnQ6IHtcbiAgICAgICAgTk9ERV9FTlY6ICdwcm9kdWN0aW9uJyxcbiAgICAgICAgQ0FDSEVfVEFCTEVfTkFNRTogY2FjaGVUYWJsZS50YWJsZU5hbWUsXG4gICAgICB9LFxuICAgICAgbG9nUmV0ZW50aW9uOiBsb2dzLlJldGVudGlvbkRheXMuT05FX1dFRUssXG4gICAgfSk7XG5cbiAgICAvLyBHcmFudCBEeW5hbW9EQiBwZXJtaXNzaW9ucyB0byBMYW1iZGFcbiAgICBjYWNoZVRhYmxlLmdyYW50UmVhZFdyaXRlRGF0YShiYWNrZW5kRnVuY3Rpb24pO1xuXG4gICAgLy8gQWRkIHBlcm1pc3Npb25zIGZvciBMYW1iZGEgdG8gY2FsbCBleHRlcm5hbCBBUElzXG4gICAgYmFja2VuZEZ1bmN0aW9uLmFkZFRvUm9sZVBvbGljeShuZXcgaWFtLlBvbGljeVN0YXRlbWVudCh7XG4gICAgICBlZmZlY3Q6IGlhbS5FZmZlY3QuQUxMT1csXG4gICAgICBhY3Rpb25zOiBbJ2V4ZWN1dGUtYXBpOkludm9rZSddLFxuICAgICAgcmVzb3VyY2VzOiBbJyonXSxcbiAgICB9KSk7XG5cbiAgICAvLyBDcmVhdGUgQVBJIEdhdGV3YXlcbiAgICBjb25zdCBhcGkgPSBuZXcgYXBpZ2F0ZXdheS5SZXN0QXBpKHRoaXMsICdCYWNrZW5kQXBpJywge1xuICAgICAgZGVzY3JpcHRpb246ICdVSyBQb2xpdGljcyBBcHAgQVBJJyxcbiAgICAgIGRlcGxveU9wdGlvbnM6IHtcbiAgICAgICAgc3RhZ2VOYW1lOiAnZGV2JyxcbiAgICAgICAgbG9nZ2luZ0xldmVsOiBhcGlnYXRld2F5Lk1ldGhvZExvZ2dpbmdMZXZlbC5JTkZPLFxuICAgICAgICBkYXRhVHJhY2VFbmFibGVkOiB0cnVlLFxuICAgICAgICB0cmFjaW5nRW5hYmxlZDogdHJ1ZSxcbiAgICAgICAgbWV0cmljc0VuYWJsZWQ6IHRydWUsXG4gICAgICB9LFxuICAgICAgZGVmYXVsdENvcnNQcmVmbGlnaHRPcHRpb25zOiB7XG4gICAgICAgIGFsbG93T3JpZ2luczogWydodHRwczovL3ZvdGV2aXRhbHMuY29tJ10sICAvLyBPbmx5IGFsbG93IHZvdGV2aXRhbHMuY29tXG4gICAgICAgIGFsbG93TWV0aG9kczogYXBpZ2F0ZXdheS5Db3JzLkFMTF9NRVRIT0RTLFxuICAgICAgICBhbGxvd0hlYWRlcnM6IFtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJyxcbiAgICAgICAgICAnWC1BbXotRGF0ZScsXG4gICAgICAgICAgJ0F1dGhvcml6YXRpb24nLFxuICAgICAgICAgICdYLUFwaS1LZXknLFxuICAgICAgICAgICdYLUFtei1TZWN1cml0eS1Ub2tlbicsXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICAgIG1heEFnZTogY2RrLkR1cmF0aW9uLmRheXMoMSksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIEFQSSByZXNvdXJjZXNcbiAgICBjb25zdCBhcGlSb290ID0gYXBpLnJvb3Q7XG4gICAgXG4gICAgLy8gL2FwaVxuICAgIGNvbnN0IGFwaVJlc291cmNlID0gYXBpUm9vdC5hZGRSZXNvdXJjZSgnYXBpJyk7XG4gICAgXG4gICAgLy8gL2FwaS9wYXJsaWFtZW50XG4gICAgY29uc3QgcGFybGlhbWVudFJlc291cmNlID0gYXBpUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ3BhcmxpYW1lbnQnKTtcbiAgICBcbiAgICAvLyAvYXBpL3BhcmxpYW1lbnQvbWVtYmVyc1xuICAgIGNvbnN0IG1lbWJlcnNSZXNvdXJjZSA9IHBhcmxpYW1lbnRSZXNvdXJjZS5hZGRSZXNvdXJjZSgnbWVtYmVycycpO1xuICAgIGNvbnN0IG1lbWJlckVhcm5pbmdzUmVzb3VyY2UgPSBtZW1iZXJzUmVzb3VyY2UuYWRkUmVzb3VyY2UoJ2Vhcm5pbmdzJyk7XG4gICAgY29uc3QgbWVtYmVyQnlJZFJlc291cmNlID0gbWVtYmVyc1Jlc291cmNlLmFkZFJlc291cmNlKCd7aWR9Jyk7XG5cbiAgICAvLyAvYXBpL3BhcmxpYW1lbnQvYmlsbHNcbiAgICBjb25zdCBiaWxsc1Jlc291cmNlID0gcGFybGlhbWVudFJlc291cmNlLmFkZFJlc291cmNlKCdiaWxscycpO1xuICAgIGNvbnN0IGJpbGxCeUlkUmVzb3VyY2UgPSBiaWxsc1Jlc291cmNlLmFkZFJlc291cmNlKCd7aWR9Jyk7XG5cbiAgICAvLyBDcmVhdGUgTGFtYmRhIGludGVncmF0aW9uIHdpdGggcmVzcG9uc2UgY29uZmlndXJhdGlvblxuICAgIGNvbnN0IGxhbWJkYUludGVncmF0aW9uID0gbmV3IGFwaWdhdGV3YXkuTGFtYmRhSW50ZWdyYXRpb24oYmFja2VuZEZ1bmN0aW9uLCB7XG4gICAgICBwcm94eTogdHJ1ZSxcbiAgICAgIGFsbG93VGVzdEludm9rZTogdHJ1ZSxcbiAgICAgIGludGVncmF0aW9uUmVzcG9uc2VzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IFwiJ2h0dHBzOi8vdm90ZXZpdGFscy5jb20nXCIsXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogXCInQ29udGVudC1UeXBlLFgtQW16LURhdGUsQXV0aG9yaXphdGlvbixYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nXCIsXG4gICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1NZXRob2RzJzogXCInR0VULE9QVElPTlMnXCIsXG4gICAgICAgICAgfSxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBBZGQgbWV0aG9kcyB0byByZXNvdXJjZXMgd2l0aCBwcm9wZXIgcmVzcG9uc2UgY29uZmlndXJhdGlvblxuICAgIGNvbnN0IHJlc291cmNlcyA9IFtcbiAgICAgIG1lbWJlcnNSZXNvdXJjZSxcbiAgICAgIG1lbWJlckVhcm5pbmdzUmVzb3VyY2UsXG4gICAgICBtZW1iZXJCeUlkUmVzb3VyY2UsXG4gICAgICBiaWxsc1Jlc291cmNlLFxuICAgICAgYmlsbEJ5SWRSZXNvdXJjZSxcbiAgICBdO1xuXG4gICAgcmVzb3VyY2VzLmZvckVhY2gocmVzb3VyY2UgPT4ge1xuICAgICAgcmVzb3VyY2UuYWRkTWV0aG9kKCdHRVQnLCBsYW1iZGFJbnRlZ3JhdGlvbiwge1xuICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICB7XG4gICAgICAgICAgICBzdGF0dXNDb2RlOiAnMjAwJyxcbiAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxuICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogdHJ1ZSxcbiAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWUsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIH0sXG4gICAgICAgIF0sXG4gICAgICB9KTtcbiAgICB9KTtcblxuICAgIC8vIENyZWF0ZSBsb2cgZ3JvdXAgZm9yIEFQSSBHYXRld2F5XG4gICAgY29uc3QgbG9nR3JvdXAgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCAnQXBpR2F0ZXdheUxvZ3MnLCB7XG4gICAgICByZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBhY2NvdW50IHNldHRpbmdzIGZvciBBUEkgR2F0ZXdheSBsb2dnaW5nXG4gICAgY29uc3QgYXBpR2F0ZXdheUFjY291bnRDb25maWcgPSBuZXcgYXBpZ2F0ZXdheS5DZm5BY2NvdW50KHRoaXMsICdBcGlHYXRld2F5QWNjb3VudCcsIHtcbiAgICAgIGNsb3VkV2F0Y2hSb2xlQXJuOiBhcGlHYXRld2F5TG9nc1JvbGUucm9sZUFybixcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IHBlcm1pc3Npb25zIHRvIHRoZSBBUEkgR2F0ZXdheSByb2xlXG4gICAgbG9nR3JvdXAuZ3JhbnRXcml0ZShhcGlHYXRld2F5TG9nc1JvbGUpO1xuXG4gICAgLy8gRW5zdXJlIHRoZSBBUEkgR2F0ZXdheSBhY2NvdW50IGNvbmZpZyBpcyBjcmVhdGVkIGJlZm9yZSB0aGUgQVBJXG4gICAgYXBpLm5vZGUuYWRkRGVwZW5kZW5jeShhcGlHYXRld2F5QWNjb3VudENvbmZpZyk7XG5cbiAgICAvLyBPdXRwdXQgdmFsdWVzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHsgdmFsdWU6IGFwaS51cmwgfSk7XG4gIH1cbn0iXX0=