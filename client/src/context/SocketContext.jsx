import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const { user, refreshUser } = useAuth();
  const [socket, setSocket] = useState(null);
  const [liveNotifications, setLiveNotifications] = useState([]);
  const [messages, setMessages] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);

  useEffect(() => {
    if (!user) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
      }
      return;
    }

    // Initialize socket connection
    // Points to the relative root (proxied to 5000 in Vite or direct localhost)
    const newSocket = io(window.location.origin, {
      autoConnect: true,
      transports: ['websocket', 'polling']
    });

    setSocket(newSocket);

    // Register user
    newSocket.emit('join_user', { userId: user.id });

    // Listeners
    newSocket.on('booking_request_received', (data) => {
      pushNotification('New Ride Request!', `${data.passengerName} has requested a seat.`);
      refreshUser();
    });

    newSocket.on('booking_status_updated', (data) => {
      pushNotification('Booking Update', `Your booking status is now: ${data.status.toUpperCase()}`);
      refreshUser();
    });

    newSocket.on('receive_message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      if (activeRoom !== msg.chatRoom) {
        pushNotification(`Message from ${msg.senderName}`, msg.content);
      }
    });

    newSocket.on('seats_updated', (data) => {
      // Event logic to refresh local views if seats change in real-time
      console.log(`[Socket] Seats update: Ride ${data.rideId} now has ${data.availableSeats} seats.`);
    });

    newSocket.on('dispute_raised', (data) => {
      if (user.role === 'admin') {
        pushNotification('Admin Alert: Dispute Raised', `Dispute on Booking ${data.bookingRef}.`);
      }
    });

    return () => {
      newSocket.disconnect();
    };
  }, [user]);

  const pushNotification = (title, message) => {
    const newNotif = {
      id: 'live_' + Date.now(),
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    };
    setLiveNotifications((prev) => [newNotif, ...prev]);

    // Also trigger system browser notification if permitted
    if (Notification.permission === 'granted') {
      new Notification(title, { body: message });
    }
  };

  const joinRoom = (roomId) => {
    if (socket) {
      socket.emit('join_room', { roomId });
    }
    setActiveRoom(roomId);
    
    // Seed messages from LocalStorage if in mock mode
    const allMsgs = JSON.parse(localStorage.getItem('rx_messages') || '[]');
    const roomMsgs = allMsgs.filter(m => m.chatRoom === roomId);
    setMessages(roomMsgs);
  };

  const sendMessage = (roomId, content) => {
    if (!user) return;

    const newMsg = {
      id: 'msg_' + Date.now(),
      chatRoom: roomId,
      senderId: user.id,
      senderName: user.name,
      content,
      createdAt: new Date().toISOString()
    };

    // If socket is connected, emit event
    if (socket && socket.connected) {
      socket.emit('send_message', newMsg);
    } else {
      // Save locally to Mock DB
      const allMsgs = JSON.parse(localStorage.getItem('rx_messages') || '[]');
      allMsgs.push(newMsg);
      localStorage.setItem('rx_messages', JSON.stringify(allMsgs));
      setMessages((prev) => [...prev, newMsg]);

      // Simulate driver automatic reply after 3 seconds for mock engagement!
      if (user.role === 'passenger') {
        setTimeout(() => {
          const autoReply = {
            id: 'msg_reply_' + Date.now(),
            chatRoom: roomId,
            senderId: 'user_driver_1',
            senderName: 'Arjun Reddy',
            content: 'Hello! I got your message. Looking forward to our trip together.',
            createdAt: new Date().toISOString()
          };
          const updatedMsgs = JSON.parse(localStorage.getItem('rx_messages') || '[]');
          updatedMsgs.push(autoReply);
          localStorage.setItem('rx_messages', JSON.stringify(updatedMsgs));
          setMessages((prev) => [...prev, autoReply]);
          pushNotification('Message from Arjun Reddy', autoReply.content);
        }, 3000);
      }
    }
  };

  const requestNotificationPermission = () => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        liveNotifications,
        messages,
        joinRoom,
        sendMessage,
        requestNotificationPermission,
        setLiveNotifications
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
