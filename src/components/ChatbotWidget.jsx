import { useEffect, useRef, useState } from 'react';
import {
  Bell,
  ChevronRight,
  Home,
  MessageCircle,
  Phone,
  Send,
  ShieldAlert,
  Waves,
  X,
} from 'lucide-react';
import '../styles/ChatbotWidget.css';

/* ─────────── Cute AI Robot icon (used inside the FAB + as the assistant
   bubble avatar). Inline SVG so it inherits color and scales crisply. */
function CuteBotIcon({ size = 40, className }) {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      aria-hidden="true"
    >
      {/* Antenna bulb */}
      <circle cx="24" cy="6" r="2.6" fill="#06B6D4" />
      <circle cx="24" cy="6" r="4.2" fill="#06B6D4" opacity="0.25" />
      <rect x="23" y="7.5" width="2" height="5" rx="1" fill="#E0F2FE" />

      {/* Headphones (cans) */}
      <rect x="4.5" y="20" width="5.5" height="11" rx="2.7" fill="#2563EB" />
      <rect x="38" y="20" width="5.5" height="11" rx="2.7" fill="#2563EB" />
      <rect x="5.5" y="22" width="3.5" height="7" rx="1.5" fill="#06B6D4" opacity="0.45" />
      <rect x="39" y="22" width="3.5" height="7" rx="1.5" fill="#06B6D4" opacity="0.45" />

      {/* Head body */}
      <rect x="9" y="12" width="30" height="28" rx="12" fill="#F8FBFF" />
      <rect
        x="9"
        y="12"
        width="30"
        height="28"
        rx="12"
        stroke="#06B6D4"
        strokeOpacity="0.45"
        strokeWidth="1.2"
      />

      {/* Visor / face plate */}
      <rect x="13" y="18" width="22" height="14" rx="7" fill="#0B1F3A" />
      <rect
        x="13"
        y="18"
        width="22"
        height="14"
        rx="7"
        stroke="#06B6D4"
        strokeOpacity="0.45"
        strokeWidth="0.8"
      />

      {/* Smiling eyes */}
      <path
        d="M17 25 Q19.5 22.5 22 25"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M26 25 Q28.5 22.5 31 25"
        stroke="#06B6D4"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />

      {/* Cheek glows */}
      <circle cx="14.5" cy="34" r="1.6" fill="#06B6D4" opacity="0.45" />
      <circle cx="33.5" cy="34" r="1.6" fill="#06B6D4" opacity="0.45" />

      {/* Chin highlight */}
      <path
        d="M19 38 Q24 41 29 38"
        stroke="#2563EB"
        strokeOpacity="0.25"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

/* Quick-reply prompts shown when the chat first opens. */
const QUICK_REPLIES = [
  {
    id: 'flood-risk',
    label: 'How do I check my flood risk?',
    Icon: ShieldAlert,
    tint: '#2563EB',
    keywords: ['flood risk', 'check risk', 'my risk', 'risk page', 'forecast'],
    answer:
      'Click the Check Flood Risk button on the home page, allow location access, and C Guard will show your Union Council level 24h, 48h, and 72h flood forecast.',
  },
  {
    id: 'shelters',
    label: 'Where can I find shelters?',
    Icon: Home,
    tint: '#0EA5E9',
    keywords: ['shelter', 'shelters', 'where to go', 'safe place', 'evacuate'],
    answer:
      'Open the Emergency page or View Emergency Resources to see available flood shelters, capacity, and support facilities.',
  },
  {
    id: 'risk-levels',
    label: 'What do risk levels mean?',
    Icon: Waves,
    tint: '#06B6D4',
    keywords: ['risk level', 'levels', 'low', 'medium', 'high', 'very high', 'exc'],
    answer:
      'Flood risk is shown as Low, Medium, High, Very High, and Exc. High using percentage-based categories.',
  },
  {
    id: 'alerts',
    label: 'How do alerts work?',
    Icon: Bell,
    tint: '#1D4ED8',
    keywords: ['alert', 'alerts', 'notify', 'subscribe', 'email', 'sms'],
    answer:
      'You can enable email or SMS alerts from the flood risk page after your location and Union Council are detected.',
  },
  {
    id: 'contacts',
    label: 'Emergency contacts',
    Icon: Phone,
    tint: '#DC2626',
    keywords: ['emergency', 'contact', 'phone', 'rescue', 'pdma', 'police', '1122'],
    answer:
      'Visit the Emergency page to view PDMA, Rescue 1122, police, and district administration contact numbers.',
  },
];

const FALLBACK_REPLY =
  "I’m still learning. Please use the quick options or visit the relevant C Guard page for more details.";

const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

const WELCOME_MESSAGE = () => ({
  id: 'welcome',
  role: 'assistant',
  text: 'Hi! 👋 I can help you understand flood risk, shelters, emergency contacts, and alerts. How can I help you today?',
});

const matchQuickReply = (text) => {
  const lower = String(text).toLowerCase();
  for (const reply of QUICK_REPLIES) {
    if (reply.keywords.some((kw) => lower.includes(kw))) {
      return reply.answer;
    }
  }
  return FALLBACK_REPLY;
};

export default function ChatbotWidget({ hidden = false }) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([WELCOME_MESSAGE()]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /* Auto-scroll to newest message / typing indicator. */
  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [messages, isTyping, isOpen]);

  /* Focus the input when the panel opens. */
  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (hidden) return null;

  const onlyWelcome = messages.length === 1 && messages[0].id === 'welcome';

  const pushReply = (userText, replyText) => {
    setMessages((prev) => [
      ...prev,
      { id: buildId(), role: 'user', text: userText },
    ]);
    setIsTyping(true);
    window.setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { id: buildId(), role: 'assistant', text: replyText },
      ]);
      setIsTyping(false);
    }, 650);
  };

  const handleQuickReply = (reply) => pushReply(reply.label, reply.answer);

  const handleSubmit = (event) => {
    event.preventDefault();
    const text = inputText.trim();
    if (!text) return;
    setInputText('');
    pushReply(text, matchQuickReply(text));
  };

  /* FAB and panel render as siblings in the same wrapper. FAB is always
     rendered (just visually re-skinned via .cg-chatbot--open) so the widget
     can never "disappear" between state changes. */
  return (
    <div
      className={`cg-chatbot ${isOpen ? 'cg-chatbot--open' : 'cg-chatbot--closed'}`}
      aria-live="polite"
    >
      <button
        type="button"
        className="cg-chatbot-fab"
        aria-label={isOpen ? 'Close C Guard Assistant' : 'Open C Guard Assistant'}
        aria-expanded={isOpen}
        data-tooltip="Need Flood Help?"
        onClick={() => setIsOpen((value) => !value)}
      >
        <span className="cg-chatbot-fab-halo" aria-hidden="true" />
        <span className="cg-chatbot-fab-orb" aria-hidden="true" />
        <span className="cg-chatbot-fab-ring" aria-hidden="true" />
        <span className="cg-chatbot-fab-icon" aria-hidden="true">
          {isOpen ? (
            <X size={28} strokeWidth={2.5} />
          ) : (
            <CuteBotIcon size={42} className="cg-chatbot-bot-svg" />
          )}
        </span>
        <span className="cg-chatbot-online-dot" aria-hidden="true" />
      </button>

      {isOpen && (
        <section
          className="cg-chatbot-panel"
          role="dialog"
          aria-modal="false"
          aria-labelledby="cg-chatbot-title"
        >
          <header className="cg-chatbot-header">
            <div className="cg-chatbot-header-left">
              <span className="cg-chatbot-avatar" aria-hidden="true">
                <CuteBotIcon size={30} className="cg-chatbot-bot-svg" />
                <span className="cg-chatbot-avatar-dot" />
              </span>
              <div className="cg-chatbot-titles">
                <h3 id="cg-chatbot-title" className="cg-chatbot-title">
                  C Guard AI Assistant
                </h3>
                <span className="cg-chatbot-status">Online • Flood Safety Guide</span>
              </div>
            </div>
          </header>

          <div className="cg-chatbot-body">
            <div className="cg-chatbot-messages">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`cg-chatbot-msg cg-chatbot-msg--${msg.role}`}
                >
                  {msg.role === 'assistant' && (
                    <span className="cg-chatbot-msg-avatar" aria-hidden="true">
                      <CuteBotIcon size={20} className="cg-chatbot-bot-svg" />
                    </span>
                  )}
                  <p className="cg-chatbot-bubble">{msg.text}</p>
                </div>
              ))}
              {isTyping && (
                <div className="cg-chatbot-msg cg-chatbot-msg--assistant">
                  <span className="cg-chatbot-msg-avatar" aria-hidden="true">
                    <CuteBotIcon size={20} className="cg-chatbot-bot-svg" />
                  </span>
                  <p className="cg-chatbot-bubble cg-chatbot-bubble--typing">
                    <span className="cg-typing-dot" />
                    <span className="cg-typing-dot" />
                    <span className="cg-typing-dot" />
                  </p>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {onlyWelcome && !isTyping && (
              <div className="cg-chatbot-quick">
                <span className="cg-chatbot-quick-label">
                  <MessageCircle size={12} strokeWidth={2.4} />
                  Quick questions
                </span>
                <div className="cg-chatbot-quick-list">
                  {QUICK_REPLIES.map((reply) => {
                    const Icon = reply.Icon;
                    return (
                      <button
                        key={reply.id}
                        type="button"
                        className="cg-chatbot-quick-btn"
                        onClick={() => handleQuickReply(reply)}
                      >
                        <span
                          className="cg-chatbot-quick-icon"
                          style={{
                            background: `${reply.tint}1A`,
                            color: reply.tint,
                          }}
                          aria-hidden="true"
                        >
                          <Icon size={15} strokeWidth={2.4} />
                        </span>
                        <span className="cg-chatbot-quick-text">{reply.label}</span>
                        <ChevronRight
                          size={15}
                          strokeWidth={2.4}
                          className="cg-chatbot-quick-arrow"
                          aria-hidden="true"
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <form className="cg-chatbot-input" onSubmit={handleSubmit}>
            <div className="cg-chatbot-input-wrap">
              <input
                ref={inputRef}
                type="text"
                className="cg-chatbot-input-field"
                placeholder="Ask me about floods, shelters, alerts..."
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                aria-label="Message C Guard AI Assistant"
              />
            </div>
            <button
              type="submit"
              className="cg-chatbot-send-btn"
              aria-label="Send message"
              disabled={!inputText.trim()}
            >
              <Send size={18} strokeWidth={2.4} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}
