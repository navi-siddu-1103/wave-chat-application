export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
}

export interface Chat {
  id: string;
  type: 'group' | 'direct';
  name: string;
  participants?: User[];
  messages: Message[];
  avatar?: string;
  unread?: number;
}
