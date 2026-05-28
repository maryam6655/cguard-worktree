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
import { useLanguage } from '../context/LanguageContext';
import '../styles/ChatbotWidget.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

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
      <circle cx="24" cy="6" r="2.6" fill="#06B6D4" />
      <circle cx="24" cy="6" r="4.2" fill="#06B6D4" opacity="0.25" />
      <rect x="23" y="7.5" width="2" height="5" rx="1" fill="#E0F2FE" />

      <rect x="4.5" y="20" width="5.5" height="11" rx="2.7" fill="#2563EB" />
      <rect x="38" y="20" width="5.5" height="11" rx="2.7" fill="#2563EB" />
      <rect x="5.5" y="22" width="3.5" height="7" rx="1.5" fill="#06B6D4" opacity="0.45" />
      <rect x="39" y="22" width="3.5" height="7" rx="1.5" fill="#06B6D4" opacity="0.45" />

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

      <circle cx="14.5" cy="34" r="1.6" fill="#06B6D4" opacity="0.45" />
      <circle cx="33.5" cy="34" r="1.6" fill="#06B6D4" opacity="0.45" />

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

const QUICK_REPLY_DEFS = [
  {
    id: 'flood-risk',
    labelKey: 'chatbot.quick.flood_risk',
    answerKey: 'chatbot.answer.flood_risk',
    Icon: ShieldAlert,
    tint: '#2563EB',
    keywords: [
      'flood risk',
      'check risk',
      'my risk',
      'risk page',
      'forecast',
      'سیلاب',
      'خطرہ',
      'فلڈ',
      'پیش گوئی',
    ],
  },
  {
    id: 'shelters',
    labelKey: 'chatbot.quick.shelters',
    answerKey: 'chatbot.answer.shelters',
    Icon: Home,
    tint: '#0EA5E9',
    keywords: [
      'shelter',
      'shelters',
      'where to go',
      'safe place',
      'evacuate',
      'پناہ',
      'پناہ گاہ',
      'محفوظ',
    ],
  },
  {
    id: 'risk-levels',
    labelKey: 'chatbot.quick.risk_levels',
    answerKey: 'chatbot.answer.risk_levels',
    Icon: Waves,
    tint: '#06B6D4',
    keywords: [
      'risk level',
      'levels',
      'low',
      'medium',
      'high',
      'very high',
      'exc',
      'سطح',
      'لیول',
    ],
  },
  {
    id: 'alerts',
    labelKey: 'chatbot.quick.alerts',
    answerKey: 'chatbot.answer.alerts',
    Icon: Bell,
    tint: '#1D4ED8',
    keywords: [
      'alert',
      'alerts',
      'notify',
      'subscribe',
      'email',
      'sms',
      'الرٹ',
      'اطلاع',
      'پیغام',
    ],
  },
  {
    id: 'contacts',
    labelKey: 'chatbot.quick.contacts',
    answerKey: 'chatbot.answer.contacts',
    Icon: Phone,
    tint: '#DC2626',
    keywords: [
      'emergency',
      'contact',
      'phone',
      'rescue',
      'pdma',
      'police',
      '1122',
      'ہنگامی',
      'رابطہ',
      'فون',
      'ریسکیو',
      'پولیس',
    ],
  },
];

const buildId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export default function ChatbotWidget({ hidden = false }) {
  const { t } = useLanguage();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 'welcome', role: 'assistant', textKey: 'chatbot.welcome' },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const renderMessageText = (msg) => (msg.textKey ? t(msg.textKey) : msg.text);

  useEffect(() => {
    if (!isOpen) return;
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'end',
    });
  }, [messages, isTyping, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  if (hidden) return null;

  const onlyWelcome = messages.length === 1 && messages[0].id === 'welcome';

  const sendMessageToBackend = async (text) => {
    setIsTyping(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/chatbot`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          message: text,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.detail || data.message || `Chatbot failed: ${response.status}`);
      }

      const botReply =
        data.reply ||
        data.response ||
        data.message ||
        t(
          'chatbot.fallback',
          'Sorry, I could not process your request right now.'
        );

      setMessages((prev) => [
        ...prev,
        {
          id: buildId(),
          role: 'assistant',
          text: botReply,
        },
      ]);
    } catch (error) {
      console.error('Chatbot API error:', error);

      setMessages((prev) => [
        ...prev,
        {
          id: buildId(),
          role: 'assistant',
          text:
            t(
              'chatbot.server_error',
              'Server connection failed. Please try again later.'
            ),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleQuickReply = async (reply) => {
    const questionText = t(reply.labelKey);

    setMessages((prev) => [
      ...prev,
      {
        id: buildId(),
        role: 'user',
        textKey: reply.labelKey,
      },
    ]);

    await sendMessageToBackend(questionText);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const text = inputText.trim();

    if (!text) return;

    setInputText('');

    setMessages((prev) => [
      ...prev,
      {
        id: buildId(),
        role: 'user',
        text,
      },
    ]);

    await sendMessageToBackend(text);
  };

  return (
    <div
      className={`cg-chatbot ${isOpen ? 'cg-chatbot--open' : 'cg-chatbot--closed'}`}
      aria-live="polite"
    >
      <button
        type="button"
        className="cg-chatbot-fab"
        aria-label={isOpen ? t('chatbot.close_label') : t('chatbot.open_label')}
        aria-expanded={isOpen}
        data-tooltip={t('chatbot.tooltip')}
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
                  {t('chatbot.title')}
                </h3>

                <span className="cg-chatbot-status">
                  {isTyping ? t('chatbot.typing', 'Typing...') : t('chatbot.status')}
                </span>
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

                  <p className="cg-chatbot-bubble">
                    {renderMessageText(msg)}
                  </p>
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
                  {t('chatbot.quick_questions_label')}
                </span>

                <div className="cg-chatbot-quick-list">
                  {QUICK_REPLY_DEFS.map((reply) => {
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

                        <span className="cg-chatbot-quick-text">
                          {t(reply.labelKey)}
                        </span>

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
                placeholder={t('chatbot.input_placeholder')}
                value={inputText}
                onChange={(event) => setInputText(event.target.value)}
                aria-label={t('chatbot.input_aria')}
              />
            </div>

            <button
              type="submit"
              className="cg-chatbot-send-btn"
              aria-label={t('chatbot.send_label')}
              disabled={!inputText.trim() || isTyping}
            >
              <Send size={18} strokeWidth={2.4} />
            </button>
          </form>
        </section>
      )}
    </div>
  );
}