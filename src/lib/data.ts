import type { User, Chat } from './types';

export const users: User[] = [
  { id: 'user1', name: 'You', avatar: 'https://placehold.co/40x40.png', online: true },
  { id: 'user2', name: 'Alice', avatar: 'https://placehold.co/40x40.png', online: true },
  { id: 'user3', name: 'Bob', avatar: 'https://placehold.co/40x40.png', online: false },
  { id: 'user4', name: 'Charlie', avatar: 'https://placehold.co/40x40.png', online: true },
  { id: 'user5', name: 'David', avatar: 'https://placehold.co/40x40.png', online: false },
];

export const chats: Chat[] = [
  {
    id: 'chat1',
    type: 'group',
    name: '#general',
    avatar: 'https://placehold.co/40x40.png',
    unread: 2,
    pinnedMessageIds: ['msg4'],
    messages: [
      { id: 'msg1', sender: users[1], content: 'Hey everyone! How is it going?', timestamp: '10:00 AM', reactions: [{ emoji: '👋', users: [users[2], users[3]] }] },
      { id: 'msg2', sender: users[2], content: 'Hi Alice! I am doing great. Just finished the quarterly report.', timestamp: '10:01 AM', reactions: [{ emoji: '👍', users: [users[1]] }] },
      { id: 'msg3', sender: users[3], content: 'Morning! Anyone has a link to the latest design mocks?', timestamp: '10:02 AM', reactions: [] },
      { id: 'msg4', sender: users[1], content: 'Sure, here it is: https://example.com/designs', timestamp: '10:03 AM', reactions: [{ emoji: '❤️', users: [users[0], users[3]] }] },
      { id: 'msg5', sender: users[0], content: 'Thanks for sharing, Alice!', timestamp: '10:05 AM', reactions: [] },
    ],
  },
  {
    id: 'chat2',
    type: 'direct',
    name: 'Alice',
    participants: [users[0], users[1]],
    avatar: users[1].avatar,
    messages: [
      { id: 'msg6', sender: users[1], content: 'Hey, do you have a minute to review my PR?', timestamp: '11:30 AM', reactions: [] },
      { id: 'msg7', sender: users[0], content: 'Sure, send it over.', timestamp: '11:31 AM', reactions: [] },
    ],
  },
  {
    id: 'chat3',
    type: 'group',
    name: '#design',
    avatar: 'https://placehold.co/40x40.png',
    messages: [
      { id: 'msg8', sender: users[3], content: 'I have updated the color palette. Let me know what you think.', timestamp: 'Yesterday', reactions: [] },
    ],
  },
  {
    id: 'chat4',
    type: 'direct',
    name: 'Charlie',
    participants: [users[0], users[3]],
    avatar: users[3].avatar,
    unread: 1,
    messages: [
        { id: 'msg9', sender: users[3], content: 'Can we sync up about the new feature tomorrow?', timestamp: 'Yesterday', reactions: [] },
    ]
  }
];
