'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, X, Bot, Sparkles, User, RefreshCw } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Assistant. I can check product prices, track active stock, update your shopping cart, and compile sales or inventory reports. How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userRoles, setUserRoles] = useState<string[]>([]);
  const [userName, setUserName] = useState<string>('');

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  // Fetch session to determine role-based suggestions and custom greetings
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const res = await fetch('/api/auth/session');
        if (res.ok) {
          const data = await res.json();
          if (data?.user) {
            setUserRoles(data.user.roles || []);
            setUserName(data.user.name || '');
          }
        }
      } catch (e) {
        console.warn('Could not retrieve active session in AI Widget', e);
      }
    };
    fetchSession();
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    if (!textToSend) setInput('');

    const newMessages: Message[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Server error occurred');
      }

      const data = await res.json();
      setMessages((prev) => [...prev, { role: 'assistant', content: data.message }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `⚠️ Error: ${e.message || 'Something went wrong.'}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getSuggestions = () => {
    if (userRoles.includes('ADMIN')) {
      return ['System reports status', 'Check audit logs count', 'Search pricing organic milk'];
    }
    if (userRoles.includes('MANAGER')) {
      return ['Revenue analysis 30 days', 'Inventory forecasting report', 'Check low stock levels'];
    }
    if (userRoles.includes('SALES')) {
      return ['Sales analysis summary', 'Get top customer insights', 'Check stock of bananas'];
    }
    return ['How much are organic bananas?', 'Show items in my cart', 'Track my recent orders'];
  };

  const getRoleBadgeColor = () => {
    if (userRoles.includes('ADMIN')) return 'bg-red-500/10 text-red-500 border border-red-500/20';
    if (userRoles.includes('MANAGER')) return 'bg-amber-500/10 text-amber-500 border border-amber-500/20';
    if (userRoles.includes('SALES')) return 'bg-purple-500/10 text-purple-500 border border-purple-500/20';
    return 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20';
  };

  const getActiveRoleLabel = () => {
    if (userRoles.includes('ADMIN')) return 'ADMIN';
    if (userRoles.includes('MANAGER')) return 'MANAGER';
    if (userRoles.includes('SALES')) return 'SALES';
    return 'CUSTOMER';
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 print:hidden">
      {/* 1. Chat Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-2xl hover:scale-105 hover:bg-primary/95 transition duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 relative group"
        >
          <MessageSquare className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-teal-500"></span>
          </span>
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-card border border-border text-foreground px-3 py-1.5 rounded-xl text-xs font-semibold shadow-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition pointer-events-none">
            Chat with AI Assistant
          </div>
        </button>
      )}

      {/* 2. Floating Chat Container */}
      {isOpen && (
        <div className="flex flex-col h-[450px] max-h-[75vh] w-[320px] sm:w-[360px] md:w-[380px] lg:w-[400px] rounded-[20px] border border-border bg-card/95 backdrop-blur-xl shadow-enterprise overflow-hidden animate-in slide-in-from-bottom-5 duration-300 fixed bottom-6 right-6">
          
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-5 py-3.5 shrink-0">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-white/20 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-bold text-white text-xs sm:text-sm flex items-center gap-1.5 leading-none">
                  OP AI Assistant
                </h4>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className={`inline-flex rounded-full px-1.5 py-0.2 text-[8px] font-bold tracking-wider bg-white/20 text-white`}>
                    {getActiveRoleLabel()}
                  </span>
                  <span className="text-[9px] text-white/80">Online</span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              type="button"
              className="rounded-full bg-white/20 hover:bg-white/30 border-2 border-white/40 p-2.5 text-white transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-white/50 shadow-lg"
              aria-label="Close chat"
            >
              <X className="h-6 w-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Messages Logs Area */}
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 bg-background">
            {messages.map((msg, index) => {
              const isAi = msg.role === 'assistant';
              return (
                <div key={index} className={`flex items-start gap-2.5 animate-in slide-in-from-bottom-2 fade-in duration-300 ${!isAi ? 'flex-row-reverse' : ''}`}>
                  {isAi ? (
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-primary/10 text-primary shrink-0">
                      <Sparkles className="h-3.5 w-3.5" />
                    </div>
                  ) : (
                    <div className="flex h-7 w-7 items-center justify-center rounded-[8px] bg-muted border border-border text-muted-foreground shrink-0">
                      <User className="h-3.5 w-3.5" />
                    </div>
                  )}
                  <div className={`max-w-[80%] rounded-[16px] px-4 py-3 text-xs leading-relaxed shadow-sm ${
                    isAi
                      ? 'bg-gradient-to-br from-card to-muted/50 text-foreground border border-border'
                      : 'bg-gradient-to-br from-primary to-primary/90 text-primary-foreground font-medium'
                  }`}>
                    <div className="space-y-1.5 whitespace-pre-line break-words">
                      {msg.content.split('\n').map((line, i) => {
                        // Bold text between **
                        if (line.includes('**')) {
                          const parts = line.split(/\*\*/g);
                          return (
                            <div key={i}>
                              {parts.map((part, j) => (
                                <span key={j} className={j % 2 === 1 ? 'font-bold text-primary' : ''}>
                                  {part}
                                </span>
                              ))}
                            </div>
                          );
                        }
                        // Bullet points
                        if (line.trim().startsWith('- ') || line.trim().startsWith('• ')) {
                          return <div key={i} className="flex items-start gap-2"><span className="text-primary mt-0.5">•</span><span>{line.replace(/^[•-]\s*/, '')}</span></div>;
                        }
                        // Numbered lists
                        if (/^\d+\./.test(line.trim())) {
                          return <div key={i} className="flex items-start gap-2"><span className="text-primary font-semibold mt-0.5">{line.match(/^\d+/)?.[0]}.</span><span>{line.replace(/^\d+\.\s*/, '')}</span></div>;
                        }
                        // Regular text
                        return <div key={i}>{line}</div>;
                      })}
                    </div>
                  </div>
                </div>
              );
            })}
            
            {/* Loading Indicator */}
            {isLoading && (
              <div className="flex items-start gap-2.5">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0 animate-pulse">
                  <Sparkles className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-muted/40 border border-muted-foreground/5 px-4 py-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-1.5 w-1.5 rounded-full bg-primary animate-bounce" style={{ animationDelay: '300ms' }} />
                  <span className="text-[10px] text-muted-foreground ml-1.5">Checking database...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Prompt Starters */}
          <div className="px-5 pb-2 pt-1 flex flex-wrap gap-1.5 border-t border-border/10 bg-muted/5">
            {getSuggestions().map((s, idx) => (
              <button
                key={idx}
                onClick={() => handleSendMessage(s)}
                disabled={isLoading}
                className="text-[10px] font-semibold text-muted-foreground hover:text-foreground bg-muted/50 hover:bg-muted border border-border px-2 py-1 rounded-xl transition duration-150 shrink-0 truncate max-w-full"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Footer Input */}
          <form
            onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
            className="flex items-center gap-2 border-t border-border bg-muted/20 px-5 py-3"
          >
            <input
              type="text"
              placeholder={isLoading ? 'AI is processing...' : 'Ask the AI...'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              className="flex-1 rounded-xl border border-border bg-card px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-primary/20 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 transition disabled:opacity-50"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>

        </div>
      )}
    </div>
  );
}
