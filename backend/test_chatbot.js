const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.HUGGINGFACE_API_KEY;
const MODEL_NAME = 'Qwen/Qwen2.5-72B-Instruct';
const API_URL = 'https://router.huggingface.co/v1/chat/completions';

async function finalTest() {
    console.log("=================================");
    console.log(" CHATBOT PRODUCTION TEST ");
    console.log("=================================\n");

    if (!API_KEY) {
        console.log("❌ API KEY missing in .env");
        return;
    }

    try {
        console.log(`🔎 Testing model: ${MODEL_NAME}`);
        const response = await axios.post(
            API_URL,
            {
                model: MODEL_NAME,
                messages: [{ role: "user", content: "Reply with: HUGO READY" }],
                max_tokens: 10
            },
            {
                headers: {
                    "Authorization": `Bearer ${API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );

        console.log("✅ SUCCESS");
        console.log("Response:", response.data.choices[0].message.content.trim());
    } catch (err) {
        console.log("❌ FAILED");
        console.log("Error:", err.response?.data || err.message);
    }
}

finalTest();
