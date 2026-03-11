/**
 * AI Chatbot integration with Google Gemini for intelligent responses
 * Falls back to rule-based responses for common queries
 */

const axios = require('axios');

// Using a reliable chat model on the HF router
const MODEL_NAME = 'Qwen/Qwen2.5-72B-Instruct';
const API_URL = 'https://router.huggingface.co/v1/chat/completions';
const API_KEY = process.env.HUGGINGFACE_API_KEY;

// Rule-based fallback for common queries
const knowledgeBase = [
    {
        keywords: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
        category: 'general',
        response: 'Hello! 👋 I\'m your DLSES Study Assistant. I can help you with course information, test preparation, attendance queries, and more. What would you like to know?',
    },
    {
        keywords: ['help', 'what can you do', 'commands'],
        category: 'general',
        response: 'I can help you with:\n• Course enrollment & content\n• Test/exam information\n• Marks & performance\n• Attendance queries\n• Flashcards & study tips\n• Subject-specific questions\n\nJust ask me anything!',
    },
    {
        keywords: ['thank', 'thanks', 'ty'],
        category: 'general',
        response: "You're welcome! 😊 Feel free to ask if you have more questions. Happy studying!",
    },
    {
        keywords: ['enroll', 'enrol', 'join', 'register course', 'add course'],
        category: 'general',
        response: 'To enroll in a course, go to your Dashboard → Courses page, browse available courses, and click "Enroll". You can enroll in multiple courses at once.',
    },
    {
        keywords: ['password', 'reset password', 'forgot password', 'change password'],
        category: 'general',
        response: 'To reset your password, click "Forgot Password" on login page. A reset link will be sent to your email. If you\'re logged in, go to Profile → Security to change your password.',
    },
    {
        keywords: ['test', 'exam', 'quiz', 'assessment', 'take test'],
        category: 'exam',
        response: 'To take a test, go to Assessments in your sidebar. You\'ll see Practice Tests (unlimited attempts), Chapter Tests, and Final Assessments. Click "Start Test" to begin. Make sure you have a stable internet connection.',
    },
    {
        keywords: ['marks', 'score', 'grade', 'result', 'performance'],
        category: 'exam',
        response: 'Your test results and marks are available on the Performance page. You can see subject-wise scores, comparison charts, and your strengths & weaknesses analysis.',
    },
    {
        keywords: ['attendance', 'absent', 'present', 'late'],
        category: 'general',
        response: 'Your attendance is tracked daily by your teachers. Check the Attendance section to see your percentage and subject-wise breakdown. An alert will appear if your attendance drops below 75%.',
    },
    {
        keywords: ['flashcard', 'study card', 'revision', 'spaced repetition'],
        category: 'subject',
        response: 'Flashcards use spaced repetition to help you remember key concepts. Go to Flashcards in the sidebar, select a subject, and start reviewing. Rate each card to optimize your review schedule.',
    },
    {
        keywords: ['video', 'lecture', 'watch'],
        category: 'subject',
        response: 'Video lectures are organized by subject and chapter. Go to a course page to find all video lectures. You can watch at your own pace and bookmark important sections.',
    },
    {
        keywords: ['pdf', 'notes', 'download', 'study material'],
        category: 'subject',
        response: 'PDF notes are available on each course page under the chapter sections. Click the download icon to save them for offline study.',
    },
    {
        keywords: ['reward', 'badge', 'points', 'gamification', 'achievement'],
        category: 'general',
        response: 'You earn points and badges for completing courses, scoring well on tests, maintaining attendance streaks, and other achievements. Check your Rewards page to see all earned badges!',
    },
    {
        keywords: ['os', 'operating system'],
        category: 'subject',
        response: 'Operating Systems covers process management, memory management, file systems, deadlocks, and scheduling algorithms. Check your OS course for chapter-wise video lectures and notes.',
    },
    {
        keywords: ['dbms', 'database'],
        category: 'subject',
        response: 'DBMS covers ER modeling, normalization, SQL queries, transaction management, and concurrency control. Practice SQL queries using the assessments section.',
    },
    {
        keywords: ['cn', 'computer network', 'networking'],
        category: 'subject',
        response: 'Computer Networks covers OSI model, TCP/IP, routing algorithms, transport layer protocols, and network security. Check the CN course for detailed lectures.',
    },
    {
        keywords: ['dsa', 'data structure', 'algorithm'],
        category: 'subject',
        response: 'DSA covers arrays, linked lists, trees, graphs, sorting, searching, dynamic programming, and greedy algorithms. Practice problems are available in the assessments section.',
    },
    {
        keywords: ['java', 'python', 'programming'],
        category: 'subject',
        response: 'Programming courses cover fundamentals, OOP concepts, collections, exception handling, and advanced topics. Practice coding through the assessments and flashcards.',
    },
];

/**
 * Generate AI response using Gemini
 */
const generateAIResponse = async (message) => {
    if (!API_KEY) {
        return null;
    }

    try {
        const response = await axios.post(
            API_URL,
            {
                model: MODEL_NAME,
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful AI assistant for a Digital Learning Support and Evaluation System (DLSES). You help students with course information (OS, DBMS, CN, COA, DSA, Java, Python, etc.), test preparation, and study tips. Always format your responses using professional Markdown (e.g., use **bold** for emphasis, lists for points, and ```sql for code blocks)."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 200,
                temperature: 0.5,
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        return {
            response: response.data.choices[0].message.content.trim(),
            category: 'ai',
            isAI: true,
        };
    } catch (error) {
        console.error('Hugging Face AI Error:', error.response?.data || error.message);
        return null;
    }
};

/**
 * Process a user message and return a chatbot response
 */
const getResponse = async (message) => {
    const lowerMsg = message.toLowerCase().trim();

    // First try AI response if available
    if (API_KEY) {
        try {
            const aiResponse = await generateAIResponse(message);
            if (aiResponse) {
                return aiResponse;
            }
        } catch (error) {
            console.error('AI generation failed, falling back to rules:', error);
        }
    }

    // Fallback to rule-based responses
    for (const entry of knowledgeBase) {
        for (const keyword of entry.keywords) {
            if (lowerMsg.includes(keyword)) {
                return {
                    response: entry.response,
                    category: entry.category,
                    isAI: false,
                };
            }
        }
    }

    // Default fallback
    return {
        response: "I'm not exactly sure about that technical detail yet. However, for subject-specific doubts, I recommend checking your Course Lectures and PDF notes. If you're still stuck, you can try asking me about specific topics like 'DBMS Normalization' or 'OS Scheduling'!",
        category: 'other',
        isAI: false,
    };
};

module.exports = { getResponse };
