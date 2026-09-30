import React, { useState, useRef, useEffect } from 'react';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm the GoalPulse AI Assistant. Ask me anything about football!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setInput('');
    setIsLoading(true);

    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8080';
      const response = await fetch(`${apiUrl}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ message: userMessage })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
    } catch (error) {
      console.error("Chat error:", error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Oops, I encountered an error. Please try again!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-5 right-5 w-14 h-14 bg-live hover:bg-live/80 text-white rounded-full flex items-center justify-center text-2xl shadow-lg transition-transform hover:scale-105 z-[9999]"
        aria-label="Toggle Chat"
      >
        ⚽
      </button>

      {isOpen && (
        <div className="fixed bottom-24 right-5 w-80 md:w-96 bg-surface border border-subtle rounded-xl shadow-2xl z-[9999] flex flex-col overflow-hidden" style={{ maxHeight: '70vh', height: '500px' }}>
          <div className="bg-live text-white px-4 py-3 font-bold font-display uppercase tracking-wide flex justify-between items-center">
            <span>GoalPulse AI</span>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-white/80">
              ✕
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-base">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] rounded-lg px-4 py-2 text-sm ${msg.role === 'user' ? 'bg-live text-white rounded-br-none' : 'bg-surface border border-subtle text-primary rounded-bl-none'}`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-surface border border-subtle text-secondary rounded-lg px-4 py-2 text-sm rounded-bl-none italic">
                  GoalPulse AI is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSend} className="p-3 bg-surface border-t border-subtle flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about football..."
              className="flex-1 bg-base border border-subtle rounded-md px-3 py-2 text-sm text-primary focus:outline-none focus:border-live"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading || !input.trim()}
              className="bg-live text-white px-4 py-2 rounded-md text-sm font-bold disabled:opacity-50 transition-opacity"
            >
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export default ChatBot;
