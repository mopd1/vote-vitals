export interface Bill {
    billId: number;
    title: string;
    currentHouse: string;
    originatingHouse: string;
    lastUpdate: string;
    sessionId: number;
    billTypeId: number;
    isDefeated: boolean;
    billWithdrawn: boolean;
}
export interface DynamoDBBill extends Bill {
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
