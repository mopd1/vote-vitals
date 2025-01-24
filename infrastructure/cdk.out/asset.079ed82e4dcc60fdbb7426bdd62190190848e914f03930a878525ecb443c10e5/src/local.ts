import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocument } from "@aws-sdk/lib-dynamodb";
import { S3Client, ListObjectsV2Command } from "@aws-sdk/client-s3";

const dynamoClient = new DynamoDBClient({
  region: "local",
  endpoint: "http://localhost:8000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
});

const dynamoDB = DynamoDBDocument.from(dynamoClient);

const s3Client = new S3Client({
  region: "local",
  endpoint: "http://localhost:9000",
  credentials: {
    accessKeyId: "local",
    secretAccessKey: "local",
  },
  forcePathStyle: true,
});

async function localTest() {
  try {
    // Test DynamoDB connection
    await dynamoDB.scan({
      TableName: process.env.DYNAMODB_BILLS_TABLE || "uk-politics-bills-local",
    });
    console.log("Successfully connected to local DynamoDB");

    // Test S3 connection
    await s3Client.send(new ListObjectsV2Command({
      Bucket: process.env.S3_CACHE_BUCKET || "uk-politics-cache-local"
    }));
    console.log("Successfully connected to local S3");
  } catch (err) {
    console.error("Error connecting to local services:", err);
    throw err;
  }
}

// Set local environment variables
process.env.REGION = 'eu-west-2';
process.env.DYNAMODB_BILLS_TABLE = 'uk-politics-bills-local';
process.env.DYNAMODB_MEMBERS_TABLE = 'uk-politics-members-local';
process.env.S3_CACHE_BUCKET = 'uk-politics-cache-local';
process.env.LOG_LEVEL = 'debug';

localTest().catch(console.error);