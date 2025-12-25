import React, { useState, useEffect } from 'react';
import IntroScreen from './components/IntroScreen';
import ChatInterface from './components/ChatInterface';
import RoadmapView from './components/RoadmapView';
import { initializeChat, sendMessageToGemini, generateRoadmapFromChat } from './services/geminiService';
import { AppState, ChatMessage, MessageRole, RoadmapData } from './types';
import { Compass, ArrowLeft } from 'lucide-react';

function App() {
  const [appState, setAppState] = useState<AppState>(AppState.INTRO);
  const [dream, setDream] = useState<string>('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [roadmapData, setRoadmapData] = useState<RoadmapData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initialize Chat
  const startChat = async (userDream: string) => {
    setDream(userDream);
    setAppState(AppState.CHAT);
    setIsProcessing(true);

    try {
      initializeChat(userDream);
      
      // Initial user message (hidden prompt contextually, but good to add to UI)
      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: MessageRole.USER,
        text: `ぼく・わたしのゆめは「${userDream}」です！`,
        timestamp: Date.now()
      };
      setMessages([userMsg]);

      // Get initial response from Gemini
      const responseText = await sendMessageToGemini(userMsg.text);
      
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);

    } catch (e) {
      console.error(e);
      alert("エラーが おきちゃったみたい。もういちど やりなおしてね。");
      setAppState(AppState.INTRO);
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sending a message
  const handleSendMessage = async (text: string) => {
    const newUserMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.USER,
      text: text,
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, newUserMsg]);
    setIsProcessing(true);

    try {
      const responseText = await sendMessageToGemini(text);
      const botMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: MessageRole.MODEL,
        text: responseText,
        timestamp: Date.now()
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate Roadmap
  const handleFinishChat = async () => {
    setAppState(AppState.LOADING_ROADMAP);
    try {
      // Create a text history of the chat
      const historyText = messages.map(m => `${m.role}: ${m.text}`).join('\n');
      const data = await generateRoadmapFromChat(historyText, dream);
      setRoadmapData(data);
      setAppState(AppState.ROADMAP);
    } catch (e) {
      console.error("Failed to generate roadmap", e);
      // In a real app, handle error gracefully
      setAppState(AppState.CHAT);
    }
  };

  // Reset App
  const resetApp = () => {
    setAppState(AppState.INTRO);
    setDream('');
    setMessages([]);
    setRoadmapData(null);
  };

  // Continue chat from roadmap
  const handleContinueChat = () => {
    const followUpMsg: ChatMessage = {
      id: Date.now().toString(),
      role: MessageRole.MODEL,
      text: "ぼうけんのちずは どうだった？\nなにか ききたいことや、しんぱいなことは あるかな？",
      timestamp: Date.now()
    };
    setMessages(prev => [...prev, followUpMsg]);
    setAppState(AppState.CHAT);
  };

  // Handle back navigation with confirmation
  const handleBackToStart = () => {
    if (appState === AppState.CHAT) {
      if (window.confirm('さいしょの がめんに もどる？\n（いまの おはなしは きえちゃうよ）')) {
        resetApp();
      }
    } else if (appState === AppState.ROADMAP) {
      // ロードマップ画面からは、チャットに戻る
      setAppState(AppState.CHAT);
    } else if (appState !== AppState.INTRO) {
      // ローディング中などの場合
      resetApp();
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f9ff] text-slate-800">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-sky-100">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {appState !== AppState.INTRO && (
              <button 
                onClick={handleBackToStart}
                className="flex items-center gap-1 bg-white text-slate-500 hover:text-indigo-600 font-bold px-3 py-2 rounded-xl border-2 border-slate-100 hover:border-indigo-200 transition-all shadow-sm active:scale-95"
                aria-label="もどる"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="text-sm hidden sm:inline">もどる</span>
              </button>
            )}
            
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
              if (appState === AppState.INTRO) return;
              handleBackToStart();
            }} role="button">
              <div className="bg-indigo-500 p-2 rounded-xl text-white">
                <Compass className="w-6 h-6" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-indigo-900">
                ゆめナビ
              </span>
            </div>
          </div>

          {appState === AppState.CHAT && (
            <div className="text-sm font-bold text-sky-600 bg-sky-100 px-3 py-1 rounded-full whitespace-nowrap">
              おはなしちゅう...
            </div>
          )}
          {appState === AppState.ROADMAP && (
            <div className="text-sm font-bold text-amber-600 bg-amber-100 px-3 py-1 rounded-full whitespace-nowrap">
              ちずができたよ！
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        
        {appState === AppState.INTRO && (
          <IntroScreen onStart={startChat} />
        )}

        {appState === AppState.CHAT && (
          <ChatInterface 
            messages={messages} 
            onSendMessage={handleSendMessage} 
            onFinish={handleFinishChat}
            isSending={isProcessing}
          />
        )}

        {appState === AppState.LOADING_ROADMAP && (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center animate-pulse">
            <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mb-6">
               <Compass className="w-12 h-12 text-indigo-500 animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-indigo-900 mb-2">
              ぼうけんのちずを かいているよ！
            </h2>
            <p className="text-slate-500">ちょっと まっててね...</p>
          </div>
        )}

        {appState === AppState.ROADMAP && roadmapData && (
          <RoadmapView 
            data={roadmapData} 
            onReset={resetApp} 
            onContinueChat={handleContinueChat}
          />
        )}

      </main>

      <footer className="py-6 text-center text-slate-400 text-sm">
        <p>© 2024 ゆめナビ - Powered by Google Gemini</p>
      </footer>
    </div>
  );
}

export default App;