import { useState, useRef, useEffect } from 'react';
import { Send, Bot } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  "What's my renewal date?",
  "Summarize my seat utilization",
  "What action items are outstanding?",
  "How does this year's spend compare to last year?",
];

const INITIAL_MESSAGES = [
  {
    id: 0,
    role: 'bot',
    text: "Hi! I'm the Renewals Bot. I can help you navigate your renewal — ask me about your key dates, usage, action items, or anything else in this hub.",
    ts: new Date().toISOString(),
  },
];

function formatTime(iso) {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

// Stub bot response — replace with a real API call here.
function getBotResponse(userText) {
  const t = userText.toLowerCase();
  if (t.includes('renewal date') || t.includes('when'))
    return "Your renewal date is **September 30, 2026** — that's 105 days away.";
  if (t.includes('seat') || t.includes('utilization'))
    return "You have **250 seats purchased** and **187 actively used** — a utilization rate of 74.8%.";
  if (t.includes('action') || t.includes('outstanding'))
    return "You have **4 open action items**. The most urgent: request an updated usage report from the vendor (due June 30).";
  if (t.includes('spend') || t.includes('cost') || t.includes('compare'))
    return "Current annual spend is **$148,500** — up from $142,500 last year (+4.2%).";
  return "I don't have a specific answer for that yet, but you can find more details in the other tabs above.";
}

export default function ChatbotTab() {
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text) {
    const trimmed = text.trim();
    if (!trimmed) return;

    const userMsg = { id: Date.now(), role: 'user', text: trimmed, ts: new Date().toISOString() };
    const botMsg  = { id: Date.now() + 1, role: 'bot', text: getBotResponse(trimmed), ts: new Date().toISOString() };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput('');
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input); }
  }

  return (
    <div className="flex flex-col h-[calc(100vh-144px)] max-h-[720px]">
      {/* Header */}
      <div className="bg-white border border-slate-200 rounded-t-xl px-5 py-3 flex items-center gap-2">
        <div className="w-7 h-7 bg-indigo-100 rounded-full flex items-center justify-center">
          <Bot className="w-4 h-4 text-indigo-600" />
        </div>
        <div>
          <p className="text-sm font-semibold text-slate-800">Renewals Bot</p>
          <p className="text-xs text-slate-400">Answers based on your renewal data</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto bg-slate-50 border-x border-slate-200 px-5 py-4 space-y-4">
        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={[
              'max-w-[80%] rounded-2xl px-4 py-2.5 text-sm',
              m.role === 'user'
                ? 'bg-indigo-600 text-white rounded-br-sm'
                : 'bg-white border border-slate-200 text-slate-700 rounded-bl-sm shadow-sm',
            ].join(' ')}>
              <p className="whitespace-pre-wrap">{m.text}</p>
              <p className={`text-[10px] mt-1 ${m.role === 'user' ? 'text-indigo-200' : 'text-slate-400'} text-right`}>
                {formatTime(m.ts)}
              </p>
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested prompts */}
      <div className="bg-white border-x border-slate-200 px-5 py-2 flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((p) => (
          <button
            key={p}
            onClick={() => send(p)}
            className="text-xs text-indigo-600 border border-indigo-200 bg-indigo-50 hover:bg-indigo-100 px-3 py-1 rounded-full transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="bg-white border border-slate-200 rounded-b-xl px-4 py-3 flex gap-2">
        <textarea
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKey}
          placeholder="Ask about your renewal…"
          className="flex-1 resize-none text-sm text-slate-700 placeholder-slate-400 border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
        <button
          onClick={() => send(input)}
          disabled={!input.trim()}
          className="self-end bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg p-2 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
