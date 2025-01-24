"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const bills_1 = require("./lib/api/bills");
const logger_1 = require("./lib/utils/logger");
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};
// Mock data for testing
const mockMembers = [
    { id: '1', name: 'John Smith', party: 'Conservative', house: 'Commons', totalEarnings: 150000, totalDonations: 75000 },
    { id: '2', name: 'Sarah Wilson', party: 'Labour', house: 'Commons', totalEarnings: 120000, totalDonations: 45000 },
    { id: '3', name: 'David Brown', party: 'Conservative', house: 'Lords', totalEarnings: 200000, totalDonations: 150000 },
];
async function handler(event) {
    try {
        logger_1.logger.info('Received request', {
            path: event.path,
            method: event.httpMethod,
            queryParams: event.queryStringParameters
        });
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        const path = event.path;
        const queryParams = event.queryStringParameters || {};
        if (path === '/health' || path === 'health') {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
                body: JSON.stringify({
                    status: 'ok',
                    timestamp: new Date().toISOString()
                })
            };
        }
        if (path === '/api/parliament/members/earnings' || path === 'api/parliament/members/earnings') {
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
                body: JSON.stringify(mockMembers)
            };
        }
        if (path.includes('/api/parliament/bills')) {
            try {
                logger_1.logger.info('Fetching bills', { queryParams });
                const bills = await bills_1.billsService.getBills({
                    page: parseInt(queryParams.page) || 1,
                    limit: parseInt(queryParams.limit) || 20,
                    sessionId: parseInt(queryParams.sessionId) || 58
                });
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    body: JSON.stringify(bills)
                };
            }
            catch (error) {
                logger_1.logger.error('Error fetching bills:', error);
                return {
                    statusCode: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    body: JSON.stringify({
                        error: 'Failed to fetch bills',
                        details: error instanceof Error ? error.message : 'Unknown error'
                    })
                };
            }
        }
        logger_1.logger.warn('Not found', { path });
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            body: JSON.stringify({ error: 'Not found' })
        };
    }
    catch (error) {
        logger_1.logger.error('Unhandled error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            body: JSON.stringify({
                error: 'Internal server error',
                details: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xhbWJkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWlCQSwwQkFtRkM7QUFuR0QsMkNBQStDO0FBQy9DLCtDQUE0QztBQUU1QyxNQUFNLFdBQVcsR0FBRztJQUNsQiw2QkFBNkIsRUFBRSxHQUFHO0lBQ2xDLDhCQUE4QixFQUFFLHNFQUFzRTtJQUN0Ryw4QkFBOEIsRUFBRSw2QkFBNkI7Q0FDOUQsQ0FBQztBQUVGLHdCQUF3QjtBQUN4QixNQUFNLFdBQVcsR0FBRztJQUNsQixFQUFFLEVBQUUsRUFBRSxHQUFHLEVBQUUsSUFBSSxFQUFFLFlBQVksRUFBRSxLQUFLLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsYUFBYSxFQUFFLE1BQU0sRUFBRSxjQUFjLEVBQUUsS0FBSyxFQUFFO0lBQ3RILEVBQUUsRUFBRSxFQUFFLEdBQUcsRUFBRSxJQUFJLEVBQUUsY0FBYyxFQUFFLEtBQUssRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxhQUFhLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUU7SUFDbEgsRUFBRSxFQUFFLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxhQUFhLEVBQUUsS0FBSyxFQUFFLGNBQWMsRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLEVBQUUsY0FBYyxFQUFFLE1BQU0sRUFBRTtDQUN2SCxDQUFDO0FBRUssS0FBSyxVQUFVLE9BQU8sQ0FBQyxLQUEyQjtJQUN2RCxJQUFJLENBQUM7UUFDSCxlQUFNLENBQUMsSUFBSSxDQUFDLGtCQUFrQixFQUFFO1lBQzlCLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSTtZQUNoQixNQUFNLEVBQUUsS0FBSyxDQUFDLFVBQVU7WUFDeEIsV0FBVyxFQUFFLEtBQUssQ0FBQyxxQkFBcUI7U0FDekMsQ0FBQyxDQUFDO1FBRUgsSUFBSSxLQUFLLENBQUMs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QUFFLENBQUM7U0FDN0MsQ0FBQztJQUVKLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsZUFBTSxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN4QyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxXQUFXLEVBQUU7WUFDL0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLEtBQUssRUFBRSx1QkFBdUI7Z0JBQzlCLE9BQU8sRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlO2FBQ2xFLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBiaWxsc1NlcnZpY2UgfSBmcm9tICcuL2xpYi9hcGkvYmlsbHMnO1xuaW1wb3J0IHsgbG9nZ2VyIH0gZnJvbSAnLi9saWIvdXRpbHMvbG9nZ2VyJztcblxuY29uc3QgY29yc0hlYWRlcnMgPSB7XG4gICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiAnKicsXG4gICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1IZWFkZXJzJzogJ0NvbnRlbnQtVHlwZSxBdXRob3JpemF0aW9uLFgtQW16LURhdGUsWC1BcGktS2V5LFgtQW16LVNlY3VyaXR5LVRva2VuJyxcbiAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU1ldGhvZHMnOiAnR0VULFBPU1QsUFVULERFTEVURSxPUFRJT05TJyxcbn07XG5cbi8vIE1vY2sgZGF0YSBmb3IgdGVzdGluZ1xuY29uc3QgbW9ja01lbWJlcnMgPSBbXG4gIHsgaWQ6ICcxJywgbmFtZTogJ0pvaG4gU21pdGgnLCBwYXJ0eTogJ0NvbnNlcnZhdGl2ZScsIGhvdXNlOiAnQ29tbW9ucycsIHRvdGFsRWFybmluZ3M6IDE1MDAwMCwgdG90YWxEb25hdGlvbnM6IDc1MDAwIH0sXG4gIHsgaWQ6ICcyJywgbmFtZTogJ1NhcmFoIFdpbHNvbicsIHBhcnR5OiAnTGFib3VyJywgaG91c2U6ICdDb21tb25zJywgdG90YWxFYXJuaW5nczogMTIwMDAwLCB0b3RhbERvbmF0aW9uczogNDUwMDAgfSxcbiAgeyBpZDogJzMnLCBuYW1lOiAnRGF2aWQgQnJvd24nLCBwYXJ0eTogJ0NvbnNlcnZhdGl2ZScsIGhvdXNlOiAnTG9yZHMnLCB0b3RhbEVhcm5pbmdzOiAyMDAwMDAsIHRvdGFsRG9uYXRpb25zOiAxNTAwMDAgfSxcbl07XG5cbmV4cG9ydCBhc3luYyBmdW5jdGlvbiBoYW5kbGVyKGV2ZW50OiBBUElHYXRld2F5UHJveHlFdmVudCk6IFByb21pc2U8QVBJR2F0ZXdheVByb3h5UmVzdWx0PiB7XG4gIHRyeSB7XG4gICAgbG9nZ2VyLmluZm8oJ1JlY2VpdmVkIHJlcXVlc3QnLCB7IFxuICAgICAgcGF0aDogZXZlbnQucGF0aCxcbiAgICAgIG1ldGhvZDogZXZlbnQuaHR0cE1ldGhvZCxcbiAgICAgIHF1ZXJ5UGFyYW1zOiBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMgXG4gICAgfSk7XG5cbiAgICBpZiAoZXZlbnQuaHR0cE1ldGhvZCA9PT0gJ09QVElPTlMnKSB7XG4gICAgICByZXR1cm4geyBcbiAgICAgICAgc3RhdHVzQ29kZTogMjAwLCBcbiAgICAgICAgaGVhZGVyczogY29yc0hlYWRlcnMsIFxuICAgICAgICBib2R5OiAnJyBcbiAgICAgIH07XG4gICAgfVxuXG4gICAgY29uc3QgcGF0aCA9IGV2ZW50LnBhdGg7XG4gICAgY29uc3QgcXVlcnlQYXJhbXMgPSBldmVudC5xdWVyeVN0cmluZ1BhcmFtZXRlcnMgfHwge307XG5cbiAgICBpZiAocGF0aCA9PT0gJy9oZWFsdGgnIHx8IHBhdGggPT09ICdoZWFsdGgnKSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgLi4uY29yc0hlYWRlcnMgfSxcbiAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBcbiAgICAgICAgICBzdGF0dXM6ICdvaycsIFxuICAgICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpXG4gICAgICAgIH0pXG4gICAgICB9O1xuICAgIH1cblxuICAgIGlmIChwYXRoID09PSAnL2FwaS9wYXJsaWFtZW50L21lbWJlcnMvZWFybmluZ3MnIHx8IHBhdGggPT09ICdhcGkvcGFybGlhbWVudC9tZW1iZXJzL2Vhcm5pbmdzJykge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsIC4uLmNvcnNIZWFkZXJzIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KG1vY2tNZW1iZXJzKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICBpZiAocGF0aC5pbmNsdWRlcygnL2FwaS9wYXJsaWFtZW50L2JpbGxzJykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGxvZ2dlci5pbmZvKCdGZXRjaGluZyBiaWxscycsIHsgcXVlcnlQYXJhbXMgfSk7XG4gICAgICAgIGNvbnN0IGJpbGxzID0gYXdhaXQgYmlsbHNTZXJ2aWNlLmdldEJpbGxzKHsgXG4gICAgICAgICAgcGFnZTogcGFyc2VJbnQocXVlcnlQYXJhbXMucGFnZSBhcyBzdHJpbmcpIHx8IDEsXG4gICAgICAgICAgbGltaXQ6IHBhcnNlSW50KHF1ZXJ5UGFyYW1zLmxpbWl0IGFzIHN0cmluZykgfHwgMjAsXG4gICAgICAgICAgc2Vzc2lvbklkOiBwYXJzZUludChxdWVyeVBhcmFtcy5zZXNzaW9uSWQgYXMgc3RyaW5nKSB8fCA1OFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgLi4uY29yc0hlYWRlcnMgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShiaWxscylcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGxvZ2dlci5lcnJvcignRXJyb3IgZmV0Y2hpbmcgYmlsbHM6JywgZXJyb3IpO1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsIC4uLmNvcnNIZWFkZXJzIH0sXG4gICAgICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBcbiAgICAgICAgICAgIGVycm9yOiAnRmFpbGVkIHRvIGZldGNoIGJpbGxzJyxcbiAgICAgICAgICAgIGRldGFpbHM6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXG4gICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsb2dnZXIud2FybignTm90IGZvdW5kJywgeyBwYXRoIH0pO1xuICAgIHJldHVybiB7XG4gICAgICBzdGF0dXNDb2RlOiA0MDQsXG4gICAgICBoZWFkZXJzOiB7ICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsIC4uLmNvcnNIZWFkZXJzIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7IGVycm9yOiAnTm90IGZvdW5kJyB9KVxuICAgIH07XG5cbiAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICBsb2dnZXIuZXJyb3IoJ1VuaGFuZGxlZCBlcnJvcjonLCBlcnJvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgLi4uY29yc0hlYWRlcnMgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgIGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyxcbiAgICAgICAgZGV0YWlsczogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcidcbiAgICAgIH0pXG4gICAgfTtcbiAgfVxufSJdfQ==