import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  Trash2,
  Sparkles,
  User as UserIcon,
  HelpCircle,
  RefreshCw,
  Lightbulb
} from 'lucide-react';
import { apiRequest } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at: string;
}

export const AssistantChat: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputPrompt, setInputPrompt] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [sending, setSending] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedPrompts = [
    'How do I dispose of a greasy pizza box?',
    'Is broken drinking glass recyclable with jars?',
    'What do resin identification codes 1 to 7 mean?',
    'Where should I take old lithium batteries and phones?',
    'How do I balance greens and browns for home compost?',
    'Can aerosol hairspray cans go in metal recycling?'
  ];

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<ChatMessage[]>('/api/v1/assistant/history');
      setMessages(data);
    } catch (err) {
      console.error('Failed to load chat history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputPrompt).trim();
    if (!text || sending) return;

    setInputPrompt('');
    setSending(true);

    // Optimistically add user message
    const tempUserMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    try {
      const reply = await apiRequest<ChatMessage>('/api/v1/assistant/chat', {
        method: 'POST',
        body: JSON.stringify({ content: text }),
      });
      setMessages((prev) => [...prev.filter((m) => m.id !== tempUserMsg.id), tempUserMsg, reply]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: Date.now() + 1,
        role: 'assistant',
        content: `Error: ${err.message || 'Failed to retrieve response. Please try again.'}`,
        created_at: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setSending(false);
    }
  };

  const handleClearHistory = async () => {
    try {
      await apiRequest('/api/v1/assistant/history', { method: 'DELETE' });
      setMessages([]);
    } catch (err) {
      console.error('Failed to clear history:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-2 border-b border-[#E3EAE4] shrink-0">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Interactive Guidance
            </span>
            <span className="text-xs text-textSecondary">Knowledge-Base Engine</span>
          </div>
          <h2 className="text-xl font-extrabold text-eco-900 tracking-tight mt-0.5">AI Recycling Assistant</h2>
        </div>

        {messages.length > 0 && (
          <button
            onClick={handleClearHistory}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear History</span>
          </button>
        )}
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto py-1 scrollbar-none shrink-0 text-xs">
        <span className="text-[11px] font-bold text-textSecondary shrink-0 flex items-center gap-1">
          <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
          Suggested:
        </span>
        {suggestedPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleSendMessage(p)}
            className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 border border-[#E3EAE4] text-eco-900 whitespace-nowrap transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Chat Messages Scroll Window */}
      <div className="flex-1 bg-white rounded-2xl border border-[#E3EAE4] shadow-sm p-4 sm:p-6 overflow-y-auto space-y-4">
        {loading ? (
          <div className="text-center py-12 text-xs text-textSecondary animate-pulse">
            Loading assistant conversation...
          </div>
        ) : messages.length === 0 ? (
          <div className="text-center py-12 max-w-md mx-auto space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-eco-50 border border-eco-200 text-eco-700 flex items-center justify-center mx-auto">
              <Bot className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-eco-900">How can I assist your recycling today?</h3>
            <p className="text-xs text-textSecondary leading-relaxed">
              Ask me any question about proper waste segregation, plastic types, hazardous chemicals,
              backyard composting, or electronic waste safety.
            </p>
          </div>
        ) : (
          messages.map((m) => {
            const isUser = m.role === 'user';
            return (
              <div
                key={m.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-bold ${
                    isUser
                      ? 'bg-eco-700 text-white'
                      : 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                  }`}
                >
                  {isUser ? user?.full_name?.charAt(0) || 'U' : <Bot className="w-4 h-4" />}
                </div>

                <div
                  className={`max-w-[80%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed space-y-1 ${
                    isUser
                      ? 'bg-eco-700 text-white rounded-tr-none'
                      : 'bg-[#F7FAF7] text-eco-900 border border-[#E3EAE4] rounded-tl-none whitespace-pre-line'
                  }`}
                >
                  <p>{m.content}</p>
                  <span
                    className={`block text-[10px] mt-1 ${
                      isUser ? 'text-emerald-100/70 text-right' : 'text-gray-400'
                    }`}
                  >
                    {new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            );
          })
        )}

        {sending && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-[#F7FAF7] p-3 rounded-2xl border border-[#E3EAE4] text-xs text-textSecondary flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-700" />
              <span>Consulting recycling knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage();
        }}
        className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#E3EAE4] shadow-sm shrink-0"
      >
        <input
          type="text"
          placeholder="Ask a question about recycling or waste disposal..."
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          className="flex-1 px-4 py-2 text-xs sm:text-sm bg-transparent focus:outline-none"
        />
        <button
          type="submit"
          disabled={!inputPrompt.trim() || sending}
          className="p-2.5 rounded-xl bg-eco-700 hover:bg-eco-800 text-white disabled:opacity-40 shadow-sm transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
