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
export declare const membersService: {
    getMembers(params?: QueryParams): Promise<MembersResponse>;
    getMemberById(id: string): Promise<ParliamentMember | null>;
};
export {};
