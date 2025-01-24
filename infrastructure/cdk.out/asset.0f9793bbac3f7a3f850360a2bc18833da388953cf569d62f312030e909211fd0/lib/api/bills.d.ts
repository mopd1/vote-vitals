import { Bill, PaginatedResponse } from '../types/parliament';
export declare class BillsService {
    getBills({ page, limit }?: {
        page?: number | undefined;
        limit?: number | undefined;
    }): Promise<PaginatedResponse<Bill>>;
}
export declare const billsService: BillsService;
