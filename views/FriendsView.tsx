
import React from 'react';
import { User, FriendRequest, GiftCircle, ViewState } from '../types.ts';
import { UserIcon, UserPlus, Search, Heart, Ban, ExternalLink, PlusCircle, Users, Check, X, Clock, ArrowLeft } from 'lucide-react';
import { getUser } from '../utils/helpers.tsx';

interface FriendsViewProps {
  currentTab: 'FRIENDS' | 'CIRCLES';
  setTab: (tab: 'FRIENDS' | 'CIRCLES') => void;
  friends: User[];
  circles: GiftCircle[];
  requests: { incoming: FriendRequest[], sent: FriendRequest[] };
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setView: (view: ViewState) => void;
  onAddFriend: () => void;
  onCreateCircle: () => void;
  onSelectFriend: (id: string) => void;
  onSelectCircle: (id: string) => void;
  onToggleFamily: (id: string) => void;
  onBlockUser: (id: string) => void;
  me: User;
}

export const FriendsView: React.FC<FriendsViewProps> = ({
  currentTab, setTab, friends, circles, requests, searchQuery, setSearchQuery,
  setView, onAddFriend, onCreateCircle, onSelectFriend, onSelectCircle,
  onToggleFamily, onBlockUser, me
}) => {
  const filteredFriends = searchQuery 
    ? friends.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : friends;

  return (
    <div className="px-4 pb-20">
       <div className="bg-gradient-to-r from-brand-500 to-purple-600 p-6 rounded-2xl text-white shadow-lg mb-6">
          <h2 className="text-2xl font-bold mb-2">Contribute to a Gift</h2>
          <p className="opacity-90">Surprise a friend by funding their wishes.</p>
      </div>

       <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-bold text-gray-800">Connections</h2>
           <div className="flex space-x-2">
              <button 
                  onClick={() => setView('FRIEND_REQUESTS')}
                  className="bg-white border border-gray-200 text-gray-700 px-3 py-2 rounded-xl text-sm font-bold flex items-center hover:bg-gray-50 transition-all active:scale-95"
              >
                  <UserIcon size={18} className="mr-1" />
                  Requests
                  {requests.incoming.length > 0 && (
                      <span className="ml-1 bg-red-500 text-white text-[10px] px-1.5 rounded-full">{requests.incoming.length}</span>
                  )}
              </button>
              <button 
                  onClick={onAddFriend}
                  className="bg-brand-600 text-white px-3 py-2 rounded-xl text-sm font-bold flex items-center space-x-1 hover:bg-brand-700 shadow-lg shadow-brand-200 transition-all active:scale-95"
              >
                  <UserPlus size={18} />
                  <span>Add</span>
              </button>
           </div>
       </div>

       {/* Search Bar */}
       <div className="relative mb-6">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
           <input 
               type="text"
               placeholder="Search your circle..." 
               className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none shadow-sm transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
           />
       </div>

       {/* Tabs */}
       <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-100 flex mb-6">
           <button 
              onClick={() => setTab('FRIENDS')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${currentTab === 'FRIENDS' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
              My Circle ({friends.length})
           </button>
           <button 
              onClick={() => setTab('CIRCLES')}
              className={`flex-1 py-2 rounded-lg text-sm font-bold transition-colors ${currentTab === 'CIRCLES' ? 'bg-brand-50 text-brand-700' : 'text-gray-500 hover:text-gray-700'}`}
           >
              Gift Circles ({circles.length})
           </button>
       </div>

       {currentTab === 'FRIENDS' ? (
          /* Friends List */
          <div className="space-y-4">
              {filteredFriends.length > 0 ? filteredFriends.map(friend => (
              <div 
                  key={friend.id} 
                  onClick={() => onSelectFriend(friend.id)}
                  className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                  <img src={friend.avatar} alt={friend.name} className="w-14 h-14 rounded-full object-cover" />
                  <div className="flex-1">
                      <h3 className="font-bold text-gray-900">{friend.name}</h3>
                      <p className="text-sm text-gray-500">
                          {me.familyMemberIds.includes(friend.id) ? 'Family Member' : 'Friend'}
                      </p>
                  </div>
                  <div className="flex items-center space-x-2">
                      <button 
                          onClick={(e) => { e.stopPropagation(); onToggleFamily(friend.id); }}
                          className={`p-2 rounded-full transition-colors ${me.familyMemberIds.includes(friend.id) ? 'bg-pink-100 text-pink-600' : 'bg-gray-100 text-gray-400'}`}
                          title={me.familyMemberIds.includes(friend.id) ? "Remove from Family" : "Mark as Family"}
                      >
                          <Heart size={20} fill={me.familyMemberIds.includes(friend.id) ? "currentColor" : "none"} />
                      </button>
                      <button 
                          onClick={(e) => { e.stopPropagation(); onBlockUser(friend.id); }}
                          className="p-2 bg-red-50 text-red-400 rounded-full hover:bg-red-100 hover:text-red-600 transition-colors"
                          title="Block User"
                      >
                          <Ban size={20} />
                      </button>
                      <div className="bg-gray-100 p-2 rounded-full text-gray-400">
                          <ExternalLink size={20} />
                      </div>
                  </div>
              </div>
              )) : (
                  <div className="text-center py-10 text-gray-400 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                      <Users size={32} className="mx-auto mb-2 opacity-30" />
                      <p className="text-sm">
                          {searchQuery ? `No friends match "${searchQuery}"` : "Your circle is empty."}
                      </p>
                      {!searchQuery && (
                          <button onClick={onAddFriend} className="text-brand-600 font-bold text-sm mt-2 hover:underline">Add someone now</button>
                      )}
                  </div>
              )}
          </div>
       ) : (
          /* Gift Circles List */
          <div className="space-y-4">
              <button 
                  onClick={onCreateCircle}
                  className="w-full py-4 border-2 border-dashed border-gray-300 rounded-xl text-gray-500 font-bold flex items-center justify-center hover:border-brand-400 hover:text-brand-600 transition-colors bg-white mb-4"
              >
                  <PlusCircle size={20} className="mr-2" /> Create New Circle
              </button>

              {circles.length > 0 ? circles.map(circle => (
                  <div 
                      key={circle.id}
                      onClick={() => onSelectCircle(circle.id)}
                      className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-brand-200 transition-colors"
                  >
                      <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center space-x-3">
                              <div className="bg-indigo-100 p-2.5 rounded-lg text-indigo-600">
                                  <Users size={20} />
                              </div>
                              <div>
                                  <h3 className="font-bold text-gray-900">{circle.name}</h3>
                                  <p className="text-xs text-gray-500">{circle.memberIds.length} members</p>
                              </div>
                          </div>
                          <span className="text-xs text-gray-400">{new Date(circle.createdTimestamp).toLocaleDateString()}</span>
                      </div>
                      <p className="text-sm text-gray-600 mb-3 pl-12 line-clamp-1">{circle.description}</p>
                      
                      <div className="pl-12 flex -space-x-2">
                          {circle.memberIds.slice(0, 5).map(id => {
                              const u = getUser(id);
                              return u ? <img key={u.id} src={u.avatar} className="w-6 h-6 rounded-full border border-white" /> : null;
                          })}
                          {circle.memberIds.length > 5 && (
                              <div className="w-6 h-6 rounded-full bg-gray-100 text-[10px] flex items-center justify-center border border-white font-medium">+{circle.memberIds.length - 5}</div>
                          )}
                      </div>
                  </div>
              )) : (
                  <div className="text-center py-10 text-gray-400">
                      <p>No gift circles yet.</p>
                  </div>
              )}
          </div>
       )}
    </div>
  );
};

interface FriendRequestsViewProps {
  incoming: FriendRequest[];
  sent: FriendRequest[];
  onAccept: (id: string) => void;
  onReject: (id: string) => void;
  onBack: () => void;
}

export const FriendRequestsView: React.FC<FriendRequestsViewProps> = ({ incoming, sent, onAccept, onReject, onBack }) => {
    return (
        <div className="px-4 pb-24">
            <div className="flex items-center mb-6">
                <button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800">
                    <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold text-gray-800 ml-2">Friend Requests</h2>
            </div>
            
            <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-3 flex items-center">
                    Incoming <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{incoming.length}</span>
                </h3>
                {incoming.length > 0 ? (
                    <div className="space-y-3">
                        {incoming.map(req => {
                            const user = getUser(req.fromUserId);
                            if (!user) return null;
                            return (
                                <div key={req.id} className="bg-white p-4 rounded-xl shadow-sm border border-red-100 flex items-center justify-between">
                                    <div className="flex items-center space-x-3">
                                        <img src={user.avatar} alt={user.name} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <p className="font-bold text-gray-900">{user.name}</p>
                                            <p className="text-xs text-gray-500">Wants to join your circle</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <button 
                                            onClick={() => onAccept(req.id)}
                                            className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                                            title="Accept"
                                        >
                                            <Check size={20} />
                                        </button>
                                        <button 
                                            onClick={() => onReject(req.id)}
                                            className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                                            title="Decline"
                                        >
                                            <X size={20} />
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                        No incoming requests.
                    </div>
                )}
            </div>

            <div className="mb-8">
                <h3 className="font-bold text-gray-800 mb-3 text-sm uppercase opacity-70 tracking-wide">Pending Sent</h3>
                {sent.length > 0 ? (
                    <div className="space-y-3">
                    {sent.map(req => {
                        const user = getUser(req.toUserId);
                        if (!user) return null;
                        return (
                            <div key={req.id} className="bg-gray-50 p-3 rounded-xl border border-gray-100 flex items-center justify-between opacity-80">
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                                        <UserIcon size={20} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-700 text-sm">{user.name || `User ${user.id}`}</p>
                                        <p className="text-xs text-gray-400">Request Sent</p>
                                    </div>
                                </div>
                                <div className="flex items-center text-orange-400 text-xs font-bold px-2 py-1 bg-orange-50 rounded-md">
                                    <Clock size={12} className="mr-1" /> Pending
                                </div>
                            </div>
                        );
                    })}
                    </div>
                ) : (
                <div className="text-center py-6 bg-gray-50 rounded-xl border border-dashed border-gray-200 text-gray-400 text-sm">
                    No pending sent requests.
                </div>
                )}
            </div>
        </div>
    );
};
