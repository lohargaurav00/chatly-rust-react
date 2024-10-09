export type sendMessageT = {
  message: string;
  room_id: string;
  sent_by: string;
};

export type ReceiveMessageT = {
  message: string;
  sender: UserT;
  id: number;
  room_id: string | number;
  time: string;
};

export type GroupT = {
  id: string | number;
  name: string;
  description?: string;
  group_photo?: string;
};

export interface GroupDetailT extends GroupT {
  members: UserT[];
  messages: ReceiveMessageT[];
}

export type UserT = {
  id: string | number;
  name: string;
  email: string;
  user_name: string;
  image: string;
};

export interface RoomMessage {
  id: bigint;
  message: string;
  room_id: number;
  sent_by: string;
  created_at: bigint;
  updated_at?: bigint | null;
  message_type: string;
  is_read?: boolean;
  is_edited: boolean;
  reply_to?: bigint | null;
  deleted_at?: bigint | null;
  status: number;
}
