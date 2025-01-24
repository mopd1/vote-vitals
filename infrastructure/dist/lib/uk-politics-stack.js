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
                allowOrigins: [
                    'https://votevitals.com',
                    'https://www.votevitals.com',
                    'https://vote-vitals.vercel.app',
                    'https://*.vercel.app', // Allow all Vercel preview deployments
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
        const addMethods = (resource, methods) => {
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
exports.UKPoliticsStack = UKPoliticsStack;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidWstcG9saXRpY3Mtc3RhY2suanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9saWIvdWstcG9saXRpY3Mtc3RhY2sudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBQUEsbUNBQW1DO0FBQ25DLGlEQUFpRDtBQUNqRCx5REFBeUQ7QUFDekQsMkNBQTJDO0FBQzNDLDZDQUE2QztBQUM3QyxxREFBcUQ7QUFHckQsTUFBYSxlQUFnQixTQUFRLEdBQUcsQ0FBQyxLQUFLO0lBQzVDLFlBQVksS0FBZ0IsRUFBRSxFQUFVLEVBQUUsS0FBc0I7UUFDOUQsS0FBSyxDQUFDLEtBQUssRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFFeEIsb0NBQW9DO1FBQ3BDLE1BQU0sVUFBVSxHQUFHLElBQUksUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsWUFBWSxFQUFFO1lBQ3hELFlBQVksRUFBRSxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsSUFBSSxFQUFFLFFBQVEsQ0FBQyxhQUFhLENBQUMsTUFBTSxFQUFFO1lBQ3ZFLG1CQUFtQixFQUFFLEtBQUs7WUFDMUIsV0FBVyxFQUFFLFFBQVEsQ0FBQyxXQUFXLENBQUMsZUFBZTtTQUNsRCxDQUFDLENBQUM7UUFFSCw4Q0FBOEM7UUFDOUMsTUFBTSxrQkFBa0IsR0FBRyxJQUFJLEdBQUcsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLG9CQUFvQixFQUFFO1lBQ2xFLFNBQVMsRUFBRSxJQUFJLEdBQUcsQ0FBQyxnQkFBZ0IsQ0FBQywwQkFBMEIsQ0FBQztZQUMvRCxlQUFlLEVBQUU7Z0JBQ2YsR0FBRyxDQUFDLGFBQWEsQ0FBQyx3QkFBd0IsQ0FDeEMsbURBQW1ELENBQ3BEO2FBQ0Y7U0FDRixDQUFDLENBQUM7UUFFSCx5QkFBeUI7UUFDekIsTUFBTSxlQUFlLEdBQUcsSUFBSSxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxpQkFBaUIsRUFBRTtZQUNuRSxPQUFPLEVBQUUsTUFBTSxD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RSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDOUIsVUFBVSxDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFDM0IsVUFBVSxDQUFDLFFBQVEsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFOUIsbUNBQW1DO1FBQ25DLE1BQU0sUUFBUSxHQUFHLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLEVBQUU7WUFDekQsU0FBUyxFQUFFLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUTtTQUN2QyxDQUFDLENBQUM7UUFFSCwrQ0FBK0M7UUFDL0MsTUFBTSx1QkFBdUIsR0FBRyxJQUFJLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxFQUFFLG1CQUFtQixFQUFFO1lBQ25GLGlCQUFpQixFQUFFLGtCQUFrQixDQUFDLE9BQU87U0FDOUMsQ0FBQyxDQUFDO1FBRUgsNENBQTRDO1FBQzVDLFFBQVEsQ0FBQyxVQUFVLENBQUMsa0JBQWtCLENBQUMsQ0FBQztRQUV4QyxrRUFBa0U7UUFDbEUsR0FBRyxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsdUJBQXVCLENBQUMsQ0FBQztRQUVoRCxnQkFBZ0I7UUFDaEIsSUFBSSxHQUFHLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxRQUFRLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUM7SUFDeEQsQ0FBQztDQUNGO0FBaktELDBDQWlLQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGNkayBmcm9tICdhd3MtY2RrLWxpYic7XG5pbXBvcnQgKiBhcyBsYW1iZGEgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxhbWJkYSc7XG5pbXBvcnQgKiBhcyBhcGlnYXRld2F5IGZyb20gJ2F3cy1jZGstbGliL2F3cy1hcGlnYXRld2F5JztcbmltcG9ydCAqIGFzIGlhbSBmcm9tICdhd3MtY2RrLWxpYi9hd3MtaWFtJztcbmltcG9ydCAqIGFzIGxvZ3MgZnJvbSAnYXdzLWNkay1saWIvYXdzLWxvZ3MnO1xuaW1wb3J0ICogYXMgZHluYW1vZGIgZnJvbSAnYXdzLWNkay1saWIvYXdzLWR5bmFtb2RiJztcbmltcG9ydCB7IENvbnN0cnVjdCB9IGZyb20gJ2NvbnN0cnVjdHMnO1xuXG5leHBvcnQgY2xhc3MgVUtQb2xpdGljc1N0YWNrIGV4dGVuZHMgY2RrLlN0YWNrIHtcbiAgY29uc3RydWN0b3Ioc2NvcGU6IENvbnN0cnVjdCwgaWQ6IHN0cmluZywgcHJvcHM/OiBjZGsuU3RhY2tQcm9wcykge1xuICAgIHN1cGVyKHNjb3BlLCBpZCwgcHJvcHMpO1xuXG4gICAgLy8gQ3JlYXRlIER5bmFtb0RCIHRhYmxlIGZvciBjYWNoaW5nXG4gICAgY29uc3QgY2FjaGVUYWJsZSA9IG5ldyBkeW5hbW9kYi5UYWJsZSh0aGlzLCAnQ2FjaGVUYWJsZScsIHtcbiAgICAgIHBhcnRpdGlvbktleTogeyBuYW1lOiAnY2FjaGVLZXknLCB0eXBlOiBkeW5hbW9kYi5BdHRyaWJ1dGVUeXBlLlNUUklORyB9LFxuICAgICAgdGltZVRvTGl2ZUF0dHJpYnV0ZTogJ3R0bCcsXG4gICAgICBiaWxsaW5nTW9kZTogZHluYW1vZGIuQmlsbGluZ01vZGUuUEFZX1BFUl9SRVFVRVNULFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIENsb3VkV2F0Y2ggTG9ncyByb2xlIGZvciBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaUdhdGV3YXlMb2dzUm9sZSA9IG5ldyBpYW0uUm9sZSh0aGlzLCAnQXBpR2F0ZXdheUxvZ3NSb2xlJywge1xuICAgICAgYXNzdW1lZEJ5OiBuZXcgaWFtLlNlcnZpY2VQcmluY2lwYWwoJ2FwaWdhdGV3YXkuYW1hem9uYXdzLmNvbScpLFxuICAgICAgbWFuYWdlZFBvbGljaWVzOiBbXG4gICAgICAgIGlhbS5NYW5hZ2VkUG9saWN5LmZyb21Bd3NNYW5hZ2VkUG9saWN5TmFtZShcbiAgICAgICAgICAnc2VydmljZS1yb2xlL0FtYXpvbkFQSUdhdGV3YXlQdXNoVG9DbG91ZFdhdGNoTG9ncydcbiAgICAgICAgKSxcbiAgICAgIF0sXG4gICAgfSk7XG5cbiAgICAvLyBDcmVhdGUgTGFtYmRhIGZ1bmN0aW9uXG4gICAgY29uc3QgYmFja2VuZEZ1bmN0aW9uID0gbmV3IGxhbWJkYS5GdW5jdGlvbih0aGlzLCAnQmFja2VuZEZ1bmN0aW9uJywge1xuICAgICAgcnVudGltZTogbGFtYmRhLlJ1bnRpbWUuTk9ERUpTXzIwX1gsXG4gICAgICBoYW5kbGVyOiAnZGlzdC9oYW5kbGVycy9hcGkuaGFuZGxlcicsXG4gICAgICBjb2RlOiBsYW1iZGEuQ29kZS5mcm9tQXNzZXQoJy4uL2JhY2tlbmQnKSxcbiAgICAgIHRpbWVvdXQ6IGNkay5EdXJhdGlvbi5zZWNvbmRzKDMwKSxcbiAgICAgIG1lbW9yeVNpemU6IDEwMjQsXG4gICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICBOT0RFX0VOVjogJ3Byb2R1Y3Rpb24nLFxuICAgICAgICBDQUNIRV9UQUJMRV9OQU1FOiBjYWNoZVRhYmxlLnRhYmxlTmFtZSxcbiAgICAgIH0sXG4gICAgICBsb2dSZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IER5bmFtb0RCIHBlcm1pc3Npb25zIHRvIExhbWJkYVxuICAgIGNhY2hlVGFibGUuZ3JhbnRSZWFkV3JpdGVEYXRhKGJhY2tlbmRGdW5jdGlvbik7XG5cbiAgICAvLyBBZGQgcGVybWlzc2lvbnMgZm9yIExhbWJkYSB0byBjYWxsIGV4dGVybmFsIEFQSXNcbiAgICBiYWNrZW5kRnVuY3Rpb24uYWRkVG9Sb2xlUG9saWN5KG5ldyBpYW0uUG9saWN5U3RhdGVtZW50KHtcbiAgICAgIGVmZmVjdDogaWFtLkVmZmVjdC5BTExPVyxcbiAgICAgIGFjdGlvbnM6IFsnZXhlY3V0ZS1hcGk6SW52b2tlJ10sXG4gICAgICByZXNvdXJjZXM6IFsnKiddLFxuICAgIH0pKTtcblxuICAgIC8vIENyZWF0ZSBBUEkgR2F0ZXdheVxuICAgIGNvbnN0IGFwaSA9IG5ldyBhcGlnYXRld2F5LlJlc3RBcGkodGhpcywgJ0JhY2tlbmRBcGknLCB7XG4gICAgICBkZXNjcmlwdGlvbjogJ1VLIFBvbGl0aWNzIEFwcCBBUEknLFxuICAgICAgZGVwbG95T3B0aW9uczoge1xuICAgICAgICBzdGFnZU5hbWU6ICdkZXYnLFxuICAgICAgICBsb2dnaW5nTGV2ZWw6IGFwaWdhdGV3YXkuTWV0aG9kTG9nZ2luZ0xldmVsLklORk8sXG4gICAgICAgIGRhdGFUcmFjZUVuYWJsZWQ6IHRydWUsXG4gICAgICAgIHRyYWNpbmdFbmFibGVkOiB0cnVlLFxuICAgICAgICBtZXRyaWNzRW5hYmxlZDogdHJ1ZSxcbiAgICAgIH0sXG4gICAgICBkZWZhdWx0Q29yc1ByZWZsaWdodE9wdGlvbnM6IHtcbiAgICAgICAgYWxsb3dPcmlnaW5zOiBbXG4gICAgICAgICAgJ2h0dHBzOi8vdm90ZXZpdGFscy5jb20nLFxuICAgICAgICAgICdodHRwczovL3d3dy52b3Rldml0YWxzLmNvbScsXG4gICAgICAgICAgJ2h0dHBzOi8vdm90ZS12aXRhbHMudmVyY2VsLmFwcCcsXG4gICAgICAgICAgJ2h0dHBzOi8vKi52ZXJjZWwuYXBwJywgIC8vIEFsbG93IGFsbCBWZXJjZWwgcHJldmlldyBkZXBsb3ltZW50c1xuICAgICAgICAgICdodHRwOi8vbG9jYWxob3N0OjMwMDAnXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93TWV0aG9kczogWydHRVQnLCAnUE9TVCcsICdQVVQnLCAnREVMRVRFJywgJ09QVElPTlMnXSxcbiAgICAgICAgYWxsb3dIZWFkZXJzOiBbXG4gICAgICAgICAgJ0NvbnRlbnQtVHlwZScsXG4gICAgICAgICAgJ1gtQW16LURhdGUnLFxuICAgICAgICAgICdBdXRob3JpemF0aW9uJyxcbiAgICAgICAgICAnWC1BcGktS2V5JyxcbiAgICAgICAgICAnWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAgICAgICAgICdBY2NlcHQnXG4gICAgICAgIF0sXG4gICAgICAgIGFsbG93Q3JlZGVudGlhbHM6IHRydWUsXG4gICAgICAgIG1heEFnZTogY2RrLkR1cmF0aW9uLmRheXMoMSksXG4gICAgICB9LFxuICAgIH0pO1xuXG4gICAgLy8gQ3JlYXRlIHYxIEFQSSByZXNvdXJjZXNcbiAgICBjb25zdCB2MSA9IGFwaS5yb290LmFkZFJlc291cmNlKCd2MScpO1xuICAgIFxuICAgIC8vIE1lbWJlcnMgZW5kcG9pbnRzXG4gICAgY29uc3QgbWVtYmVycyA9IHYxLmFkZFJlc291cmNlKCdtZW1iZXJzJyk7XG4gICAgY29uc3QgbWVtYmVyQnlJZCA9IG1lbWJlcnMuYWRkUmVzb3VyY2UoJ3tpZH0nKTtcbiAgICBjb25zdCBtZW1iZXJJbnRlcmVzdHMgPSBtZW1iZXJCeUlkLmFkZFJlc291cmNlKCdpbnRlcmVzdHMnKTtcbiAgICBcbiAgICAvLyBCaWxscyBlbmRwb2ludHNcbiAgICBjb25zdCBiaWxscyA9IHYxLmFkZFJlc291cmNlKCdiaWxscycpO1xuICAgIGNvbnN0IGJpbGxCeUlkID0gYmlsbHMuYWRkUmVzb3VyY2UoJ3tpZH0nKTtcbiAgICBcbiAgICAvLyBWb3RlcyBlbmRwb2ludHNcbiAgICBjb25zdCB2b3RlcyA9IHYxLmFkZFJlc291cmNlKCd2b3RlcycpO1xuICAgIGNvbnN0IHZvdGVCeUlkID0gdm90ZXMuYWRkUmVzb3VyY2UoJ3tpZH0nKTtcblxuICAgIC8vIENyZWF0ZSBMYW1iZGEgaW50ZWdyYXRpb25cbiAgICBjb25zdCBsYW1iZGFJbnRlZ3JhdGlvbiA9IG5ldyBhcGlnYXRld2F5LkxhbWJkYUludGVncmF0aW9uKGJhY2tlbmRGdW5jdGlvbiwge1xuICAgICAgcHJveHk6IHRydWUsXG4gICAgICBhbGxvd1Rlc3RJbnZva2U6IHRydWUsXG4gICAgfSk7XG5cbiAgICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gYWRkIG1ldGhvZHMgdG8gYSByZXNvdXJjZVxuICAgIGNvbnN0IGFkZE1ldGhvZHMgPSAocmVzb3VyY2U6IGFwaWdhdGV3YXkuUmVzb3VyY2UsIG1ldGhvZHM6IHN0cmluZ1tdKSA9PiB7XG4gICAgICBtZXRob2RzLmZvckVhY2gobWV0aG9kID0+IHtcbiAgICAgICAgcmVzb3VyY2UuYWRkTWV0aG9kKG1ldGhvZCwgbGFtYmRhSW50ZWdyYXRpb24sIHtcbiAgICAgICAgICBtZXRob2RSZXNwb25zZXM6IFtcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3RhdHVzQ29kZTogJzIwMCcsXG4gICAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWUsXG4gICAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctSGVhZGVycyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6IHRydWUsXG4gICAgICAgICAgICAgICAgJ21ldGhvZC5yZXNwb25zZS5oZWFkZXIuQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICByZXNwb25zZU1vZGVsczoge1xuICAgICAgICAgICAgICAgICdhcHBsaWNhdGlvbi9qc29uJzogYXBpZ2F0ZXdheS5Nb2RlbC5FTVBUWV9NT0RFTCxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgIHN0YXR1c0NvZGU6ICc0MDAnLFxuICAgICAgICAgICAgICByZXNwb25zZVBhcmFtZXRlcnM6IHtcbiAgICAgICAgICAgICAgICAnbWV0aG9kLnJlc3BvbnNlLmhlYWRlci5BY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiB0cnVlLFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgc3RhdHVzQ29kZTogJzUwMCcsXG4gICAgICAgICAgICAgIHJlc3BvbnNlUGFyYW1ldGVyczoge1xuICAgICAgICAgICAgICAgICdtZXRob2QucmVzcG9uc2UuaGVhZGVyLkFjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IHRydWUsXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB9LFxuICAgICAgICAgIF0sXG4gICAgICAgIH0pO1xuICAgICAgfSk7XG4gICAgfTtcblxuICAgIC8vIEFkZCBtZXRob2RzIHRvIHJlc291cmNlc1xuICAgIGFkZE1ldGhvZHMobWVtYmVycywgWydHRVQnLCAnUE9TVCddKTtcbiAgICBhZGRNZXRob2RzKG1lbWJlckJ5SWQsIFsnR0VUJ10pO1xuICAgIGFkZE1ldGhvZHMobWVtYmVySW50ZXJlc3RzLCBbJ0dFVCddKTtcbiAgICBhZGRNZXRob2RzKGJpbGxzLCBbJ0dFVCddKTtcbiAgICBhZGRNZXRob2RzKGJpbGxCeUlkLCBbJ0dFVCddKTtcbiAgICBhZGRNZXRob2RzKHZvdGVzLCBbJ0dFVCddKTtcbiAgICBhZGRNZXRob2RzKHZvdGVCeUlkLCBbJ0dFVCddKTtcblxuICAgIC8vIENyZWF0ZSBsb2cgZ3JvdXAgZm9yIEFQSSBHYXRld2F5XG4gICAgY29uc3QgbG9nR3JvdXAgPSBuZXcgbG9ncy5Mb2dHcm91cCh0aGlzLCAnQXBpR2F0ZXdheUxvZ3MnLCB7XG4gICAgICByZXRlbnRpb246IGxvZ3MuUmV0ZW50aW9uRGF5cy5PTkVfV0VFSyxcbiAgICB9KTtcblxuICAgIC8vIEFkZCBhY2NvdW50IHNldHRpbmdzIGZvciBBUEkgR2F0ZXdheSBsb2dnaW5nXG4gICAgY29uc3QgYXBpR2F0ZXdheUFjY291bnRDb25maWcgPSBuZXcgYXBpZ2F0ZXdheS5DZm5BY2NvdW50KHRoaXMsICdBcGlHYXRld2F5QWNjb3VudCcsIHtcbiAgICAgIGNsb3VkV2F0Y2hSb2xlQXJuOiBhcGlHYXRld2F5TG9nc1JvbGUucm9sZUFybixcbiAgICB9KTtcblxuICAgIC8vIEdyYW50IHBlcm1pc3Npb25zIHRvIHRoZSBBUEkgR2F0ZXdheSByb2xlXG4gICAgbG9nR3JvdXAuZ3JhbnRXcml0ZShhcGlHYXRld2F5TG9nc1JvbGUpO1xuXG4gICAgLy8gRW5zdXJlIHRoZSBBUEkgR2F0ZXdheSBhY2NvdW50IGNvbmZpZyBpcyBjcmVhdGVkIGJlZm9yZSB0aGUgQVBJXG4gICAgYXBpLm5vZGUuYWRkRGVwZW5kZW5jeShhcGlHYXRld2F5QWNjb3VudENvbmZpZyk7XG5cbiAgICAvLyBPdXRwdXQgdmFsdWVzXG4gICAgbmV3IGNkay5DZm5PdXRwdXQodGhpcywgJ0FwaVVybCcsIHsgdmFsdWU6IGFwaS51cmwgfSk7XG4gIH1cbn0iXX0=