import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { billsService } from './lib/api/bills';
import { membersService } from './lib/api/members';
import { InterestsAPI } from './lib/api/interests';
import { ParliamentMember, HouseType } from './lib/types/parliament';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};

interface EarningsData {
  id: string;
  name: string;
  party: string;
  house: HouseType;
  totalValue: number;
}

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (event.httpMethod === 'OPTIONS') {
      return { statusCode: 200, headers: corsHeaders, body: '' };
    }

    const path = event.path.toLowerCase();
    const params = event.queryStringParameters || {};

    // General members endpoint
    if (path.match(/\/api\/parliament\/members$/)) {
      const members = await membersService.getMembers({
        party: params.party,
        house: params.house as HouseType,
        page: params.page ? parseInt(params.page) : undefined,
        limit: params.limit ? parseInt(params.limit) : undefined
      });

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(members)
      };
    }

    // Members earnings endpoint
    if (path.includes('/api/parliament/members/earnings')) {
      const interestsApi = new InterestsAPI();
      const members = await interestsApi.getAllMembersWithInterests();
      
      const earningsData: EarningsData[] = members.items.map(member => ({
        id: member.id,
        name: member.name,
        party: member.party,
        house: member.house,
        totalValue: member.earnings.reduce((sum, e) => sum + e.amount, 0)
      }));

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(earningsData)
      };
    }

    // Bills endpoint
    if (path.includes('/api/parliament/bills')) {
      const bills = await billsService.getBills({
        page: params.page ? parseInt(params.page) : undefined,
        limit: params.limit ? parseInt(params.limit) : undefined
      });

      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify(bills)
      };
    }

    return {
      statusCode: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Not found', path })
    };

  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
}