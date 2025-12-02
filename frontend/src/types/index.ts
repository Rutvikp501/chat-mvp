export type User = {
  id: string;
  username: string;
  displayName?: string;
  preferredLang?: string;
  avatar?: string; // s3 key
};

export type Conversation = {
  _id: string;
  title?: string;
  isGroup?: boolean;
  members: string[]; // user ids
};

export type Attachment = {
  key: string;
  filename?: string;
  type?: string;
};

export type Message = {
  _id: string;
  conversationId: string;
  sender: string;
  text?: string;
  translations?: Record<string, string>;
  createdAt: string;
  attachments?: Attachment[];
};

type UserState = {
  user: User | null;
  setUser: (user: User | null) => void;
};
