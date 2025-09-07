export interface RoomInput {
    name: string;
    size?: number;
    description?: string;
    exclusive?: boolean;
    status?: boolean;
  }
  
  export interface UpdateRoomInput {
    id: string;
    updates: Partial<RoomInput>;
  }