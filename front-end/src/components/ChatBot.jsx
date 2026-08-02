import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2 } from 'lucide-react'
import api from '../api/api'

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { id: 1, text: 'Hi! How can I help?', sender: 'bot', time: new Date() },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (e) => {
    e.preventDefault()
    if (!input.trim()) return

    const msg = { id: messages.length + 1, text: input, sender: 'user', time: new Date() }
    setMessages(prev => [...prev, msg])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/api/chat', { message: input })
      const reply = { id: messages.length + 2, text: res.data?.reply || 'No response received.', sender: 'bot', time: new Date() }
      setMessages(prev => [...prev, reply])
    } catch (err) {
      const detail = err.response?.data?.error || err.response?.data || err.message || 'Unable to reach the AI assistant.'
      const error = { id: messages.length + 2, text: `Error: ${String(detail)}`, sender: 'bot', time: new Date() }
      setMessages(prev => [...prev, error])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-primary btn-ripple fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-glow transition-transform duration-300 hover:-translate-y-0.5"
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {isOpen && (
        <div className="glass-strong fixed bottom-24 right-6 z-50 flex max-h-[28rem] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl shadow-glow">
          <div className="btn-primary px-6 py-4">
            <h3 className="font-display text-base font-semibold text-white">AI Assistant</h3>
            <p className="text-xs text-white/70">Gemini Powered</p>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto p-4">
            {messages.map(msg => (
              <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs rounded-2xl px-3.5 py-2 ${
                  msg.sender === 'user' ? 'btn-primary text-white' : 'bg-white/10 text-gray-100'
                }`}>
                  <p className="text-sm">{msg.text}</p>
                  <span className="text-[10px] opacity-60">{msg.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
              </div>
            )}
            <div ref={endRef} />
          </div>

          <form onSubmit={send} className="flex gap-2 border-t border-white/10 p-3">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask something..."
              disabled={loading}
              className="input-glass flex-1 rounded-xl px-3.5 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="btn-primary flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl text-white transition-transform duration-300 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatBot
