// Rocky portfolio assistant backend with Gemini integration
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { GoogleGenerativeAI } = require('@google/generative-ai');

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;
const GEMINI_API_KEY = (process.env.GEMINI_API_KEY || '').trim();
const USER_MODEL = (process.env.GEMINI_MODEL || '').trim();

const MODEL_CANDIDATES = Array.from(new Set([
    USER_MODEL,
    'gemini-2.5-flash',
    'gemini-2.0-flash',
    'gemini-1.5-flash',
    'gemini-pro'
].filter(Boolean)));

const ROCKY_CONTEXT = `You are Rocky, the portfolio assistant for Mulagaleti Krishna Koushik.
You help visitors understand Koushik's profile in a clear and professional tone.

Facts about Koushik:
- Full name: Mulagaleti Krishna Koushik
- Current role: Trainee at [24]7.ai
- Interests: AI, cybersecurity, IoT, full-stack development, computer vision
- Skills: Python, JavaScript, HTML, CSS, Node.js, React, MongoDB, MySQL, YOLO
- Email: mulagaletikrishnakoushik@gmail.com
- Phone: 7013802548

Behavior rules:
- Keep answers concise and accurate.
- If a question is outside known profile data, suggest contacting Koushik by email.
- Do not mention backend implementation details.`;

const PREDEFINED_RESPONSES = [
    {
        patterns: [/who are you/, /what is your name/, /your name/],
        reply: "I am Rocky, Koushik's portfolio assistant."
    },
    {
        patterns: [/full name/, /who is koushik/, /his name/],
        reply: 'His full name is Mulagaleti Krishna Koushik.'
    },
    {
        patterns: [/where does koushik work/, /current role/, /work at/, /24\]7\.ai/],
        reply: 'Koushik is currently a trainee at [24]7.ai.'
    },
    {
        patterns: [/skills/, /technologies/, /tech stack/, /what does he know/],
        reply: 'He works in AI, cybersecurity, IoT, full-stack development, and computer vision with Python, JavaScript, Node.js, React, MongoDB, and MySQL.'
    },
    {
        patterns: [/projects/, /what has he built/, /portfolio projects/],
        reply: 'His key projects include an enhanced water-surface cleaning robot, Kindness Connect, a personal AI assistant, and a USB security system.'
    },
    {
        patterns: [/email/, /mail/, /contact/],
        reply: 'You can contact Koushik at mulagaletikrishnakoushik@gmail.com.'
    },
    {
        patterns: [/phone/, /mobile/, /number/],
        reply: 'You can call Koushik at 7013802548.'
    },
    {
        patterns: [/internship/, /experience/, /worked at/],
        reply: 'He has internship experience in full-stack development, ethical hacking, AI and ML, IoT, and cybersecurity.'
    },
    {
        patterns: [/open to opportunities/, /available for opportunities/, /hire/],
        reply: 'Yes, he is open to internships, collaborations, and technical opportunities.'
    }
];

const MAX_HISTORY_MESSAGES = 20;
let conversationHistory = [];
let activeModelName = MODEL_CANDIDATES[0] || 'gemini-pro';

app.use(cors());
app.use(express.json());
app.use(express.static('.'));

function findPredefinedResponse(input) {
    const normalized = input.toLowerCase().trim();
    for (const entry of PREDEFINED_RESPONSES) {
        if (entry.patterns.some((pattern) => pattern.test(normalized))) {
            return entry.reply;
        }
    }
    return null;
}

function trimConversationHistory() {
    if (conversationHistory.length > MAX_HISTORY_MESSAGES) {
        conversationHistory = conversationHistory.slice(-MAX_HISTORY_MESSAGES);
    }
}

function isModelNotFoundError(error) {
    const statusCode = Number(error?.status || error?.code);
    if (statusCode === 404) {
        return true;
    }
    const message = (error?.message || '').toLowerCase();
    return message.includes('not found') && message.includes('model');
}

function buildPrompt(userMessage) {
    if (conversationHistory.length === 0) {
        return `${ROCKY_CONTEXT}\n\nUser question: ${userMessage}`;
    }
    return userMessage;
}

async function generateGeminiReply(userMessage) {
    if (!GEMINI_API_KEY) {
        throw new Error('GEMINI_API_KEY_MISSING');
    }

    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    let lastError = null;

    for (const modelName of MODEL_CANDIDATES) {
        try {
            const model = genAI.getGenerativeModel({ model: modelName });
            const chat = model.startChat({
                history: conversationHistory,
                generationConfig: {
                    maxOutputTokens: 300,
                    temperature: 0.7
                }
            });

            const result = await chat.sendMessage(buildPrompt(userMessage));
            const reply = result.response.text().trim();
            if (!reply) {
                throw new Error('EMPTY_MODEL_REPLY');
            }
            activeModelName = modelName;
            return reply;
        } catch (error) {
            lastError = error;
            if (!isModelNotFoundError(error)) {
                throw error;
            }
            console.warn(`Model "${modelName}" is unavailable. Trying next model.`);
        }
    }

    throw lastError || new Error('NO_GEMINI_MODEL_AVAILABLE');
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        const userMessage = typeof message === 'string' ? message.trim() : '';

        if (!userMessage) {
            return res.status(400).json({ error: 'Message cannot be empty.' });
        }

        const predefinedResponse = findPredefinedResponse(userMessage);
        if (predefinedResponse) {
            conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
            conversationHistory.push({ role: 'model', parts: [{ text: predefinedResponse }] });
            trimConversationHistory();
            return res.json({ reply: predefinedResponse, source: 'predefined' });
        }

        if (!GEMINI_API_KEY) {
            return res.status(503).json({
                error: 'Gemini is not configured yet. Add GEMINI_API_KEY in .env and restart the server.',
                code: 'GEMINI_KEY_MISSING'
            });
        }

        const reply = await generateGeminiReply(userMessage);
        conversationHistory.push({ role: 'user', parts: [{ text: userMessage }] });
        conversationHistory.push({ role: 'model', parts: [{ text: reply }] });
        trimConversationHistory();

        return res.json({ reply, source: 'gemini', model: activeModelName });
    } catch (error) {
        console.error('Chat error:', error);
        const statusCode = Number(error?.status || error?.code);
        const message = String(error?.message || '').toLowerCase();
        if (statusCode === 429 || message.includes('quota') || message.includes('rate limit')) {
            return res.status(429).json({
                error: 'Gemini quota limit reached for this API key. Please check AI Studio quota/billing, then try again.',
                code: 'GEMINI_QUOTA_EXCEEDED'
            });
        }
        if (statusCode === 401 || statusCode === 403 || message.includes('api key')) {
            return res.status(401).json({
                error: 'Gemini authentication failed. Please verify GEMINI_API_KEY and project access.',
                code: 'GEMINI_AUTH_FAILED'
            });
        }
        return res.status(500).json({
            error: 'Rocky could not answer right now. Please try again in a moment.',
            details: process.env.NODE_ENV === 'development' ? String(error?.message || error) : undefined
        });
    }
});

app.post('/api/chat/reset', (_req, res) => {
    conversationHistory = [];
    res.json({ message: 'Conversation reset.' });
});

app.get('/api/health', (_req, res) => {
    res.json({
        status: 'ok',
        keyConfigured: Boolean(GEMINI_API_KEY),
        activeModel: activeModelName,
        modelCandidates: MODEL_CANDIDATES
    });
});

app.listen(PORT, () => {
    console.log(`Rocky backend is running on port ${PORT}.`);
    console.log(`Chat endpoint: http://localhost:${PORT}/api/chat`);
    console.log(`Gemini key configured: ${Boolean(GEMINI_API_KEY)}`);
    console.log(`Model candidates: ${MODEL_CANDIDATES.join(', ')}`);
});
