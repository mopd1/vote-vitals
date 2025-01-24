"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fetchWithRateLimit = fetchWithRateLimit;
exports.handleApiResponse = handleApiResponse;
const axios_1 = __importDefault(require("axios"));
const logger_1 = require("../utils/logger");
// Rate limiting configuration
const RATE_LIMIT = 1000; // 1 request per second
let lastRequest = 0;
async function fetchWithRateLimit(url, options = {}) {
    const now = Date.now();
    const timeToWait = Math.max(0, RATE_LIMIT - (now - lastRequest));
    if (timeToWait > 0) {
        logger_1.logger.debug(`Rate limiting: waiting ${timeToWait}ms before next request`);
        await new Promise(resolve => setTimeout(resolve, timeToWait));
    }
    lastRequest = Date.now();
    try {
        logger_1.logger.debug('Making API request', { url, options });
        const response = await axios_1.default.get(url, {
            params: options.params,
            headers: {
                'Accept': 'application/json',
                ...options.headers
            }
        });
        return handleApiResponse(response);
    }
    catch (error) {
        logger_1.logger.error('API request failed', { error, url, options });
        throw error;
    }
}
async function handleApiResponse(response) {
    if (response.status !== 200) {
        logger_1.logger.error('API request failed', {
            status: response.status,
            statusText: response.statusText,
            url: response.config.url
        });
        throw new Error(`API request failed: ${response.statusText}`);
    }
    return response.data;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXRpbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2FwaS91dGlscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQU9BLGdEQWdDQztBQUVELDhDQVdDO0FBcERELGtEQUE2QztBQUM3Qyw0Q0FBeUM7QUFFekMsOEJBQThCO0FBQzlCLE1BQU0sVUFBVSxHQUFHLElBQUksQ0FBQyxDQUFDLHVCQUF1QjtBQUNoRCxJQUFJLFdBQVcsR0FBRyxDQUFDLENBQUM7QUFFYixLQUFLLFVBQVUsa0JBQWtCLENBQ3RDLEdBQVcsRUFDWCxVQUdJLEVBQUU7SUFFTixNQUFNLEdBQUcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDdkIsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsVUFBVSxHQUFHLENBQUMsR0FBRyxHQUFHLFdBQVcsQ0FBQyxDQUFDLENBQUM7SUFFakUsSUFBSSxVQUFVLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbkIsZUFBTSxDQUFDLEtBQUssQ0FBQywwQkFBMEIsVUFBVSx3QkFBd0IsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sSUFBSSxPQUFPLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxVQUFVLENBQUMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELFdBQVcsR0FBRyxJQUFJLENBQUMsR0FBRyxFQUFFLENBQUM7SUFFekIsSUFBSSxDQUFDO1FBQ0gsZUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsQ0FBQyxDQUFDO1FBQ3JELE1BQU0sUUFBUSxHQUFHLE1BQU0sZUFBSyxDQUFDLEdBQUcsQ0FBQyxHQUFHLEVBQUU7WUFDcEMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxNQUFNO1lBQ3RCLE9BQU8sRUFBRTtnQkFDUCxRQUFRLEVBQUUsa0JBQWtCO2dCQUM1QixHQUFHLE9BQU8sQ0FBQyxPQUFPO2FBQ25CO1NBQ0YsQ0FBQyxDQUFDO1FBRUgsT0FBTyxpQkFBaUIsQ0FBSSxRQUFRLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztRQUNmLGVBQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDNUQsTUFBTSxLQUFLLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQztBQUVNLEtBQUssVUFBVSxpQkFBaUIsQ0FBSSxRQUF1QjtJQUNoRSxJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssR0FBRyxFQUFFLENBQUM7UUFDNUIsZUFBTSxDQUFDLEtBQUssQ0FBQyxvQkFBb0IsRUFBRTtZQUNqQyxNQUFNLEVBQUUsUUFBUSxDQUFDLE1BQU07WUFDdkIsVUFBVSxFQUFFLFFBQVEsQ0FBQyxVQUFVO1lBQy9CLEdBQUcsRUFBRSxRQUFRLENBQUMsTUFBTSxDQUFDLEdBQUc7U0FDekIsQ0FBQyxDQUFDO1FBQ0gsTUFBTSxJQUFJLEtBQUssQ0FBQyx1QkFBdUIsUUFBUSxDQUFDLFVBQVUsRUFBRSxDQUFDLENBQUM7SUFDaEUsQ0FBQztJQUVELE9BQU8sUUFBUSxDQUFDLElBQVMsQ0FBQztBQUM1QixDQUFDIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IGF4aW9zLCB7IEF4aW9zUmVzcG9uc2UgfSBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuLi91dGlscy9sb2dnZXInO1xuXG4vLyBSYXRlIGxpbWl0aW5nIGNvbmZpZ3VyYXRpb25cbmNvbnN0IFJBVEVfTElNSVQgPSAxMDAwOyAvLyAxIHJlcXVlc3QgcGVyIHNlY29uZFxubGV0IGxhc3RSZXF1ZXN0ID0gMDtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGZldGNoV2l0aFJhdGVMaW1pdDxUPihcbiAgdXJsOiBzdHJpbmcsIFxuICBvcHRpb25zOiB7IFxuICAgIHBhcmFtcz86IFJlY29yZDxzdHJpbmcsIHN0cmluZyB8IG51bWJlciB8IGJvb2xlYW4+LFxuICAgIGhlYWRlcnM/OiBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+XG4gIH0gPSB7fVxuKTogUHJvbWlzZTxUPiB7XG4gIGNvbnN0IG5vdyA9IERhdGUubm93KCk7XG4gIGNvbnN0IHRpbWVUb1dhaXQgPSBNYXRoLm1heCgwLCBSQVRFX0xJTUlUIC0gKG5vdyAtIGxhc3RSZXF1ZXN0KSk7XG4gIFxuICBpZiAodGltZVRvV2FpdCA+IDApIHtcbiAgICBsb2dnZXIuZGVidWcoYFJhdGUgbGltaXRpbmc6IHdhaXRpbmcgJHt0aW1lVG9XYWl0fW1zIGJlZm9yZSBuZXh0IHJlcXVlc3RgKTtcbiAgICBhd2FpdCBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHNldFRpbWVvdXQocmVzb2x2ZSwgdGltZVRvV2FpdCkpO1xuICB9XG4gIFxuICBsYXN0UmVxdWVzdCA9IERhdGUubm93KCk7XG5cbiAgdHJ5IHtcbiAgICBsb2dnZXIuZGVidWcoJ01ha2luZyBBUEkgcmVxdWVzdCcsIHsgdXJsLCBvcHRpb25zIH0pO1xuICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KHVybCwge1xuICAgICAgcGFyYW1zOiBvcHRpb25zLnBhcmFtcyxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0FjY2VwdCc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgLi4ub3B0aW9ucy5oZWFkZXJzXG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gaGFuZGxlQXBpUmVzcG9uc2U8VD4ocmVzcG9uc2UpO1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGxvZ2dlci5lcnJvcignQVBJIHJlcXVlc3QgZmFpbGVkJywgeyBlcnJvciwgdXJsLCBvcHRpb25zIH0pO1xuICAgIHRocm93IGVycm9yO1xuICB9XG59XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVBcGlSZXNwb25zZTxUPihyZXNwb25zZTogQXhpb3NSZXNwb25zZSk6IFByb21pc2U8VD4ge1xuICBpZiAocmVzcG9uc2Uuc3RhdHVzICE9PSAyMDApIHtcbiAgICBsb2dnZXIuZXJyb3IoJ0FQSSByZXF1ZXN0IGZhaWxlZCcsIHtcbiAgICAgIHN0YXR1czogcmVzcG9uc2Uuc3RhdHVzLFxuICAgICAgc3RhdHVzVGV4dDogcmVzcG9uc2Uuc3RhdHVzVGV4dCxcbiAgICAgIHVybDogcmVzcG9uc2UuY29uZmlnLnVybFxuICAgIH0pO1xuICAgIHRocm93IG5ldyBFcnJvcihgQVBJIHJlcXVlc3QgZmFpbGVkOiAke3Jlc3BvbnNlLnN0YXR1c1RleHR9YCk7XG4gIH1cbiAgXG4gIHJldHVybiByZXNwb25zZS5kYXRhIGFzIFQ7XG59Il19