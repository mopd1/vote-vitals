"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.membersService = void 0;
const aws_sdk_1 = require("aws-sdk");
const axios_1 = __importDefault(require("axios"));
const dynamoDB = new aws_sdk_1.DynamoDB.DocumentClient();
const MEMBERS_TABLE = process.env.DYNAMODB_MEMBERS_TABLE || '';
const PARLIAMENT_API_BASE = 'https://members-api.parliament.uk/api';
exports.membersService = {
    async getMembers(params = {}) {
        try {
            let filterExpression = '';
            const expressionValues = {};
            if (params.party) {
                filterExpression += 'party = :party';
                expressionValues[':party'] = params.party;
            }
            if (params.house) {
                if (filterExpression)
                    filterExpression += ' AND ';
                filterExpression += 'house = :house';
                expressionValues[':house'] = params.house;
            }
            const dbParams = {
                TableName: MEMBERS_TABLE,
                Limit: params.limit || 20,
                ...(filterExpression && {
                    FilterExpression: filterExpression,
                    ExpressionAttributeValues: expressionValues
                })
            };
            const result = await dynamoDB.scan(dbParams).promise();
            return {
                items: (result.Items || []),
                totalItems: result.Count || 0,
                hasMore: !!result.LastEvaluatedKey
            };
        }
        catch (error) {
            console.error('Error fetching members:', error);
            throw error;
        }
    },
    async getMemberById(id) {
        try {
            const result = await dynamoDB.get({
                TableName: MEMBERS_TABLE,
                Key: {
                    PK: `MEMBER#${id}`,
                    SK: 'DETAILS'
                }
            }).promise();
            return result.Item || null;
        }
        catch (error) {
            console.error('Error fetching member:', error);
            throw error;
        }
    },
    async getMemberEarnings() {
        try {
            // Fetch all Commons members with interests
            const response = await axios_1.default.get(`${PARLIAMENT_API_BASE}/Members/Search?House=Commons&IsCurrentMember=true`);
            const members = response.data.items || [];
            const memberEarnings = [];
            // Process each member's interests
            for (const member of members) {
                const interestsResponse = await axios_1.default.get(`${PARLIAMENT_API_BASE}/Members/${member.value.id}/RegisteredInterests`);
                const interests = interestsResponse.data.items || [];
                let totalEarnings = 0;
                // Calculate total earnings from interests
                interests.forEach((interest) => {
                    if (interest.category === 1) { // Employment and earnings
                        const amount = parseFloat(interest.valueAmount?.replace(/[^0-9.-]+/g, '') || '0');
                        totalEarnings += amount;
                    }
                });
                if (totalEarnings > 0) {
                    memberEarnings.push({
                        memberId: member.value.id,
                        name: `${member.value.nameDisplayAs}`,
                        party: member.value.latestParty?.name || 'Independent',
                        constituency: member.value.latestHouseMembership?.membershipFrom,
                        totalEarnings,
                        interests: interests.map((interest) => ({
                            category: interest.category,
                            description: interest.description,
                            registeredLate: interest.registeredLate,
                            dateCreated: interest.dateCreated,
                            valueAmount: parseFloat(interest.valueAmount?.replace(/[^0-9.-]+/g, '') || '0'),
                            valueDescription: interest.valueDescription
                        }))
                    });
                }
            }
            // Sort by total earnings descending
            return memberEarnings.sort((a, b) => b.totalEarnings - a.totalEarnings);
        }
        catch (error) {
            console.error('Error fetching member earnings:', error);
            throw error;
        }
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWVtYmVycy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uL3NyYy9saWIvYXBpL21lbWJlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEscUNBQW1DO0FBRW5DLGtEQUEwQjtBQUUxQixNQUFNLFFBQVEsR0FBRyxJQUFJLGtCQUFRLENBQUMsY0FBYyxFQUFFLENBQUM7QUFDL0MsTUFBTSxhQUFhLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxzQkFBc0IsSUFBSSxFQUFFLENBQUM7QUFDL0QsTUFBTSxtQkFBbUIsR0FBRyx1Q0FBdUMsQ0FBQztBQWlDdkQsUUFBQSxjQUFjLEdBQUc7SUFDNUIsS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFzQixFQUFFO1FBQ3ZDLElBQUksQ0FBQztZQUNILElBQUksZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1lBQzFCLE1BQU0sZ0JBQWdCLEdBQXdCLEVBQUUsQ0FBQztZQUVqRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEVBQUUsQ0FBQztnQkFDakIsZ0JBQWdCLElBQUksZ0JBQWdCLENBQUM7Z0JBQ3JDLGdCQUFnQixDQUFDLFFBQVEsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxLQUFLLENBQUM7WUFDNUMsQ0FBQztZQUVELElBQUksTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO2dCQUNqQixJQUFJLGdCQUFnQjtvQkFBRSxnQkFBZ0IsSUFBSSxPQUFPLENBQUM7Z0JBQ2xELGdCQUFnQixJQUFJLGdCQUFnQixDQUFDO2dCQUNyQyxnQkFBZ0IsQ0FBQyxRQUFRLENBQUMsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDO1lBQzVDLENBQUM7WUFFRCxNQUFNLFFBQVEsR0FBc0M7Z0JBQ2xELFNBQVMsRUFBRSxhQUFhO2dCQUN4QixLQUFLLEVBQUUsTUFBTSxDQUFDLEtBQUssSUFBSSxFQUFFO2dCQUN6QixHQUFHLENBQUMsZ0JBQWdCLElBQUk7b0JBQ3RCLGdCQUFnQixFQUFFLGdCQUFnQjtvQkFDbEMseUJB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Q0FBQyxxQkFBcUIsRUFBRSxjQUFjO3dCQUNoRSxhQUFhO3dCQUNiLFNBQVMsRUFBRSxTQUFTLENBQUMsR0FBRyxDQUFDLENBQUMsUUFBYSxFQUFFLEVBQUUsQ0FBQyxDQUFDOzRCQUMzQyxRQUFRLEVBQUUsUUFBUSxDQUFDLFFBQVE7NEJBQzNCLFdBQVcsRUFBRSxRQUFRLENBQUMsV0FBVzs0QkFDakMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxjQUFjOzRCQUN2QyxXQUFXLEVBQUUsUUFBUSxDQUFDLFdBQVc7NEJBQ2pDLFdBQVcsRUFBRSxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsWUFBWSxFQUFFLEVBQUUsQ0FBQyxJQUFJLEdBQUcsQ0FBQzs0QkFDL0UsZ0JBQWdCLEVBQUUsUUFBUSxDQUFDLGdCQUFnQjt5QkFDNUMsQ0FBQyxDQUFDO3FCQUNKLENBQUMsQ0FBQztnQkFDTCxDQUFDO1lBQ0gsQ0FBQztZQUVELG9DQUFvQztZQUNwQyxPQUFPLGNBQWMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsYUFBYSxHQUFHLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUMxRSxDQUFDO1FBQUMsT0FBTyxLQUFLLEVBQUUsQ0FBQztZQUNmLE9BQU8sQ0FBQyxLQUFLLENBQUMsaUNBQWlDLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDeEQsTUFBTSxLQUFLLENBQUM7UUFDZCxDQUFDO0lBQ0gsQ0FBQztDQUNGLENBQUMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBEeW5hbW9EQiB9IGZyb20gJ2F3cy1zZGsnO1xuaW1wb3J0IHsgUGFybGlhbWVudE1lbWJlciwgUGFnaW5hdGVkUmVzcG9uc2UgfSBmcm9tICcuLi90eXBlcy9wYXJsaWFtZW50JztcbmltcG9ydCBheGlvcyBmcm9tICdheGlvcyc7XG5cbmNvbnN0IGR5bmFtb0RCID0gbmV3IER5bmFtb0RCLkRvY3VtZW50Q2xpZW50KCk7XG5jb25zdCBNRU1CRVJTX1RBQkxFID0gcHJvY2Vzcy5lbnYuRFlOQU1PREJfTUVNQkVSU19UQUJMRSB8fCAnJztcbmNvbnN0IFBBUkxJQU1FTlRfQVBJX0JBU0UgPSAnaHR0cHM6Ly9tZW1iZXJzLWFwaS5wYXJsaWFtZW50LnVrL2FwaSc7XG5cbmludGVyZmFjZSBRdWVyeVBhcmFtcyB7XG4gIHBhcnR5Pzogc3RyaW5nO1xuICBob3VzZT86ICdDb21tb25zJyB8ICdMb3Jkcyc7XG4gIHBhZ2U/OiBudW1iZXI7XG4gIGxpbWl0PzogbnVtYmVyO1xufVxuXG5pbnRlcmZhY2UgTWVtYmVyc1Jlc3BvbnNlIHtcbiAgaXRlbXM6IFBhcmxpYW1lbnRNZW1iZXJbXTtcbiAgdG90YWxJdGVtczogbnVtYmVyO1xuICBoYXNNb3JlOiBib29sZWFuO1xufVxuXG5pbnRlcmZhY2UgTWVtYmVySW50ZXJlc3Qge1xuICBjYXRlZ29yeTogc3RyaW5nO1xuICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICByZWdpc3RlcmVkTGF0ZTogYm9vbGVhbjtcbiAgZGF0ZUNyZWF0ZWQ6IHN0cmluZztcbiAgdmFsdWVBbW91bnQ/OiBudW1iZXI7XG4gIHZhbHVlRGVzY3JpcHRpb24/OiBzdHJpbmc7XG59XG5cbmludGVyZmFjZSBNZW1iZXJFYXJuaW5ncyB7XG4gIG1lbWJlcklkOiBzdHJpbmc7XG4gIG5hbWU6IHN0cmluZztcbiAgcGFydHk6IHN0cmluZztcbiAgY29uc3RpdHVlbmN5Pzogc3RyaW5nO1xuICB0b3RhbEVhcm5pbmdzOiBudW1iZXI7XG4gIGludGVyZXN0czogTWVtYmVySW50ZXJlc3RbXTtcbn1cblxuZXhwb3J0IGNvbnN0IG1lbWJlcnNTZXJ2aWNlID0ge1xuICBhc3luYyBnZXRNZW1iZXJzKHBhcmFtczogUXVlcnlQYXJhbXMgPSB7fSk6IFByb21pc2U8TWVtYmVyc1Jlc3BvbnNlPiB7XG4gICAgdHJ5IHtcbiAgICAgIGxldCBmaWx0ZXJFeHByZXNzaW9uID0gJyc7XG4gICAgICBjb25zdCBleHByZXNzaW9uVmFsdWVzOiBSZWNvcmQ8c3RyaW5nLCBhbnk+ID0ge307XG5cbiAgICAgIGlmIChwYXJhbXMucGFydHkpIHtcbiAgICAgICAgZmlsdGVyRXhwcmVzc2lvbiArPSAncGFydHkgPSA6cGFydHknO1xuICAgICAgICBleHByZXNzaW9uVmFsdWVzWyc6cGFydHknXSA9IHBhcmFtcy5wYXJ0eTtcbiAgICAgIH1cblxuICAgICAgaWYgKHBhcmFtcy5ob3VzZSkge1xuICAgICAgICBpZiAoZmlsdGVyRXhwcmVzc2lvbikgZmlsdGVyRXhwcmVzc2lvbiArPSAnIEFORCAnO1xuICAgICAgICBmaWx0ZXJFeHByZXNzaW9uICs9ICdob3VzZSA9IDpob3VzZSc7XG4gICAgICAgIGV4cHJlc3Npb25WYWx1ZXNbJzpob3VzZSddID0gcGFyYW1zLmhvdXNlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBkYlBhcmFtczogRHluYW1vREIuRG9jdW1lbnRDbGllbnQuU2NhbklucHV0ID0ge1xuICAgICAgICBUYWJsZU5hbWU6IE1FTUJFUlNfVEFCTEUsXG4gICAgICAgIExpbWl0OiBwYXJhbXMubGltaXQgfHwgMjAsXG4gICAgICAgIC4uLihmaWx0ZXJFeHByZXNzaW9uICYmIHtcbiAgICAgICAgICBGaWx0ZXJFeHByZXNzaW9uOiBmaWx0ZXJFeHByZXNzaW9uLFxuICAgICAgICAgIEV4cHJlc3Npb25BdHRyaWJ1dGVWYWx1ZXM6IGV4cHJlc3Npb25WYWx1ZXNcbiAgICAgICAgfSlcbiAgICAgIH07XG5cbiAgICAgIGNvbnN0IHJlc3VsdCA9IGF3YWl0IGR5bmFtb0RCLnNjYW4oZGJQYXJhbXMpLnByb21pc2UoKTtcblxuICAgICAgcmV0dXJuIHtcbiAgICAgICAgaXRlbXM6IChyZXN1bHQuSXRlbXMgfHwgW10pIGFzIFBhcmxpYW1lbnRNZW1iZXJbXSxcbiAgICAgICAgdG90YWxJdGVtczogcmVzdWx0LkNvdW50IHx8IDAsXG4gICAgICAgIGhhc01vcmU6ICEhcmVzdWx0Lkxhc3RFdmFsdWF0ZWRLZXlcbiAgICAgIH07XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIG1lbWJlcnM6JywgZXJyb3IpO1xuICAgICAgdGhyb3cgZXJyb3I7XG4gICAgfVxuICB9LFxuXG4gIGFzeW5jIGdldE1lbWJlckJ5SWQoaWQ6IHN0cmluZyk6IFByb21pc2U8UGFybGlhbWVudE1lbWJlciB8IG51bGw+IHtcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzdWx0ID0gYXdhaXQgZHluYW1vREIuZ2V0KHtcbiAgICAgICAgVGFibGVOYW1lOiBNRU1CRVJTX1RBQkxFLFxuICAgICAgICBLZXk6IHtcbiAgICAgICAgICBQSzogYE1FTUJFUiMke2lkfWAsXG4gICAgICAgICAgU0s6ICdERVRBSUxTJ1xuICAgICAgICB9XG4gICAgICB9KS5wcm9taXNlKCk7XG5cbiAgICAgIHJldHVybiByZXN1bHQuSXRlbSBhcyBQYXJsaWFtZW50TWVtYmVyIHx8IG51bGw7XG4gICAgfSBjYXRjaCAoZXJyb3IpIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoJ0Vycm9yIGZldGNoaW5nIG1lbWJlcjonLCBlcnJvcik7XG4gICAgICB0aHJvdyBlcnJvcjtcbiAgICB9XG4gIH0sXG5cbiAgYXN5bmMgZ2V0TWVtYmVyRWFybmluZ3MoKTogUHJvbWlzZTxNZW1iZXJFYXJuaW5nc1tdPiB7XG4gICAgdHJ5IHtcbiAgICAgIC8vIEZldGNoIGFsbCBDb21tb25zIG1lbWJlcnMgd2l0aCBpbnRlcmVzdHNcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KGAke1BBUkxJQU1FTlRfQVBJX0JBU0V9L01lbWJlcnMvU2VhcmNoP0hvdXNlPUNvbW1vbnMmSXNDdXJyZW50TWVtYmVyPXRydWVgKTtcbiAgICAgIGNvbnN0IG1lbWJlcnMgPSByZXNwb25zZS5kYXRhLml0ZW1zIHx8IFtdO1xuICAgICAgXG4gICAgICBjb25zdCBtZW1iZXJFYXJuaW5nczogTWVtYmVyRWFybmluZ3NbXSA9IFtdO1xuXG4gICAgICAvLyBQcm9jZXNzIGVhY2ggbWVtYmVyJ3MgaW50ZXJlc3RzXG4gICAgICBmb3IgKGNvbnN0IG1lbWJlciBvZiBtZW1iZXJzKSB7XG4gICAgICAgIGNvbnN0IGludGVyZXN0c1Jlc3BvbnNlID0gYXdhaXQgYXhpb3MuZ2V0KFxuICAgICAgICAgIGAke1BBUkxJQU1FTlRfQVBJX0JBU0V9L01lbWJlcnMvJHttZW1iZXIudmFsdWUuaWR9L1JlZ2lzdGVyZWRJbnRlcmVzdHNgXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgaW50ZXJlc3RzID0gaW50ZXJlc3RzUmVzcG9uc2UuZGF0YS5pdGVtcyB8fCBbXTtcbiAgICAgICAgbGV0IHRvdGFsRWFybmluZ3MgPSAwO1xuXG4gICAgICAgIC8vIENhbGN1bGF0ZSB0b3RhbCBlYXJuaW5ncyBmcm9tIGludGVyZXN0c1xuICAgICAgICBpbnRlcmVzdHMuZm9yRWFjaCgoaW50ZXJlc3Q6IGFueSkgPT4ge1xuICAgICAgICAgIGlmIChpbnRlcmVzdC5jYXRlZ29yeSA9PT0gMSkgeyAvLyBFbXBsb3ltZW50IGFuZCBlYXJuaW5nc1xuICAgICAgICAgICAgY29uc3QgYW1vdW50ID0gcGFyc2VGbG9hdChpbnRlcmVzdC52YWx1ZUFtb3VudD8ucmVwbGFjZSgvW14wLTkuLV0rL2csICcnKSB8fCAnMCcpO1xuICAgICAgICAgICAgdG90YWxFYXJuaW5ncyArPSBhbW91bnQ7XG4gICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBpZiAodG90YWxFYXJuaW5ncyA+IDApIHtcbiAgICAgICAgICBtZW1iZXJFYXJuaW5ncy5wdXNoKHtcbiAgICAgICAgICAgIG1lbWJlcklkOiBtZW1iZXIudmFsdWUuaWQsXG4gICAgICAgICAgICBuYW1lOiBgJHttZW1iZXIudmFsdWUubmFtZURpc3BsYXlBc31gLFxuICAgICAgICAgICAgcGFydHk6IG1lbWJlci52YWx1ZS5sYXRlc3RQYXJ0eT8ubmFtZSB8fCAnSW5kZXBlbmRlbnQnLFxuICAgICAgICAgICAgY29uc3RpdHVlbmN5OiBtZW1iZXIudmFsdWUubGF0ZXN0SG91c2VNZW1iZXJzaGlwPy5tZW1iZXJzaGlwRnJvbSxcbiAgICAgICAgICAgIHRvdGFsRWFybmluZ3MsXG4gICAgICAgICAgICBpbnRlcmVzdHM6IGludGVyZXN0cy5tYXAoKGludGVyZXN0OiBhbnkpID0+ICh7XG4gICAgICAgICAgICAgIGNhdGVnb3J5OiBpbnRlcmVzdC5jYXRlZ29yeSxcbiAgICAgICAgICAgICAgZGVzY3JpcHRpb246IGludGVyZXN0LmRlc2NyaXB0aW9uLFxuICAgICAgICAgICAgICByZWdpc3RlcmVkTGF0ZTogaW50ZXJlc3QucmVnaXN0ZXJlZExhdGUsXG4gICAgICAgICAgICAgIGRhdGVDcmVhdGVkOiBpbnRlcmVzdC5kYXRlQ3JlYXRlZCxcbiAgICAgICAgICAgICAgdmFsdWVBbW91bnQ6IHBhcnNlRmxvYXQoaW50ZXJlc3QudmFsdWVBbW91bnQ/LnJlcGxhY2UoL1teMC05Li1dKy9nLCAnJykgfHwgJzAnKSxcbiAgICAgICAgICAgICAgdmFsdWVEZXNjcmlwdGlvbjogaW50ZXJlc3QudmFsdWVEZXNjcmlwdGlvblxuICAgICAgICAgICAgfSkpXG4gICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gU29ydCBieSB0b3RhbCBlYXJuaW5ncyBkZXNjZW5kaW5nXG4gICAgICByZXR1cm4gbWVtYmVyRWFybmluZ3Muc29ydCgoYSwgYikgPT4gYi50b3RhbEVhcm5pbmdzIC0gYS50b3RhbEVhcm5pbmdzKTtcbiAgICB9IGNhdGNoIChlcnJvcikge1xuICAgICAgY29uc29sZS5lcnJvcignRXJyb3IgZmV0Y2hpbmcgbWVtYmVyIGVhcm5pbmdzOicsIGVycm9yKTtcbiAgICAgIHRocm93IGVycm9yO1xuICAgIH1cbiAgfVxufTsiXX0=