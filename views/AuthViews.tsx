
import React from 'react';
import { Gift, ArrowLeft } from 'lucide-react';
import { ViewState } from '../types.ts';

interface LoginProps {
  onLogin: (e: React.FormEvent) => void;
  setView: (view: ViewState) => void;
}

export const LoginView: React.FC<LoginProps> = ({ onLogin, setView }) => (
  <div className="min-h-screen bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in fade-in zoom-in duration-500">
      <div className="text-center mb-8">
        <div className="bg-brand-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 text-brand-600">
          <Gift size={32} />
        </div>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">GiftCircle</h1>
        <p className="text-gray-500">Celebrate moments, together.</p>
      </div>

      <form onSubmit={onLogin} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input 
            type="email" 
            defaultValue="alex@example.com"
            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brand-500 focus:bg-white transition-all outline-none"
            placeholder="Enter your email"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
          <input 
            type="password" 
            defaultValue="password"
            className="w-full p-4 bg-gray-50 rounded-xl border-2 border-transparent focus:border-brand-500 focus:bg-white transition-all outline-none"
            placeholder="••••••••"
          />
        </div>
        <button 
          type="submit" 
          className="w-full bg-brand-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-brand-700 transition-colors shadow-lg shadow-brand-200"
        >
          Sign In
        </button>
      </form>
      <p className="text-center mt-6 text-gray-400 text-sm">
        Don't have an account? <button onClick={() => setView('SIGNUP')} className="text-brand-600 font-bold cursor-pointer hover:underline">Sign up</button>
      </p>
    </div>
  </div>
);

interface SignupProps {
  onSignup: (e: React.FormEvent) => void;
  setView: (view: ViewState) => void;
}

export const SignupView: React.FC<SignupProps> = ({ onSignup, setView }) => (
  <div className="min-h-screen bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center p-4">
    <div className="bg-white w-full max-w-md p-8 rounded-3xl shadow-2xl animate-in slide-in-from-right duration-300">
      <button onClick={() => setView('LOGIN')} className="mb-4 text-gray-400 hover:text-brand-600 flex items-center text-sm font-bold">
        <ArrowLeft size={16} className="mr-1" /> Back to Login
      </button>
      
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
        <p className="text-gray-500 text-sm">Join the gifting revolution today.</p>
      </div>

      <form onSubmit={onSignup} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
           <div>
             <label className="block text-xs font-bold text-gray-500 mb-1">First Name</label>
             <input name="firstName" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
           </div>
           <div>
             <label className="block text-xs font-bold text-gray-500 mb-1">Last Name</label>
             <input name="lastName" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
           </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Date of Birth</label>
            <input name="dob" type="date" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1">Sex</label>
            <select name="sex" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Phone Number</label>
          <input name="phoneNumber" type="tel" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required placeholder="+1 555-000-0000" />
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Email</label>
          <input name="email" type="email" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
        </div>
        <div>
          <label className="block text-xs font-bold text-gray-500 mb-1">Password</label>
          <input name="password" type="password" className="w-full p-3 bg-gray-50 rounded-xl border-none focus:ring-2 focus:ring-brand-500" required />
        </div>

        <button 
          type="submit" 
          className="w-full bg-gray-900 text-white py-4 rounded-xl font-bold text-lg hover:bg-gray-800 transition-colors shadow-lg mt-2"
        >
          Join GiftCircle
        </button>
      </form>
    </div>
  </div>
);
