# Rocky AI Assistant - Setup Guide

## 🤖 What Just Happened

Your portfolio chatbot has been upgraded to use **Google Gemini AI**! Rocky is now an intelligent assistant that can answer questions naturally about Koushik's work, skills, and personality.

## 📋 Quick Setup (2 Steps)

### Step 1: Get Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **"Create API Key"**
3. Copy the API key
4. Paste it into the `.env` file (see Step 2)

### Step 2: Create `.env` File

Create a `.env` file in your portfolio directory:

```bash
cd c:\Users\ADMIN\Desktop\portfolio
```

Create a file named `.env` with:

```
GEMINI_API_KEY=your_api_key_here
NODE_ENV=production
PORT=3000
```

Replace `your_api_key_here` with the API key from Step 1.

## 🚀 Running Rocky

### First Time Setup (Install Dependencies)

```bash
cd c:\Users\ADMIN\Desktop\portfolio
npm install
```

### Start Rocky's Backend

```bash
npm start
```

You'll see:
```
Rocky's backend is running on port 3000 🚀
API endpoint: http://localhost:3000/api/chat
```

### Keep It Running

Keep this terminal open while testing or using the portfolio.

## 🧠 How Rocky Works

1. **Predefined Responses** - Quick answers for specific questions like "who are you", "email", "phone"
2. **Gemini AI** - For all other questions, Rocky uses Google Gemini to generate intelligent, conversational responses
3. **Conversation History** - Rocky remembers context from previous messages for more natural conversations
4. **Error Handling** - If something goes wrong, Rocky responds: "Rocky is currently thinking too hard 😅 Please try again."

## 📝 Customizing Rocky

Edit `server.js` to:
- Change the system prompt (search for `SYSTEM_PROMPT`)
- Add more predefined responses
- Adjust response length or tone
- Modify AI parameters (temperature, tokens, etc.)

## 🔒 Security

- **Never** commit `.env` to git
- **Never** share your API key
- The `.env.example` file shows what variables to use
- All API calls are private between your server and Google

## 📖 Architecture

```
portfolio/
├── index.html          (Chatbot UI - unchanged)
├── script.js           (Updated to call API)
├── style.css           (Unchanged)
├── server.js           (New: Gemini integration)
├── package.json        (New: Node dependencies)
├── .env                (New: Your API key)
└── .env.example        (Template for .env)
```

## 🧪 Testing

1. Open `index.html` in your browser
2. Click the Rocky assistant button
3. Ask questions like:
   - "Who are you?"
   - "What technologies does Koushik know?"
   - "Tell me about Koushik's AI projects"
   - "Can I hire you?" (casual question)

## ⚠️ Troubleshooting

### "Connection Refused" or "Page cannot reach server"

Make sure:
- Terminal is running `npm start`
- Port 3000 is not blocked
- Try: `http://localhost:3000/api/health` in a new tab

### "Rocky is currently thinking too hard"

Check:
- `.env` file has correct API key
- API key is valid (not revoked)
- You have internet connection
- Check browser console for error details

### API Key Errors

- Go back to [Google AI Studio](https://aistudio.google.com/app/apikey)
- Check if key is still valid
- Create a new key if needed
- Update `.env` and restart server

## 📞 Koushik's Details in Rocky

Rocky knows:
- Email: mulagaletikrishnakoushik@gmail.com
- Phone: 7013802548
- Role: Trainee at [24]7.ai
- Skills: AI, Cybersecurity, IoT, Full Stack, Computer Vision
- And much more!

## 🎯 Production Deployment

For deploying to a live server:
1. Use a proper Node.js hosting (Railway, Heroku, Render, etc.)
2. Set environment variables on the hosting platform
3. Update the API endpoint in `script.js` from `http://localhost:3000` to your server URL
4. Ensure the portfolio and server are on the same domain or use CORS properly

---

**Rocky is ready to impress visitors with intelligent, human-like responses! 🚀**
