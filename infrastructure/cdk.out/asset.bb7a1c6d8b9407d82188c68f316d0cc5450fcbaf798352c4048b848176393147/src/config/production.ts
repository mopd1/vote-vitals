export const config = {
  port: process.env.PORT || 3001,
  aws: {
    region: process.env.AWS_REGION || 'eu-west-2',
    dynamodb: {
      billsTable: process.env.DYNAMODB_BILLS_TABLE || 'ukpol-dev-bills-table',
      membersTable: process.env.DYNAMODB_MEMBERS_TABLE || 'ukpol-dev-members-table'
    },
    s3: {
      cacheBucket: process.env.S3_CACHE_BUCKET || 'ukpol-dev-cache-bucket-528757790199'
    }
  },
  api: {
    parliamentBills: 'https://bills-api.parliament.uk/api/v1',
    parliamentMembers: 'https://members-api.parliament.uk/api/v1'
  },
  cors: {
    origin: [
      'http://localhost:3000',
      'https://www.votevitals.com',
      'https://votevitals.com'
    ],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }
}