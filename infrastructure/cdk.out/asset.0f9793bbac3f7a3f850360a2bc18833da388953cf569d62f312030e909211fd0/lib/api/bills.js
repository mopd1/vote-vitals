"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.billsService = exports.BillsService = void 0;
const axios_1 = __importDefault(require("axios"));
const PARLIAMENT_API = 'https://bills-api.parliament.uk/api/v1';
class BillsService {
    async getBills({ page = 1, limit = 20 } = {}) {
        try {
            const response = await axios_1.default.get(`${PARLIAMENT_API}/Bills`, {
                params: {
                    Take: limit,
                    Skip: (page - 1) * limit
                }
            });
            return {
                items: response.data.items.map(item => ({
                    billId: item.billId,
                    shortTitle: item.shortTitle,
                    currentHouse: item.currentHouse,
                    lastUpdate: item.lastUpdate,
                    currentStage: item.currentStage
                })),
                totalItems: response.data.totalResults,
                pageNumber: page,
                pageSize: limit,
                totalPages: Math.ceil(response.data.totalResults / limit)
            };
        }
        catch (error) {
            console.error('Error fetching bills:', error);
            throw error;
        }
    }
}
exports.BillsService = BillsService;
exports.billsService = new BillsService();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmlsbHMuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvbGliL2FwaS9iaWxscy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQSxrREFBMEI7QUFHMUIsTUFBTSxjQUFjLEdBQUcsd0NBQXdDLENBQUM7QUFnQmhFLE1BQWEsWUFBWTtJQUN2QixLQUFLLENBQUMsUUFBUSxDQUFDLEVBQUUsSUFBSSxHQUFHLENBQUMsRUFBRSxLQUFLLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRTtRQUMxQyxJQUFJLENBQUM7WUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQUssQ0FBQyxHQUFHLENBQW1CLEdBQUcsY0FBYyxRQUFRLEVBQUU7Z0JBQzVFLE1BQU0sRUFBRTtvQkFDTixJQUFJLEVBQUUsS0FBSztvQkFDWCxJQUFJLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsS0FBSztpQkFDekI7YUFDRixDQUFDLENBQUM7WUFFSCxPQUFPO2dCQUNMLEtBQUssRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDO29CQUN0QyxNQUFNLEVBQUUsSUFBSSxDQUFDLE1BQU07b0JBQ25CLFVBQVUsRUFBRSxJQUFJLENBQUMsVUFBVTtvQkFDM0IsWUFBWSxFQUFFLElBQUksQ0FBQyxZQUFZO29CQUMvQixVQUFVLEVBQUUsSUFBSSxDQUFDLFVBQVU7b0JBQzNCLFlBQVksRUFBRSxJQUFJLENBQUMsWUFBWTtpQkFDaEMsQ0FBQyxDQUFDO2dCQUNILFVBQVUsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVk7Z0JBQ3RDLFVBQVUsRUFBRSxJQUFJO2dCQUNoQixRQUFRLEVBQUUsS0FBSztnQkFDZixVQUFVLEVBQUUsSUFBSSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxLQUFLLENBQUM7YUFDMUQsQ0FBQztRQUNKLENBQUM7UUFBQyxPQUFPLEtBQUssRUFBRSxDQUFDO1lBQ2YsT0FBTyxDQUFDLEtBQUssQ0FBQyx1QkFBdUIsRUFBRSxLQUFLLENBQUMsQ0FBQztZQUM5QyxNQUFNLEtBQUssQ0FBQztRQUNkLENBQUM7SUFDSCxDQUFDO0NBQ0Y7QUE1QkQsb0NBNEJDO0FBRVksUUFBQSxZQUFZLEdBQUcsSUFBSSxZQUFZLEVBQUUsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5pbXBvcnQgeyBCaWxsLCBQYWdpbmF0ZWRSZXNwb25zZSB9IGZyb20gJy4uL3R5cGVzL3BhcmxpYW1lbnQnO1xuXG5jb25zdCBQQVJMSUFNRU5UX0FQSSA9ICdodHRwczovL2JpbGxzLWFwaS5wYXJsaWFtZW50LnVrL2FwaS92MSc7XG5cbmludGVyZmFjZSBCaWxsc0FwaVJlc3BvbnNlIHtcbiAgaXRlbXM6IEFycmF5PHtcbiAgICBiaWxsSWQ6IG51bWJlcjtcbiAgICBzaG9ydFRpdGxlOiBzdHJpbmc7XG4gICAgY3VycmVudEhvdXNlOiBzdHJpbmc7XG4gICAgbGFzdFVwZGF0ZTogc3RyaW5nO1xuICAgIGN1cnJlbnRTdGFnZT86IHtcbiAgICAgIGRlc2NyaXB0aW9uOiBzdHJpbmc7XG4gICAgICBob3VzZTogc3RyaW5nO1xuICAgIH07XG4gIH0+O1xuICB0b3RhbFJlc3VsdHM6IG51bWJlcjtcbn1cblxuZXhwb3J0IGNsYXNzIEJpbGxzU2VydmljZSB7XG4gIGFzeW5jIGdldEJpbGxzKHsgcGFnZSA9IDEsIGxpbWl0ID0gMjAgfSA9IHt9KTogUHJvbWlzZTxQYWdpbmF0ZWRSZXNwb25zZTxCaWxsPj4ge1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGF4aW9zLmdldDxCaWxsc0FwaVJlc3BvbnNlPihgJHtQQVJMSUFNRU5UX0FQSX0vQmlsbHNgLCB7XG4gICAgICAgIHBhcmFtczoge1xuICAgICAgICAgIFRha2U6IGxpbWl0LFxuICAgICAgICAgIFNraXA6IChwYWdlIC0gMSkgKiBsaW1pdFxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbXM6IHJlc3BvbnNlLmRhdGEuaXRlbXMubWFwKGl0ZW0gPT4gKHtcbiAgICAgICAgICBiaWxsSWQ6IGl0ZW0uYmlsbElkLFxuICAgICAgICAgIHNob3J0VGl0bGU6IGl0ZW0uc2hvcnRUaXRsZSxcbiAgICAgICAgICBjdXJyZW50SG91c2U6IGl0ZW0uY3VycmVudEhvdXNlLFxuICAgICAgICAgIGxhc3RVcGRhdGU6IGl0ZW0ubGFzdFVwZGF0ZSxcbiAgICAgICAgICBjdXJyZW50U3RhZ2U6IGl0ZW0uY3VycmVudFN0YWdlXG4gICAgICAgIH0pKSxcbiAgICAgICAgdG90YWxJdGVtczogcmVzcG9uc2UuZGF0YS50b3RhbFJlc3VsdHMsXG4gICAgICAgIHBhZ2VOdW1iZXI6IHBhZ2UsXG4gICAgICAgIHBhZ2VTaXplOiBsaW1pdCxcbiAgICAgICAgdG90YWxQYWdlczogTWF0aC5jZWlsKHJlc3BvbnNlLmRhdGEudG90YWxSZXN1bHRzIC8gbGltaXQpXG4gICAgICB9O1xuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBiaWxsczonLCBlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGJpbGxzU2VydmljZSA9IG5ldyBCaWxsc1NlcnZpY2UoKTsiXX0=