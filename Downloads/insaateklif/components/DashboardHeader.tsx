import React, { useState } from 'react';
import { User, Notification } from '../types';
import { VerificationBadge } from './Shared';
import { Bell, LogOut, Menu, User as UserIcon, MessageSquare } from 'lucide-react';

interface Props {
  user: User;
  onLogout: () => void;
  toggleSidebar: () => void;
  toggleChat: () => void;
  notifications: Notification[];
  onMarkAllRead: () => void;
  onNotificationClick: (id: string) => void;
  unreadChatCount: number;
}

export const DashboardHeader: React.FC<Props> = ({ 
  user, onLogout, toggleSidebar, toggleChat, notifications, onMarkAllRead, onNotificationClick, unreadChatCount 
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifCount = notifications.filter(n => !n.isRead).length;
  const isAdmin = user.role === 'ADMIN';

  return (
    <header className="bg-white border-b border-gray-200 h-16 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-gray-600 hover:bg-gray-100 rounded-lg">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex flex-col">
          <h1 className="text-xl font-bold text-gray-900 leading-none tracking-tight">inşaateklif</h1>
          <span className={`text-[10px] font-bold tracking-wider uppercase mt-1 ${user.role === 'CONTRACTOR' ? 'text-primary-600' : user.role === 'ADMIN' ? 'text-red-600' : 'text-secondary-600'}`}>
            {user.role === 'CONTRACTOR' ? 'Müteahhit Portalı' : user.role === 'ADMIN' ? 'Admin Panel' : 'Usta Portalı'}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {/* User Info - Desktop */}
        <div className="hidden sm:flex flex-col items-end mr-2">
          <span className="text-sm font-semibold text-gray-900">{user.name}</span>
          <VerificationBadge tier={user.tier} />
        </div>

        {/* Chat Toggle - Hidden for Admin */}
        {!isAdmin && (
          <button 
              onClick={toggleChat}
              className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-full transition"
              title="Mesajlar"
            >
              <MessageSquare className="w-5 h-5" />
              {unreadChatCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-primary-600 text-[10px] text-white flex items-center justify-center rounded-full border border-white">
                  {unreadChatCount}
                </span>
              )}
          </button>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`relative p-2 rounded-full transition ${showNotifications ? 'bg-primary-50 text-primary-600' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Bell className="w-5 h-5" />
            {unreadNotifCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white ring-2 ring-white"></span>
            )}
          </button>

          {/* Dropdown */}
          {showNotifications && (
            <>
            <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)}></div>
            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-in slide-in-from-top-2 duration-200">
              <div className="p-3 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
                <h4 className="font-semibold text-sm text-gray-900">Bildirimler</h4>
                {unreadNotifCount > 0 && (
                  <button onClick={onMarkAllRead} className="text-xs text-primary-600 font-medium hover:text-primary-800">
                    Tümünü Okundu İşaretle
                  </button>
                )}
              </div>
              <div className="max-h-[300px] overflow-y-auto">
                {notifications.length > 0 ? (
                  notifications.map(n => (
                    <div 
                      key={n.id} 
                      onClick={() => { onNotificationClick(n.id); setShowNotifications(false); }}
                      className={`p-4 border-b border-gray-50 hover:bg-gray-50 cursor-pointer transition ${!n.isRead ? 'bg-blue-50/30' : ''}`}
                    >
                      <div className="flex gap-3">
                         <div className={`mt-1 w-2 h-2 rounded-full shrink-0 ${!n.isRead ? 'bg-primary-500' : 'bg-gray-300'}`} />
                         <div>
                            <p className={`text-sm ${!n.isRead ? 'font-semibold text-gray-900' : 'text-gray-600'}`}>{n.title}</p>
                            <p className="text-xs text-gray-500 mt-1">{n.message}</p>
                            <p className="text-[10px] text-gray-400 mt-2">{n.timestamp}</p>
                         </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 text-center text-gray-500 text-sm">Bildiriminiz yok.</div>
                )}
              </div>
            </div>
            </>
          )}
        </div>

        <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

        <button 
          onClick={onLogout}
          className="flex items-center gap-2 text-gray-500 hover:text-red-600 transition text-sm font-medium p-2 rounded-lg hover:bg-red-50"
          title="Çıkış Yap"
        >
          <LogOut className="w-5 h-5" />
          <span className="hidden sm:inline">Çıkış</span>
        </button>
      </div>
    </header>
  );
};