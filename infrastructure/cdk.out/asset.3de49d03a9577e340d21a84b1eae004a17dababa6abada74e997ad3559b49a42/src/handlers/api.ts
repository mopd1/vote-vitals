import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';

const PARLIAMENT_API = 'https://members-api.parliament.uk/api/v1';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    // Parse the path and query parameters
    const path = event.resource;
    const queryParams = event.queryStringParameters || {};
    const { house = 'Commons', page = '1' } = queryParams;

    // Handle different endpoints
    if (path === '/v1/members') {
      const skip = (parseInt(page) - 1) * 20;
      const response = await axios.get(`${PARLIAMENT_API}/Members`, {
        params: {
          house,
          skip,
          take: 20
        }
      });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': event.headers.origin || '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(response.data)
      };
    }

    // Handle member interests
    if (path === '/v1/members/{id}/interests') {
      const memberId = event.pathParameters?.id;
      const response = await axios.get(`${PARLIAMENT_API}/Members/${memberId}/RegisteredInterests`);

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': event.headers.origin || '*',
          'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(response.data)
      };
    }

    // Handle unsupported endpoints
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Not Found' })
    };
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Credentials': true
      },
      body: JSON.stringify({ message: 'Internal Server Error' })
    };
  }
};