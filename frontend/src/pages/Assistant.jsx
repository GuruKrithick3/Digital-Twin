import React, { useState, useEffect } from 'react';
import DataBadge from '../components/DataBadge';
import { queryAssistant } from '../services/api';
import { BotMessageSquare, Send, User, Sparkles, Database } from 'lucide-react';

const STORAGE_KEY = 'assistant-conversation';

const initialMessage = {
  sender: 'assistant',
  text: 'Greetings. I am the Antarctic Twin AI Operational Assistant. I query live telemetry, energy models, and logistics reserves from Maitri & Bharati to answer operational queries with grounded precision. How may I assist station management today?',
  grounding: null
};

function loadMessages() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    // ignore corrupted storage
  }
  return [initialMessage];
}

export default function Assistant() {
  const [station, setStation] = useState('Bharati');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState(loadMessages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input;
    setInput('');
    setMessages(prev => [...prev, { sender: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const res = await queryAssistant({ question: userQuery, station });
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: res.data.answer,
          grounding: res.data.groundingData
        }
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: 'Error querying operational telemetry database.',
          grounding: null
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between shrink-0 flex-wrap gap-3">
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold text-white font-heading tracking-wide">AI Operations Assistant</h2>
            <DataBadge type="simulated" />
          </div>
          <p className="text-xs text-slate-400 font-sans mt-0.5">Grounded operational question-answering integrated directly with platform state</p>
        </div>

        <div className="flex items-center space-x-1.5 bg-slate-900/60 p-1 rounded-lg border border-white/[0.08]">
          <button
            onClick={() => setStation('Maitri')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-heading tracking-wider transition-all ${
              station === 'Maitri' ? 'bg-[#3A86FF] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Maitri Context
          </button>
          <button
            onClick={() => setStation('Bharati')}
            className={`px-3.5 py-1.5 rounded-md text-xs font-semibold font-heading tracking-wider transition-all ${
              station === 'Bharati' ? 'bg-[#3A86FF] text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Bharati Context
          </button>
        </div>
      </div>

      <div className="glass-panel rounded-xl flex flex-col min-h-0 flex-1 overflow-hidden">
        {/* Chat Thread */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-lg bg-[#3A86FF]/15 border border-[#3A86FF]/40 flex items-center justify-center text-cyan-400 shrink-0 mt-0.5">
                  <BotMessageSquare className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-xl text-xs leading-relaxed font-sans ${
                  msg.sender === 'user'
                    ? 'bg-[#3A86FF] text-white rounded-tr-none font-medium shadow-sm'
                    : 'bg-slate-900/80 text-slate-200 border border-white/[0.08] rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                {msg.text}

                {msg.grounding && (
                  <div className="mt-3 pt-2.5 border-t border-white/[0.08] text-[11px] text-cyan-300 font-mono flex items-center justify-between gap-2">
                    <span>Grounded telemetry context: {msg.grounding.station}</span>
                    <DataBadge type="real" />
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-lg bg-slate-900/80 border border-white/[0.08] flex items-center justify-center text-slate-300 shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-cyan-400 font-mono">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Querying Station Telemetry & Running Physics Checks...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-4 bg-slate-950/80 border-t border-white/[0.08] flex items-center space-x-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={`Ask an operational query (e.g. "Can ${station} operate for the next 30 days without resupply?")`}
            className="flex-1 bg-slate-900/80 border border-white/10 rounded-lg px-4 py-2.5 text-xs text-white font-sans placeholder-slate-400 focus:outline-none focus:border-cyan-400/50 focus:ring-1 focus:ring-cyan-400/30 transition-colors"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 rounded-lg bg-[#3A86FF] text-white font-semibold font-heading tracking-wide text-xs hover:bg-[#3A86FF]/80 transition-all flex items-center space-x-1.5 shadow-sm disabled:opacity-60"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
}

