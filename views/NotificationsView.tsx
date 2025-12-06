
import React from 'react';
import { Notification, NotificationType } from '../types.ts';
import { ArrowLeft, Bell, MessageSquare, UserPlus, Calendar, Check, X } from 'lucide-react';

interface NotificationsViewProps {
  notifications: Notification[];
  onBack: () => void;
  onMarkRead: (id: string) => void;
  onAction: (notification: Notification, action: 'ACCEPT' | 'REJECT') => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ notifications, onBack, onMarkRead, onAction }) => {
    // Sort by timestamp desc
    const sorted = [...notifications].sort((a, b) => b.timestamp - a.timestamp);

    const getIcon = (type: NotificationType) => {
        switch (type) {
            case NotificationType.FRIEND_REQUEST: return <UserPlus size={20} className="text-blue-500" />;
            case NotificationType.EVENT_INVITE: return <Calendar size={20} className="text-purple-500" />;
            default: return <MessageSquare size={20} className="text-gray-500" />;
        }
    };

    return (
        <div className="px-4 pb-24">
             <div className="flex items-center mb-6 pt-4">
                 <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button>
                 <h2 className="text-xl font-bold text-gray-800 ml-2">Notifications</h2>
             </div>

             <div className="space-y-3">
                 {sorted.length > 0 ? sorted.map(n => (
                     <div 
                        key={n.id} 
                        className={`p-4 rounded-2xl border flex items-start space-x-4 transition-colors ${n.isRead ? 'bg-white border-gray-100' : 'bg-blue-50 border-blue-100'}`}
                        onClick={() => !n.isRead && onMarkRead(n.id)}
                     >
                         <div className={`p-2 rounded-full flex-shrink-0 ${n.isRead ? 'bg-gray-100' : 'bg-white shadow-sm'}`}>
                             {getIcon(n.type)}
                         </div>
                         <div className="flex-1">
                             <div className="flex justify-between items-start">
                                 <h4 className={`text-sm ${n.isRead ? 'font-semibold text-gray-800' : 'font-bold text-gray-900'}`}>{n.title}</h4>
                                 <span className="text-[10px] text-gray-400 whitespace-nowrap ml-2">{new Date(n.timestamp).toLocaleDateString()}</span>
                             </div>
                             <p className="text-sm text-gray-600 mt-1">{n.message}</p>
                             
                             {n.actionStatus === 'PENDING' && (n.type === NotificationType.FRIEND_REQUEST || n.type === NotificationType.EVENT_INVITE) && (
                                 <div className="flex space-x-3 mt-3">
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); onAction(n, 'ACCEPT'); }}
                                        className="flex-1 bg-brand-600 text-white py-2 rounded-lg text-xs font-bold hover:bg-brand-700 flex justify-center items-center"
                                     >
                                         <Check size={14} className="mr-1" /> Accept
                                     </button>
                                     <button 
                                        onClick={(e) => { e.stopPropagation(); onAction(n, 'REJECT'); }}
                                        className="flex-1 bg-white border border-gray-300 text-gray-700 py-2 rounded-lg text-xs font-bold hover:bg-gray-50 flex justify-center items-center"
                                     >
                                         <X size={14} className="mr-1" /> Decline
                                     </button>
                                 </div>
                             )}
                             {n.actionStatus && n.actionStatus !== 'PENDING' && n.actionStatus !== 'VIEWED' && (
                                 <div className={`mt-2 text-xs font-bold px-2 py-1 rounded inline-block ${n.actionStatus === 'ACCEPTED' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                     {n.actionStatus === 'ACCEPTED' ? 'Accepted' : 'Declined'}
                                 </div>
                             )}
                         </div>
                     </div>
                 )) : (
                     <div className="text-center py-12 text-gray-400">
                         <Bell size={48} className="mx-auto mb-3 opacity-20" />
                         <p>No notifications yet.</p>
                     </div>
                 )}
             </div>
        </div>
    );
};
