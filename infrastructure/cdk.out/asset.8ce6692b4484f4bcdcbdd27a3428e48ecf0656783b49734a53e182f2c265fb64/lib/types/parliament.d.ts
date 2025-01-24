export interface ParliamentMember {
    id: string;
    name: string;
    party: string;
    constituency?: string;
    house: 'Commons' | 'Lords';
    earnings?: Array<{
        amount: number;
        registeredDate: string;
        description: string;
    }>;
    donations?: Array<{
        amount: number;
        registeredDate: string;
        donor: string;
    }>;
}
export interface Bill {
    billId: number;
    title: string;
    currentHouse: string;
    originatingHouse: string;
    lastUpdate: string;
    sessionId: number;
    billTypeId: number;
    isDefeated: boolean;
    billWithdrawn: boolean | null;
}
export interface DynamoDBBill extends Bill {
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    ttl: number;
}
export interface DynamoDBMember extends ParliamentMember {
    PK: string;
    SK: string;
    GSI1PK: string;
    GSI1SK: string;
    ttl: number;
}
export interface PaginatedResponse<T> {
    items: T[];
    totalItems: number;
    pageNumber: number;
    pageSize: number;
    totalPages: number;
}
