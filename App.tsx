


import React, { useState, useMemo } from 'react';
import { WishlistItem, User, ContributionType, ViewState, Event, EventType, WishlistStatus, FriendRequest, GiftCircle, Notification, NotificationType } from './types.ts';
import { MOCK_USERS, INITIAL_WISHLIST, MOCK_CURRENT_USER_ID, INITIAL_EVENTS, INITIAL_FRIEND_REQUESTS, INITIAL_CIRCLES, INITIAL_NOTIFICATIONS } from './mockData.ts';
import { ContributionModal } from './components/ContributionModal.tsx';
import { WishDetailModal } from './components/WishDetailModal.tsx';
import { getCurrencySymbol, getUser } from './utils/helpers.tsx';

// Components
import { Header, BottomNav } from './components/Navigation.tsx';
import { OnboardingModal, AddFriendModal, CreateCircleModal, InviteModal } from './components/Modals.tsx';

// Views
import { LoginView, SignupView } from './views/AuthViews.tsx';
import { HomeView } from './views/HomeView.tsx';
import { FriendsView, FriendRequestsView } from './views/FriendsView.tsx';
import { CreateEventView, EventDetailView, EventPlanningView } from './views/EventViews.tsx';
import { CircleDetailView } from './views/CircleDetailView.tsx';
import { MyProfileView, SettingsView, WalletView, FriendProfileView } from './views/ProfileViews.tsx';
import { AddItemView } from './views/AddItemView.tsx';
import { NotificationsView } from './views/NotificationsView.tsx';
import { GiftFlowView } from './views/GiftFlowView.tsx';

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [view, setView] = useState<ViewState>('HOME');
  const [showOnboarding, setShowOnboarding] = useState(false);
  
  const [currentUserData, setCurrentUserData] = useState<User>(() => {
     return MOCK_USERS.find(u => u.id === MOCK_CURRENT_USER_ID)!;
  });

  const [wishlist, setWishlist] = useState<WishlistItem[]>(INITIAL_WISHLIST);
  const [events, setEvents] = useState<Event[]>(INITIAL_EVENTS);
  const [friendRequests, setFriendRequests] = useState<FriendRequest[]>(INITIAL_FRIEND_REQUESTS);
  const [circles, setCircles] = useState<GiftCircle[]>(INITIAL_CIRCLES);
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL_NOTIFICATIONS);
  
  const [selectedFriendId, setSelectedFriendId] = useState<string | null>(null);
  const [contributingItem, setContributingItem] = useState<WishlistItem | null>(null);
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);
  const [showCreateCircleModal, setShowCreateCircleModal] = useState(false);
  const [showCircleInviteModal, setShowCircleInviteModal] = useState(false);
  const [activeCircleId, setActiveCircleId] = useState<string | null>(null);
  
  const [viewingItemId, setViewingItemId] = useState<string | null>(null);
  const [viewingEventId, setViewingEventId] = useState<string | null>(null);
  const [showEventInviteModal, setShowEventInviteModal] = useState(false);
  
  const [wishlistTab, setWishlistTab] = useState<WishlistStatus>('ACTIVE');
  const [friendsViewTab, setFriendsViewTab] = useState<'FRIENDS' | 'CIRCLES'>('FRIENDS');
  const [friendSearchQuery, setFriendSearchQuery] = useState('');

  // Adding Item State
  const [addingItemToCircleId, setAddingItemToCircleId] = useState<string | null>(null);
  
  const me = currentUserData;
  const currencySymbol = getCurrencySymbol(me.settings.currency);

  const unreadNotificationsCount = useMemo(() => notifications.filter(n => !n.isRead).length, [notifications]);
  
  const friends = useMemo(() => MOCK_USERS.filter(u => me.friends.includes(u.id)), [me]);
  
  const myActiveEvents = useMemo(() => {
    const myEvents = events.filter(e => e.userId === me.id);
    const acceptedEvents = events.filter(e => me.acceptedEventIds && me.acceptedEventIds.includes(e.id));
    const familyEvents = events.filter(e => {
        const owner = getUser(e.userId);
        if (!owner) return false;
        const iMarkedThem = me.familyMemberIds.includes(owner.id);
        const theyMarkedMe = owner.familyMemberIds.includes(me.id);
        return iMarkedThem && theyMarkedMe;
    });
    const combined = [...myEvents, ...acceptedEvents, ...familyEvents];
    const uniqueMap = new Map();
    combined.forEach(item => uniqueMap.set(item.id, item));
    return Array.from(uniqueMap.values()).filter(e => !me.hiddenEventIds?.includes(e.id));
  }, [events, me.id, me.acceptedEventIds, me.familyMemberIds, me.hiddenEventIds]);

  const displayedWishlist = useMemo(() => {
    if (view === 'PROFILE' && selectedFriendId) {
      return wishlist.filter(w => w.userId === selectedFriendId && w.status === 'ACTIVE' && !w.circleId);
    }
    if (view === 'HOME') {
      return wishlist.filter(w => w.userId === me.id && w.status === wishlistTab && !w.circleId);
    }
    return [];
  }, [view, selectedFriendId, wishlist, me.id, wishlistTab]);

  const incomingRequests = useMemo(() => friendRequests.filter(req => req.toUserId === me.id && req.status === 'PENDING'), [friendRequests, me.id]);
  const sentRequests = useMemo(() => friendRequests.filter(req => req.fromUserId === me.id && req.status === 'PENDING'), [friendRequests, me.id]);

  // Handlers
  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); setIsLoggedIn(true); setShowOnboarding(true); setView('HOME'); };
  const handleLogout = () => { setIsLoggedIn(false); setView('HOME'); setShowOnboarding(false); };
  
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const newUser: User = {
      id: `u${Date.now()}`,
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      name: `${formData.get('firstName')} ${formData.get('lastName')}`,
      dob: formData.get('dob') as string,
      email: formData.get('email') as string,
      sex: formData.get('sex') as any,
      phoneNumber: formData.get('phoneNumber') as string,
      avatar: `https://ui-avatars.com/api/?name=${formData.get('firstName')}+${formData.get('lastName')}&background=random`,
      friends: [], blockedUserIds: [], familyMemberIds: [], acceptedEventIds: [], hiddenEventIds: [],
      settings: { defaultGiftAmount: 20, maxGiftAmount: 200, currency: 'INR', autoAcceptContacts: false }
    };
    setCurrentUserData(newUser);
    setIsLoggedIn(true);
    setShowOnboarding(true);
    setView('HOME');
  };

  const handleContribute = (amount: number, type: ContributionType, isAnonymous: boolean, isAmountHidden: boolean) => {
    if (!contributingItem) return;
    const newContribution = { id: Date.now().toString(), contributorId: me.id, amount, type, timestamp: Date.now(), isAnonymous, isAmountHidden };
    setWishlist(prev => prev.map(item => item.id === contributingItem.id ? { ...item, fundedAmount: item.fundedAmount + amount, contributions: [...item.contributions, newContribution] } : item));
    setContributingItem(null);
  };

  const handleAddItem = (item: WishlistItem) => {
    // If adding to circle, assign circleID
    const newItem = addingItemToCircleId ? { ...item, circleId: addingItemToCircleId, userId: me.id } : item;
    
    setWishlist([...wishlist, newItem]);
    if (addingItemToCircleId) { setView('CIRCLE_DETAIL'); setAddingItemToCircleId(null); } else { setView('HOME'); }
  };

  const handleCancelItem = (itemId: string) => {
      if (window.confirm('Are you sure you want to cancel this item?')) setWishlist(prev => prev.map(item => item.id === itemId ? { ...item, status: 'CANCELLED' } : item));
  };

  const handleEventCreation = (eventData: Partial<Event>, selectedIds: string[], newItems: Partial<WishlistItem>[]) => {
      const newEventId = `e${Date.now()}`;
      const newEvent: Event = { id: newEventId, userId: me.id, title: eventData.title!, type: eventData.type as EventType, date: eventData.date!, description: eventData.description || '', inviteeIds: [], status: 'ACTIVE', visibility: eventData.visibility || 'PRIVATE' };
      setEvents([...events, newEvent]);
      const updatedWishlist = wishlist.map(item => selectedIds.includes(item.id) ? { ...item, eventId: newEventId } : item);
      const createdItems: WishlistItem[] = newItems.map((item, idx) => ({ id: `nw${Date.now()}-${idx}`, userId: me.id, title: item.title!, description: item.description || '', price: item.price || 0, fundedAmount: 0, imageUrl: `https://picsum.photos/seed/new${Date.now()}-${idx}/300/300`, productUrl: item.productUrl || '', eventId: newEventId, contributions: [], status: 'ACTIVE' }));
      setWishlist([...updatedWishlist, ...createdItems]);
      setView('HOME');
  };

  const handleUpdateEventInvites = (selectedIds: string[]) => {
    if (viewingEventId) setEvents(events.map(e => e.id === viewingEventId ? { ...e, inviteeIds: selectedIds } : e));
  };

  const handleUpdateCircleMembers = (selectedIds: string[]) => {
      if (activeCircleId) setCircles(circles.map(c => c.id === activeCircleId ? { ...c, memberIds: selectedIds } : c));
  };

  const handleCreateCircle = (name: string, description: string, memberIds: string[], adminIds: string[]) => {
      // Ensure creator is always admin and member
      const allMembers = Array.from(new Set([...memberIds, me.id]));
      const allAdmins = Array.from(new Set([...adminIds, me.id]));

      const newCircle: GiftCircle = { 
          id: `gc${Date.now()}`, 
          name, 
          description, 
          adminIds: allAdmins, 
          memberIds: allMembers, 
          createdTimestamp: Date.now() 
      };
      setCircles([...circles, newCircle]);
      setShowCreateCircleModal(false);
      setActiveCircleId(newCircle.id);
      setView('CIRCLE_DETAIL');
      setFriendsViewTab('CIRCLES');
  };

  const handleToggleCircleAdmin = (circleId: string, memberId: string) => {
    setCircles(prevCircles => prevCircles.map(c => {
        if (c.id !== circleId) return c;
        const isAdmin = c.adminIds.includes(memberId);
        let newAdminIds = [...c.adminIds];
        if (isAdmin) {
             // Cannot remove self if only admin
             if (c.adminIds.length === 1 && memberId === me.id) {
                 alert("You are the only admin. You cannot remove yourself.");
                 return c;
             }
             newAdminIds = newAdminIds.filter(id => id !== memberId);
        } else {
             newAdminIds.push(memberId);
        }
        return { ...c, adminIds: newAdminIds };
    }));
  };

  const handleSendFriendRequest = (id: string) => {
      const targetUser = MOCK_USERS.find(u => u.id === id);
      if (!targetUser || me.friends.includes(id)) return;
      const newRequest: FriendRequest = { id: `fr${Date.now()}`, fromUserId: me.id, toUserId: id, status: targetUser.settings.autoAcceptContacts ? 'ACCEPTED' : 'PENDING', timestamp: Date.now() };
      setFriendRequests([...friendRequests, newRequest]);
      if (targetUser.settings.autoAcceptContacts) setCurrentUserData({ ...me, friends: [...me.friends, id] });
      setShowAddFriendModal(false);
  };

  const handleAcceptFriendRequest = (requestId: string) => {
      const req = friendRequests.find(r => r.id === requestId);
      if (req) {
          setFriendRequests(friendRequests.map(r => r.id === requestId ? { ...r, status: 'ACCEPTED' } : r));
          setCurrentUserData({ ...me, friends: [...me.friends, req.fromUserId] });
      }
  };

  const handleUpdateProfile = (data: Partial<User>) => setCurrentUserData({...currentUserData, ...data});

  if (!isLoggedIn) return view === 'SIGNUP' ? <SignupView onSignup={handleSignup} setView={setView} /> : <LoginView onLogin={handleLogin} setView={setView} />;

  return (
    <div className="min-h-screen bg-gray-50 font-sans max-w-screen-md mx-auto shadow-2xl">
      <Header user={me} unreadCount={unreadNotificationsCount} onNotificationsClick={() => setView('NOTIFICATIONS')} onProfileClick={() => setView('MY_PROFILE')} onLogout={handleLogout} />

      <main className="pb-24 pt-4">
        {view === 'HOME' && <HomeView events={myActiveEvents} wishlist={displayedWishlist} wishlistTab={wishlistTab} setWishlistTab={setWishlistTab} setView={setView} handleEventClick={(id) => { setViewingEventId(id); setView('EVENT_DETAIL'); }} handleHideEvent={(e, id) => { e.stopPropagation(); setCurrentUserData({...me, hiddenEventIds: [...(me.hiddenEventIds||[]), id]})}} handleContribute={setContributingItem} handleCancelItem={handleCancelItem} onItemClick={setViewingItemId} me={me} currencySymbol={currencySymbol} />}
        
        {view === 'FRIENDS' && <FriendsView currentTab={friendsViewTab} setTab={setFriendsViewTab} friends={friends} circles={circles} requests={{incoming: incomingRequests, sent: sentRequests}} searchQuery={friendSearchQuery} setSearchQuery={setFriendSearchQuery} setView={setView} onAddFriend={() => setShowAddFriendModal(true)} onCreateCircle={() => setShowCreateCircleModal(true)} onSelectFriend={(id) => { setSelectedFriendId(id); setView('PROFILE'); }} onSelectCircle={(id) => { setActiveCircleId(id); setView('CIRCLE_DETAIL'); }} onToggleFamily={(id) => { const isF = me.familyMemberIds.includes(id); setCurrentUserData({...me, familyMemberIds: isF ? me.familyMemberIds.filter(f=>f!==id) : [...me.familyMemberIds, id]}) }} onBlockUser={(id) => { if(confirm('Block user?')) setCurrentUserData({...me, blockedUserIds:[...me.blockedUserIds, id], friends: me.friends.filter(f=>f!==id)}) }} me={me} />}
        
        {view === 'FRIEND_REQUESTS' && <FriendRequestsView incoming={incomingRequests} sent={sentRequests} onAccept={handleAcceptFriendRequest} onReject={(id) => setFriendRequests(friendRequests.map(r => r.id===id?{...r, status: 'REJECTED'}:r))} onBack={() => setView('FRIENDS')} />}
        
        {view === 'CREATE_EVENT' && <CreateEventView onBack={() => setView('HOME')} onCreate={handleEventCreation} userItems={wishlist.filter(w => w.userId === me.id && w.status === 'ACTIVE')} existingEvents={events} currencySymbol={currencySymbol} />}
        
        {view === 'EVENT_DETAIL' && viewingEventId && <EventDetailView event={events.find(e => e.id === viewingEventId)!} wishlist={wishlist} onBack={() => setView('HOME')} me={me} onUpdateVisibility={(eid, v) => setEvents(events.map(e => e.id===eid?{...e, visibility: v}:e))} onCancelEvent={(eid) => setEvents(events.map(e => e.id===eid?{...e, status:'CANCELLED'}:e))} onInvite={() => setShowEventInviteModal(true)} onItemClick={setViewingItemId} onContribute={setContributingItem} currencySymbol={currencySymbol} />}
        
        {view === 'EVENT_PLANNING' && <EventPlanningView onBack={() => setView('HOME')} currencySymbol={currencySymbol} />}

        {view === 'CIRCLE_DETAIL' && activeCircleId && <CircleDetailView circle={circles.find(c => c.id === activeCircleId)!} wishlist={wishlist} me={me} onBack={() => setView('FRIENDS')} onInvite={() => setShowCircleInviteModal(true)} onAddGoal={() => { setAddingItemToCircleId(activeCircleId); setView('ADD_ITEM'); }} onItemClick={setViewingItemId} onContribute={setContributingItem} onToggleAdmin={(memberId) => handleToggleCircleAdmin(activeCircleId, memberId)} onCancelItem={handleCancelItem} currencySymbol={currencySymbol} />}

        {view === 'MY_PROFILE' && <MyProfileView me={me} onBack={() => setView('HOME')} onEditProfile={handleUpdateProfile} onGoToSettings={() => setView('SETTINGS')} onGoToWallet={() => setView('WALLET')} />}
        
        {view === 'SETTINGS' && <SettingsView me={me} onBack={() => setView('MY_PROFILE')} onSave={(s) => { setCurrentUserData({...me, settings: s}); setView('MY_PROFILE'); }} currencySymbol={currencySymbol} />}
        
        {view === 'WALLET' && <WalletView me={me} wishlist={wishlist} onBack={() => setView('MY_PROFILE')} currencySymbol={currencySymbol} />}

        {view === 'PROFILE' && selectedFriendId && <FriendProfileView friendId={selectedFriendId} events={events} wishlist={displayedWishlist} currencySymbol={currencySymbol} onBack={() => setView('FRIENDS')} onItemClick={setViewingItemId} onContribute={setContributingItem} />}

        {view === 'ADD_ITEM' && <AddItemView onBack={() => addingItemToCircleId ? setView('CIRCLE_DETAIL') : setView('HOME')} onAdd={handleAddItem} circleName={addingItemToCircleId ? circles.find(c=>c.id===addingItemToCircleId)?.name : undefined} activeEvents={myActiveEvents} currencySymbol={currencySymbol} />}

        {view === 'NOTIFICATIONS' && <NotificationsView notifications={notifications} onBack={() => setView('HOME')} onMarkRead={(id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))} onAction={(n, action) => { if(n.type===NotificationType.FRIEND_REQUEST && n.relatedId) action==='ACCEPT'?handleAcceptFriendRequest(n.relatedId):null; setNotifications(prev => prev.map(nt => nt.id===n.id?{...nt, actionStatus: action==='ACCEPT'?'ACCEPTED':'REJECTED', isRead:true}:nt)) }} />}

        {view === 'GIFT_FLOW' && <GiftFlowView onBack={() => setView('HOME')} friends={friends} wishlist={wishlist} currencySymbol={currencySymbol} onContribute={setContributingItem} onItemClick={setViewingItemId} />}
      </main>

      <BottomNav currentView={view} setView={setView} />

      {showOnboarding && <OnboardingModal onClose={() => setShowOnboarding(false)} />}
      {showAddFriendModal && <AddFriendModal onClose={() => setShowAddFriendModal(false)} onSend={handleSendFriendRequest} myId={me.id} />}
      {showCreateCircleModal && <CreateCircleModal onClose={() => setShowCreateCircleModal(false)} onCreate={handleCreateCircle} friends={friends} />}
      {showEventInviteModal && viewingEventId && <InviteModal title="Invite Guests" friends={friends} existingIds={events.find(e => e.id === viewingEventId)?.inviteeIds || []} onClose={() => setShowEventInviteModal(false)} onSave={handleUpdateEventInvites} />}
      {showCircleInviteModal && activeCircleId && <InviteModal title="Invite to Circle" friends={friends} existingIds={circles.find(c => c.id === activeCircleId)?.memberIds || []} onClose={() => setShowCircleInviteModal(false)} onSave={handleUpdateCircleMembers} />}
      {contributingItem && <ContributionModal item={contributingItem} defaultAmount={me.settings.defaultGiftAmount} maxAmount={me.settings.maxGiftAmount} currencySymbol={currencySymbol} onClose={() => setContributingItem(null)} onContribute={handleContribute} />}
      {viewingItemId && (activeViewingItem => activeViewingItem && <WishDetailModal item={activeViewingItem} currencySymbol={currencySymbol} onClose={() => setViewingItemId(null)} />)(wishlist.find(i => i.id === viewingItemId))}
    </div>
  );
};
export default App;