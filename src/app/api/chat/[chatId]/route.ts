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
export async function POST(request: Request,{params}:{params:{chatId: string}}){
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
        {
        {
            // NO NEED TO USE THIS PREVIOUS CODE
            // const {handlers} = LangChainStream();
            // const model = new Replicate({
            //     model: "a16z-infra/llama-2-13b-chat:df7690f1994d94e96ad9d568eac121aecf50684a0b0963b25a41cc40061269e5",
            //     input: {
            //         max_length: 2048,
            //     },
            //     apiKey: process.env.REPLICATE_API_TOKEN,
            //     callbackManager: CallbackManager.fromHandlers(handlers)
            // })
            // model.verbose = true;
            // const resp = String(
            //     await model.call(
            //         `Only generate plain sentences without prefix of who is speaking. Do not use ${name}:prefix.
            //         ${companion.instructions}
            //         Below are relevant details about ${name}'s past and the conversation you are in.
            //         ${relevantHistory}
            //         ${recentChatHistory}\n${name}:`
            //     ).catch(console.error)
            // )
    
            // const cleaned = resp.replaceAll(",","");
            // const chunks = cleaned.split('\n');
            // const response = chunks[0];
            // await memoryManager.writeToHistory(""+ response.trim(),companionKey);
            // var Readable = require("stream").Readable;
            // let s = new Readable();
            // s.push(response);
            // s.push(null);
            // if(response!==undefined && response.length>1){
            //     memoryManager.writeToHistory(""+response.trim(),companionKey);
            //     await prismadb.companion.update({
            //         where:{
            //             id: chatId,
            //         },
            //         data:{
            //             messages:{
            //                 create:{
            //                     content: response.trim(),
            //                     role:"system",
            //                     userId: user.id,
    
            //                 }
            //             }
            //         }
            //     })
            // };
            // return new StreamingTextResponse(s);
            }
            {
                // NO NEED TO USE THIS PREVIOUS CODE
        // Use streamText to generate the AI response
        // const {textStream}  = await streamText({
        //     model: openai('gpt-4o'), // Replace with your desired model
        //     prompt: `
        //         Only generate plain sentences without prefix of who is speaking. Do not use ${name}:prefix.
        //         ${companion.instructions}
        //         Below are relevant details about ${name}'s past and the conversation you are in.
        //         ${relevantHistory}
        //         ${recentChatHistory}\n${name}:
        //     `,
        //     maxTokens: 2048,
        // });
            }
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
    // Read from the stream and write to the writable stream
    let fullResponse = "";

    (async () => {
      try {
        while (true) {
          const { done, value } = await streamReader.read();
          if (done) break;
          const text = new TextDecoder().decode(value);
          fullResponse += text;
          await writer.write(encoder.encode(text));
        }

        await writer.close();

        // Save streamed response to memory and DB
        await memoryManager.writeToHistory(fullResponse.trim(), companionKey);
        await prismadb.companion.update({
          where: { id: chatId },
          data: {
            messages: {
              create: {
                content: fullResponse.trim(),
                role: "system",
                userId: user.id,
              },
            },
          },
        });
        // console.log("Generated response:", fullResponse.trim());
      } catch (err) {
        console.error("Stream error:", err);
        await writer.abort(err);
      }
    })();

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });

    
          
        const textStream = await llm.stream(
                 `Only generate plain sentences without prefix of who is speaking. Do not use ${name}:prefix.
                 ${companion.instructions}
                 Below are relevant details about ${name}'s past and the conversation you are in.
                 ${relevantHistory}
                 ${recentChatHistory}\n${name}:`
        )
        {
        //NO NEED TO USE THIS
        // const { textStream } = await streamText({

        //     model: openai('gpt-4o'), // Replace with your desired model
        //     prompt: `Tell me a joke.`,
        //     maxTokens: 512,
        //   });
        }
        console.log("Stream created:", textStream);
        const [stream1,stream2] = textStream.tee();
        {
        //NO NEED TO USE THIS PREVIOUS CODE
        
        // const model = openai('gpt-3.5-turbo');
        // const {text} = await generateText({
        //     model,
        //     prompt:`tell me a joke`
        // })
        // const text = await llm.invoke(`tell me a joke`);
        // console.log("the response is: ", text);
        // Convert the text stream to a data stream response
        // const response = LangChainAdapter.toDataStreamResponse({
        //     textStream,
        //     status: 200,
        //     headers: { 'Content-Type': 'text/plain' },
        // });
        }
        // Write the AI response to memory
        let responseText = "";
        const reader = stream1.getReader();
        {
        //NO NEED TO USE THIS PREVIOUS CODE
        
        // for await (const textPart of textStream) {
        //     responseText += textPart;
        // }
        }
        while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            console.log("Received chunk:", value);
            responseText += value;
        }
        {
        //NO need to use this previous code
        // const responseStream = new ReadableStream({
        //     async start(controller) {
        //         const reader = textStream.getReader();
        //         try {
        //             while (true) {
        //                 const { done, value } = await reader.read();
        //                 if (done) break;
        //                 controller.enqueue(value);
        //             }
        //         } finally {
        //             controller.close();
        //             reader.releaseLock();
        //         }
        //     }
        // });
        }
        await memoryManager.writeToHistory(responseText.trim(), companionKey);
        console.log("Generated response:", responseText.trim());
        // Update the companion's chat history in the database
        //this is not a comment but a code so uncomment it when you want to use it
        // await prismadb.companion.update({
        //     where: {
        //         id: chatId,
        //     },
        //     data: {
        //         messages: {
        //             create: {
        //                 content: responseText.trim(),
        //                 role: "system",
        //                 userId: user.id,
        //             },
        //         },
        //     },
        // });
        
        // return LangChainAdapter.toDataStreamResponse(textStream);
        return new Response(stream2, {
            headers: {
                'Content-Type': 'text/plain',
            },
        });
    } catch (error) {
        console.log("[CHAT_POST]",error);
        return new NextResponse("Internal Error", {status: 500});
    }

}

       
