import { AxiosResponse } from 'axios';
export declare function fetchWithRateLimit<T>(url: string, options?: {
    params?: Record<string, string | number | boolean>;
    headers?: Record<string, string>;
}): Promise<T>;
export declare function handleApiResponse<T>(response: AxiosResponse): Promise<T>;
