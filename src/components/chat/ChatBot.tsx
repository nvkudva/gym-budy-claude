import { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import type { ChatMessage } from '../../types';
import { sendChatMessage } from '../../services/chatService';

const SUGGESTED_PROMPTS = [
  "What should I eat before a workout?",
  "How do I improve my squat form?",
  "Add more core exercises to my plan",
  "I'm feeling tired, modify my plan for today",
  "What's the best protein intake for muscle gain?",
  "Replace leg day with full body workout",
];

export default function ChatBot() {
  const { profile, plan, messages, addMessage, clearChat, setPlan } = useApp();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  if (!profile) return null;

  async function handleSend(text?: string) {
    const content = (text ?? input).trim();
    if (!content || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    addMessage(userMsg);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(content, profile!, plan, messages);

      const aiMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        role: 'assistant',
        content: response.message,
        timestamp: new Date().toISOString(),
        isPlanUpdate: response.isPlanUpdate,
      };

      addMessage(aiMsg);

      if (response.updatedPlan) {
        setPlan(response.updatedPlan);
      }
    } catch (err) {
      const errMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        role: 'assistant',
        content: '⚠️ Something went wrong. Please check your API key and try again.',
        timestamp: new Date().toISOString(),
      };
      addMessage(errMsg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-full flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-2 pb-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/30">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <div className="text-white font-bold text-sm">AI Coach</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              <span className="text-white/40 text-xs">Always available</span>
            </div>
          </div>
        </div>
        {messages.length > 0 && (
          <button
            onClick={clearChat}
            className="text-white/25 hover:text-white/50 text-xs transition-colors"
          >
            Clear
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 space-y-3">
        {/* Welcome */}
        {messages.length === 0 && (
          <div className="animate-fade-in">
            <div className="glass p-4 rounded-2xl mb-4 bg-gradient-to-br from-pink-500/10 to-rose-600/10 border-pink-500/20">
              <div className="text-2xl mb-2">👋</div>
              <div className="text-white font-semibold mb-1">Hey {profile.name}!</div>
              <div className="text-white/60 text-sm leading-relaxed">
                I'm your personal AI fitness coach. I can answer questions about exercise, nutrition, and help modify your workout plan. What can I help you with?
              </div>
            </div>

            {/* Suggested prompts */}
            <div className="mb-3">
              <div className="text-white/30 text-xs font-medium mb-2 uppercase tracking-wider">Try asking</div>
              <div className="space-y-2">
                {SUGGESTED_PROMPTS.map(prompt => (
                  <button
                    key={prompt}
                    onClick={() => handleSend(prompt)}
                    className="w-full text-left px-4 py-2.5 rounded-xl glass glass-hover text-white/60 text-sm hover:text-white/90 transition-all"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        {messages.map(msg => (
          <MessageBubble key={msg.id} message={msg} userName={profile.name} />
        ))}

        {/* Loading */}
        {loading && (
          <div className="flex items-start gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center flex-shrink-0">
              <span className="text-xs">🤖</span>
            </div>
            <div className="glass px-4 py-3 rounded-2xl rounded-tl-sm">
              <div className="flex gap-1 items-center h-4">
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 px-4 pb-2 pt-3 border-t border-white/[0.06]">
        <div className="flex gap-2 items-end">
          <input
            ref={inputRef}
            className="input-glass flex-1 resize-none"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Ask me anything about fitness..."
            disabled={loading}
          />
          <button
            onClick={() => handleSend()}
            disabled={!input.trim() || loading}
            className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 ${
              input.trim() && !loading
                ? 'bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg shadow-pink-500/30'
                : 'bg-white/[0.08]'
            }`}
          >
            <svg className={`w-4 h-4 ${input.trim() && !loading ? 'text-white' : 'text-white/30'}`}
              fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ message, userName }: { message: ChatMessage; userName: string }) {
  const isUser = message.role === 'user';
  const time = new Date(message.timestamp).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' });

  // Simple markdown-ish formatting: bold **text**, bullet points, line breaks
  function formatContent(content: string) {
    const lines = content.split('\n');
    return lines.map((line, i) => {
      // Bold
      const parts = line.split(/\*\*(.+?)\*\*/g);
      const formatted = parts.map((p, j) =>
        j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{p}</strong> : p
      );

      // Bullet points
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('• ');
      if (isBullet) {
        return (
          <div key={i} className="flex items-start gap-1.5 my-0.5">
            <span className="text-white/40 mt-0.5 flex-shrink-0">•</span>
            <span>{formatted.map((p, j) =>
              typeof p === 'string' ? p.replace(/^[-•]\s*/, '') : p
            )}</span>
          </div>
        );
      }

      return <div key={i} className={i > 0 && line === '' ? 'h-2' : ''}>{formatted}</div>;
    });
  }

  return (
    <div className={`flex items-end gap-2 animate-slide-up ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold ${
        isUser
          ? 'bg-gradient-to-br from-violet-500 to-indigo-600'
          : 'bg-gradient-to-br from-pink-500 to-rose-600'
      }`}>
        {isUser ? userName.slice(0, 1).toUpperCase() : '🤖'}
      </div>

      {/* Bubble */}
      <div className={`max-w-[78%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-gradient-to-br from-violet-600/60 to-indigo-600/60 border border-violet-400/20 rounded-br-sm text-white/90'
            : 'glass border-white/10 rounded-bl-sm text-white/80'
        } ${message.isPlanUpdate ? 'border-green-500/30 bg-green-500/10' : ''}`}>
          {message.isPlanUpdate && (
            <div className="flex items-center gap-1.5 mb-2 text-green-400 text-xs font-semibold">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Plan Updated
            </div>
          )}
          <div className="space-y-0.5">
            {formatContent(message.content)}
          </div>
        </div>
        <span className="text-white/20 text-[10px] px-1">{time}</span>
      </div>
    </div>
  );
}
