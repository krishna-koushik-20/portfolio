# Rocky AI Assistant - Integration Complete ✅

## What's New

Your portfolio now has **Rocky**, an AI-powered assistant powered by Google Gemini AI. Rocky can answer questions naturally about Koushik's work, skills, projects, and personality.

### Key Features

✅ **AI-Powered Responses** - Uses Google Gemini for intelligent answers  
✅ **Conversation Context** - Remembers previous messages for natural dialogue  
✅ **Predefined Answers** - Fast responses for specific questions (email, phone, etc.)  
✅ **Error Handling** - Graceful fallbacks if something goes wrong  
✅ **No UI Changes** - Your existing chatbot UI remains completely unchanged  
✅ **Secure** - API key stored in `.env`, never exposed to client  

---

## Architecture

### Client Side (Browser)
- **index.html** - Your existing chatbot UI (unchanged)
- **script.js** - Updated to call the backend API instead of local pattern matching
- **style.css** - Your existing styles (unchanged)

### Backend (Node.js + Gemini)
- **server.js** - New Express server that handles Gemini API calls
- **package.json** - Dependencies for Express, CORS, dotenv, and @google/generative-ai

### Configuration
- **.env** - Stores your Gemini API key (create this)
- **.env.example** - Template showing what variables you need

---

## How Rocky Works

```
User Types Question
        ↓
Browser sends to: POST /api/chat
        ↓
server.js receives message
        ↓
Check predefined responses (email, phone, etc.)
        ↓
If no predefined match → Send to Gemini AI
        ↓
Gemini generates intelligent response using system prompt
        ↓
Server returns response to browser
        ↓
Response appears in chat with typing animation
```

---

## Setup Instructions

### prerequisite: Get Gemini API Key

1. Go to: https://aistudio.google.com/app/apikey
2. Click "Create API Key"
3. Copy the key

### Create .env File

In portfolio directory, create `.env`:

```
GEMINI_API_KEY=your_key_here
NODE_ENV=production
PORT=3000
```

### Install Dependencies

```bash
cd c:\Users\ADMIN\Desktop\portfolio
npm install
```

### Start Rocky

```bash
npm start
```

You'll see:
```
Rocky's backend is running on port 3000 🚀
```

---

## File Changes Summary

### Modified Files

**script.js**
- Replaced `getAssistantResponse()` with `getAssistantResponseFromAPI()`
- Updated `sendAssistantMessage()` to make async API calls
- All UI behavior remains identical

**index.html**
- No changes

**style.css**
- No changes

### New Files

- `server.js` - Express backend with Gemini integration
- `package.json` - Node.js dependencies
- `.env` - Your API key (YOU create this)
- `.env.example` - Template
- `ROCKY_SETUP.md` - Detailed setup guide
- `ROCKY_QUICKSTART.txt` - Quick reference
- This file

---

## Customization

### Change Rocky's Personality

Edit the `SYSTEM_PROMPT` in `server.js` (around line 25):

```javascript
const SYSTEM_PROMPT = `You are Rocky, an AI assistant...`
```

### Add More Predefined Responses

In `server.js`, look for `PREDEFINED_RESPONSES` object:

```javascript
const PREDEFINED_RESPONSES = {
    'who are you': 'I am KK\'s assistant 🤖',
    'your custom question': 'Your custom answer'
};
```

### Adjust AI Settings

In `server.js`, find the `generationConfig`:

```javascript
generationConfig: {
    maxOutputTokens: 300,  // Adjust response length
    temperature: 0.7,      // 0 = precise, 1 = creative
}
```

---

## API Endpoints

### `POST /api/chat`
Send a message and get a response

**Request:**
```json
{
  "message": "Who are you?"
}
```

**Response:**
```json
{
  "reply": "I am KK's assistant 🤖"
}
```

### `POST /api/chat/reset`
Clear conversation history

### `GET /api/health`
Check if server is running

---

## Local Testing

1. Start server: `npm start`
2. Open your portfolio in browser
3. Refresh to load the updated script
4. Click Rocky button
5. Ask questions and watch the magic happen ✨

---

## Production Deployment

To deploy Rocky to production:

1. Get hosting with Node.js support (Railway, Render, Heroku, etc.)
2. Set environment variables on hosting platform
3. Update API endpoint in `script.js`:
   ```javascript
   const response = await fetch('https://your-domain.com/api/chat', {
   ```
4. Deploy server and portfolio together

---

## Troubleshooting

### "Cannot find module '@google/generative-ai'"
```bash
npm install
```

### "Port 3000 already in use"
Change `PORT` in `.env`:
```
PORT=3001
```
Then update the URL in `script.js`

### "API Key invalid"
1. Check Google AI Studio
2. Verify key hasn't expired
3. Create a new key
4. Update `.env`
5. Restart server

### Gemini returns nothing
- Check internet connection
- Verify API key is valid
- Check browser console for errors
- Ensure `.env` file exists and is readable

---

## Security Best Practices

✅ **Do:**
- Keep `.env` file secure and private
- Never commit `.env` to git
- Use `.env.example` as template
- Rotate API keys periodically
- Monitor API usage on Google AI Studio

❌ **Don't:**
- Share API keys
- Expose `.env` in source code
- Hard-code keys in script.js
- Leave server running unnecessary

---

## What Rocky Knows About Koushik

Rocky is trained on:
- Koushik's skills and interests
- His projects and experience
- His contact information
- His personality and work style
- Career goals and aspirations

Rocky will answer questions about all these topics naturally and conversationally while maintaining professionalism.

---

## Support

If Rocky is not working:

1. Check browser console (F12) for errors
2. Verify server is running (`npm start`)
3. Confirm `.env` file exists with valid API key
4. Test with `http://localhost:3000/api/health`
5. Check `ROCKY_SETUP.md` for detailed help

---

**Rocky is ready to impress! Let's go! 🚀**
