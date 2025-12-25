import React, { useState, useRef } from 'react';
import { Rocket, Sparkles, Mic, MicOff } from 'lucide-react';

interface IntroScreenProps {
  onStart: (dream: string) => void;
}

const IntroScreen: React.FC<IntroScreenProps> = ({ onStart }) => {
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      onStart(input.trim());
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
      setInput(transcript);
    };
    recognition.onerror = (event: any) => {
      console.error(event.error);
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center animate-fade-in">
      <div className="bg-white p-8 rounded-3xl shadow-xl max-w-lg w-full border-4 border-sky-200">
        <div className="flex justify-center mb-6">
          <div className="bg-indigo-100 p-4 rounded-full">
            <Rocket className="w-16 h-16 text-indigo-500" />
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-slate-800 mb-4">
          しょうらいの ゆめを おしえて！
        </h1>
        <p className="text-slate-500 mb-8 text-lg">
          おおきくなったら、なにになりたい？<br/>
          AIのロボットくんと おはなししよう！
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="relative w-full">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="れい：サッカーせんしゅ、おはなやさん..."
              className="w-full text-center text-xl p-4 pr-12 rounded-xl border-2 border-slate-200 focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 transition-all outline-none"
              autoFocus
            />
            <button
              type="button"
              onClick={toggleListening}
              className={`absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full transition-colors ${
                isListening 
                  ? 'bg-rose-100 text-rose-500 animate-pulse' 
                  : 'text-slate-400 hover:text-indigo-500 hover:bg-slate-100'
              }`}
              title="こえで入力"
            >
              {isListening ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
            </button>
          </div>
          
          <button
            type="submit"
            disabled={!input.trim()}
            className="w-full bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-300 text-white font-bold text-xl py-4 rounded-xl shadow-lg transform transition active:scale-95 flex items-center justify-center gap-2"
          >
            <Sparkles className="w-6 h-6" />
            おはなしする！
          </button>
        </form>
      </div>
    </div>
  );
};

export default IntroScreen;