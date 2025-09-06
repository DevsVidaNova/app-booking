export type Booking = {
    id: string;
    description: string;
    room: any;
    date: string | null;
    startTime: string;
    endTime: string;
    repeat: string | null;
    dayRepeat: number | null;
    userId: string;
    user_profiles?: any;
    rooms?: any;
};

export type CreateBookingInput = {
    description: string;
    roomId: string;
    date?: string | null;
    startTime: string;
    endTime: string;
    repeat?: string | null;
    dayRepeat?: number | null;
};