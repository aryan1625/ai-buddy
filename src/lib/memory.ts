import {Redis} from "@upstash/redis"
// import { OpenAIEmbeddings } from "@langchain/openai"
import { OllamaEmbeddings } from "@langchain/ollama";
import {Pinecone} from "@pinecone-database/pinecone"
import {PineconeStore} from "@langchain/pinecone"
export type CompanionKey = {
    companionName: string;
    modelName: string;
    userId: string;
}

export class MemoryManager{
    private static instance: MemoryManager;
    private history: Redis;
    private pineconeClient: Pinecone;
    private embeddings: OllamaEmbeddings;
    public constructor(){
        this.history = Redis.fromEnv();
        this.pineconeClient = new Pinecone();
        this.embeddings = new OllamaEmbeddings({
            model: "llama2",
            // baseUrl: "http://localhost:11434",
            baseUrl: "http://127.0.0.1:11434",
        })
    }
    public async init(){
        try {
            await new Promise(resolve => setTimeout(resolve, 1000));
            console.log("Pinecone initialized successfully");
            // if (this.pineconeClient instanceof Pinecone) {
            //   await this.pineconeClient.init({
            //     apiKey: process.env.PINECONE_API_KEY!,
            //     environment: process.env.PINECONE_ENVIRONMENT!,
            //   });
            // }
          } catch (error) {
            console.error("Failed to initialize Pinecone:", error);
            throw error; // Re-throw to ensure getInstance knows initialization failed
          }
    }
    public async vectorSearch(
        recentChatHistory: string,
        companionFileName: string,
    ){
        // const pineconeClient = <Pinecone>this.pineconeClient;
        const pineconeIndex = this.pineconeClient.Index(process.env.PINECONE_INDEX! || "");
        const vectorStore = await PineconeStore.fromExistingIndex(
            // new OpenAIEmbeddings({
            //         openAIApiKey: process.env.OPENAI_API_KEY!,
            //         modelName: "text-embedding-ada-002",
            //     }),
           
            this.embeddings,
                {
                    pineconeIndex,
                    filter: {fileName: companionFileName}
                }
        )
        const similarDocs = await vectorStore.similaritySearch(recentChatHistory,3).catch((error)=>{
            console.log("Failed to get vector search results",error);
            return [];
        })
        return similarDocs;
    }
    public static async getInstance(): Promise<MemoryManager>{
        if(!MemoryManager.instance){
            MemoryManager.instance = new MemoryManager();
            await MemoryManager.instance.init();
        }
        return MemoryManager.instance;
    }

    private generateRedisCompanionKey(companionKey: CompanionKey): string{
        return `${companionKey.companionName}-${companionKey.modelName}-${companionKey.userId}`;
    }
    public async writeToHistory(text: string, companionKey: CompanionKey){
        if(!companionKey || typeof companionKey.userId === "undefined"){
            console.log("Companion Key set incorrectly");
            return "";
        }
        const key = this.generateRedisCompanionKey(companionKey);
        const result = await this.history.zadd(key,{
            score: Date.now(),
            member: text,
        })
        return result;
    }
    public async readLatestHistory(companionKey: CompanionKey): Promise<string>{
        if(!companionKey || typeof companionKey.userId === "undefined"){
            console.log("Companion Key set incorrectly");
            return "";
        }
        const key = this.generateRedisCompanionKey(companionKey);
        let result  = await this.history.zrange(key,0,Date.now(),{
            byScore: true,
        })
        result = result.slice(-30).reverse();
        const recentChats = result.reverse().join("\n");
        return recentChats;
    }
    public async seedChatHistory(
        seedContent: string,
        delimiter: string = "\n",
        companionKey: CompanionKey
    ){
        const key = this.generateRedisCompanionKey(companionKey);
        if(await this.history.exists(key)){
            console.log("user already has chat history");
            return;
        }
        const content = seedContent.split(delimiter);
        let counter = 0;
        for(const line of content){
            await this.history.zadd(key,{score: counter, member: line});
            counter += 1;
        }

    }
}


