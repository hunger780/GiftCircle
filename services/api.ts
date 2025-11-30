
import { User, WishlistItem, Event } from '../types';
import { MOCK_USERS, INITIAL_WISHLIST, INITIAL_EVENTS, USE_MOCK_DATA } from '../constants';

// Backend URLs - Fallback to mock if fetch fails in this demo env
const AUTH_URL = 'http://localhost:8081/auth';
const API_URL = 'http://localhost:8080/api';

const isBackendAvailable = async () => {
    try {
        await fetch(`${API_URL}/users`, { method: 'HEAD' });
        return true;
    } catch {
        return false;
    }
};

// API Wrapper that toggles between Real Backend and Mock Data
export const api = {
    auth: {
        login: async (email: string, password: string): Promise<{user: User | null, token: string | null}> => {
            if (USE_MOCK_DATA) {
                return { user: MOCK_USERS[0], token: 'mock-token' };
            }
            try {
                const res = await fetch(`${AUTH_URL}/login`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({email, password})
                });
                if (res.ok) {
                    const data = await res.json();
                    // In a real app, we'd fetch the full user details here using data.userId
                    const user = MOCK_USERS.find(u => u.id === 'u1') || null; 
                    return { user, token: data.token };
                }
            } catch (e) {
                console.warn("Backend login failed, using mock");
            }
            // Fallback Mock
            return { user: MOCK_USERS[0], token: 'mock-token' };
        }
    },
    users: {
        get: async (id: string): Promise<User | null> => {
            if (USE_MOCK_DATA) {
                return MOCK_USERS.find(u => u.id === id) || null;
            }
            try {
                const res = await fetch(`${API_URL}/users/${id}`);
                if (res.ok) return await res.json();
            } catch (e) {}
            return MOCK_USERS.find(u => u.id === id) || null;
        },
        getAll: async (): Promise<User[]> => {
            if (USE_MOCK_DATA) {
                return MOCK_USERS;
            }
            try {
                const res = await fetch(`${API_URL}/users`);
                if (res.ok) return await res.json();
            } catch (e) {}
            return MOCK_USERS;
        },
        create: async (user: User): Promise<User> => {
            if (USE_MOCK_DATA) {
                return user;
            }
            try {
                const res = await fetch(`${API_URL}/users`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(user)
                });
                if (res.ok) return await res.json();
            } catch (e) {}
            return user;
        }
    },
    wishlist: {
        getAll: async (): Promise<WishlistItem[]> => {
            if (USE_MOCK_DATA) {
                return INITIAL_WISHLIST;
            }
            try {
                const res = await fetch(`${API_URL}/wishlist`);
                if (res.ok) return await res.json();
            } catch (e) {}
            return INITIAL_WISHLIST;
        },
        create: async (item: WishlistItem): Promise<WishlistItem> => {
            if (USE_MOCK_DATA) {
                return item;
            }
             try {
                const res = await fetch(`${API_URL}/wishlist`, {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(item)
                });
                if (res.ok) return await res.json();
            } catch (e) {}
            return item;
        },
        update: async (item: WishlistItem): Promise<WishlistItem> => {
            if (USE_MOCK_DATA) {
                return item;
            }
             try {
                const res = await fetch(`${API_URL}/wishlist/${item.id}`, {
                    method: 'PUT',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify(item)
                });
                if (res.ok) return await res.json();
            } catch (e) {}
            return item;
        }
    },
    events: {
        getAll: async (): Promise<Event[]> => {
            if (USE_MOCK_DATA) {
                return INITIAL_EVENTS;
            }
            try {
                const res = await fetch(`${API_URL}/events`);
                if (res.ok) return await res.json();
            } catch (e) {}
            return INITIAL_EVENTS;
        }
    }
};
