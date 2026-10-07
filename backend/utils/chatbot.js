const axios = require('axios');

const MODEL_NAME = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';
const API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const API_KEY = process.env.GROQ_API_KEY;
const MAX_HISTORY_MESSAGES = 8;
const AI_UNAVAILABLE_MESSAGE = "I'm having trouble connecting to the AI service right now. Please try again in a moment.";

const SYSTEM_PROMPT = `You are EduVance's Student Learning Assistant. Answer the student's actual question directly and helpfully. You are an educational assistant, not just a course-information bot.

Use recent conversation to understand follow-up questions and pronouns. Explain concepts accurately at the student's apparent level, with examples where helpful. Keep simple answers concise. For comparisons, use a clear table; for processes, show ordered steps; for code or math, show the reasoning and a correct worked example; for exam or revision requests, include key points and useful practice questions. Respond naturally and briefly to greetings.

You may receive three kinds of context: general conversation, EduVance account data, and EduVance course materials. Clearly distinguish them. Treat course and account data as the only source of truth for claims about this student's courses, grades, attendance, progress, activity, assignments, or mentor. Never invent account data or course material. A course outline's topic names only confirm that a topic is listed; they do not describe what its lectures teach. If asked what a course specifically teaches and there is no relevant lecture/material content, explicitly say that the course outline lists the topic but the specific lecture content is unavailable. You may then offer a clearly labeled general explanation. Use only the supplied student's context and do not reveal private/internal details that are irrelevant to the question. If the request is ambiguous and context does not resolve it, ask a short clarification question. Never claim a tool or data lookup succeeded unless its result appears in the context.`;

const isFollowUp = (text) => /\b(it|this|that|they|them|those|same|example|explain more|why|how about)\b/i.test(text);

const generateAIResponse = async (message, history = [], context = {}) => {
    if (!API_KEY) return { response: AI_UNAVAILABLE_MESSAGE, category: 'other', isAI: false };

    const safeHistory = history.slice(-MAX_HISTORY_MESSAGES).flatMap((turn) => {
        if (!turn?.message || !turn?.response) return [];
        return [
            { role: 'user', content: String(turn.message).slice(0, 1600) },
            { role: 'assistant', content: String(turn.response).slice(0, 2200) },
        ];
    });

    try {
        const payload = {
            model: MODEL_NAME,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'system', content: `Authenticated student's relevant EduVance context (JSON; empty fields mean unavailable). Course outlines/topics are metadata; courseMaterials contains only actual lecture descriptions available to you.\n${JSON.stringify(context).slice(0, 6500)}` },
                ...safeHistory,
                { role: 'user', content: message },
            ],
            max_tokens: 700,
            temperature: 0.4,
        };
        const requestOptions = {
            headers: { Authorization: `Bearer ${API_KEY}`, 'Content-Type': 'application/json' },
            timeout: 30000,
        };
        let response;
        try {
            response = await axios.post(API_URL, payload, requestOptions);
        } catch (error) {
            if (error.response?.status !== 429) throw error;
            const retryAfterSeconds = Number(error.response.headers?.['retry-after']) || 3;
            if (retryAfterSeconds > 8) throw error;
            await new Promise((resolve) => setTimeout(resolve, retryAfterSeconds * 1000));
            response = await axios.post(API_URL, payload, requestOptions);
        }

        const answer = response.data.choices?.[0]?.message?.content?.trim();
        if (!answer) throw new Error('AI service returned an empty answer');
        return { response: answer, category: 'ai', isAI: true };
    } catch (error) {
        console.error('EduVance AI service error:', error.response?.data || error.message);
        return { response: AI_UNAVAILABLE_MESSAGE, category: 'other', isAI: false };
    }
};

const getResponse = async (message, history = [], context = {}) => {
    const cleanMessage = typeof message === 'string' ? message.trim() : '';
    if (!cleanMessage || cleanMessage.length > 2000) {
        return { response: 'Please enter a question of 1 to 2,000 characters.', category: 'other', isAI: false };
    }
    if (isFollowUp(cleanMessage) && history.length === 0) {
        return { response: 'What topic or idea would you like me to explain?', category: 'other', isAI: false };
    }
    return generateAIResponse(cleanMessage, history, context);
};

module.exports = { getResponse, AI_UNAVAILABLE_MESSAGE };
