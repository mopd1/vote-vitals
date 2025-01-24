"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InterestsAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const INTERESTS_API = 'https://interests-api.parliament.uk/api/v1';
class InterestsAPI {
    async getAllMembersWithInterests() {
        try {
            const response = await axios_1.default.get(`${INTERESTS_API}/Interests`, {
                params: {
                    PublishedFrom: '2024-01-01',
                    Take: 100
                }
            });
            // Group by member and process interests
            const memberMap = new Map();
            response.data.items.forEach(interest => {
                const memberId = interest.member.memberId;
                // Initialize member if not exists
                if (!memberMap.has(memberId)) {
                    memberMap.set(memberId, {
                        id: memberId,
                        name: interest.member.nameDisplayAs,
                        party: interest.member.party,
                        house: interest.member.house,
                        earnings: [],
                        donations: []
                    });
                }
                const member = memberMap.get(memberId);
                const amount = {
                    amount: interest.value || 0,
                    registeredDate: interest.registrationDate,
                    description: interest.summary
                };
                // Categorize the interest
                if (interest.category.name.toLowerCase().includes('employment')) {
                    member.earnings.push(amount);
                }
                else if (interest.category.name.toLowerCase().includes('donation')) {
                    member.donations.push({
                        ...amount,
                        donor: interest.summary
                    });
                }
            });
            const members = Array.from(memberMap.values());
            return {
                items: members,
                totalItems: members.length
            };
        }
        catch (error) {
            console.error('Error fetching interests:', error);
            throw error;
        }
    }
}
exports.InterestsAPI = InterestsAPI;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW50ZXJlc3RzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2xpYi9hcGkvaW50ZXJlc3RzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7OztBQUFBLGtEQUEwQjtBQUcxQixNQUFNLGFBQWEsR0FBRyw0Q0FBNEMsQ0FBQztBQUVuRSxNQUFhLFlBQVk7SUFDdkIsS0FBSyxDQUFDLDBCQUEwQjtRQUM5QixJQUFJLENBQUM7WUFDSCxNQUFNLFFBQVEsR0FBRyxNQUFNLGVBQUssQ0FBQyxHQUFHLENBQXdDLEdBQUcsYUFBYSxZQUFZLEVBQUU7Z0JBQ3BHLE1BQU0sRUFBRTtvQkFDTixhQUFhLEVBQUUsWUFBWTtvQkFDM0IsSUFBSSxFQUFFLEdBQUc7aUJBQ1Y7YUFDRixDQUFDLENBQUM7WUFFSCx3Q0FBd0M7WUFDeEMsTUFBTSxTQUFTLEdBQUcsSUFBSSxHQUFHLEVBQTRCLENBQUM7WUFFdEQsUUFBUSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxFQUFFO2dCQUNyQyxNQUFNLFFBQVEsR0FBRyxRQUFRLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQztnQkFFMUMsa0NBQWtDO2dCQUNsQyxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDO29CQUM3QixTQUFTLENBQUMsR0FBRyxDQUFDLFFBQVEsRUFBRTt3QkFDdEIsRUFBRSxFQUFFLFFBQVE7d0JBQ1osSUFBSSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsYUFBYTt3QkFDbkMsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBSzt3QkFDNUIsS0FBSyxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsS0FBa0I7d0JBQ3pDLFFBQVEsRUFBRSxFQUFFO3dCQUNaLFNBQVMsRUFBRSxFQUFFO3FCQUNkLENBQUMsQ0FBQztnQkFDTCxDQUFDO2dCQUVELE1BQU0sTUFBTSxHQUFHLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFFLENBQUM7Z0JBQ3hDLE1BQU0sTUFBTSxHQUFtQjtvQkFDN0IsTUFBTSxFQUFFLFFBQVEsQ0FBQyxLQUFLLElBQUksQ0FBQztvQkFDM0IsY0FBYyxFQUFFLFFBQVEsQ0FBQyxnQkFBZ0I7b0JBQ3pDLFdBQVcsRUFBRSxRQUFRLENBQUMsT0FBTztpQkFDOUIsQ0FBQztnQkFFRiwwQkFBMEI7Z0JBQzFCLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7b0JBQ2hFLE1BQU0sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMvQixDQUFDO3FCQUFNLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFFLENBQUM7b0JBQ3JFLE1BQU0sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDO3dCQUNwQixHQUFHLE1BQU07d0JBQ1QsS0FBSyxFQUFFLFFBQVEsQ0FBQyxPQUFPO3FCQUN4QixDQUFDLENBQUM7Z0JBQ0wsQ0FBQztZQUNILENBQUMsQ0FBQyxDQUFDO1lBRUgsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQztZQUUvQyxPQUFPO2dCQUNMLEtBQUssRUFBRSxPQUFPO2dCQUNkLFVBQVUsRUFBRSxPQUFPLENBQUMsTUFBTTthQUMzQixDQUFDO1FBRUosQ0FBQztRQUFDLE9BQU8sS0FBSyxFQUFFLENBQUM7WUFDZixPQUFPLENBQUMsS0FBSyxDQUFDLDJCQUEyQixFQUFFLEtBQUssQ0FBQyxDQUFDO1lBQ2xELE1BQU0sS0FBSyxDQUFDO1FBQ2QsQ0FBQztJQUNILENBQUM7Q0FDRjtBQTFERCxvQ0EwREMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgYXhpb3MgZnJvbSAnYXhpb3MnO1xuaW1wb3J0IHsgUGFybGlhbWVudE1lbWJlciwgUGFybGlhbWVudEludGVyZXN0LCBQYWdpbmF0ZWRSZXNwb25zZSwgSW50ZXJlc3RBbW91bnQsIEhvdXNlVHlwZSB9IGZyb20gJy4uL3R5cGVzL3BhcmxpYW1lbnQnO1xuXG5jb25zdCBJTlRFUkVTVFNfQVBJID0gJ2h0dHBzOi8vaW50ZXJlc3RzLWFwaS5wYXJsaWFtZW50LnVrL2FwaS92MSc7XG5cbmV4cG9ydCBjbGFzcyBJbnRlcmVzdHNBUEkge1xuICBhc3luYyBnZXRBbGxNZW1iZXJzV2l0aEludGVyZXN0cygpOiBQcm9taXNlPFBhZ2luYXRlZFJlc3BvbnNlPFBhcmxpYW1lbnRNZW1iZXI+PiB7XG4gICAgdHJ5IHtcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0PFBhZ2luYXRlZFJlc3BvbnNlPFBhcmxpYW1lbnRJbnRlcmVzdD4+KGAke0lOVEVSRVNUU19BUEl9L0ludGVyZXN0c2AsIHtcbiAgICAgICAgcGFyYW1zOiB7XG4gICAgICAgICAgUHVibGlzaGVkRnJvbTogJzIwMjQtMDEtMDEnLFxuICAgICAgICAgIFRha2U6IDEwMFxuICAgICAgICB9XG4gICAgICB9KTtcblxuICAgICAgLy8gR3JvdXAgYnkgbWVtYmVyIGFuZCBwcm9jZXNzIGludGVyZXN0c1xuICAgICAgY29uc3QgbWVtYmVyTWFwID0gbmV3IE1hcDxzdHJpbmcsIFBhcmxpYW1lbnRNZW1iZXI+KCk7XG5cbiAgICAgIHJlc3BvbnNlLmRhdGEuaXRlbXMuZm9yRWFjaChpbnRlcmVzdCA9PiB7XG4gICAgICAgIGNvbnN0IG1lbWJlcklkID0gaW50ZXJlc3QubWVtYmVyLm1lbWJlcklkO1xuICAgICAgICBcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBtZW1iZXIgaWYgbm90IGV4aXN0c1xuICAgICAgICBpZiAoIW1lbWJlck1hcC5oYXMobWVtYmVySWQpKSB7XG4gICAgICAgICAgbWVtYmVyTWFwLnNldChtZW1iZXJJZCwge1xuICAgICAgICAgICAgaWQ6IG1lbWJlcklkLFxuICAgICAgICAgICAgbmFtZTogaW50ZXJlc3QubWVtYmVyLm5hbWVEaXNwbGF5QXMsXG4gICAgICAgICAgICBwYXJ0eTogaW50ZXJlc3QubWVtYmVyLnBhcnR5LFxuICAgICAgICAgICAgaG91c2U6IGludGVyZXN0Lm1lbWJlci5ob3VzZSBhcyBIb3VzZVR5cGUsXG4gICAgICAgICAgICBlYXJuaW5nczogW10sXG4gICAgICAgICAgICBkb25hdGlvbnM6IFtdXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBtZW1iZXIgPSBtZW1iZXJNYXAuZ2V0KG1lbWJlcklkKSE7XG4gICAgICAgIGNvbnN0IGFtb3VudDogSW50ZXJlc3RBbW91bnQgPSB7XG4gICAgICAgICAgYW1vdW50OiBpbnRlcmVzdC52YWx1ZSB8fCAwLFxuICAgICAgICAgIHJlZ2lzdGVyZWREYXRlOiBpbnRlcmVzdC5yZWdpc3RyYXRpb25EYXRlLFxuICAgICAgICAgIGRlc2NyaXB0aW9uOiBpbnRlcmVzdC5zdW1tYXJ5XG4gICAgICAgIH07XG5cbiAgICAgICAgLy8gQ2F0ZWdvcml6ZSB0aGUgaW50ZXJlc3RcbiAgICAgICAgaWYgKGludGVyZXN0LmNhdGVnb3J5Lm5hbWUudG9Mb3dlckNhc2UoKS5pbmNsdWRlcygnZW1wbG95bWVudCcpKSB7XG4gICAgICAgICAgbWVtYmVyLmVhcm5pbmdzLnB1c2goYW1vdW50KTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnRlcmVzdC5jYXRlZ29yeS5uYW1lLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoJ2RvbmF0aW9uJykpIHtcbiAgICAgICAgICBtZW1iZXIuZG9uYXRpb25zLnB1c2goe1xuICAgICAgICAgICAgLi4uYW1vdW50LFxuICAgICAgICAgICAgZG9ub3I6IGludGVyZXN0LnN1bW1hcnlcbiAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgICAgfSk7XG5cbiAgICAgIGNvbnN0IG1lbWJlcnMgPSBBcnJheS5mcm9tKG1lbWJlck1hcC52YWx1ZXMoKSk7XG4gICAgICBcbiAgICAgIHJldHVybiB7XG4gICAgICAgIGl0ZW1zOiBtZW1iZXJzLFxuICAgICAgICB0b3RhbEl0ZW1zOiBtZW1iZXJzLmxlbmd0aFxuICAgICAgfTtcblxuICAgIH0gY2F0Y2ggKGVycm9yKSB7XG4gICAgICBjb25zb2xlLmVycm9yKCdFcnJvciBmZXRjaGluZyBpbnRlcmVzdHM6JywgZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9XG59Il19