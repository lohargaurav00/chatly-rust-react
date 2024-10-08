export type sendMessageT = {
  message: string;
  room_id: string;
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
