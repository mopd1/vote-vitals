import { DynamoDB } from 'aws-sdk';
interface QueryParams {
    party?: string;
    house?: 'commons' | 'lords';
    page?: number;
    limit?: number;
}
export declare const membersService: {
    getMembers({ party, house, page, limit }?: QueryParams): Promise<{
        items: DynamoDB.DocumentClient.ItemList;
        totalItems: number;
        hasMore: boolean;
    }>;
    getMemberById(id: string): Promise<DynamoDB.DocumentClient.AttributeMap | undefined>;
};
export {};
