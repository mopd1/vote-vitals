import { ParliamentMember } from '../types/parliament';
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
export declare const membersService: {
    getMembers(params?: QueryParams): Promise<MembersResponse>;
    getMemberById(id: string): Promise<ParliamentMember | null>;
    getMemberEarnings(): Promise<MemberEarnings[]>;
};
export {};
