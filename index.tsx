import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Gift, Users, Sparkles, ArrowRight, Check, RefreshCw, Wand2, PartyPopper, ChevronLeft } from 'lucide-react';
import { GoogleGenAI, Type } from "@google/genai";

// --- Types ---
interface Participant {
  id: string;
  name: string;
  interests: string;
}

interface GiftIdea {
  item: string;
  description: string;
  estimatedPrice: string;
}

interface Match {
  giverId: string;
  receiverId: string;
}

// --- AI Service ---
const getGiftIdeas = async (interests: string, budget: string, receiverName: string): Promise<GiftIdea[]> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Suggest 3 specific, creative gift ideas for ${receiverName} who likes: "${interests}". The budget is under ${budget}.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              item: { type: Type.STRING },
              description: { type: Type.STRING },
              estimatedPrice: { type: Type.STRING }
            }
          }
        }
      }
    });
    
    return JSON.parse(response.text || "[]");
  } catch (error) {
    console.error("AI Error:", error);
    return [];
  }
};

const getFestiveMessage = async (giver: string, receiver: string): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Write a short (2-3 lines), rhyming, funny Secret Santa hint message from ${giver} to ${receiver}. Do not reveal the identity directly, just be playful.`,
    });
    return response.text || "Happy Holidays!";
  } catch (error) {
    return "Wishing you a wonderful gift exchange!";
  }
};

// --- Components ---

function App() {
  const [step, setStep] = useState<'intro' | 'setup' | 'participants' | 'drawn'>('intro');
  const [circleName, setCircleName] = useState('');
  const [budget, setBudget] = useState('50');
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [matches, setMatches] = useState<Match[]>([]);
  const [currentViewer, setCurrentViewer] = useState<Participant | null>(null);

  // --- Handlers ---
  
  const handleStart = () => setStep('setup');
  
  const handleSetupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (circleName && budget) setStep('participants');
  };

  const addParticipant = (name: string, interests: string) => {
    const newPerson: Participant = {
      id: crypto.randomUUID(),
      name,
      interests
    };
    setParticipants([...participants, newPerson]);
  };

  const removeParticipant = (id: string) => {
    setParticipants(participants.filter(p => p.id !== id));
  };

  const drawNames = () => {
    if (participants.length < 2) return;
    
    // Simple shuffle and shift algorithm
    const shuffled = [...participants].sort(() => Math.random() - 0.5);
    const newMatches: Match[] = [];
    
    for (let i = 0; i < shuffled.length; i++) {
      const giver = shuffled[i];
      const receiver = shuffled[(i + 1) % shuffled.length];
      newMatches.push({ giverId: giver.id, receiverId: receiver.id });
    }
    
    setMatches(newMatches);
    setStep('drawn');
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-2xl w-full glass-panel rounded-3xl shadow-2xl overflow-hidden min-h-[600px] flex flex-col">
        {/* Header */}
        <div className="bg-emerald-600 p-6 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Gift className="w-6 h-6" />
            <h1 className="font-bold text-xl tracking-tight">GiftCircle</h1>
          </div>
          {step !== 'intro' && (
            <div className="text-emerald-100 text-sm font-medium">
              {step === 'setup' && 'Step 1/3'}
              {step === 'participants' && 'Step 2/3'}
              {step === 'drawn' && 'Circle Ready'}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="p-8 flex-1 flex flex-col">
          {step === 'intro' && (
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold text-slate-800">Magical Gift Exchanges</h2>
              <p className="text-slate-600 max-w-md text-lg">
                Create a circle, add friends, and let our AI help you find the perfect gift.
                Stress-free Secret Santa starts here.
              </p>
              <button 
                onClick={handleStart}
                className="group mt-8 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center gap-2 text-lg shadow-lg hover:shadow-xl"
              >
                Create New Circle
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}

          {step === 'setup' && (
            <div className="max-w-md mx-auto w-full py-8">
              <h2 className="text-2xl font-bold mb-6 text-slate-800">Circle Details</h2>
              <form onSubmit={handleSetupSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Circle Name</label>
                  <input 
                    type="text" 
                    required
                    value={circleName}
                    onChange={(e) => setCircleName(e.target.value)}
                    placeholder="e.g., Office Party 2024"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Budget Limit ($)</label>
                  <input 
                    type="number" 
                    required
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    placeholder="50"
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
                  />
                </div>
                <button 
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Next: Add People
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            </div>
          )}

          {step === 'participants' && (
            <ParticipantManager 
              participants={participants} 
              onAdd={addParticipant} 
              onRemove={removeParticipant}
              onNext={drawNames}
            />
          )}

          {step === 'drawn' && !currentViewer && (
            <div className="flex flex-col items-center justify-center flex-1 space-y-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4 text-emerald-600">
                  <PartyPopper className="w-8 h-8" />
                </div>
                <h2 className="text-2xl font-bold text-slate-800">Matches Generated!</h2>
                <p className="text-slate-600 mt-2">Who are you? Click your name to see your match.</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg overflow-y-auto max-h-[400px] p-2">
                {participants.map(p => (
                  <button
                    key={p.id}
                    onClick={() => setCurrentViewer(p)}
                    className="flex items-center gap-3 p-4 bg-white hover:bg-emerald-50 border border-slate-200 hover:border-emerald-200 rounded-xl transition-all text-left group"
                  >
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 font-bold group-hover:bg-emerald-200 group-hover:text-emerald-700 transition-colors">
                      {p.name.charAt(0)}
                    </div>
                    <span className="font-medium text-slate-700 group-hover:text-emerald-900">{p.name}</span>
                  </button>
                ))}
              </div>
              
              <button onClick={() => setStep('participants')} className="text-sm text-slate-400 hover:text-slate-600">
                Back to editing
              </button>
            </div>
          )}

          {step === 'drawn' && currentViewer && (
            <RevealCard 
              viewer={currentViewer} 
              match={participants.find(p => p.id === matches.find(m => m.giverId === currentViewer.id)?.receiverId)!} 
              budget={budget}
              onBack={() => setCurrentViewer(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// --- Subcomponents ---

function ParticipantManager({ participants, onAdd, onRemove, onNext }: { 
  participants: Participant[], 
  onAdd: (name: string, interests: string) => void,
  onRemove: (id: string) => void,
  onNext: () => void
}) {
  const [name, setName] = useState('');
  const [interests, setInterests] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && interests) {
      onAdd(name, interests);
      setName('');
      setInterests('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      <h2 className="text-2xl font-bold mb-4 text-slate-800">Add Participants</h2>
      
      <form onSubmit={handleSubmit} className="bg-slate-50 p-4 rounded-xl space-y-4 mb-6 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input 
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name (e.g. Sarah)"
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
          <input 
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
            placeholder="Interests (e.g. Cats, Cooking)"
            className="px-4 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <button 
          type="submit"
          disabled={!name || !interests}
          className="w-full bg-white border border-slate-300 text-slate-700 font-medium py-2 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          Add Person
        </button>
      </form>

      <div className="flex-1 overflow-y-auto space-y-2 mb-6 pr-2">
        {participants.length === 0 && (
          <div className="text-center text-slate-400 py-8">
            No participants yet. Add at least 2 people!
          </div>
        )}
        {participants.map(p => (
          <div key={p.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
            <div>
              <div className="font-semibold text-slate-800">{p.name}</div>
              <div className="text-xs text-slate-500">{p.interests}</div>
            </div>
            <button 
              onClick={() => onRemove(p.id)}
              className="text-red-400 hover:text-red-600 p-2"
            >
              &times;
            </button>
          </div>
        ))}
      </div>

      <button 
        onClick={onNext}
        disabled={participants.length < 2}
        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
      >
        <Wand2 className="w-4 h-4" />
        Draw Names
      </button>
    </div>
  );
}

function RevealCard({ viewer, match, budget, onBack }: { 
  viewer: Participant, 
  match: Participant, 
  budget: string,
  onBack: () => void 
}) {
  const [ideas, setIdeas] = useState<GiftIdea[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [loadingMsg, setLoadingMsg] = useState(false);

  const fetchIdeas = async () => {
    setLoading(true);
    const result = await getGiftIdeas(match.interests, budget, match.name);
    setIdeas(result);
    setLoading(false);
  };

  const fetchMessage = async () => {
    setLoadingMsg(true);
    const m = await getFestiveMessage(viewer.name, match.name);
    setMsg(m);
    setLoadingMsg(false);
  };

  return (
    <div className="flex flex-col h-full animate-fadeIn">
      <button onClick={onBack} className="self-start mb-4 text-slate-500 hover:text-emerald-600 flex items-center gap-1 text-sm font-medium">
        <ChevronLeft className="w-4 h-4" /> Back to list
      </button>

      <div className="bg-white rounded-2xl p-8 border border-slate-100 shadow-lg text-center mb-6">
        <h3 className="text-slate-500 font-medium mb-2">Hello, {viewer.name}!</h3>
        <p className="text-2xl font-bold text-slate-800 mb-2">You are buying for</p>
        <div className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 py-2">
          {match.name}
        </div>
        <div className="mt-4 inline-block bg-slate-50 px-4 py-2 rounded-full text-sm text-slate-600 border border-slate-200">
          Likes: {match.interests}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1 overflow-y-auto">
        {/* Gift Ideas Section */}
        <div className="bg-white/50 rounded-xl p-4 border border-white">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
              <Gift className="w-4 h-4 text-emerald-500" /> Gift Ideas
            </h4>
            {!loading && ideas.length === 0 && (
              <button 
                onClick={fetchIdeas}
                className="text-xs bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full hover:bg-emerald-200 transition-colors"
              >
                Ask Gemini
              </button>
            )}
          </div>
          
          {loading && (
            <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-xs">Thinking of perfect gifts...</span>
            </div>
          )}

          {!loading && ideas.length > 0 && (
            <ul className="space-y-3">
              {ideas.map((idea, i) => (
                <li key={i} className="bg-white p-3 rounded-lg border border-slate-100 shadow-sm text-sm">
                  <div className="font-bold text-slate-800 flex justify-between">
                    {idea.item}
                    <span className="text-emerald-600 font-normal">{idea.estimatedPrice}</span>
                  </div>
                  <div className="text-slate-500 mt-1 text-xs">{idea.description}</div>
                </li>
              ))}
            </ul>
          )}
          
          {!loading && ideas.length === 0 && (
            <div className="text-center text-slate-400 text-sm py-8">
              Click 'Ask Gemini' to get curated ideas based on their interests.
            </div>
          )}
        </div>

        {/* Message Section */}
        <div className="bg-white/50 rounded-xl p-4 border border-white flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-slate-700 flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" /> Festive Note
            </h4>
             {!loadingMsg && !msg && (
              <button 
                onClick={fetchMessage}
                className="text-xs bg-purple-100 text-purple-700 px-3 py-1 rounded-full hover:bg-purple-200 transition-colors"
              >
                Write Poem
              </button>
            )}
          </div>

          {loadingMsg && (
             <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
              <RefreshCw className="w-6 h-6 animate-spin" />
              <span className="text-xs">Composing rhyme...</span>
            </div>
          )}

          {msg && (
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border border-purple-100 text-slate-700 italic text-sm leading-relaxed whitespace-pre-wrap">
              "{msg}"
            </div>
          )}
           {!loadingMsg && !msg && (
            <div className="text-center text-slate-400 text-sm py-8">
              Need a fun message for the card? Ask Gemini!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
