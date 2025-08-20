export interface User {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

export interface Reaction {
  emoji: string;
  users: User[];
}

export interface Message {
  id: string;
  sender: User;
  content: string;
  timestamp: string;
  reactions?: Reaction[];
}

export interface Chat {
  id: string;
  type: 'group' | 'direct';
  name: string;
  participants?: User[];
  messages: Message[];
  avatar?: string;
  unread?: number;
  pinnedMessageIds?: string[];
}
