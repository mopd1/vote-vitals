import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';

const PARLIAMENT_API = 'https://members-api.parliament.uk/api';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const path = event.path;
    const queryParams = event.queryStringParameters || {};
    const { house = 'Commons', page = '1', search } = queryParams;

    console.log('Path:', path);
    console.log('Query Parameters:', queryParams);

    // Handle members endpoint
    if (path === '/v1/members') {
      console.log('Fetching members from Parliament API');
      const skip = (parseInt(page) - 1) * 20;
      const parliamentUrl = `${PARLIAMENT_API}/Members/Search`;
      console.log('Parliament API URL:', parliamentUrl);

      try {
        const params: any = {
          House: house,
          Skip: skip,
          Take: 20,
          IsCurrentMember: true
        };

        // Add search parameter if provided
        if (search) {
          params.Name = search;
        }

        const response = await axios.get(parliamentUrl, {
          params,
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Vote Vitals (https://votevitals.com)'
          }
        });

        console.log('Parliament API Response Status:', response.status);

        // Transform the response to match our frontend expectations
        const transformedData = {
          items: response.data.items.map((member: any) => ({
            id: member.value.id,
            nameDisplayAs: member.value.nameDisplayAs,
            latestParty: {
              id: member.value.latestParty.id,
              name: member.value.latestParty.name
            },
            membershipFrom: member.value.latestHouseMembership.membershipFrom || '',
            house: member.value.latestHouseMembership.house,
            thumbnailUrl: member.value.thumbnailUrl,
            startDate: member.value.latestHouseMembership.membershipStartDate
          })),
          totalResults: response.data.totalResults,
          currentPage: parseInt(page),
          totalPages: Math.ceil(response.data.totalResults / 20)
        };

        console.log('Transformed Response:', JSON.stringify(transformedData, null, 2));

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': event.headers.origin || '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
          },
          body: JSON.stringify(transformedData)
        };
      } catch (apiError: any) {
        console.error('Parliament API Error:', apiError.message);
        if (apiError.response) {
          console.error('API Error Response:', JSON.stringify(apiError.response.data, null, 2));
        }
        throw apiError;
      }
    }

    // Handle member interests
    if (path.match(/\/v1\/members\/\d+\/interests/)) {
      const memberId = event.pathParameters?.id;
      console.log('Fetching interests for member:', memberId);
      
      const response = await axios.get(`${PARLIAMENT_API}/Members/${memberId}/RegisteredInterests`, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Vote Vitals (https://votevitals.com)'
        }
      });

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': event.headers.origin || '*',
          'Access-Control-Allow-Credentials': 'true',
          'Access-Control-Allow-Methods': 'GET, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
        },
        body: JSON.stringify(response.data)
      };
    }

    // Handle unsupported endpoints
    console.log('Endpoint not found:', path);
    return {
      statusCode: 404,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': event.headers.origin || '*',
        'Access-Control-Allow-Credentials': 'true'
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
        'Access-Control-Allow-Credentials': 'true'
      },
      body: JSON.stringify({ 
        message: 'Internal Server Error',
        details: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};