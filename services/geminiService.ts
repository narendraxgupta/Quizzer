
import { GoogleGenAI, Type } from "@google/genai";
import { QuizData, Difficulty, Language } from '../types';

const MAX_RETRIES = 3;

// Read API key if provided (Vite injects process.env.API_KEY at build time)
const getApiKey = (): string | null => {
  return process.env.API_KEY ?? null;
};

const apiKey = getApiKey();
let ai: any = null;
if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

const quizSchema = {
    type: Type.OBJECT,
    properties: {
        questions: {
            type: Type.ARRAY,
            description: "An array of 5 unique quiz questions.",
            items: {
                type: Type.OBJECT,
                properties: {
                    question: {
                        type: Type.STRING,
                        description: "The text of the quiz question."
                    },
                    options: {
                        type: Type.ARRAY,
                        description: "An array of 4 possible answers (3 incorrect, 1 correct).",
                        items: { type: Type.STRING }
                    },
                    correctAnswer: {
                        type: Type.STRING,
                        description: "The correct answer, which must exactly match one of the strings in the 'options' array."
                    }
                },
                required: ["question", "options", "correctAnswer"]
            }
        }
    },
    required: ["questions"]
};

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

const mockQuiz = (topic: string, difficulty: Difficulty = 'Medium', language: Language = 'English'): QuizData => {
  const label = `${language}${difficulty === 'Easy' ? ' (Easy)' : difficulty === 'Hard' ? ' (Hard)' : ' (Medium)'}`;
  return ({
  questions: [
    {
      question: `Which of the following best describes ${topic}? [${label}]`,
      options: [
        `A basic definition of ${topic}`,
        `An unrelated option`,
        `A plausible but incorrect detail about ${topic}`,
        `Another incorrect option`
      ],
      correctAnswer: `A basic definition of ${topic}`
    },
    {
      question: `What is a common use case for ${topic}? [${label}]`,
      options: [
        `A common use case for ${topic}`,
        `An uncommon use case`,
        `A wrong usage`,
        `Another wrong usage`
      ],
      correctAnswer: `A common use case for ${topic}`
    },
    {
      question: `Which statement about ${topic} is true? [${label}]`,
      options: [
        `A true statement about ${topic}`,
        `A false statement`,
        `A misleading but plausible statement`,
        `A clearly wrong statement`
      ],
      correctAnswer: `A true statement about ${topic}`
    },
    {
      question: `Which term is most closely related to ${topic}? [${label}]`,
      options: [
        `Related term 1`,
        `Unrelated term`,
        `Plausible distractor`,
        `Another distractor`
      ],
      correctAnswer: `Related term 1`
    },
    {
      question: `Which of these is NOT true about ${topic}? [${label}]`,
      options: [
        `A false claim about ${topic}`,
        `A true claim about ${topic}`,
        `Another true claim`,
        `A plausible but false claim`
      ],
      correctAnswer: `A false claim about ${topic}`
    }
  ]
  });
};

export const generateQuizQuestions = async (topic: string, difficulty: Difficulty = 'Medium', language: Language = 'English'): Promise<QuizData> => {
  // If there's no API client (no key), return a deterministic mock so the UI can be developed offline
  if (!ai) {
    console.warn('GEMINI API key not set — returning mock quiz data.');
    // small delay to simulate network latency
    await delay(200);
    return mockQuiz(topic, difficulty, language);
  }

  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
  const prompt = `Generate 5 unique multiple-choice questions in ${language} for a quiz on the topic of "${topic}" at a ${difficulty.toLowerCase()} difficulty level. Each question must have exactly 4 options. For each question, provide one correct answer and three plausible but incorrect distractors. The correct answer must be one of the provided options. Ensure the JSON output is valid.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: quizSchema,
        },
      });

      const responseText = response.text.trim();
      const parsedJson = JSON.parse(responseText);
      
      if (parsedJson.questions && parsedJson.questions.length > 0) {
        return parsedJson as QuizData;
      }
      console.warn(`Attempt ${i + 1}: AI returned empty or invalid questions array. Retrying...`);
    } catch (error) {
      console.error(`Error generating quiz questions (Attempt ${i + 1}/${MAX_RETRIES}):`, error);
      if (i === MAX_RETRIES - 1) {
        throw new Error("Failed to generate quiz questions after multiple retries.");
      }
      await new Promise(res => setTimeout(res, 1000));
    }
  }
  throw new Error("Failed to generate valid quiz data from AI.");
};


export const generateQuizFeedback = async (topic: string, score: number, totalQuestions: number): Promise<string> => {
  if (!ai) {
    // Simple encouraging feedback for mock mode
    if (score === totalQuestions) return `Perfect! You aced the ${topic} quiz — great job!`;
    if (score >= Math.ceil(totalQuestions * 0.7)) return `Nice work — you scored ${score}/${totalQuestions} on ${topic}. Keep it up!`;
    return `Good effort — you scored ${score}/${totalQuestions}. Review the material and try again!`;
  }

  try {
    const prompt = `A user has just completed a ${totalQuestions}-question quiz on "${topic}" and scored ${score} out of ${totalQuestions}. Write a short, encouraging, and personalized feedback message for them based on their performance. Keep it under 60 words.`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text.trim();
  } catch (error) {
    console.error("Error generating quiz feedback:", error);
    return "Great effort! Keep learning and challenging yourself.";
  }
};

export const generateQuestionExplanation = async (topic: string, questionText: string, correctAnswer: string): Promise<string> => {
  if (!ai) {
    // Provide a short mock explanation
    return `Brief explanation: "${correctAnswer}" is correct because it best matches the core idea of ${topic} in this question.`;
  }

  try {
    const prompt = `Provide a short (1-2 sentence) explanation for why the following answer is correct for this quiz question on the topic of "${topic}":\nQuestion: ${questionText}\nCorrect answer: ${correctAnswer}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error generating question explanation:', error);
    return `Explanation: ${correctAnswer} is the correct answer.`;
  }
};

export const generateQuestionHint = async (topic: string, questionText: string): Promise<string> => {
  if (!ai) {
    // Mock hint: give an approach without giving away the answer
    return `Hint: Think about the core concept behind ${topic} mentioned in the question and eliminate clearly unrelated options.`;
  }

  try {
    const prompt = `Provide a short, helpful hint (one sentence) for the user to answer the following quiz question on the topic of "${topic}" without revealing the correct answer.\nQuestion: ${questionText}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text.trim();
  } catch (error) {
    console.error('Error generating question hint:', error);
    return `Hint: Focus on the main concept asked in the question and eliminate obviously incorrect choices.`;
  }
};
