export type Booking = {
    id: string;
    description: string;
    room: any;
    date: string | null;
    start_time: string;
    end_time: string;
    repeat: string | null;
    day_repeat: number | null;
    user_id: string;
    user_profiles?: any;
    rooms?: any;
};

export type CreateBookingInput = {
    description: string;
    room?: string | number;
    room_id?: string | number;
    date?: string | null;
    start_time: string;
    end_time: string;
    repeat?: string | null;
    day_repeat?: number | null;
};