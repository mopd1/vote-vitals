import { Bill, PaginatedResponse } from '../types/parliament';
export declare class BillsService {
    getBills(params: {
        page?: number;
        limit?: number;
        sessionId?: number;
    }): Promise<PaginatedResponse<Bill>>;
    private getFromCache;
    private setCache;
    private getFromDynamo;
    private storeBills;
    private fetchFromAPI;
    private mapBillToDynamoDB;
}
export declare const billsService: BillsService;
