import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, User } from '../types';
import { Send, CheckCheck, MoreVertical, Phone, Mic } from 'lucide-react';
import { Input, Button } from './Shared';

interface Props {
  conversation: Conversation;
  currentUser: User;
  onSendMessage: (text: string) => void;
  onClose: () => void;
}

export const ChatWindow: React.FC<Props> = ({ conversation, currentUser, onSendMessage, onClose }) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation.messages]);

  const handleSend = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!newMessage.trim()) return;
    onSendMessage(newMessage);
    setNewMessage('');
  };

  return (
    <div className="flex flex-col h-full bg-white overflow-hidden">
      {/* Header */}
      <div className="p-3 border-b border-gray-100 flex justify-between items-center bg-gray-50/80 backdrop-blur">
        <div className="flex items-center gap-3">
           <img src={conversation.otherUserAvatar} className="w-9 h-9 rounded-full border border-gray-200" alt="" />
           <div>
             <h4 className="font-bold text-gray-900 text-sm leading-tight">{conversation.otherUserName}</h4>
             <p className="text-[10px] text-gray-500 truncate max-w-[150px]">{conversation.jobTitle}</p>
           </div>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition" title="Ara">
            <Phone className="w-4 h-4" />
          </button>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition md:hidden">
            <span className="text-xl leading-none">&times;</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {conversation.messages.map(msg => {
          const isMe = msg.senderId === currentUser.id;
          return (
            <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 shadow-sm text-sm ${isMe ? 'bg-primary-600 text-white rounded-tr-none' : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'}`}>
                <p>{msg.content}</p>
                <div className={`flex items-center justify-end gap-1 mt-1 text-[10px] ${isMe ? 'text-primary-200' : 'text-gray-400'}`}>
                  <span>{msg.timestamp}</span>
                  {isMe && <CheckCheck className="w-3 h-3" />}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSend} className="p-3 bg-white border-t border-gray-200 flex gap-2 items-center">
        <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
           <Mic className="w-5 h-5" />
        </button>
        <input 
          className="flex-1 bg-gray-50 border border-gray-200 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:bg-white transition"
          placeholder="Mesaj yazın..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />
        <button 
          type="submit"
          disabled={!newMessage.trim()}
          className="w-9 h-9 bg-primary-600 text-white rounded-full flex items-center justify-center hover:bg-primary-700 disabled:opacity-50 disabled:hover:bg-primary-600 transition shadow-sm shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};