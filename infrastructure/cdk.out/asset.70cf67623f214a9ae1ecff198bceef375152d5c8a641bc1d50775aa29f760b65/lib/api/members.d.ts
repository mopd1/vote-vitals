interface Member {
    id: string;
    name: string;
    party: string;
    house: 'Commons' | 'Lords';
    earnings: {
        amount: number;
        registeredDate: string;
        description: string;
    }[];
    donations: {
        amount: number;
        registeredDate: string;
        donor: string;
    }[];
}
export declare const membersService: {
    getMembersWithInterests(): Promise<Member[]>;
    updateMemberInterests(member: Member): Promise<void>;
};
export {};
