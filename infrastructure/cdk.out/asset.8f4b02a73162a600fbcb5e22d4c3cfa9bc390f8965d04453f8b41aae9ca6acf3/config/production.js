"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    port: process.env.PORT || 3001,
    aws: {
        region: process.env.AWS_REGION || 'eu-west-2',
        dynamodb: {
            billsTable: process.env.DYNAMODB_BILLS_TABLE || 'ukpol-dev-bills-table',
            membersTable: process.env.DYNAMODB_MEMBERS_TABLE || 'ukpol-dev-members-table'
        },
        s3: {
            cacheBucket: process.env.S3_CACHE_BUCKET || 'ukpol-dev-cache-bucket-528757790199'
        }
    },
    api: {
        parliamentBills: 'https://bills-api.parliament.uk/api/v1',
        parliamentMembers: 'https://members-api.parliament.uk/api/v1'
    },
    cors: {
        origin: [
            'http://localhost:3000',
            'https://www.votevitals.com',
            'https://votevitals.com'
        ],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZHVjdGlvbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25maWcvcHJvZHVjdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFBYSxRQUFBLE1BQU0sR0FBRztJQUNwQixJQUFJLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLElBQUksSUFBSTtJQUM5QixHQUFHLEVBQUU7UUFDSCxNQUFNLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLElBQUksV0FBVztRQUM3QyxRQUFRLEVBQUU7WUFDUixVQUFVLEVBQUUsT0FBTyxDQUFDLEdBQUcsQ0FBQyxvQkFBb0IsSUFBSSx1QkFBdUI7WUFDdkUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsc0JBQXNCLElBQUkseUJBQXlCO1NBQzlFO1FBQ0QsRUFBRSxFQUFFO1lBQ0YsV0FBVyxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsZUFBZSxJQUFJLHFDQUFxQztTQUNsRjtLQUNGO0lBQ0QsR0FBRyxFQUFFO1FBQ0gsZUFBZSxFQUFFLHdDQUF3QztRQUN6RCxpQkFBaUIsRUFBRSwwQ0FBMEM7S0FDOUQ7SUFDRCxJQUFJLEVBQUU7UUFDSixNQUFNLEVBQUU7WUFDTix1QkFBdUI7WUFDdkIsNEJBQTRCO1lBQzVCLHdCQUF3QjtTQUN6QjtRQUNELE9BQU8sRUFBRSxDQUFDLEtBQUssRUFBRSxNQUFNLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxTQUFTLENBQUM7UUFDcEQsY0FBYyxFQUFFLENBQUMsY0FBYyxFQUFFLGVBQWUsQ0FBQztLQUNsRDtDQUNGLENBQUEiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgY29uc3QgY29uZmlnID0ge1xuICBwb3J0OiBwcm9jZXNzLmVudi5QT1JUIHx8IDMwMDEsXG4gIGF3czoge1xuICAgIHJlZ2lvbjogcHJvY2Vzcy5lbnYuQVdTX1JFR0lPTiB8fCAnZXUtd2VzdC0yJyxcbiAgICBkeW5hbW9kYjoge1xuICAgICAgYmlsbHNUYWJsZTogcHJvY2Vzcy5lbnYuRFlOQU1PREJfQklMTFNfVEFCTEUgfHwgJ3VrcG9sLWRldi1iaWxscy10YWJsZScsXG4gICAgICBtZW1iZXJzVGFibGU6IHByb2Nlc3MuZW52LkRZTkFNT0RCX01FTUJFUlNfVEFCTEUgfHwgJ3VrcG9sLWRldi1tZW1iZXJzLXRhYmxlJ1xuICAgIH0sXG4gICAgczM6IHtcbiAgICAgIGNhY2hlQnVja2V0OiBwcm9jZXNzLmVudi5TM19DQUNIRV9CVUNLRVQgfHwgJ3VrcG9sLWRldi1jYWNoZS1idWNrZXQtNTI4NzU3NzkwMTk5J1xuICAgIH1cbiAgfSxcbiAgYXBpOiB7XG4gICAgcGFybGlhbWVudEJpbGxzOiAnaHR0cHM6Ly9iaWxscy1hcGkucGFybGlhbWVudC51ay9hcGkvdjEnLFxuICAgIHBhcmxpYW1lbnRNZW1iZXJzOiAnaHR0cHM6Ly9tZW1iZXJzLWFwaS5wYXJsaWFtZW50LnVrL2FwaS92MSdcbiAgfSxcbiAgY29yczoge1xuICAgIG9yaWdpbjogW1xuICAgICAgJ2h0dHA6Ly9sb2NhbGhvc3Q6MzAwMCcsXG4gICAgICAnaHR0cHM6Ly93d3cudm90ZXZpdGFscy5jb20nLFxuICAgICAgJ2h0dHBzOi8vdm90ZXZpdGFscy5jb20nXG4gICAgXSxcbiAgICBtZXRob2RzOiBbJ0dFVCcsICdQT1NUJywgJ1BVVCcsICdERUxFVEUnLCAnT1BUSU9OUyddLFxuICAgIGFsbG93ZWRIZWFkZXJzOiBbJ0NvbnRlbnQtVHlwZScsICdBdXRob3JpemF0aW9uJ11cbiAgfVxufSJdfQ==