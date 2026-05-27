import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatWindow from '../components/chat/ChatWindow';
import { MessageSquare, User, Clock } from 'lucide-react';

export default function ChatPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [rooms, setRooms] = useState([]);
  const [activeRoomId, setActiveRoomId] = useState(searchParams.get('room') || null);
  const [otherUserData, setOtherUserData] = useState(null);

  useEffect(() => {
    // Collect active conversation rooms based on bookings in LocalStorage
    const bookings = JSON.parse(localStorage.getItem('rx_bookings') || '[]');
    const userBookings = bookings.filter(b => b.passengerId === user?.id || b.driverId === user?.id);
    
    // Group by ride-passenger Composite key
    const chatRooms = [];
    const processedIds = new Set();

    userBookings.forEach(bk => {
      const roomKey = `room_${bk.rideId}_${bk.passengerId}`;
      if (processedIds.has(roomKey)) return;
      processedIds.add(roomKey);

      const isOwnPassenger = bk.passengerId === user?.id;
      chatRooms.push({
        roomId: roomKey,
        bookingRef: bk.bookingRef,
        otherName: isOwnPassenger ? bk.driverName : bk.passengerName,
        otherAvatar: isOwnPassenger ? bk.driverAvatar : bk.passengerAvatar,
        otherId: isOwnPassenger ? bk.driverId : bk.passengerId,
        routeSummary: `${bk.rideSource} → ${bk.rideDestination}`,
        lastMessage: 'Tap to open chat...'
      });
    });

    setRooms(chatRooms);

    // If query params are set, automatically select that room
    if (searchParams.get('room')) {
      setActiveRoomId(searchParams.get('room'));
      setOtherUserData({
        name: searchParams.get('otherName'),
        avatar: searchParams.get('otherAvatar')
      });
    } else if (chatRooms.length > 0 && !activeRoomId) {
      setActiveRoomId(chatRooms[0].roomId);
      setOtherUserData({
        name: chatRooms[0].otherName,
        avatar: chatRooms[0].otherAvatar
      });
    }
  }, [user, searchParams]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Left Conversations Sidebar */}
      <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-premium space-y-4 h-[500px] flex flex-col">
        <h3 className="font-outfit font-extrabold text-slate-800 text-base border-b border-slate-50 pb-3 flex items-center space-x-2">
          <MessageSquare className="w-5 h-5 text-brand-500" />
          <span>Active Chats</span>
        </h3>

        <div className="flex-grow overflow-y-auto space-y-2 pr-1">
          {rooms.length === 0 ? (
            <div className="text-center text-xs text-slate-400 py-16">
              No conversations found. Chats are activated after bookings are initiated.
            </div>
          ) : (
            rooms.map((room) => (
              <button
                key={room.roomId}
                onClick={() => {
                  setActiveRoomId(room.roomId);
                  setOtherUserData({ name: room.otherName, avatar: room.otherAvatar });
                }}
                className={`w-full text-left p-3 rounded-2xl border transition-all flex items-center space-x-3 ${
                  activeRoomId === room.roomId 
                    ? 'bg-brand-50 border-brand-100' 
                    : 'bg-white border-slate-100/50 hover:bg-slate-50'
                }`}
              >
                <img 
                  src={room.otherAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
                  alt={room.otherName} 
                  className="w-10 h-10 rounded-xl object-cover flex-shrink-0"
                />
                <div className="flex-grow truncate text-xs">
                  <h4 className="font-bold text-slate-800">{room.otherName}</h4>
                  <p className="text-slate-400 font-medium truncate mt-0.5">{room.routeSummary}</p>
                  <p className="text-[10px] text-brand-600 font-bold mt-1 uppercase tracking-wider">Ref: {room.bookingRef}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Messages Room panel */}
      <div className="lg:col-span-2">
        <ChatWindow roomId={activeRoomId} otherUser={otherUserData} />
      </div>
    </div>
  );
}
