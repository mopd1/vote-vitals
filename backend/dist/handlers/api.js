"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handler = void 0;
const axios_1 = require("axios");
const PARLIAMENT_API = 'https://members-api.parliament.uk/api/v1';
const handler = async (event) => {
    try {
        // Parse the path and query parameters
        const path = event.resource;
        const queryParams = event.queryStringParameters || {};
        const { house = 'Commons', page = '1' } = queryParams;
        // Handle different endpoints
        if (path === '/v1/members') {
            const skip = (parseInt(page) - 1) * 20;
            const response = await axios_1.default.get(`${PARLIAMENT_API}/Members`, {
                params: {
                    house,
                    skip,
                    take: 20
                }
            });
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': event.headers.origin || '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify(response.data)
            };
        }
        // Handle member interests
        if (path === '/v1/members/{id}/interests') {
            const memberId = event.pathParameters?.id;
            const response = await axios_1.default.get(`${PARLIAMENT_API}/Members/${memberId}/RegisteredInterests`);
            return {
                statusCode: 200,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': event.headers.origin || '*',
                    'Access-Control-Allow-Credentials': true
                },
                body: JSON.stringify(response.data)
            };
        }
        // Handle unsupported endpoints
        return {
            statusCode: 404,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': event.headers.origin || '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ message: 'Not Found' })
        };
    }
    catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': event.headers.origin || '*',
                'Access-Control-Allow-Credentials': true
            },
            body: JSON.stringify({ message: 'Internal Server Error' })
        };
    }
};
exports.handler = handler;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2hhbmRsZXJzL2FwaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFDQSxpQ0FBMEI7QUFFMUIsTUFBTSxjQUFjLEdBQUcsMENBQTBDLENBQUM7QUFFM0QsTUFBTSxPQUFPLEdBQUcsS0FBSyxFQUFFLEtBQTJCLEVBQWtDLEVBQUU7SUFDM0YsSUFBSSxDQUFDO1FBQ0gsc0NBQXNDO1FBQ3RDLE1BQU0sSUFBSSxHQUFHLEtBQUssQ0FBQyxRQUFRLENBQUM7UUFDNUIsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLHFCQUFxQixJQUFJLEVBQUUsQ0FBQztRQUN0RCxNQUFNLEVBQUUsS0FBSyxHQUFHLFNBQVMsRUFBRSxJQUFJLEdBQUcsR0FBRyxFQUFFLEdBQUcsV0FBVyxDQUFDO1FBRXRELDZCQUE2QjtRQUM3QixJQUFJLElBQUksS0FBSyxhQUFhLEVBQUUsQ0FBQztZQUMzQixNQUFNLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7WUFDdkMsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsY0FBYyxVQUFVLEVBQUU7Z0JBQzVELE1BQU0sRUFBRTtvQkFDTixLQUFLO29CQUNMLElBQUk7b0JBQ0osSUFBSSxFQUFFLEVBQUU7aUJBQ1Q7YUFDRixDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNMLFVBQVUsRUFBRSxHQUFHO2dCQUNmLE9BQU8sRUFBRTtvQkFDUCxjQUFjLEVBQUUsa0JBQWtCO29CQUNsQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHO29CQUMxRCxrQ0FBa0MsRUFBRSxJQUFJO2lCQUN6QztnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2FBQ3BDLENBQUM7UUFDSixDQUFDO1FBRUQsMEJBQTBCO1FBQzFCLElBQUksSUFBSSxLQUFLLDRCQUE0QixFQUFFLENBQUM7WUFDMUMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLGNBQWMsRUFBRSxFQUFFLENBQUM7WUFDMUMsTUFBTSxRQUFRLEdBQUcsTUFBTSxlQUFLLENBQUMsR0FBRyxDQUFDLEdBQUcsY0FBYyxZQUFZLFFBQVEsc0JBQXNCLENBQUMsQ0FBQztZQUU5RixPQUFPO2dCQUNMLFVBQVUsRUFBRSxHQUFHO2dCQUNmLE9BQU8sRUFBRTtvQkFDUCxjQUFjLEVBQUUsa0JBQWtCO29CQUNsQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHO29CQUMxRCxrQ0FBa0MsRUFBRSxJQUFJO2lCQUN6QztnQkFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDO2FBQ3BDLENBQUM7UUFDSixDQUFDO1FBRUQsK0JBQStCO1FBQy9CLE9BQU87WUFDTCxVQUFVLEVBQUUsR0FBRztZQUNmLE9BQU8sRUFBRTtnQkFDUCxjQUFjLEVBQUUsa0JBQWtCO2dCQUNsQyw2QkFBNkIsRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sSUFBSSxHQUFHO2dCQUMxRCxrQ0FBa0MsRUFBRSxJQUFJO2FBQ3pDO1lBQ0QsSUFBSSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsRUFBRSxPQUFPLEVBQUUsV0FBVyxFQUFFLENBQUM7U0FDL0MsQ0FBQztJQUNKLENBQUM7SUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1FBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyxRQUFRLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0IsT0FBTztZQUNMLFVBQVUsRUFBRSxHQUFHO1lBQ2YsT0FBTyxFQUFFO2dCQUNQLGNBQWMsRUFBRSxrQkFBa0I7Z0JBQ2xDLDZCQUE2QixFQUFFLEtBQUssQ0FBQyxPQUFPLENBQUMsTUFBTSxJQUFJLEdBQUc7Z0JBQzFELGtDQUFrQyxFQUFFLElBQUk7YUFDekM7WUFDRCxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxFQUFFLE9BQU8sRUFBRSx1QkFBdUIsRUFBRSxDQUFDO1NBQzNELENBQUM7SUFDSixDQUFDO0FBQ0gsQ0FBQyxDQUFDO0FBbkVXLFFBQUEsT0FBTyxXQW1FbEIiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBBUElHYXRld2F5UHJveHlFdmVudCwgQVBJR2F0ZXdheVByb3h5UmVzdWx0IH0gZnJvbSAnYXdzLWxhbWJkYSc7XG5pbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuXG5jb25zdCBQQVJMSUFNRU5UX0FQSSA9ICdodHRwczovL21lbWJlcnMtYXBpLnBhcmxpYW1lbnQudWsvYXBpL3YxJztcblxuZXhwb3J0IGNvbnN0IGhhbmRsZXIgPSBhc3luYyAoZXZlbnQ6IEFQSUdhdGV3YXlQcm94eUV2ZW50KTogUHJvbWlzZTxBUElHYXRld2F5UHJveHlSZXN1bHQ+ID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBQYXJzZSB0aGUgcGF0aCBhbmQgcXVlcnkgcGFyYW1ldGVyc1xuICAgIGNvbnN0IHBhdGggPSBldmVudC5yZXNvdXJjZTtcbiAgICBjb25zdCBxdWVyeVBhcmFtcyA9IGV2ZW50LnF1ZXJ5U3RyaW5nUGFyYW1ldGVycyB8fCB7fTtcbiAgICBjb25zdCB7IGhvdXNlID0gJ0NvbW1vbnMnLCBwYWdlID0gJzEnIH0gPSBxdWVyeVBhcmFtcztcblxuICAgIC8vIEhhbmRsZSBkaWZmZXJlbnQgZW5kcG9pbnRzXG4gICAgaWYgKHBhdGggPT09ICcvdjEvbWVtYmVycycpIHtcbiAgICAgIGNvbnN0IHNraXAgPSAocGFyc2VJbnQocGFnZSkgLSAxKSAqIDIwO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoYCR7UEFSTElBTUVOVF9BUEl9L01lbWJlcnNgLCB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIGhvdXNlLFxuICAgICAgICAgIHNraXAsXG4gICAgICAgICAgdGFrZTogMjBcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIHJldHVybiB7XG4gICAgICAgIHN0YXR1c0NvZGU6IDIwMCxcbiAgICAgICAgaGVhZGVyczoge1xuICAgICAgICAgICdDb250ZW50LVR5cGUnOiAnYXBwbGljYXRpb24vanNvbicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IGV2ZW50LmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlXG4gICAgICAgIH0sXG4gICAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHJlc3BvbnNlLmRhdGEpXG4gICAgICB9O1xuICAgIH1cblxuICAgIC8vIEhhbmRsZSBtZW1iZXIgaW50ZXJlc3RzXG4gICAgaWYgKHBhdGggPT09ICcvdjEvbWVtYmVycy97aWR9L2ludGVyZXN0cycpIHtcbiAgICAgIGNvbnN0IG1lbWJlcklkID0gZXZlbnQucGF0aFBhcmFtZXRlcnM/LmlkO1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBheGlvcy5nZXQoYCR7UEFSTElBTUVOVF9BUEl9L01lbWJlcnMvJHttZW1iZXJJZH0vUmVnaXN0ZXJlZEludGVyZXN0c2ApO1xuXG4gICAgICByZXR1cm4ge1xuICAgICAgICBzdGF0dXNDb2RlOiAyMDAsXG4gICAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAgICdBY2Nlc3MtQ29udHJvbC1BbGxvdy1PcmlnaW4nOiBldmVudC5oZWFkZXJzLm9yaWdpbiB8fCAnKicsXG4gICAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogdHJ1ZVxuICAgICAgICB9LFxuICAgICAgICBib2R5OiBKU09OLnN0cmluZ2lmeShyZXNwb25zZS5kYXRhKVxuICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBIYW5kbGUgdW5zdXBwb3J0ZWQgZW5kcG9pbnRzXG4gICAgcmV0dXJuIHtcbiAgICAgIHN0YXR1c0NvZGU6IDQwNCxcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LU9yaWdpbic6IGV2ZW50LmhlYWRlcnMub3JpZ2luIHx8ICcqJyxcbiAgICAgICAgJ0FjY2Vzcy1Db250cm9sLUFsbG93LUNyZWRlbnRpYWxzJzogdHJ1ZVxuICAgICAgfSxcbiAgICAgIGJvZHk6IEpTT04uc3RyaW5naWZ5KHsgbWVzc2FnZTogJ05vdCBGb3VuZCcgfSlcbiAgICB9O1xuICB9IGNhdGNoIChlcnJvcikge1xuICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yOicsIGVycm9yKTtcbiAgICByZXR1cm4ge1xuICAgICAgc3RhdHVzQ29kZTogNTAwLFxuICAgICAgaGVhZGVyczoge1xuICAgICAgICAnQ29udGVudC1UeXBlJzogJ2FwcGxpY2F0aW9uL2pzb24nLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctT3JpZ2luJzogZXZlbnQuaGVhZGVycy5vcmlnaW4gfHwgJyonLFxuICAgICAgICAnQWNjZXNzLUNvbnRyb2wtQWxsb3ctQ3JlZGVudGlhbHMnOiB0cnVlXG4gICAgICB9LFxuICAgICAgYm9keTogSlNPTi5zdHJpbmdpZnkoeyBtZXNzYWdlOiAnSW50ZXJuYWwgU2VydmVyIEVycm9yJyB9KVxuICAgIH07XG4gIH1cbn07Il19