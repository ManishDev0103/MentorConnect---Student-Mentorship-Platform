import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const globalScope = typeof window !== 'undefined' ? window : globalThis;
if (typeof globalScope !== 'undefined' && typeof globalScope.global === 'undefined') {
  globalScope.global = globalScope;
}

let client = null;
let activeSubscriptions = new Map();
let socketReadyPromise = null;

export const connectChatSocket = (onConnect, onMessage, onError, onDisconnect) => {
  if (client && client.connected) {
    return Promise.resolve(client);
  }

  if (client && !client.connected && socketReadyPromise) {
    return socketReadyPromise;
  }

  const token = localStorage.getItem('token');
  const socketUrl = token
    ? `http://localhost:8080/ws?token=${encodeURIComponent(token)}`
    : 'http://localhost:8080/ws';
  const socket = new SockJS(socketUrl);

  socketReadyPromise = new Promise((resolve, reject) => {
    client = new Client({
      webSocketFactory: () => socket,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
      debug: (str) => console.log('[STOMP]', str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('WebSocket connected');
        if (onConnect) onConnect();
        resolve(client);
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame.headers['message']);
        socketReadyPromise = null;
        if (onError) onError(frame);
        reject(frame);
      },
      onWebSocketClose: () => {
        console.log('WebSocket disconnected');
        socketReadyPromise = null;
        if (onDisconnect) onDisconnect();
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error', error);
        socketReadyPromise = null;
        if (onError) onError(error);
        reject(error);
      },
    });

    client.activate();
  });

  return socketReadyPromise;
};

export const subscribeToMessages = (userId, onMessage) => {
  if (!client || !client.connected) {
    console.warn('Chat socket not connected yet');
    return null;
  }

  const key = `user-${userId}`;
  if (activeSubscriptions.has(key)) {
    return activeSubscriptions.get(key);
  }

  const subscription = client.subscribe(`/user/queue/messages`, (message) => {
    try {
      const payload = JSON.parse(message.body);
      if (onMessage) onMessage(payload);
    } catch (error) {
      console.error('Failed to parse incoming chat message', error);
    }
  });

  activeSubscriptions.set(key, subscription);
  return subscription;
};

export const disconnectChatSocket = () => {
  activeSubscriptions.clear();
  socketReadyPromise = null;
  if (client) {
    client.deactivate();
    client = null;
  }
};

export const sendChatMessage = async (messageData) => {
  if (!client) {
    await connectChatSocket();
  }

  if (!client || !client.connected) {
    if (socketReadyPromise) {
      await socketReadyPromise;
    }
  }

  if (!client || !client.connected) {
    throw new Error('Chat socket is not connected');
  }

  client.publish({
    destination: '/app/chat.send',
    body: JSON.stringify(messageData),
  });
};
