export interface MemberInterest {
  id: number;
  category: {
    id: number;
    name: string;
    type: 'Commons';
  };
  summary: string;
  registrationDate: string;
  publishedDate: string;
  fields: {
    name: string;
    description: string;
    type: string;
    value: string | null;
  }[];
}

export interface Member {
  id: number;
  nameListAs: string;
  nameDisplayAs: string;
  nameFullTitle: string;
  nameAddressAs: string;
  latestParty: {
    id: number;
    name: string;
    abbreviation: string;
    backgroundColour: string;
    foregroundColour: string;
  };
  gender: string;
  latestHouseMembership: {
    house: 1 | 2;
    membershipFrom: string;
    membershipStartDate: string;
  };
  thumbnailUrl: string;
}

export interface MemberWithInterests extends Member {
  interests: MemberInterest[];
  totalValue: number;
}

export interface Bill {
  id: number;
  title: string;
  lastUpdate: string;
  billTypeId: number;
  sessionId: number;
  isAct: boolean;
  currentHouse: 1 | 2;
  isDefeated: boolean;
  publications: {
    id: number;
    title: string;
    publishedDate: string;
    type: string;
    url: string;
  }[];
  stages: {
    id: number;
    title: string;
    stageName: string;
    house: 1 | 2;
    isCompleted: boolean;
    completedDate?: string;
  }[];
}

export interface APIGatewayEvent {
  path: string;
  httpMethod: string;
  queryStringParameters?: Record<string, string>;
  headers: Record<string, string>;
}