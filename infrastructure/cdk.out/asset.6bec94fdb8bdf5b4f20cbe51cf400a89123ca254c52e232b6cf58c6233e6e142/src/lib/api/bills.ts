import axios from 'axios';
import { Bill, PaginatedResponse } from '../types/parliament';

const PARLIAMENT_API = 'https://bills-api.parliament.uk/api/v1';

interface BillsApiResponse {
  items: Array<{
    billId: number;
    shortTitle: string;
    currentHouse: string;
    lastUpdate: string;
    currentStage?: {
      description: string;
      house: string;
    };
  }>;
  totalResults: number;
}

export class BillsService {
  async getBills({ page = 1, limit = 20 } = {}): Promise<PaginatedResponse<Bill>> {
    try {
      const response = await axios.get<BillsApiResponse>(`${PARLIAMENT_API}/Bills`, {
        params: {
          Take: limit,
          Skip: (page - 1) * limit
        }
      });

      return {
        items: response.data.items.map(item => ({
          billId: item.billId,
          shortTitle: item.shortTitle,
          currentHouse: item.currentHouse,
          lastUpdate: item.lastUpdate,
          currentStage: item.currentStage
        })),
        totalItems: response.data.totalResults,
        pageNumber: page,
        pageSize: limit,
        totalPages: Math.ceil(response.data.totalResults / limit)
      };
    } catch (error) {
      console.error('Error fetching bills:', error);
      throw error;
    }
  }
}

export const billsService = new BillsService();