
import React, { useState } from 'react';
import { User, WishlistItem, Event, ContributionType, BankDetails } from '../types.ts';
import { ArrowLeft, Settings, Wallet, CreditCard, ChevronRight, LogOut, User as UserIcon, Building2, Save, X, Calendar, MapPin, Grid, Lock } from 'lucide-react';
import { WishlistCard } from '../components/WishlistCard.tsx';
import { getEventIcon } from '../utils/helpers.tsx';
import { MOCK_USERS } from '../mockData.ts';

// --- My Profile ---
interface MyProfileViewProps {
    me: User;
    onBack: () => void;
    onEditProfile: (data: Partial<User>) => void;
    onGoToSettings: () => void;
    onGoToWallet: () => void;
}

export const MyProfileView: React.FC<MyProfileViewProps> = ({ me, onBack, onEditProfile, onGoToSettings, onGoToWallet }) => {
    const [activeTab, setActiveTab] = useState<'PERSONAL' | 'BANK'>('PERSONAL');
    const [bankDraft, setBankDraft] = useState<BankDetails>(me.bankDetails || {
        accountName: '', accountNumber: '', bankName: '', ifscCode: '', panNumber: ''
    });

    const handleSaveBank = (e: React.FormEvent) => {
        e.preventDefault();
        onEditProfile({ bankDetails: bankDraft });
        alert('Bank details saved successfully!');
    };

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="bg-gradient-to-br from-brand-600 to-purple-600 text-white pt-8 pb-16 px-6 relative mb-12">
                <div className="flex justify-between items-center mb-6">
                    <button onClick={onBack} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div className="flex space-x-3">
                        <button onClick={onGoToWallet} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors" title="Wallet">
                            <Wallet size={20} />
                        </button>
                        <button onClick={onGoToSettings} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors" title="Settings">
                            <Settings size={20} />
                        </button>
                    </div>
                </div>

                <div className="absolute -bottom-10 left-6 flex items-end">
                    <img src={me.avatar} alt="Profile" className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white" />
                </div>
            </div>

            <div className="px-6 mt-2">
                <h1 className="text-2xl font-extrabold text-gray-900">{me.name}</h1>
                <p className="text-gray-500 text-sm mb-6">{me.email}</p>

                {/* Tabs */}
                <div className="flex border-b border-gray-200 mb-6">
                    <button
                        onClick={() => setActiveTab('PERSONAL')}
                        className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'PERSONAL' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <UserIcon size={16} />
                        <span>Personal</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('BANK')}
                        className={`flex items-center space-x-2 py-2 px-4 border-b-2 font-medium text-sm transition-colors ${activeTab === 'BANK' ? 'border-brand-600 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
                    >
                        <Building2 size={16} />
                        <span>Bank Details</span>
                    </button>
                </div>

                {activeTab === 'PERSONAL' ? (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Mobile</label>
                            <p className="font-medium text-gray-800 mt-1">{me.phoneNumber || 'Not set'}</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Birthday</label>
                                <p className="font-medium text-gray-800 mt-1">{me.dob || 'Not set'}</p>
                            </div>
                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-wide">Gender</label>
                                <p className="font-medium text-gray-800 mt-1">{me.sex || 'Not set'}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSaveBank} className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-yellow-50 p-3 rounded-lg flex items-start space-x-3 text-sm text-yellow-800 border border-yellow-100 mb-4">
                            <Lock size={16} className="mt-0.5 flex-shrink-0" />
                            <p>These details are used for receiving cash gifts from your wallet. They are kept secure.</p>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Holder Name</label>
                            <input
                                value={bankDraft.accountName}
                                onChange={e => setBankDraft({ ...bankDraft, accountName: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                placeholder="Name as per bank records"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                            <input
                                value={bankDraft.accountNumber}
                                onChange={e => setBankDraft({ ...bankDraft, accountNumber: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                type="password"
                                placeholder="XXXXXXXXXXXX"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Bank Name</label>
                            <input
                                value={bankDraft.bankName}
                                onChange={e => setBankDraft({ ...bankDraft, bankName: e.target.value })}
                                className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                placeholder="e.g. HDFC, SBI"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">IFSC Code</label>
                                <input
                                    value={bankDraft.ifscCode}
                                    onChange={e => setBankDraft({ ...bankDraft, ifscCode: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="ABCD0123456"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">PAN Number</label>
                                <input
                                    value={bankDraft.panNumber}
                                    onChange={e => setBankDraft({ ...bankDraft, panNumber: e.target.value })}
                                    className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500"
                                    placeholder="ABCDE1234F"
                                />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold flex items-center justify-center space-x-2 hover:bg-brand-700 shadow-md">
                            <Save size={18} />
                            <span>Save Details</span>
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

// --- Settings ---
interface SettingsViewProps {
    me: User;
    onBack: () => void;
    onSave: (settings: any) => void;
    currencySymbol: string;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ me, onBack, onSave, currencySymbol }) => {
    const [settings, setSettings] = useState(me.settings);

    return (
        <div className="px-4 pb-24">
            <div className="flex items-center mb-6"><button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button><h2 className="text-xl font-bold text-gray-800 ml-2">Settings</h2></div>
            <div className="bg-white p-6 rounded-2xl shadow-sm space-y-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Default Gift Amount ({currencySymbol})</label>
                    <input type="number" value={settings.defaultGiftAmount} onChange={e => setSettings({ ...settings, defaultGiftAmount: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Gift Limit ({currencySymbol})</label>
                    <input type="number" value={settings.maxGiftAmount} onChange={e => setSettings({ ...settings, maxGiftAmount: Number(e.target.value) })} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
                    <select value={settings.currency} onChange={e => setSettings({ ...settings, currency: e.target.value })} className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500">
                        <option value="USD">USD ($)</option>
                        <option value="INR">INR (₹)</option>
                        <option value="EUR">EUR (€)</option>
                        <option value="GBP">GBP (£)</option>
                    </select>
                </div>
                <div className="flex items-center justify-between py-2">
                    <div><p className="font-medium text-gray-900">Auto-Accept Friends</p><p className="text-xs text-gray-500">Automatically accept new requests</p></div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={settings.autoAcceptContacts} onChange={e => setSettings({ ...settings, autoAcceptContacts: e.target.checked })} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-600"></div>
                    </label>
                </div>
                <button onClick={() => onSave(settings)} className="w-full bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 shadow-md">Save Changes</button>
            </div>
        </div>
    );
};

// --- Wallet ---
interface WalletViewProps {
    me: User;
    wishlist: WishlistItem[];
    onBack: () => void;
    currencySymbol: string;
}

export const WalletView: React.FC<WalletViewProps> = ({ me, wishlist, onBack, currencySymbol }) => {
    // Calculate balances
    const myReceivedContributions = wishlist
        .filter(w => w.userId === me.id)
        .flatMap(w => w.contributions);

    const freeBalance = myReceivedContributions
        .filter(c => c.type === ContributionType.FREE)
        .reduce((sum, c) => sum + c.amount, 0);

    // Mock logic: assuming some locked funds are released for cancelled items
    const cancelledItems = wishlist.filter(w => w.userId === me.id && w.status === 'CANCELLED');
    const refundedBalance = cancelledItems
        .flatMap(w => w.contributions)
        .filter(c => c.type === ContributionType.LOCKED)
        .reduce((sum, c) => sum + c.amount, 0);

    const totalBalance = freeBalance + refundedBalance;

    return (
        <div className="px-4 pb-24">
            <div className="flex items-center mb-6"><button onClick={onBack} className="p-2 -ml-2 text-gray-500 hover:text-gray-800"><ArrowLeft size={24} /></button><h2 className="text-xl font-bold text-gray-800 ml-2">My Wallet</h2></div>

            <div className="bg-gray-900 text-white rounded-2xl p-6 shadow-xl mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-6 opacity-10"><Wallet size={100} /></div>
                <p className="text-gray-400 text-sm font-medium mb-1">Available Balance</p>
                <h1 className="text-4xl font-extrabold mb-6">{currencySymbol}{totalBalance.toFixed(2)}</h1>
                <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <p className="text-xs text-gray-300 mb-1">Flexi Funds</p>
                        <p className="font-bold text-lg">{currencySymbol}{freeBalance}</p>
                    </div>
                    <div className="bg-white/10 p-3 rounded-xl backdrop-blur-sm">
                        <p className="text-xs text-gray-300 mb-1">Refunds</p>
                        <p className="font-bold text-lg">{currencySymbol}{refundedBalance}</p>
                    </div>
                </div>
            </div>

            <div className="flex space-x-3 mb-8">
                <button className="flex-1 bg-brand-600 text-white py-3 rounded-xl font-bold shadow-lg shadow-brand-200 hover:bg-brand-700 transition-colors">Withdraw</button>
                <button className="flex-1 bg-white border border-gray-200 text-gray-700 py-3 rounded-xl font-bold hover:bg-gray-50 transition-colors">History</button>
            </div>

            {/* Recent Activity Mock */}
            <div>
                <h3 className="font-bold text-gray-800 mb-4">Recent Activity</h3>
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    {myReceivedContributions.length > 0 ? (
                        <div className="divide-y divide-gray-100">
                            {myReceivedContributions.slice(0, 5).map((c, i) => (
                                <div key={i} className="p-4 flex justify-between items-center">
                                    <div className="flex items-center space-x-3">
                                        <div className={`p-2 rounded-full ${c.type === ContributionType.FREE ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                            {c.type === ContributionType.FREE ? <CreditCard size={18} /> : <Lock size={18} />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-sm text-gray-900">{c.type === ContributionType.FREE ? 'Flexi Contribution' : 'Locked Contribution'}</p>
                                            <p className="text-xs text-gray-500">{new Date(c.timestamp).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <span className="font-bold text-green-600">+{currencySymbol}{c.amount}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-6 text-center text-gray-400 text-sm">No recent transactions.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

// --- Friend Profile ---
interface FriendProfileViewProps {
    friendId: string;
    events: Event[];
    wishlist: WishlistItem[];
    currencySymbol: string;
    onBack: () => void;
    onItemClick: (itemId: string) => void;
    onContribute: (item: WishlistItem, amount?: number) => void;
}

export const FriendProfileView: React.FC<FriendProfileViewProps> = ({ friendId, events, wishlist, currencySymbol, onBack, onItemClick, onContribute }) => {
    // We fetch the friend from Mock Data inside here or pass it in.
    const friend = MOCK_USERS.find((u: any) => u.id === friendId) as User;

    if (!friend) return <div>User not found</div>;

    const friendEvents = events.filter(e => e.userId === friendId && e.status === 'ACTIVE' && e.visibility === 'PUBLIC');
    const friendWishes = wishlist; // Filtered by parent already

    return (
        <div className="pb-24">
            {/* Header */}
            <div className="relative">
                <div className="h-32 bg-gradient-to-r from-blue-400 to-indigo-500"></div>
                <div className="absolute top-4 left-4"><button onClick={onBack} className="p-2 bg-white/20 text-white rounded-full backdrop-blur-md hover:bg-white/30"><ArrowLeft size={20} /></button></div>
                <div className="px-6 flex flex-col items-center -mt-12">
                    <img src={friend.avatar} alt={friend.name} className="w-24 h-24 rounded-full border-4 border-white shadow-md bg-white" />
                    <h1 className="mt-2 text-2xl font-bold text-gray-900">{friend.name}</h1>
                    <p className="text-gray-500 text-sm">Member since 2024</p>
                </div>
            </div>

            <div className="px-6 mt-8 space-y-8">
                {/* Events */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center"><Calendar size={18} className="mr-2 text-brand-500" /> Public Events</h3>
                    {friendEvents.length > 0 ? (
                        <div className="flex space-x-3 overflow-x-auto pb-4 scrollbar-hide">
                            {friendEvents.map(e => (
                                <div key={e.id} className="flex-shrink-0 w-60 bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-3 opacity-5 text-brand-500">{getEventIcon(e.type)}</div>
                                    <p className="text-xs font-bold text-brand-600 mb-1 uppercase tracking-wide">{e.type}</p>
                                    <h4 className="font-bold text-gray-900 mb-1">{e.title}</h4>
                                    <p className="text-sm text-gray-500">{new Date(e.date).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : <p className="text-gray-400 text-sm italic">No public events.</p>}
                </div>

                {/* Wishlist */}
                <div>
                    <h3 className="font-bold text-gray-800 mb-3 flex items-center"><Grid size={18} className="mr-2 text-brand-500" /> Active Wishes</h3>
                    {friendWishes.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {friendWishes.map(item => (
                                <WishlistCard
                                    key={item.id}
                                    item={item}
                                    isOwn={false}
                                    currencySymbol={currencySymbol}
                                    onClick={onItemClick}
                                    onContribute={onContribute}
                                />
                            ))}
                        </div>
                    ) : <p className="text-gray-400 text-sm italic">No active wishes.</p>}
                </div>
            </div>
        </div>
    );
};
