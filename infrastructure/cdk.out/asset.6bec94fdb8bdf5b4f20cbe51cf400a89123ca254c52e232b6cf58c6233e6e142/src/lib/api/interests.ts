import axios from 'axios';
import { ParliamentMember, ParliamentInterest, PaginatedResponse, InterestAmount, HouseType } from '../types/parliament';

const INTERESTS_API = 'https://interests-api.parliament.uk/api/v1';

export class InterestsAPI {
  async getAllMembersWithInterests(): Promise<PaginatedResponse<ParliamentMember>> {
    try {
      const response = await axios.get<PaginatedResponse<ParliamentInterest>>(`${INTERESTS_API}/Interests`, {
        params: {
          PublishedFrom: '2024-01-01',
          Take: 100
        }
      });

      // Group by member and process interests
      const memberMap = new Map<string, ParliamentMember>();

      response.data.items.forEach(interest => {
        const memberId = interest.member.memberId;
        
        // Initialize member if not exists
        if (!memberMap.has(memberId)) {
          memberMap.set(memberId, {
            id: memberId,
            name: interest.member.nameDisplayAs,
            party: interest.member.party,
            house: interest.member.house as HouseType,
            earnings: [],
            donations: []
          });
        }

        const member = memberMap.get(memberId)!;
        const amount: InterestAmount = {
          amount: interest.value || 0,
          registeredDate: interest.registrationDate,
          description: interest.summary
        };

        // Categorize the interest
        if (interest.category.name.toLowerCase().includes('employment')) {
          member.earnings.push(amount);
        } else if (interest.category.name.toLowerCase().includes('donation')) {
          member.donations.push({
            ...amount,
            donor: interest.summary
          });
        }
      });

      const members = Array.from(memberMap.values());
      
      return {
        items: members,
        totalItems: members.length
      };

    } catch (error) {
      console.error('Error fetching interests:', error);
      throw error;
    }
  }
}