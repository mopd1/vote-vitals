import axios, { AxiosError } from 'axios';

const PARLIAMENT_MEMBERS_API = 'https://members-api.parliament.uk/api';
const PARLIAMENT_INTERESTS_API = 'https://interests-api.parliament.uk/api/v1';
const PARLIAMENT_BILLS_API = 'https://bills-api.parliament.uk/api/v1';

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

async function fetchAllMembersWithInterests() {
  try {
    // 1. Fetch all current Commons members
    const membersResponse = await axios.get(`${PARLIAMENT_MEMBERS_API}/Members/Search`, {
      params: {
        House: 1,
        IsCurrentMember: true,
        take: 650
      }
    });

    const members = membersResponse.data.items.map((item: any) => item.value);

    // 2. Fetch interests for each member in parallel
    const membersWithInterests = await Promise.all(
      members.map(async (member: any) => {
        try {
          const interestsResponse = await axios.get(`${PARLIAMENT_INTERESTS_API}/Interests`, {
            params: {
              MemberId: member.id,
              take: 1000
            }
          });

          const interests = interestsResponse.data.items || [];

          // Calculate total value from interests
          const totalValue = interests.reduce((sum: number, interest: any) => {
            const valueField = interest.registeredInterestValue || '0';
            const amount = parseFloat(valueField.replace(/[^0-9.-]+/g, ''));
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

    return membersWithInterests.sort((a, b) => b.totalValue - a.totalValue);
  } catch (error) {
    console.error('Error in fetchAllMembersWithInterests:', error);
    throw error;
  }
}

export const handler = async (event: APIGatewayEvent) => {
  // Handle OPTIONS requests for CORS
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
      const membersWithInterests = await fetchAllMembersWithInterests();
      return {
        statusCode: 200,
        headers: CORS_HEADERS,
        body: JSON.stringify(membersWithInterests)
      };
    }
    else if (path.startsWith('/api/members')) {
      response = await axios.get(`${PARLIAMENT_MEMBERS_API}/Members/Search`, {
        params: {
          House: queryParams.house || 1,
          IsCurrentMember: true,
          take: queryParams.take || 650
        }
      });
    }
    else if (path.startsWith('/api/interests')) {
      response = await axios.get(`${PARLIAMENT_INTERESTS_API}/Interests`, {
        params: {
          MemberId: queryParams.memberId,
          take: queryParams.take || 1000
        }
      });
    }
    else if (path.startsWith('/api/bills') && !path.includes('bills/')) {
      response = await axios.get(`${PARLIAMENT_BILLS_API}/Bills`, {
        params: {
          take: queryParams.take || 20,
          skip: queryParams.skip || 0,
          lastUpdatedFrom: queryParams.lastUpdatedFrom
        }
      });
    }
    else if (path.startsWith('/api/bills/')) {
      const billId = path.split('/').pop();
      response = await axios.get(`${PARLIAMENT_BILLS_API}/Bills/${billId}`);
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

  } catch (err) {
    console.error('Error:', err);
    
    const error = err as AxiosError;
    
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