import React, { useState } from 'react';
import { RoadmapData } from '../types';
import { Star, BookOpen, Dumbbell, Gamepad2, Heart, RefreshCw, Download, Loader2, MessageCircle } from 'lucide-react';
// @ts-ignore
import html2canvas from 'html2canvas';

interface RoadmapViewProps {
  data: RoadmapData;
  onReset: () => void;
  onContinueChat: () => void;
}

const RoadmapView: React.FC<RoadmapViewProps> = ({ data, onReset, onContinueChat }) => {
  const [isSaving, setIsSaving] = useState(false);
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'study': return <BookOpen className="w-6 h-6 text-blue-500" />;
      case 'practice': return <Dumbbell className="w-6 h-6 text-orange-500" />;
      case 'fun': return <Gamepad2 className="w-6 h-6 text-purple-500" />;
      case 'heart': return <Heart className="w-6 h-6 text-pink-500" />;
      default: return <Star className="w-6 h-6 text-yellow-500" />;
    }
  };

  const getBgColor = (type: string) => {
     switch (type) {
      case 'study': return 'bg-blue-50 border-blue-200';
      case 'practice': return 'bg-orange-50 border-orange-200';
      case 'fun': return 'bg-purple-50 border-purple-200';
      case 'heart': return 'bg-pink-50 border-pink-200';
      default: return 'bg-yellow-50 border-yellow-200';
    }
  };

  const handleSaveImage = async () => {
    setIsSaving(true);
    const element = document.getElementById('roadmap-capture-area');
    
    if (element) {
      try {
        // Wait a moment for images/fonts to settle
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const canvas = await html2canvas(element, {
          scale: 2, // High resolution
          backgroundColor: '#ffffff',
          useCORS: true,
          logging: false
        });

        const image = canvas.toDataURL("image/png");
        const link = document.createElement('a');
        link.href = image;
        link.download = `ぼうけんのちず_${data.dreamTitle}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (error) {
        console.error("Save failed:", error);
        alert("ごめんね、うまくほぞんできなかったみたい。");
      }
    }
    setIsSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto pb-12 px-4 animate-fade-in">
      
      {/* Capture Area */}
      <div id="roadmap-capture-area" className="bg-white rounded-3xl shadow-2xl overflow-hidden border-4 border-amber-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-300 to-orange-300 p-8 text-center text-white relative overflow-hidden">
          <h2 className="text-xl font-bold mb-2 opacity-90">キミの ゆめは...</h2>
          <h1 className="text-4xl font-extrabold drop-shadow-md mb-4">{data.dreamTitle}</h1>
          <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full border border-white/40">
            <span className="text-lg">✨ すてきな ゆめだね！ ✨</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 md:p-8">
          
          <div className="bg-slate-50 p-6 rounded-2xl border-2 border-slate-100 mb-8">
             <h3 className="text-lg font-bold text-slate-700 mb-2 flex items-center gap-2">
                <Bot className="w-6 h-6 text-emerald-500" />
                ロボットくんからのメッセージ
             </h3>
             <p className="text-slate-600 leading-relaxed text-lg">
               {data.encouragement}
             </p>
          </div>

          <h3 className="text-2xl font-bold text-center text-slate-700 mb-6 flex items-center justify-center gap-2">
            <span className="text-3xl">🗺️</span> ぼうけんのちず
          </h3>

          <div className="space-y-6 relative">
            {/* Connecting Line */}
            <div className="absolute left-8 top-4 bottom-4 w-1 bg-slate-200 -z-10 rounded-full"></div>

            {data.steps.map((step, index) => (
              <div key={index} className="flex gap-4 items-start group">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 shadow-lg border-4 border-white z-10 ${
                    index === 0 ? 'bg-amber-100 text-amber-600' : 'bg-white'
                }`}>
                   <span className="text-2xl font-bold text-slate-400 group-hover:text-amber-500 transition-colors">
                     {step.stepNumber}
                   </span>
                </div>
                
                <div className={`flex-1 p-5 rounded-2xl border-2 transition-transform hover:scale-[1.02] duration-300 shadow-sm ${getBgColor(step.iconType)}`}>
                   <div className="flex items-center gap-2 mb-2">
                      {getIcon(step.iconType)}
                      <h4 className="font-bold text-lg text-slate-800">{step.title}</h4>
                   </div>
                   <p className="text-slate-600 text-lg leading-snug">
                     {step.description}
                   </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer Actions (Outside of capture area) */}
      <div className="mt-6 flex flex-col gap-4">
         <button 
           onClick={onContinueChat}
           className="w-full px-6 py-4 bg-emerald-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-emerald-600 shadow-md transition-colors active:scale-95 text-lg"
         >
           <MessageCircle className="w-6 h-6" />
           もっと おはなしする（しつもんする）
         </button>

         <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={handleSaveImage}
              disabled={isSaving}
              className="flex-1 px-6 py-4 bg-sky-100 text-sky-700 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-sky-200 transition-colors shadow-sm active:scale-95 disabled:opacity-70 disabled:cursor-wait"
            >
              {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Download className="w-5 h-5" />}
              ちずを 画像(がぞう)で ほぞん
            </button>
            <button 
              onClick={onReset}
              className="flex-1 px-6 py-4 bg-white text-slate-500 border-2 border-slate-200 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-slate-50 hover:text-indigo-600 shadow-sm transition-colors active:scale-95"
            >
              <RefreshCw className="w-5 h-5" />
              ちがう ゆめを さがす
            </button>
         </div>
      </div>
      
      <p className="text-center text-slate-400 text-sm mt-4">
        ※「ほぞん」すると ダウンロードフォルダに はいります
      </p>
    </div>
  );
};

// Helper component for the view
function Bot({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
    )
}

export default RoadmapView;