export type sendMessageT = {
  message: string;
  room_id: string;
};

export type receivedMessageT = {
  message: string;
  // sender: string;
  id: number;
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
  messages: receivedMessageT[];
}

export type UserT = {
  id: string | number;
  name: string;
  email: string;
  user_name: string;
  profile_photo: string;
};
