// src/MessagePage.jsx
import { useState } from 'react'
import {
  Search,
  Paperclip,
  Send,
  MoreVertical,
  Phone,
  Video,
  ChevronLeft,
} from 'lucide-react'

// ── dummy data ──
const CONTACTS = [
  {
    id: 1,
    name: 'Wade Warren',
    avatar: 'WW',
    avatarBg: 'bg-emerald-200 text-emerald-700',
    lastMessage: 'That sounds great! I\'ll send the...',
    time: '10:30 AM',
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: 'Brooklyn Simmons',
    avatar: 'BS',
    avatarBg: 'bg-violet-200 text-violet-700',
    lastMessage: 'Can we reschedule our meeting?',
    time: '9:45 AM',
    unread: 0,
    online: false,
  },
  {
    id: 3,
    name: 'Esther Howard',
    avatar: 'EH',
    avatarBg: 'bg-rose-200 text-rose-700',
    lastMessage: 'You: I\'ll review the documents...',
    time: 'Yesterday',
    unread: 5,
    online: true,
  },
  {
    id: 4,
    name: 'Cameron Williamson',
    avatar: 'CW',
    avatarBg: 'bg-amber-200 text-amber-700',
    lastMessage: 'Let me know if you need any...',
    time: 'Yesterday',
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: 'Leslie Alexander',
    avatar: 'LA',
    avatarBg: 'bg-blue-200 text-blue-700',
    lastMessage: 'The payment has been processed.',
    time: 'Mon',
    unread: 1,
    online: true,
  },
]

const MESSAGES = [
  { id: 1, sender: 'them', text: 'Hi there! How\'s the project going?', time: '10:15 AM' },
  { id: 2, sender: 'me', text: 'Going great! We\'re on track for the deadline.', time: '10:18 AM' },
  {
    id: 3,
    sender: 'them',
    text: 'Awesome. Can you share the latest mockups?',
    time: '10:20 AM',
  },
  {
    id: 4,
    sender: 'me',
    text: 'Sure, I\'ll upload them right now.',
    time: '10:21 AM',
  },
  {
    id: 5,
    sender: 'them',
    text: 'That sounds great! I\'ll send the feedback by EOD.',
    time: '10:30 AM',
  },
]

export default function MessagePage() {
  const [selectedContact, setSelectedContact] = useState(CONTACTS[0])
  const [messageInput, setMessageInput] = useState('')
  const [messages, setMessages] = useState(MESSAGES)

  const handleSend = () => {
    if (!messageInput.trim()) return
    const newMsg = {
      id: Date.now(),
      sender: 'me',
      text: messageInput,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    setMessages([...messages, newMsg])
    setMessageInput('')
  }

  return (
    <div className="h-[calc(100vh-2.5rem)] flex gap-5">
      {/* ── LEFT COLUMN – Chat List ── */}
      <aside className="w-95 shrink-0 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {/* Search */}
        <div className="p-5 pb-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search messages..."
              className="w-full rounded-2xl bg-slate-50 border border-slate-100 py-2.5 pl-10 pr-4 text-sm text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#8B5CF6]/20"
            />
          </div>
        </div>

        {/* Chat list */}
        <nav className="flex-1 overflow-y-auto px-3 pb-3 space-y-1">
          {CONTACTS.map((contact) => (
            <button
              key={contact.id}
              onClick={() => setSelectedContact(contact)}
              className={`w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200 ${
                selectedContact.id === contact.id
                  ? 'bg-violet-50 border-l-[3px] border-[#8B5CF6] pl-2.25'
                  : 'hover:bg-slate-50'
              }`}
            >
              <div className="relative shrink-0">
                <span
                  className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${contact.avatarBg}`}
                >
                  {contact.avatar}
                </span>
                {contact.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-800 truncate">
                    {contact.name}
                  </p>
                  <span className="text-[11px] text-slate-400 shrink-0 ml-2">
                    {contact.time}
                  </span>
                </div>
                <p className="text-xs text-slate-400 truncate mt-0.5">
                  {contact.lastMessage}
                </p>
              </div>
              {contact.unread > 0 && (
                <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#8B5CF6] px-1.5 text-[10px] font-semibold text-white">
                  {contact.unread}
                </span>
              )}
            </button>
          ))}
        </nav>
      </aside>

      {/* ── RIGHT COLUMN – Chat Window ── */}
      <main className="flex-1 min-w-0 rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col overflow-hidden">
        {/* Chat header */}
        <header className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="relative">
              <span
                className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${selectedContact.avatarBg}`}
              >
                {selectedContact.avatar}
              </span>
              {selectedContact.online && (
                <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-emerald-400" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">{selectedContact.name}</p>
              <p className="text-xs text-slate-400">
                {selectedContact.online ? 'Online' : 'Offline'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
              <Phone size={16} />
            </button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
              <Video size={16} />
            </button>
            <button className="inline-flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-50 text-slate-500 hover:bg-slate-100 transition-colors">
              <MoreVertical size={16} />
            </button>
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.sender === 'me'
                    ? 'bg-[#8B5CF6] text-white rounded-br-md'
                    : 'bg-slate-100 text-slate-700 rounded-bl-md'
                }`}
              >
                <p>{msg.text}</p>
                <p
                  className={`text-[10px] mt-1 ${
                    msg.sender === 'me' ? 'text-violet-200' : 'text-slate-400'
                  }`}
                >
                  {msg.time}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Message input */}
        <div className="border-t border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2 rounded-2xl bg-slate-50 border border-slate-100 px-3 py-2">
            <button className="text-slate-400 hover:text-slate-600 transition-colors">
              <Paperclip size={18} />
            </button>
            <input
              type="text"
              placeholder="Type a message..."
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder-slate-400 focus:outline-none"
            />
            <button
              onClick={handleSend}
              className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-[#8B5CF6] text-white hover:bg-violet-600 transition-colors"
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}