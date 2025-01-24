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
  currentPage?: number;
  totalPages?: number;
}

export interface Constituency {
  id: number;
  name: string;
  gssCode: string;
}

export interface NeighborInfo {
  constituency: Constituency;
  mp: Member | null;
}

export interface PostcodeLookupResponse {
  constituency: Constituency;
  mp: Member | null;
  neighbors: NeighborInfo[];
}