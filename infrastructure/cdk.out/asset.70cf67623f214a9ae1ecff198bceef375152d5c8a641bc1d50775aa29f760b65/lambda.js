"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = handler;
const bills_1 = require("./lib/api/bills");
const members_1 = require("./lib/api/members");
const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
};
async function handler(event) {
    try {
        console.log('Lambda started', { event });
        if (event.httpMethod === 'OPTIONS') {
            return {
                statusCode: 200,
                headers: corsHeaders,
                body: ''
            };
        }
        const path = event.path.toLowerCase();
        console.log('Processing path', { path });
        if (path.includes('/health')) {
            const response = {
                status: 'ok',
                timestamp: new Date().toISOString(),
                environment: {
                    region: process.env.REGION,
                    billsTable: process.env.DYNAMODB_BILLS_TABLE,
                    membersTable: process.env.DYNAMODB_MEMBERS_TABLE,
                    cacheBucket: process.env.S3_CACHE_BUCKET,
                    nodeEnv: process.env.NODE_ENV
                }
            };
            return {
                statusCode: 200,
                headers: { 'Content-Type': 'application/json', ...corsHeaders },
                body: JSON.stringify(response)
            };
        }
        if (path.includes('/api/parliament/members/earnings')) {
            try {
                const members = await members_1.membersService.getMembersWithInterests();
                // Filter for recent interests (2024 onwards)
                const filteredMembers = members.map(member => {
                    const recentEarnings = member.earnings.filter(e => new Date(e.registeredDate) >= new Date('2024-01-01'));
                    const recentDonations = member.donations.filter(d => new Date(d.registeredDate) >= new Date('2024-01-01'));
                    return {
                        id: member.id,
                        name: member.name,
                        party: member.party,
                        house: member.house,
                        totalEarnings: recentEarnings.reduce((sum, e) => sum + e.amount, 0),
                        totalDonations: recentDonations.reduce((sum, d) => sum + d.amount, 0)
                    };
                });
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    body: JSON.stringify(filteredMembers)
                };
            }
            catch (error) {
                console.error('Error fetching members:', error);
                return {
                    statusCode: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    body: JSON.stringify({
                        error: 'Failed to fetch members',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    })
                };
            }
        }
        if (path.includes('/api/parliament/bills')) {
            try {
                const bills = await bills_1.billsService.getBills({
                    page: parseInt(event.queryStringParameters?.page) || 1,
                    limit: parseInt(event.queryStringParameters?.limit) || 20,
                    sessionId: parseInt(event.queryStringParameters?.sessionId) || 58
                });
                return {
                    statusCode: 200,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    body: JSON.stringify(bills)
                };
            }
            catch (error) {
                console.error('Error fetching bills:', error);
                return {
                    statusCode: 500,
                    headers: { 'Content-Type': 'application/json', ...corsHeaders },
                    body: JSON.stringify({
                        error: 'Failed to fetch bills',
                        message: error instanceof Error ? error.message : 'Unknown error'
                    })
                };
            }
        }
        console.warn('Not found', { path });
        return {
            statusCode: 404,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            body: JSON.stringify({
                error: 'Not found',
                path,
                availablePaths: ['/health', '/api/parliament/bills', '/api/parliament/members/earnings']
            })
        };
    }
    catch (error) {
        console.error('Unhandled error:', error);
        return {
            statusCode: 500,
            headers: { 'Content-Type': 'application/json', ...corsHeaders },
            body: JSON.stringify({
                error: 'Internal server error',
                message: error instanceof Error ? error.message : 'Unknown error'
            })
        };
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFtYmRhLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2xhbWJkYS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQVdBLDBCQTRIQztBQXRJRCwyQ0FBK0M7QUFDL0MsK0NBQW1EO0FBR25ELE1BQU0sV0FBVyxHQUFHO0lBQ2xCLDZCQUE2QixFQUFFLEdBQUc7SUFDbEMsOEJBQThCLEVBQUUsc0VBQXNFO0lBQ3RHLDhCQUE4QixFQUFFLDZCQUE2QjtDQUM5RCxDQUFDO0FBRUssS0FBSyxVQUFVLE9BQU8sQ0FBQyxLQUEyQjtJQUN2RCxJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsR0FBRyxDQUFDLGdCQUFnQixFQUFFLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQztRQUV6QyxJQUFJLEtBQUssQ0FBQyxVQUFVLEtBQUssU0FBUyxFQUFFLENBQUM7WUFDbkMsT0FBTztnQkFDTCxVQUFVLEVBQUUsR0FBRztnQkFDZixPQUFPLEVBQUUsV0FBVztnQkFDcEIsSUFBSSxFQUFFLEVBQUU7YUFDVCxDQUFDO1FBQ0osQ0FBQztRQUVELE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFDdEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLENBQUM7UUFFekMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxFQUFFLENBQUM7WUFDN0IsTUFBTSxRQUFRLEdBQUc7Z0JBQ2YsTUFBTSxFQUFFLElBQUk7Z0JBQ1osU0FBUyxFQUFFLElBQUksSUFBSSxFQUFFLENBQUMsV0FBVyxFQUFFO2dCQUNuQyxXQUFXLEVBQUU7b0JBQ1gsTUFBTSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsTUFBTTtvQkFDMUIsVUFBVSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsb0JBQW9CO29CQUM1QyxZQUFZLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0I7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LEtBQUssRUFBRSxXQUFXO2dCQUNsQixJQUFJO2dCQUNKLGNBQWMsRUFBRSxDQUFDLFNBQVMsRUFBRSx1QkFBdUIsRUFBRSxrQ0FBa0MsQ0FBQzthQUN6RixDQUFDO1NBQ0gsQ0FBQztJQUVKLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxrQkFBa0IsRUFBRSxLQUFLLENBQUMsQ0FBQztRQUN6QyxPQUFPO1lBQ0wsVUFBVSxFQUFFLEdBQUc7WUFDZixPQUFPLEVBQUUsRUFBRSxjQUFjLEVBQUUsa0JBQWtCLEVBQUUsR0FBRyxXQUFXLEVBQUU7WUFDL0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7Z0JBQ25CLEtBQUssRUFBRSx1QkFBdUI7Z0JBQzlCLE9BQU8sRUFBRSxLQUFLLFlBQVksS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQyxlQUFlO2FBQ2xFLENBQUM7U0FDSCxDQUFDO0lBQ0osQ0FBQztBQUNILENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgeyBiaWxsc1NlcnZpY2UgfSBmcm9tICcuL2xpYi9hcGkvYmlsbHMnO1xuaW1wb3J0IHsgbWVtYmVyc1NlcnZpY2UgfSBmcm9tICcuL2xpYi9hcGkvbWVtYmVycyc7XG5pbXBvcnQgeyBsb2dnZXIgfSBmcm9tICcuL2xpYi91dGlscy9sb2dnZXInO1xuXG5jb25zdCBjb3JzSGVhZGVycyA9IHtcbiAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6ICcqJyxcbiAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUhlYWRlcnMnOiAnQ29udGVudC1UeXBlLEF1dGhvcml6YXRpb24sWC1BbXotRGF0ZSxYLUFwaS1LZXksWC1BbXotU2VjdXJpdHktVG9rZW4nLFxuICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctTWV0aG9kcyc6ICdHRVQsUE9TVCxQVVQsREVMRVRFLE9QVElPTlMnLFxufTtcblxuZXhwb3J0IGFzeW5jIGZ1bmN0aW9uIGhhbmRsZXIoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+IHtcbiAgdHJ5IHtcbiAgICBjb25zb2xlLmxvZygnTGFtYmRhIHN0YXJ0ZWQnLCB7IGV2ZW50IH0pO1xuXG4gICAgaWYgKGV2ZW50Lmh0dHBNZXRob2QgPT09ICdPUFRJT05TJykge1xuICAgICAgcmV0dXJuIHsgXG4gICAgICAgIHN0YXR1c0NvZGU6IDIwMCwgXG4gICAgICAgIGhlYWRlcnM6IGNvcnNIZWFkZXJzLCBcbiAgICAgICAgYm9keTogJycgXG4gICAgICB9O1xuICAgIH1cblxuICAgIGNvbnN0IHBhdGggPSBldmVudC5wYXRoLnRvTG93ZXJDYXNlKCk7XG4gICAgY29uc29sZS5sb2coJ1Byb2Nlc3NpbmcgcGF0aCcsIHsgcGF0aCB9KTtcblxuICAgIGlmIChwYXRoLmluY2x1ZGVzKCcvaGVhbHRoJykpIHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0ge1xuICAgICAgICBzdGF0dXM6ICdvaycsXG4gICAgICAgIHRpbWVzdGFtcDogbmV3IERhdGUoKS50b0lTT1N0cmluZygpLFxuICAgICAgICBlbnZpcm9ubWVudDoge1xuICAgICAgICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuUkVHSU9OLFxuICAgICAgICAgIGJpbGxzVGFibGU6IHByb2Nlc3MuZW52LkRZTkFNT0RCX0JJTExTX1RBQkxFLFxuICAgICAgICAgIG1lbWJlcnNUYWJsZTogcHJvY2Vzcy5lbnYuRFlOQU1PREJfTUVNQkVSU19UQUJMRSxcbiAgICAgICAgICBjYWNoZUJ1Y2tldDogcHJvY2Vzcy5lbnYuUzNfQ0FDSEVfQlVDS0VULFxuICAgICAgICAgIG5vZGVFbnY6IHByb2Nlc3MuZW52Lk5PREVfRU5WXG4gICAgICAgIH1cbiAgICAgIH07XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLCAuLi5jb3JzSGVhZGVycyB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXNwb25zZSlcbiAgICAgIH07XG4gICAgfVxuXG4gICAgaWYgKHBhdGguaW5jbHVkZXMoJy9hcGkvcGFybGlhbWVudC9tZW1iZXJzL2Vhcm5pbmdzJykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IG1lbWJlcnMgPSBhd2FpdCBtZW1iZXJzU2VydmljZS5nZXRNZW1iZXJzV2l0aEludGVyZXN0cygpO1xuICAgICAgICBcbiAgICAgICAgLy8gRmlsdGVyIGZvciByZWNlbnQgaW50ZXJlc3RzICgyMDI0IG9ud2FyZHMpXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkTWVtYmVycyA9IG1lbWJlcnMubWFwKG1lbWJlciA9PiB7XG4gICAgICAgICAgY29uc3QgcmVjZW50RWFybmluZ3MgPSBtZW1iZXIuZWFybmluZ3MuZmlsdGVyKGUgPT4gXG4gICAgICAgICAgICBuZXcgRGF0ZShlLnJlZ2lzdGVyZWREYXRlKSA+PSBuZXcgRGF0ZSgnMjAyNC0wMS0wMScpXG4gICAgICAgICAgKTtcbiAgICAgICAgICBjb25zdCByZWNlbnREb25hdGlvbnMgPSBtZW1iZXIuZG9uYXRpb25zLmZpbHRlcihkID0+IFxuICAgICAgICAgICAgbmV3IERhdGUoZC5yZWdpc3RlcmVkRGF0ZSkgPj0gbmV3IERhdGUoJzIwMjQtMDEtMDEnKVxuICAgICAgICAgICk7XG4gICAgICAgICAgXG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGlkOiBtZW1iZXIuaWQsXG4gICAgICAgICAgICBuYW1lOiBtZW1iZXIubmFtZSxcbiAgICAgICAgICAgIHBhcnR5OiBtZW1iZXIucGFydHksXG4gICAgICAgICAgICBob3VzZTogbWVtYmVyLmhvdXNlLFxuICAgICAgICAgICAgdG90YWxFYXJuaW5nczogcmVjZW50RWFybmluZ3MucmVkdWNlKChzdW0sIGUpID0+IHN1bSArIGUuYW1vdW50LCAwKSxcbiAgICAgICAgICAgIHRvdGFsRG9uYXRpb25zOiByZWNlbnREb25hdGlvbnMucmVkdWNlKChzdW0sIGQpID0+IHN1bSArIGQuYW1vdW50LCAwKVxuICAgICAgICAgIH07XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgLi4uY29yc0hlYWRlcnMgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShmaWx0ZXJlZE1lbWJlcnMpXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBtZW1iZXJzOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLCAuLi5jb3JzSGVhZGVycyB9LFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBtZW1iZXJzJyxcbiAgICAgICAgICAgIG1lc3NhZ2U6IGVycm9yIGluc3RhbmNlb2YgRXJyb3IgPyBlcnJvci5tZXNzYWdlIDogJ1Vua25vd24gZXJyb3InXG4gICAgICAgICAgfSlcbiAgICAgICAgfTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAocGF0aC5pbmNsdWRlcygnL2FwaS9wYXJsaWFtZW50L2JpbGxzJykpIHtcbiAgICAgIHRyeSB7XG4gICAgICAgIGNvbnN0IGJpbGxzID0gYXdhaXQgYmlsbHNTZXJ2aWNlLmdldEJpbGxzKHsgXG4gICAgICAgICAgcGFnZTogcGFyc2VJbnQoZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5wYWdlIGFzIHN0cmluZykgfHwgMSxcbiAgICAgICAgICBsaW1pdDogcGFyc2VJbnQoZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5saW1pdCBhcyBzdHJpbmcpIHx8IDIwLFxuICAgICAgICAgIHNlc3Npb25JZDogcGFyc2VJbnQoZXZlbnQucXVlcnlTdHJpbmdQYXJhbWV0ZXJzPy5zZXNzaW9uSWQgYXMgc3RyaW5nKSB8fCA1OFxuICAgICAgICB9KTtcbiAgICAgICAgXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgc3RhdHVzQ29kZTogMjAwLFxuICAgICAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgLi4uY29yc0hlYWRlcnMgfSxcbiAgICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShiaWxscylcbiAgICAgICAgfTtcbiAgICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIGJpbGxzOicsIGVycm9yKTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBzdGF0dXNDb2RlOiA1MDAsXG4gICAgICAgICAgaGVhZGVyczogeyAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLCAuLi5jb3JzSGVhZGVycyB9LFxuICAgICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgICAgICBlcnJvcjogJ0ZhaWxlZCB0byBmZXRjaCBiaWxscycsXG4gICAgICAgICAgICBtZXNzYWdlOiBlcnJvciBpbnN0YW5jZW9mIEVycm9yID8gZXJyb3IubWVzc2FnZSA6ICdVbmtub3duIGVycm9yJ1xuICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc29sZS53YXJuKCdOb3QgZm91bmQnLCB7IHBhdGggfSk7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwNCxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgLi4uY29yc0hlYWRlcnMgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgIGVycm9yOiAnTm90IGZvdW5kJywgXG4gICAgICAgIHBhdGgsXG4gICAgICAgIGF2YWlsYWJsZVBhdGhzOiBbJy9oZWFsdGgnLCAnL2FwaS9wYXJsaWFtZW50L2JpbGxzJywgJy9hcGkvcGFybGlhbWVudC9tZW1iZXJzL2Vhcm5pbmdzJ11cbiAgICAgIH0pXG4gICAgfTtcblxuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ1VuaGFuZGxlZCBlcnJvcjonLCBlcnJvcik7XG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDUwMCxcbiAgICAgIGhlYWRlcnM6IHsgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJywgLi4uY29yc0hlYWRlcnMgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgXG4gICAgICAgIGVycm9yOiAnSW50ZXJuYWwgc2VydmVyIGVycm9yJyxcbiAgICAgICAgbWVzc2FnZTogZXJyb3IgaW5zdGFuY2VvZiBFcnJvciA/IGVycm9yLm1lc3NhZ2UgOiAnVW5rbm93biBlcnJvcidcbiAgICAgIH0pXG4gICAgfTtcbiAgfVxufSJdfQ==