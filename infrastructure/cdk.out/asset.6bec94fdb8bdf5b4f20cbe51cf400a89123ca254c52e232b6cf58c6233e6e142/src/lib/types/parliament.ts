// Interface for Parliament API responses
export interface ParliamentInterest {
  id: number;
  value?: number;
  member: {
    memberId: string;
    nameDisplayAs: string;
    party: string;
    house: string;
  };
  category: {
    id: number;
    name: string;
  };
  registrationDate: string;
  summary: string;
}

export interface InterestAmount {
  amount: number;
  registeredDate: string;
  description?: string;
  donor?: string;
}

export type HouseType = "Commons" | "Lords";

export interface ParliamentMember {
  id: string;
  name: string;
  party: string;
  house: HouseType;
  earnings: InterestAmount[];
  donations: InterestAmount[];
}

export interface Bill {
  billId: number;
  shortTitle: string;
  currentHouse: string;
  lastUpdate: string;
  currentStage?: {
    description: string;
    house: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  totalItems: number;
  pageNumber?: number;
  pageSize?: number;
  totalPages?: number;
}

export interface QueryParams {
  page?: number;
  limit?: number;
  party?: string;
  house?: HouseType;
}