export interface Member {
  id: number;
  nameDisplayAs: string;
  latestParty: {
    id: number;
    name: string;
  };
  membershipFrom: string; // Constituency
  house: string;
  thumbnailUrl: string;
  startDate: string;
  value?: number; // Financial interests value
}

export interface MembersResponse {
  items: Member[];
  totalResults: number;
}