import React, { useState, useEffect, useRef } from 'react';

import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { TRAIT_CONFIG } from '../utils/helpers';
import toast from 'react-hot-toast';

// ── Message bubble ────────────────────────────────────────────
function MessageBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex gap-3 items-end ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-fade-in`}>
      {/* Avatar */}
      <div className={`w-8 h-8 rounded-xl flex-shrink-0 flex items-center justify-center text-sm font-bold
        ${isUser
          ? 'bg-gradient-to-br from-primary-600 to-purple-600'
          : 'bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600'
        }`}
      >
        {isUser ? '✦' : '🤖'}
      </div>

      {/* Bubble */}
      <div
        className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser
            ? 'bg-gradient-to-br from-primary-600 to-purple-600 text-white rounded-br-sm shadow-lg shadow-primary-500/20'
            : 'bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 rounded-bl-sm'
          }`}
      >
        {msg.content}
        <p className={`text-xs mt-1.5 ${isUser ? 'text-primary-200/60' : 'text-zinc-600'}`}>
          {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </div>
  );
}

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex gap-3 items-end">
      <div className="w-8 h-8 rounded-xl flex-shrink-0 bg-gradient-to-br from-zinc-700 to-zinc-800 border border-zinc-600 flex items-center justify-center text-sm">
        🤖
      </div>
      <div className="px-4 py-3 rounded-2xl rounded-bl-sm bg-zinc-800/80 border border-zinc-700/50">
        <div className="flex gap-1.5 items-center h-4">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-zinc-500"
              style={{ animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Suggested prompts ─────────────────────────────────────────
const SUGGESTED_PROMPTS = [
  "What careers suit my personality best?",
  "How can I improve my weaknesses?",
  "What are my natural leadership strengths?",
  "How should I approach job interviews?",
  "What work environments suit me most?",
  "Help me with work-life balance tips",
];

// ── Main Chat Page ────────────────────────────────────────────
export default function CareerChatPage() {
  const { user } = useAuth();
  const [messages, setMessages]   = useState([]);
  const [input, setInput]         = useState('');
  const [sending, setSending]     = useState(false);
  const [personality, setPersonality] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);

  // Load personality for context display
  useEffect(() => {
    api.get('/analysis/latest')
      .then(r => setPersonality(r.data))
      .catch(() => {});
  }, []);

  // Welcome message
  useEffect(() => {
  const welcome = {
    role: 'assistant',
    content: `Hi ${user?.name?.split(' ')[0] || 'there'}! 👋 I'm Alex, your personal AI career coach.\n\nI've been briefed on your personality profile${personality ? ` — you're ${personality.personalityType}` : ''}. I can help you with career decisions, workplace strategies, personal growth, and more.\n\nWhat's on your mind today?`,
    timestamp: new Date().toISOString(),
  };
  setMessages([welcome]);
}, [personality, user?.name]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const sendMessage = async (text) => {
    const content = (text || input).trim();
    if (!content || sending) return;

    const userMsg = { role: 'user', content, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setSending(true);

    // Build history for context (exclude welcome message, last 10)
    const history = messages.slice(1).slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const { data } = await api.post('/ai/chat', { message: content, history });
      const assistantMsg = {
        role: 'assistant',
        content: data.reply,
        timestamp: data.timestamp,
      };
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Failed to get response. Please try again.';
      toast.error(errMsg);
      // Remove the user message on failure so they can retry
      setMessages(prev => prev.filter(m => m !== userMsg));
      setInput(content);
    } finally {
      setSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages(prev => [prev[0]]); // Keep welcome message
    toast.success('Chat cleared');
  };

  return (
    <div className="h-full flex flex-col max-h-screen">

      {/* ── Header ─────────────────────────────────────── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-zinc-800 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-700 to-teal-700 flex items-center justify-center text-lg shadow-lg">
            🤖
          </div>
          <div>
            <h1 className="font-display text-lg text-white flex items-center gap-2">
              Alex — Career Coach
              <span className="flex gap-1 items-center">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-mono text-emerald-400 font-normal">online</span>
              </span>
            </h1>
            <p className="text-zinc-500 text-xs">
              Powered by GPT-4o · Context-aware with your personality data
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {personality && (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 glass rounded-lg">
              <span className="text-sm">{personality.personalityType?.split(' ')[0]}</span>
              <span className="text-xs text-zinc-400">{personality.personalityType?.split(' ').slice(1).join(' ')}</span>
            </div>
          )}
          <button
            onClick={clearChat}
            className="btn-ghost px-3 py-2 text-xs"
            title="Clear chat history"
          >
            ↺ Clear
          </button>
        </div>
      </div>

      {/* ── Personality Context Bar ───────────────────── */}
      {personality && (
        <div className="flex-shrink-0 px-4 py-2 bg-zinc-900/60 border-b border-zinc-800/50 flex gap-2 overflow-x-auto scrollbar-hide">
          {Object.entries(personality.scores || {}).map(([trait, score]) => (
            <div
              key={trait}
              className="flex-shrink-0 flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium"
              style={{ color: TRAIT_CONFIG[trait]?.color, backgroundColor: TRAIT_CONFIG[trait]?.color + '15' }}
            >
              <span>{TRAIT_CONFIG[trait]?.icon}</span>
              <span className="capitalize hidden sm:inline">{trait.replace('_', ' ')}</span>
              <span className="font-mono font-bold">{score}</span>
            </div>
          ))}
        </div>
      )}

      {/* ── Messages area ─────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 md:px-6 py-6 space-y-5 min-h-0">
        {messages.map((msg, i) => (
          <MessageBubble key={i} msg={msg} />
        ))}
        {sending && <TypingIndicator />}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Suggested prompts ─────────────────────────── */}
      {messages.length <= 1 && !sending && (
        <div className="flex-shrink-0 px-4 md:px-6 pb-3">
          <p className="text-xs text-zinc-600 mb-2 font-medium">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, i) => (
              <button
                key={i}
                onClick={() => sendMessage(prompt)}
                className="text-xs px-3 py-1.5 rounded-full border border-zinc-700 text-zinc-400
                           hover:border-primary-500/50 hover:text-primary-300 hover:bg-primary-900/20
                           transition-all duration-200"
              >
                {prompt}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ── Input area ────────────────────────────────── */}
      <div className="flex-shrink-0 px-4 md:px-6 pb-6 pt-3 border-t border-zinc-800">
        <div className="flex gap-3 items-end">
          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask Alex anything about your career, strengths, or growth…"
              rows={1}
              maxLength={1000}
              className="input resize-none pr-10 py-3.5 leading-relaxed"
              style={{ minHeight: '52px', maxHeight: '140px' }}
              onInput={e => {
                e.target.style.height = 'auto';
                e.target.style.height = Math.min(e.target.scrollHeight, 140) + 'px';
              }}
            />
            {input.length > 800 && (
              <span className="absolute right-3 bottom-3 text-xs text-zinc-600 font-mono">
                {1000 - input.length}
              </span>
            )}
          </div>

          <button
            onClick={() => sendMessage()}
            disabled={!input.trim() || sending}
            className="btn-primary px-4 py-3.5 text-lg flex-shrink-0 disabled:opacity-40"
            title="Send message"
          >
            {sending ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin block" />
            ) : '→'}
          </button>
        </div>
        <p className="text-xs text-zinc-700 mt-2 text-center">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
