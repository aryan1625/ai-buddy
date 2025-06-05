// import { LangChainAdapter, streamText } from "ai"
// import { StreamingTextResponse,LangChainStream } from 'ai';
import {streamText,LangChainAdapter, generateText} from "ai";
// import { LangChainAdapter } from "ai/langchain";
import { openai } from '@ai-sdk/openai';
// import ollama from 'ollama';
import { Ollama } from "@langchain/ollama";
import {auth,currentUser} from "@clerk/nextjs/server";
// import {CallbackManager} from "langchain/callbacks";
// import {Replicate} from "langchain/llms/replicate";
import {NextRequest, NextResponse} from "next/server";
import {MemoryManager} from "@/lib/memory";
import { rateLimit } from "@/lib/rate-limit";
import prismadb from "@/lib/prismadb";
export async function POST(request: Request,{params}:{params:Promise<{chatId: string}>}){
    try {
        const {prompt} = await request.json();
        const user = await currentUser();
        if(!user || !user.firstName || !user.id){
            return new NextResponse("Unauthorized",{status: 401});
        }
        const identifier = request.url + "-" + user.id;
        const { success } = await rateLimit(identifier);
        if(!success){
            return new NextResponse("Rate Limit Exceeded",{status: 429});
        }
        const {chatId} = await params;
        console.log("API route hit with chatId:", chatId);
        const companion = await prismadb.companion.update({
            where:{
                id: chatId,
            },
            data:{
                messages:{
                    create:{
                        content: prompt,
                        role: "user",
                        userId: user.id,
                    }
                }
            }
        });
        if(!companion){
            return new NextResponse("Companion not found",{status: 404});
        }
        const name = companion.id;
        const companion_file_name = `${name}.txt`;
      
        const companionKey = {
            companionName: name,
            userId: user.id,
            modelName: "llama2-13b",
        };

        const memoryManager = await MemoryManager.getInstance();
        const records = await memoryManager.readLatestHistory(companionKey);
        if (records.length === 0) {
            await memoryManager.seedChatHistory(companion.seed, "\n\n", companionKey);
        }

        await memoryManager.writeToHistory("User: " + prompt + "\n", companionKey);
        const recentChatHistory = await memoryManager.readLatestHistory(companionKey);
        const similarDocs = await memoryManager.vectorSearch(recentChatHistory, companion_file_name);

        let relevantHistory = "";
        if (!!similarDocs && similarDocs.length !== 0) {
            relevantHistory = similarDocs.map((doc: { pageContent: string }) => doc.pageContent).join("\n");
        }
        const llm = new Ollama({
            model: "llama2",  // Using Llama2 model
            baseUrl: "http://127.0.0.1:11434", // Ollama server URL
            temperature: 0.7, // Adjust creativity (0-1)
          });

          const messages = [
      [
        "system",
        `Only generate plain sentences without prefix of who is speaking.Very Important, Do not use ${name}: prefix.
${companion.instructions} just generate the response!!! Also remove 0:" " format just print the text in the string 
Below are relevant details about ${name}'s past and the conversation you are in.
${relevantHistory}
        `,
      ],
      ["user", prompt],
    ] as [string, string][];

    const llmStream = await llm.stream(messages);
    const stream = LangChainAdapter.toDataStreamResponse(llmStream);
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();
    const streamReader = stream.body!.getReader();
    let responseBuffer = ""; // For database storage

    (async () => {
      try {
        while (true) {
          const { done, value } = await streamReader.read();
          if (done) break;

          const textChunk = new TextDecoder().decode(value);
          // console.log("Raw textChunk:", textChunk);
          let cleanedChunk = textChunk;

          // Enhanced cleaning logic
          try {
            // Handle JSON object with numeric keys
            const parsed = JSON.parse(textChunk);
            if (
              parsed &&
              typeof parsed === "object" &&
              Object.keys(parsed).every(k => !isNaN(Number(k)))
            ) {
              cleanedChunk = Object.values(parsed).join(" ");
            }
          } catch {
            try {
              // Convert to valid JSON by wrapping
              const wrapped = `{${textChunk}}`.replace(/^\{\s*(\d+)\s*:/, '{"$1":');
              const parsed = JSON.parse(wrapped);
              const keys = Object.keys(parsed);
              if (keys.length === 1) {
                cleanedChunk = parsed[keys[0]];
              }
            } catch {
              // Fallback regex extraction
              const match = textChunk.match(/^\s*\d+\s*:\s*"((?:\\"|[^"])*)"\s*$/);
              if (match) {
                try {
                  cleanedChunk = JSON.parse(`"${match[1]}"`);
                } catch {
                  cleanedChunk = match[1];
                }
              }
            }
          }

          // Stream immediately to client
          // console.log("Cleaned chunk:", cleanedChunk);
          await writer.write(encoder.encode(cleanedChunk));
          
          // Accumulate for database storage
          responseBuffer += cleanedChunk;
        }

        await writer.close();

        // Save to database AFTER streaming completes
        const fullResponse = responseBuffer.trim();
        if (fullResponse) {
          await memoryManager.writeToHistory(fullResponse, companionKey);
          await prismadb.companion.update({
            where: { id: chatId },
            data: {
              messages: {
                create: {
                  content: fullResponse,
                  role: "system",
                  userId: user.id,
                },
              },
            },
          });
        }
      } catch (err) {
        console.error("Stream processing error:", err);
        await writer.abort(err);
      }
    })();

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
    } catch (error) {
        console.log("[CHAT_POST]",error);
        return new NextResponse("Internal Error", {status: 500});
    }

}

       
