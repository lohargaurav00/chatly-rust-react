export type sendMessageT = {
  message: string;
  roomId: string;
};

export type receivedMessageT = {
  message: string;
  sender: string;
  time: string;
};
