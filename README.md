# 🤖 AI Buddy

AI Buddy is a personalized AI chat application built using **Next.js**, **Ollama**, and **LangChain**. It allows you to chat with custom AI companions powered by open-source LLMs running locally on your machine. The app supports streaming responses, memory, and retrieval-based augmentation via Pinecone and Redis.

> 🚀 Deployed on Vercel: [https://your-app.vercel.app](https://ai-buddy-rctt.vercel.app/)  
> 🧠 Powered locally by [Ollama](https://ollama.com) models like `llama2`, `mistral`, etc.

---

## ✨ Features

- 🔥 Real-time Chat UI with Streaming
- 🧠 Memory backed by Redis & LangChain
- 📚 RAG (Retrieval-Augmented Generation) using Pinecone
- 🔐 Use of Local open source Ollama server to use models like llama2 and mistral
- 🧑‍🤝‍🧑 Create multiple AI companions (with database persistence using Prisma & Supabase)
- ☁️ Vercel deployment-friendly with secure local inference

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router), Tailwind CSS, React
- **Backend**: LangChain, Ollama, TypeScript API routes
- **Database**: Supabase (PostgresSQL) via Prisma
- **Vector DB**: Pinecone
- **Cache/Memory**: Redis via Upstash
- **Auth**: Clerk Authorisation
- **Deployment**: Vercel (for frontend) + Local Ollama (for model inference)

---

## ⚙️ Local Setup Instructions

> This guide helps you run **AI Buddy locally**, with Ollama installed on your own machine.

### 1. Clone the Repository

```bash
git clone https://github.com/aryan1625/ai-buddy.git
cd ai-buddy
```
### 2. Install Dependencies
```bash
npm install
```

### 3. Install and Start Ollama
#### I. First install Ollama, save the env variables in path and then 
```bash
ollama serve
```
#### II. Pull a LLM like mistral or llama2
 ```bash
  ollama pull mistral
  ollama pull llama2
  ```
#### III. run the model
```bash
  ollama run mistral
  ollama run llama2
  ```

#### IV. Start Dev Server
  ```bash
  npm run dev
  ```

#### v. Update the .env file
```.env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY = your_clerk_publishable_key (starts from pk)
CLERK_SECRET_KEY=your_clerk_secret_key (starts from sk)
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
DATABASE_URL="postgres://postgres.[your-supabase-project]:[password]@aws-0-[aws-region].pooler.supabase.com:6543/postgres"
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloudinary_name(for image upload)
PINECONE_INDEX=pinecone_index_name
PINECONE_ENVIRONMENT=pinecone_env
PINECONE_API_KEY=your_pinecone_api_key
UPSTASH_REDIS_REST_URL=your_upstash_redis_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_token
STRIPE_API_KEY=your_stripe_api_key (starts from sk)
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret_key (starts from wh)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```


## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
