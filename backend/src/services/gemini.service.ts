import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);
    this.model = this.genAI.getGenerativeModel({ 
      model: "models/gemini-1.5-flash",
      safetySettings: [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
      ]
    });
  }

  async generateModeration(chatHistory: { role: string; content: string }[], currentMessage: string, mode: string = 'General GD') {
    const prompt = `
      You are an AI Moderator for a professional group discussion platform named GDVerse.
      Current Mode: ${mode}
      
      Chat History:
      ${chatHistory.map(h => `${h.role}: ${h.content}`).join('\n')}
      
      New Message: ${currentMessage}
      
      Tasks:
      1. If the discussion is going off-track, politely guide it back.
      2. If a participant is being toxic or rude, provide a gentle warning.
      3. In ${mode} mode, ensure participants follow the etiquette of that mode.
      
      Respond as the "AI Moderator". If no intervention is needed, respond with "NO_INTERVENTION".
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "NO_INTERVENTION";
    }
  }

  async generateResponse(query: string, chatHistory: { role: string; content: string }[], mode: string = 'General GD') {
    const prompt = `
      You are an expert participant in a ${mode} discussion.
      Mode Context: ${mode === 'Debate' ? 'Be argumentative but respectful, take a side if appropriate.' : mode === 'Interview' ? 'Be professional, answer like a candidate or ask like an interviewer.' : 'Be collaborative.'}
      
      Chat History:
      ${chatHistory.map(h => `${h.role}: ${h.content}`).join('\n')}
      
      User Query: ${query}
      
      Provide a concise, insightful response that contributes meaningfully to the discussion.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Error:', error);
      return "I'm having trouble connecting to my knowledge base right now.";
    }
  }

  async generateSummary(chatHistory: { role: string; content: string }[]) {
    if (!chatHistory || chatHistory.length === 0) {
      return "No discussion was recorded during this session. To generate a Minutes of Meeting, please ensure participants contribute to the chat or speak while the microphone is active.";
    }

    const prompt = `
      You are an AI Secretary for a professional group discussion platform named GDVerse.
      Your task is to generate the "Minutes of Meeting" (MoM) for the discussion session just concluded.
      
      Structure your response as follows:
      1. **Meeting Summary**: A high-level overview of the discussion.
      2. **Key Discussion Points**: Detailed bullet points of the main topics and arguments.
      3. **Action Items & Decisions**: Any conclusions reached or next steps identified.
      4. **Participation Feedback**: Constructive feedback on how well the group engaged and the quality of arguments.
      
      Discussion History:
      ${chatHistory.map(h => `${h.role}: ${h.content}`).join('\n')}
      
      Format the output clearly using Markdown.
    `;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Gemini API Summary Error:', error);
      return "The AI was unable to generate a summary due to an external service error. Your discussion was recorded, but the intelligence layer is currently unavailable.";
    }
  }

  async performSentimentAnalysis(message: string) {
    const prompt = `Analyze the sentiment of this message in one word (Positive, Negative, or Neutral): "${message}"`;
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      return "Neutral";
    }
  }
}

export default new GeminiService();
