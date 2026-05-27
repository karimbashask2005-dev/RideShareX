import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { Send, User, MessageCircle } from 'lucide-react';

export default function ChatWindow({ roomId, otherUser }) {
  const { user } = useAuth();
  const { messages, joinRoom, sendMessage } = useSocket();
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (roomId) {
      joinRoom(roomId);
    }
  }, [roomId]);

  useEffect(() => {
    // Scroll to bottom when messages update
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    sendMessage(roomId, inputText);
    setInputText('');
  };

  if (!roomId) {
    return (
      <div className="bg-white border border-slate-100 rounded-3xl h-[500px] flex flex-col items-center justify-center text-center p-6 shadow-premium">
        <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-brand-500 mb-4">
          <MessageCircle className="w-7 h-7" />
        </div>
        <h4 className="font-outfit font-bold text-slate-800 text-lg">Your Conversations</h4>
        <p className="text-xs text-slate-400 max-w-xs mt-1.5 leading-relaxed">Select a booking chat room from the sidebar list to connect with your driver or passenger in real time.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-100 rounded-3xl h-[500px] flex flex-col justify-between shadow-premium overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4.5 border-b border-slate-50 flex items-center space-x-3 bg-slate-50/20">
        <img 
          src={otherUser?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150'} 
          alt={otherUser?.name} 
          className="w-10 h-10 rounded-xl object-cover ring-2 ring-slate-100"
        />
        <div>
          <h4 className="font-bold text-sm text-slate-800">{otherUser?.name || 'Driver / Passenger'}</h4>
          <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-wider flex items-center">
            <span className="inline-block w-1.5 h-1.5 bg-emerald-500 rounded-full mr-1.5 animate-pulse" />
            Online
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-grow p-6 overflow-y-auto space-y-4 bg-slate-50/30">
        {messages.length === 0 ? (
          <div className="text-center text-xs text-slate-400 py-10">
            No messages yet. Send a greeting to coordinate your pickup!
          </div>
        ) : (
          messages.map((msg) => {
            const isOwn = msg.senderId === user.id;
            return (
              <div 
                key={msg.id} 
                className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
              >
                <div 
                  className={`max-w-[70%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                    isOwn 
                      ? 'bg-brand-500 text-white rounded-tr-none' 
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>
                  <span className={`text-[9px] mt-1 block text-right ${isOwn ? 'text-indigo-200' : 'text-slate-400'}`}>
                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Footer input form */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex items-center space-x-3.5 bg-white">
        <input 
          type="text" 
          placeholder="Type your message here..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          className="flex-grow text-sm font-medium text-slate-700 bg-slate-50 border border-slate-100 rounded-2xl px-4.5 py-3 focus:outline-none focus:ring-2 focus:ring-brand-400 transition-all"
        />
        <button 
          type="submit" 
          className="p-3 bg-brand-500 hover:bg-brand-600 text-white rounded-2xl shadow-premium transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center flex-shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </form>
    </div>
  );
}
