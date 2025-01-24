export declare const config: {
    port: string | number;
    aws: {
        region: string;
        dynamodb: {
            billsTable: string;
            membersTable: string;
        };
        s3: {
            cacheBucket: string;
        };
    };
    api: {
        parliamentBills: string;
        parliamentMembers: string;
    };
    cors: {
        origin: string[];
        methods: string[];
        allowedHeaders: string[];
    };
};
