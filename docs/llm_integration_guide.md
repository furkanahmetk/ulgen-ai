# Sentinel AI - LLM & AI Agent Integration Guide

You are free to choose the "brain" (AI model) that powers the autonomous ReAct loop of Sentinel AI. Depending on your budget and infrastructure, you can configure one of the following options.

## 1. OpenAI (gpt-4o-mini) - Recommended (Low Cost)
The most stable API for tool-calling. The `gpt-4o-mini` model is extremely cheap.
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys).
2. Add a minimum credit balance ($5) and generate a new API Key.
3. Add to your `backend/.env`:
   ```env
   OPENAI_API_KEY=sk-xxxx...
   ```
4. Code Integration: When calling the `ChatOpenAI` module in LangChain, set the model to `gpt-4o-mini`.

## 2. Google Gemini API - Free Tier
Offers a generous free tier for developers.
1. Get a free API Key from [Google AI Studio](https://aistudio.google.com/app/apikey).
2. Install the package in the backend:
   ```bash
   cd backend
   npm install @langchain/google-genai
   ```
3. Add to your `backend/.env`:
   ```env
   GOOGLE_API_KEY=AIzaSy...
   ```
4. Code Integration: Use `ChatGoogleGenerativeAI({ model: "gemini-1.5-flash" })` instead of `ChatOpenAI`.

## 3. Groq API - Free and Extremely Fast
Runs open-source models (like Llama 3) in the cloud at incredible speeds for free.
1. Go to [Groq Console](https://console.groq.com/keys) and generate an API Key.
2. Install the package in the backend:
   ```bash
   cd backend
   npm install @langchain/groq
   ```
3. Add to your `backend/.env`:
   ```env
   GROQ_API_KEY=gsk_xxxx...
   ```
4. Code Integration: Use `ChatGroq({ model: "llama3-70b-8192" })` instead of `ChatOpenAI`.

## 4. Ollama - Fully Local and Offline
If you have a powerful machine, you can run a local model without using any external APIs.
1. Download and install Ollama from [Ollama.com](https://ollama.com).
2. Download a model via terminal: `ollama run llama3`
3. Install the package in the backend:
   ```bash
   cd backend
   npm install @langchain/community
   ```
4. Code Integration: Connect using `ChatOllama({ model: "llama3" })`. (No API Key needed, defaults to localhost:11434).
