import { DynamoDB } from 'aws-sdk';
import { ParliamentMember, PaginatedResponse } from '../types/parliament';
import axios from 'axios';

const dynamoDB = new DynamoDB.DocumentClient();
const MEMBERS_TABLE = process.env.DYNAMODB_MEMBERS_TABLE || '';
const PARLIAMENT_API_BASE = 'https://members-api.parliament.uk/api';

interface QueryParams {
  party?: string;
  house?: 'Commons' | 'Lords';
  page?: number;
  limit?: number;
}

interface MembersResponse {
  items: ParliamentMember[];
  totalItems: number;
  hasMore: boolean;
}

interface MemberInterest {
  category: string;
  description: string;
  registeredLate: boolean;
  dateCreated: string;
  valueAmount?: number;
  valueDescription?: string;
}

interface MemberEarnings {
  memberId: string;
  name: string;
  party: string;
  constituency?: string;
  totalEarnings: number;
  interests: MemberInterest[];
}

export const membersService = {
  async getMembers(params: QueryParams = {}): Promise<MembersResponse> {
    try {
      let filterExpression = '';
      const expressionValues: Record<string, any> = {};

      if (params.party) {
        filterExpression += 'party = :party';
        expressionValues[':party'] = params.party;
      }

      if (params.house) {
        if (filterExpression) filterExpression += ' AND ';
        filterExpression += 'house = :house';
        expressionValues[':house'] = params.house;
      }

      const dbParams: DynamoDB.DocumentClient.ScanInput = {
        TableName: MEMBERS_TABLE,
        Limit: params.limit || 20,
        ...(filterExpression && {
          FilterExpression: filterExpression,
          ExpressionAttributeValues: expressionValues
        })
      };

      const result = await dynamoDB.scan(dbParams).promise();

      return {
        items: (result.Items || []) as ParliamentMember[],
        totalItems: result.Count || 0,
        hasMore: !!result.LastEvaluatedKey
      };
    } catch (error) {
      console.error('Error fetching members:', error);
      throw error;
    }
  },

  async getMemberById(id: string): Promise<ParliamentMember | null> {
    try {
      const result = await dynamoDB.get({
        TableName: MEMBERS_TABLE,
        Key: {
          PK: `MEMBER#${id}`,
          SK: 'DETAILS'
        }
      }).promise();

      return result.Item as ParliamentMember || null;
    } catch (error) {
      console.error('Error fetching member:', error);
      throw error;
    }
  },

  async getMemberEarnings(): Promise<MemberEarnings[]> {
    try {
      // Fetch all Commons members with interests
      const response = await axios.get(`${PARLIAMENT_API_BASE}/Members/Search?House=Commons&IsCurrentMember=true`);
      const members = response.data.items || [];
      
      const memberEarnings: MemberEarnings[] = [];

      // Process each member's interests
      for (const member of members) {
        const interestsResponse = await axios.get(
          `${PARLIAMENT_API_BASE}/Members/${member.value.id}/RegisteredInterests`
        );

        const interests = interestsResponse.data.items || [];
        let totalEarnings = 0;

        // Calculate total earnings from interests
        interests.forEach((interest: any) => {
          if (interest.category === 1) { // Employment and earnings
            const amount = parseFloat(interest.valueAmount?.replace(/[^0-9.-]+/g, '') || '0');
            totalEarnings += amount;
          }
        });

        if (totalEarnings > 0) {
          memberEarnings.push({
            memberId: member.value.id,
            name: `${member.value.nameDisplayAs}`,
            party: member.value.latestParty?.name || 'Independent',
            constituency: member.value.latestHouseMembership?.membershipFrom,
            totalEarnings,
            interests: interests.map((interest: any) => ({
              category: interest.category,
              description: interest.description,
              registeredLate: interest.registeredLate,
              dateCreated: interest.dateCreated,
              valueAmount: parseFloat(interest.valueAmount?.replace(/[^0-9.-]+/g, '') || '0'),
              valueDescription: interest.valueDescription
            }))
          });
        }
      }

      // Sort by total earnings descending
      return memberEarnings.sort((a, b) => b.totalEarnings - a.totalEarnings);
    } catch (error) {
      console.error('Error fetching member earnings:', error);
      throw error;
    }
  }
};