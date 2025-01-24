import { DynamoDB } from 'aws-sdk';

const dynamoDB = new DynamoDB.DocumentClient({
  region: process.env.REGION || 'eu-west-2'
});

// Initial mock data
const mockMembersData = [
  {
    id: '1',
    name: 'John Smith',
    party: 'Conservative',
    house: 'Commons',
    earnings: [
      {
        amount: 50000,
        registeredDate: '2024-01-15',
        description: 'Consulting work'
      }
    ],
    donations: [
      {
        amount: 25000,
        registeredDate: '2024-01-20',
        donor: 'Company A Ltd'
      }
    ]
  },
  {
    id: '2',
    name: 'Sarah Wilson',
    party: 'Labour',
    house: 'Commons',
    earnings: [
      {
        amount: 30000,
        registeredDate: '2024-01-10',
        description: 'Speaking engagement'
      }
    ],
    donations: [
      {
        amount: 15000,
        registeredDate: '2024-01-25',
        donor: 'Union B'
      }
    ]
  },
  {
    id: '3',
    name: 'David Brown',
    party: 'Liberal Democrats',
    house: 'Commons',
    earnings: [
      {
        amount: 40000,
        registeredDate: '2024-01-05',
        description: 'Advisory role'
      }
    ],
    donations: [
      {
        amount: 20000,
        registeredDate: '2024-02-01',
        donor: 'Foundation C'
      }
    ]
  }
];

async function ingestMembers() {
  const tableName = 'ukpol-dev-1737659189083-members';  // Use the new table name from deployment output

  for (const member of mockMembersData) {
    const params = {
      TableName: tableName,
      Item: {
        PK: `MEMBER#${member.id}`,
        SK: `DETAILS`,
        GSI1PK: `PARTY#${member.party}`,
        GSI1SK: member.name,
        ...member,
        ttl: Math.floor(Date.now() / 1000) + (7 * 24 * 60 * 60) // 7 days TTL
      }
    };

    try {
      await dynamoDB.put(params).promise();
      console.log(`Ingested member: ${member.name}`);
    } catch (error) {
      console.error(`Failed to ingest member ${member.name}:`, error);
    }
  }
}

ingestMembers()
  .then(() => console.log('Data ingestion complete'))
  .catch(console.error);