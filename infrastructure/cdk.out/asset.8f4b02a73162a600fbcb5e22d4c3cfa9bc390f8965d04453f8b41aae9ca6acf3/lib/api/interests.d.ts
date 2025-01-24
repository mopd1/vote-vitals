import { ParliamentMember, PaginatedResponse } from '../types/parliament';
export declare class InterestsAPI {
    getAllMembersWithInterests(): Promise<PaginatedResponse<ParliamentMember>>;
}
