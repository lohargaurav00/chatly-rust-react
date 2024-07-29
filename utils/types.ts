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
