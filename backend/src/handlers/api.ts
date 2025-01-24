import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios from 'axios';

const PARLIAMENT_API = 'https://members-api.parliament.uk/api';
const POSTCODES_API = 'https://api.postcodes.io/postcodes';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    const path = event.path;
    const queryParams = event.queryStringParameters || {};

    // Handle postcode lookup
    if (path.startsWith('/v1/members/postcode/')) {
      const postcode = decodeURIComponent(path.split('/').pop() || '').toUpperCase().replace(/\s+/g, '');
      console.log('Looking up postcode:', postcode);

      try {
        // 1. Get constituency from postcodes.io
        const postcodeUrl = `${POSTCODES_API}/${postcode}`;
        console.log('Postcode lookup URL:', postcodeUrl);
        
        const postcodeResponse = await axios.get(postcodeUrl);
        console.log('Postcode Response:', JSON.stringify(postcodeResponse.data, null, 2));

        if (!postcodeResponse.data.result?.parliamentary_constituency) {
          throw new Error('No constituency found for postcode');
        }

        const constituencyName = postcodeResponse.data.result.parliamentary_constituency;
        
        // 2. Get MP for the constituency
        console.log('Looking up MP for constituency:', constituencyName);
        const mpResponse = await axios.get(`${PARLIAMENT_API}/Members/Search`, {
          params: {
            Name: '', // Empty name to get all MPs
            IsCurrentMember: true,
            House: 'Commons',
          },
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'Vote Vitals (https://votevitals.com)'
          }
        });

        // Find MP for this constituency
        const mp = mpResponse.data.items.find((item: any) => 
          item.value.latestHouseMembership.membershipFrom.toLowerCase() === constituencyName.toLowerCase()
        )?.value;

        if (!mp) {
          throw new Error('No current MP found for this constituency');
        }

        // 3. Get neighboring constituencies from postcode data
        const { lsoa, european_electoral_region } = postcodeResponse.data.result;
        console.log('Looking up nearby postcodes in same LSOA:', lsoa);
        
        const nearbyResponse = await axios.get(`${POSTCODES_API}`, {
          params: {
            q: postcode.substring(0, 3), // Use first part of postcode for rough area match
            limit: 10
          }
        });

        const nearbyConstituencies = Array.from(new Set(
          nearbyResponse.data.result
            .map((p: any) => p.parliamentary_constituency)
            .filter((c: string) => c && c !== constituencyName)
        )).slice(0, 5); // Limit to 5 neighboring constituencies

        // 4. Get MPs for neighboring constituencies
        const neighborMPs = await Promise.all(
          nearbyConstituencies.map(async (constituency: string) => {
            const neighborMp = mpResponse.data.items.find((item: any) => 
              item.value.latestHouseMembership.membershipFrom.toLowerCase() === constituency.toLowerCase()
            )?.value;

            return {
              constituency: {
                name: constituency
              },
              mp: neighborMp ? {
                id: neighborMp.id,
                nameDisplayAs: neighborMp.nameDisplayAs,
                latestParty: neighborMp.latestParty,
                membershipFrom: neighborMp.latestHouseMembership.membershipFrom,
                house: neighborMp.latestHouseMembership.house,
                thumbnailUrl: neighborMp.thumbnailUrl,
                startDate: neighborMp.latestHouseMembership.membershipStartDate
              } : null
            };
          })
        );

        return {
          statusCode: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': event.headers.origin || '*',
            'Access-Control-Allow-Credentials': 'true',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
          },
          body: JSON.stringify({
            constituency: {
              name: constituencyName,
              region: european_electoral_region
            },
            mp: mp ? {
              id: mp.id,
              nameDisplayAs: mp.nameDisplayAs,
              latestParty: mp.latestParty,
              membershipFrom: mp.latestHouseMembership.membershipFrom,
              house: mp.latestHouseMembership.house,
              thumbnailUrl: mp.thumbnailUrl,
              startDate: mp.latestHouseMembership.membershipStartDate
            } : null,
            neighbors: neighborMPs
          })
        };
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        if (apiError.response) {
          console.error('API Error Response:', JSON.stringify(apiError.response.data, null, 2));
        }
        return {
          statusCode: 404,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': event.headers.origin || '*',
            'Access-Control-Allow-Credentials': 'true'
          },
          body: JSON.stringify({ 
            message: 'Invalid postcode or no constituency found',
            details: apiError.message
          })
        };
      }
    }

    // Handle members endpoint
    if (path === '/v1/members') {
      console.log('Fetching members from Parliament API');
      const { house = 'Commons', page = '1', search } = queryParams;
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
        console.error('Parliament API Error:', apiError);
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