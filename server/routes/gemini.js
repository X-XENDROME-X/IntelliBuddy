const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const router = express.Router();

const API_KEY = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY is not set');
  process.exit(1);
}

const cleanJsonResponse = (responseText) => {
  let cleaned = responseText.replace(/``````/g, "");
  cleaned = cleaned.trim();
  return cleaned;
};

router.post('/generate', async (req, res) => {
  try {
    const { 
      prompt, 
      sessionId, 
      isQuickReply = false, 
      language = 'en',
      context,
      enhancedPrompt,
      enhancedContext,
      isFirstInteraction,
      hasJustProvidedName 
    } = req.body;

    if (req.body.offline) {
      return res.json({
        text: "You appear to be offline. Please check your internet connection and try again.",
        sessionId: sessionId || 'new-session'
      });
    }

    const generationConfig = {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 1024,
    };

    const finalContext = enhancedContext || context || prompt;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: finalContext }] }],
      generationConfig
    });

    let responseText = result.response.text();


    if (isQuickReply && responseText.includes("Nice to meet you")) {
      responseText = responseText.replace(/Nice to meet you,?\s+([^!.]+)[!.]?/g, 
                                        "Regarding $1,");
    }


    if (isQuickReply || !isFirstInteraction) {
      const promptMatch = new RegExp(`Nice to meet you,?\\s+${prompt}[!.]?`, 'i');
      if (promptMatch.test(responseText)) {
        responseText = responseText.replace(promptMatch, `About ${prompt},`);
      }
    }

    res.json({
      text: responseText,
      sessionId: sessionId || 'new-session'
    });

  } catch (error) {
    console.error("Error generating response:", error);
    
    if (error.message?.includes('429') || error.status === 429) {
      return res.status(429).json({
        isRateLimitError: true,
        message: "Rate limit exceeded. Please try again later.",
        nextAvailableTime: new Date(Date.now() + 60000)
      });
    }
    
    res.json({
      text: "I'm sorry, I encountered an error. Please try again later.",
      sessionId: sessionId || 'new-session'
    });
  }
});

router.post('/suggestions', async (req, res) => {
  try {
    const { lastMessage, sessionId, language = 'en' } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Your exact prompt
    const prompt = `Based on this message from an AI assistant: "${lastMessage}"
    Generate two short (2-5 words) response options that a user might want to reply with.
    Format your response as a JSON array with exactly two strings and nothing else:
    ["suggestion 1", "suggestion 2"]
    Important: The suggestions MUST be in ${language} language.`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const cleanedResponse = cleanJsonResponse(responseText);
    console.log("Cleaned response:", cleanedResponse);

    try {
      const suggestions = JSON.parse(cleanedResponse);
      if (Array.isArray(suggestions) && suggestions.length >= 2) {
        return res.json({ suggestions: suggestions.slice(0, 2) });
      }
    } catch (e) {
      console.error("Failed to parse AI suggestions:", e);
      console.error("Raw response:", responseText);
      console.error("Cleaned response:", cleanedResponse);
    }

    res.json({ suggestions: ["Tell me more", "Thanks for the info"] });

  } catch (error) {
    console.error("Error generating suggestions:", error);
    res.json({ suggestions: ["Tell me more", "Thanks for the info"] });
  }
});

router.post('/translate', async (req, res) => {
  try {
    const { text, targetLanguage } = req.body;

    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    // Your exact translation prompt
    const prompt = `Translate the following text to ${targetLanguage} language.
    The source language could be any language - detect it automatically.
    Preserve all formatting, markdown, and special characters.
    Only return the translated text with no explanations:
    
    ${text}`;

    const result = await model.generateContent(prompt);
    const translatedText = result.response.text();

    res.json({ translatedText });

  } catch (error) {
    console.error("Translation error:", error);
    res.json({ translatedText: text });
  }
});

module.exports = router;
