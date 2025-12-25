import { GoogleGenAI, Chat, Type, Schema } from "@google/genai";
import { RoadmapData } from "../types";

// Initialize the API client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// System instruction for the chat persona
const CHAT_SYSTEM_INSTRUCTION = `
あなたは「ゆめナビ」という名前の、小学生の夢を応援する優しいAIロボットです。
相手は小学1年生〜2年生くらいの子供です。
**絶対に難しい漢字を使わないでください。**

ルール：
1. **ひらがな中心**: 漢字は極力使わず、ひらがなで書いてください。使うとしても「人」「日」「大」「小」「山」「川」などの小学1年生レベルの漢字だけにしてください。
   - NG: 「将来」「勉強」「素敵」「興味」「練習」「選手」
   - OK: 「しょうらい」「べんきょう」「すてき」「きょうみ」「れんしゅう」「せんしゅ」
2. **やさしい言葉**: 難しい言葉（熟語など）は使わず、子供がわかる言葉に言い換えてください。
   - NG: 「習得する」「分析する」「提案する」
   - OK: 「やってみる」「よくみる」「おしえる」
3. **態度**: 元気よく、優しく、たくさん褒めてください。「〜だね！」「〜だよ！」という語尾を使ってください。
4. **長さ**: 1回の返事は短く（2〜3文）。質問は1つだけ。
5. **絵文字**: 文脈に合わせて絵文字😊🚀✨を適度に使ってください。
6. **わだいを かえる**: 同じことばかり聞かないでください。3回くらい同じ話題（「なんで？」「もっとおしえて」など）が続いたら、「それじゃあ、つぎは〜」といって、別のこと（たとえば、練習のこと、道具のこと、どんなことが楽しいか、など）を聞いてください。

例：
ユーザー「サッカー選手になりたい」
あなた「わあ！ サッカーせんしゅ、すてきだね！⚽️ どんな ところが すきなの？」
`;

let chatSession: Chat | null = null;

export const initializeChat = (dream: string) => {
  chatSession = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: CHAT_SYSTEM_INSTRUCTION,
    },
  });
  return chatSession;
};

export const sendMessageToGemini = async (message: string): Promise<string> => {
  if (!chatSession) {
    throw new Error("Chat session not initialized");
  }
  
  try {
    const result = await chatSession.sendMessage({ message });
    return result.text || "ごめんね、ちょっとかんがえごとを していたよ。もういっかい いってくれる？";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "ごめんね、つうしんのエラーみたい。もういちど ためしてみてね。";
  }
};

export const generateRoadmapFromChat = async (historyText: string, dream: string): Promise<RoadmapData> => {
  // Schema definition for structured output
  const roadmapSchema: Schema = {
    type: Type.OBJECT,
    properties: {
      dreamTitle: { type: Type.STRING, description: "The definitive title of the child's dream (e.g., 宇宙飛行士, お花屋さん)" },
      encouragement: { type: Type.STRING, description: "A warm, encouraging short paragraph summarizing their passion." },
      steps: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            stepNumber: { type: Type.INTEGER },
            title: { type: Type.STRING, description: "Short title of the step" },
            description: { type: Type.STRING, description: "Actionable advice for a child" },
            iconType: { type: Type.STRING, enum: ['study', 'practice', 'fun', 'heart'], description: "Type of activity" }
          },
          required: ['stepNumber', 'title', 'description', 'iconType']
        }
      }
    },
    required: ['dreamTitle', 'encouragement', 'steps']
  };

  const prompt = `
  これまでの会話履歴をもとに、この子の夢「${dream}」を叶えるための「ぼうけんのちず（ロードマップ）」を作ってください。
  
  会話履歴:
  ${historyText}

  小学生がワクワクするような、具体的で実行可能な5つのステップを提案してください。
  JSON形式で出力してください。

  **最も重要な指示: 言葉づかいについて**
  1. **ひらがなを基本にしてください**: 漢字はほとんど使わないでください。「人」「大」「小」などの小学1年生で習う漢字以外は、すべてひらがなにしてください。
  2. **わかりやすい言葉**: 「習得する」「理解する」などの難しい言葉は禁止。「やってみる」「わかる」などのやさしい言葉を使ってください。
  3. 英語やカタカナも、子供が知っているもの（サッカー、ピアノなど）以外はひらがなにしてください。

  出力例:
  title: "もっと ほんを よもう"
  description: "としょかんに いって、すきな ほんを さがして みてね。"
  dreamTitleの例: "サッカーせんしゅ"
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
      }
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No data returned");
    
    return JSON.parse(jsonText) as RoadmapData;
  } catch (error) {
    console.error("Gemini Roadmap Error:", error);
    // Fallback data in case of failure
    return {
      dreamTitle: dream,
      encouragement: "エラーがおきちゃったけど、キミのゆめはとってもすてきだよ！これからもおうえんしているよ！",
      steps: [
        { stepNumber: 1, title: "もっとしらべてみよう", description: "ほんやインターネットで、あこがれのおしごとについて しらべてみよう。", iconType: "study" },
        { stepNumber: 2, title: "まねっこしてみよう", description: "そのおしごとをしている人のつもりになって、あそんでみよう。", iconType: "fun" },
        { stepNumber: 3, title: "えをかいてみよう", description: "しょうらいのじぶんの すがたを えにかいてみよう。", iconType: "heart" },
        { stepNumber: 4, title: "おうちのひとにはなそう", description: "どんなことをしたいか、おうちのひとに おしえてあげよう。", iconType: "fun" },
        { stepNumber: 5, title: "まいにちたのしもう", description: "すきなことを たくさんやって、まいにち ニコニコですごそう。", iconType: "heart" }
      ]
    };
  }
};