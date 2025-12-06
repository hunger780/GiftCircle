
import React from 'react';
import { Bell, LogOut, Home, Users, PlusCircle, CalendarRange, User as UserIcon } from 'lucide-react';
import { User, ViewState } from '../types.ts';

interface HeaderProps {
  user: User;
  unreadCount: number;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, unreadCount, onNotificationsClick, onProfileClick, onLogout }) => (
  <header className="bg-white sticky top-0 z-10 border-b px-4 py-3 flex justify-between items-center shadow-sm">
    <h1 className="text-xl font-extrabold bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
      GiftCircle
    </h1>
    <div className="flex items-center space-x-3">
      <button 
         onClick={onNotificationsClick}
         className="relative p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors"
      >
          <Bell size={20} />
          {unreadCount > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border border-white"></span>
          )}
      </button>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-600 hidden sm:block">Hi, {user.firstName}</span>
        <img onClick={onProfileClick} src={user.avatar} alt="avatar" className="w-8 h-8 rounded-full border border-gray-200 cursor-pointer" />
      </div>
      <button 
        onClick={onLogout}
        className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50"
        title="Logout"
      >
        <LogOut size={20} />
      </button>
    </div>
  </header>
);

interface BottomNavProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, setView }) => {
  const isActive = (views: ViewState[]) => views.includes(currentView) ? 'text-brand-600' : 'text-gray-400';

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-40 pb-safe shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
      <div className="max-w-md mx-auto flex justify-between items-end px-6 py-3">
        <div className="w-full max-w-md flex justify-between">
            <button onClick={() => setView('HOME')} className={`flex flex-col items-center space-y-1 ${isActive(['HOME'])}`}>
              <Home size={24} />
              <span className="text-xs">Home</span>
            </button>
            <button onClick={() => setView('FRIENDS')} className={`flex flex-col items-center space-y-1 ${isActive(['FRIENDS', 'CIRCLE_DETAIL', 'PROFILE', 'GIFT_FLOW', 'FRIEND_REQUESTS'])}`}>
              <Users size={24} />
              <span className="text-xs">Friends</span>
            </button>
            <button onClick={() => setView('ADD_ITEM')} className="flex flex-col items-center space-y-1 -mt-6">
              <div className="bg-brand-600 text-white p-3 rounded-full shadow-lg shadow-brand-300 transform transition-transform hover:scale-105 active:scale-95">
                  <PlusCircle size={28} />
              </div>
              <span className="text-xs font-medium text-gray-600">Add Wish</span>
            </button>
            <button onClick={() => setView('EVENT_PLANNING')} className={`flex flex-col items-center space-y-1 ${isActive(['EVENT_PLANNING'])}`}>
              <CalendarRange size={24} />
              <span className="text-xs">Planning</span>
            </button>
            <button onClick={() => setView('MY_PROFILE')} className={`flex flex-col items-center space-y-1 ${isActive(['MY_PROFILE', 'SETTINGS', 'WALLET'])}`}>
              <UserIcon size={24} />
              <span className="text-xs">Profile</span>
            </button>
        </div>
      </div>
    </nav>
  );
};
