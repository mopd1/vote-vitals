import axios, { AxiosError } from 'axios';

const PARLIAMENT_MEMBERS_API = 'https://members-api.parliament.uk/api';
const PARLIAMENT_INTERESTS_API = 'https://interests-api.parliament.uk/api/v1';
const PARLIAMENT_BILLS_API = 'https://bills-api.parliament.uk/api/v1';

interface APIGatewayEvent {
  path: string;
  httpMethod: string;
  queryStringParameters?: Record<string, string>;
}

export const handler = async (event: APIGatewayEvent) => {
  const path = event.path;
  const method = event.httpMethod;
  const queryParams = event.queryStringParameters || {};

  // Set CORS headers
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    let response;

    if (path.startsWith('/api/members')) {
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
        headers,
        body: JSON.stringify({ error: 'Not Found' })
      };
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(response.data)
    };

  } catch (err) {
    console.error('Error:', err);
    
    // Type check for Axios error
    const error = err as AxiosError;
    
    return {
      statusCode: error.response?.status || 500,
      headers,
      body: JSON.stringify({
        error: error.response?.data || 'Internal Server Error',
        message: error.message
      })
    };
  }
};