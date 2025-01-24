import axios from 'axios';

const MEMBERS_API = 'https://members-api.parliament.uk/api';
const INTERESTS_API = 'https://interests-api.parliament.uk/api/v1';
const BILLS_API = 'https://bills-api.parliament.uk/api/v1';

interface APIGatewayEvent {
  path: string;
  httpMethod: string;
  queryStringParameters?: Record<string, string>;
}

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': 'https://votevitals.com',
  'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Credentials': 'true',
};

async function calculateMemberEarnings() {
  try {
    // 1. Get all current Commons members
    const membersResponse = await axios.get(`${MEMBERS_API}/Members/Search`, {
      params: {
        House: 1, // Commons
        IsCurrentMember: true,
        take: 650
      }
    });

    const members = membersResponse.data.items.map((item: any) => item.value);

    // 2. Get registered interests for each member
    const membersWithInterests = await Promise.all(
      members.map(async (member: any) => {
        try {
          const interestsResponse = await axios.get(`${INTERESTS_API}/Interests`, {
            params: {
              MemberId: member.id,
              take: 1000
            }
          });

          const interests = interestsResponse.data.items || [];
          
          // Calculate total value from registered interests
          const totalValue = interests.reduce((sum: number, interest: any) => {
            const fields = interest.fields || [];
            const valueField = fields.find((f: any) => 
              f.name.toLowerCase().includes('value') ||
              f.name.toLowerCase().includes('amount')
            );
            
            if (!valueField?.value) return sum;
            const amount = parseFloat(valueField.value.replace(/[^0-9.-]+/g, '') || '0');
            return sum + (isNaN(amount) ? 0 : amount);
          }, 0);

          return {
            ...member,
            interests,
            totalValue
          };
        } catch (error) {
          console.error(`Error fetching interests for member ${member.id}:`, error);
          return {
            ...member,
            interests: [],
            totalValue: 0
          };
        }
      })
    );

    // Sort by total value
    return membersWithInterests.sort((a, b) => b.totalValue - a.totalValue);
  } catch (error) {
    console.error('Error in calculateMemberEarnings:', error);
    throw error;
  }
}

export const handler = async (event: APIGatewayEvent) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: '',
    };
  }

  const path = event.path;
  const queryParams = event.queryStringParameters || {};

  try {
    let response;

    if (path.startsWith('/api/members/earnings')) {
      const data = await calculateMemberEarnings();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(data)
      };
    }
    else if (path.startsWith('/api/members')) {
      response = await axios.get(`${MEMBERS_API}/Members/Search`, {
        params: {
          House: queryParams.house || 1,
          IsCurrentMember: true,
          take: queryParams.take || 20,
          skip: queryParams.skip || 0
        }
      });
    }
    else if (path.startsWith('/api/interests')) {
      response = await axios.get(`${INTERESTS_API}/Interests`, {
        params: {
          MemberId: queryParams.memberId,
          take: queryParams.take || 20
        }
      });
    }
    else if (path.startsWith('/api/bills') && path.includes('/bills/')) {
      const billId = path.split('/').pop();
      response = await axios.get(`${BILLS_API}/Bills/${billId}`);
    }
    else if (path.startsWith('/api/bills')) {
      response = await axios.get(`${BILLS_API}/Bills`, {
        params: {
          take: queryParams.take || 20,
          skip: queryParams.skip || 0,
          lastUpdatedFrom: queryParams.lastUpdatedFrom || '2024-01-01'
        }
      });
    }
    else {
      return {
        statusCode: 404,
        headers: CORS_HEADERS,
        body: JSON.stringify({ error: 'Not Found' })
      };
    }

    return {
      statusCode: 200,
      headers: CORS_HEADERS,
      body: JSON.stringify(response.data)
    };

  } catch (error: any) {
    console.error('Error:', error);
    
    return {
      statusCode: error.response?.status || 500,
      headers: CORS_HEADERS,
      body: JSON.stringify({
        error: error.response?.data || 'Internal Server Error',
        message: error.message
      })
    };
  }
};