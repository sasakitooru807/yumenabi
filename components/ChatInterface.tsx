import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Flag, Mic, MicOff } from 'lucide-react';
import { ChatMessage, MessageRole } from '../types';

interface ChatInterfaceProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  onFinish: () => void;
  isSending: boolean;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ messages, onSendMessage, onFinish, isSending }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isSending) {
      onSendMessage(input.trim());
      setInput('');
    }
  };

  const toggleListening = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("このブラウザでは 音声入力が つかえないみたいだよ。ごめんね。");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;
    recognitionRef.current = recognition;

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  const showFinishButton = messages.length >= 5; // Allow finishing after a few exchanges

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] max-w-2xl mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border-4 border-sky-100">
      
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 ${msg.role === MessageRole.USER ? 'flex-row-reverse' : 'flex-row'}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
              msg.role === MessageRole.USER ? 'bg-indigo-100' : 'bg-emerald-100'
            }`}>
              {msg.role === MessageRole.USER ? (
                <User className="w-6 h-6 text-indigo-600" />
              ) : (
                <Bot className="w-6 h-6 text-emerald-600" />
              )}
            </div>
            
            <div className={`max-w-[80%] p-4 rounded-2xl text-lg leading-relaxed ${
              msg.role === MessageRole.USER 
                ? 'bg-indigo-500 text-white rounded-br-none shadow-indigo-200' 
                : 'bg-slate-100 text-slate-800 rounded-bl-none shadow-sm'
            } shadow-md`}>
              {msg.text}
            </div>
          </div>
        ))}
        
        {isSending && (
          <div className="flex items-end gap-2">
             <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                <Bot className="w-6 h-6 text-emerald-600" />
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl rounded-bl-none">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-sky-50 border-t border-sky-100">
        {showFinishButton && (
           <button
             onClick={onFinish}
             className="w-full mb-3 bg-amber-400 hover:bg-amber-500 text-white font-bold py-2 px-4 rounded-xl shadow-sm flex items-center justify-center gap-2 transition-colors animate-pulse"
           >
             <Flag className="w-5 h-5" />
             ぼうけんのちずを つくる！
           </button>
        )}
        
        <div className="flex gap-2">
          <button
            type="button"
            onClick={toggleListening}
            className={`p-3 rounded-full shadow-md transition-all flex items-center justify-center shrink-0 ${
              isListening 
                ? 'bg-rose-500 text-white animate-pulse' 
                : 'bg-white text-slate-400 hover:text-indigo-500 border-2 border-slate-200'
            }`}
            title="こえで入力"
          >
            {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="メッセージを かいてね..."
              disabled={isSending}
              className="flex-1 p-3 px-5 rounded-full border-2 border-slate-200 focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-100 transition-all text-lg"
            />
            <button
              type="submit"
              disabled={!input.trim() || isSending}
              className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white p-3 rounded-full shadow-lg transition-transform active:scale-95 flex items-center justify-center shrink-0"
            >
              <Send className="w-6 h-6 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;