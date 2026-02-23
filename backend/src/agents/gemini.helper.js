import { gemini } from '../config/gemini.js';

export const callGeminiJson = async ({
  systemPrompt,
  userPrompt,
  schema,
  temperature = 0.3,
  model = 'gemini-3.1-pro-preview',
}) => {
  try {
    const generativeModel = gemini.getGenerativeModel({
      model,
      systemInstruction: systemPrompt,
      generationConfig: {
        temperature,
        responseMimeType: 'application/json',
        ...(schema ? { responseSchema: schema } : {}),
      },
    });

    const result = await generativeModel.generateContent(userPrompt);
    const response = await result.response;
    const text = response?.text();

    if (!text) {
      throw new Error('Gemini response did not include assistant content.');
    }

    try {
      return JSON.parse(text);
    } catch (error) {
      return { raw: text.trim() };
    }
  } catch (error) {
    const err = new Error('Gemini agent request failed');
    err.cause = error;
    throw err;
  }
};
