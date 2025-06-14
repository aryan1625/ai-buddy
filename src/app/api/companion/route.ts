import { currentUser } from "@clerk/nextjs/server";
import { NextResponse,NextRequest } from "next/server";
import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
export async function POST(req: Request){
    try {
        const body = await req.json()
        const user = await currentUser()
        const {src,name,description,instructions,seed,categoryId} = body;
        if(!user || !user.id || !user.firstName){
            return new NextResponse("Unauthorized",{status:401})
        }
        if(!src || !name || !description || !instructions || !seed || !categoryId){
            return new NextResponse("Missing required fields",{status:400})
        }
        //todo check for subsciption
        const isPro = await checkSubscription();
        if(!isPro){
            return new NextResponse("You need to be a pro user to create a companion",{status:403})
        }
        const companion = await prismadb.companion.create({
            data:{
                categoryId,
                userId: user.id,
                userName: user.firstName,
                src,
                name,
                description,
                instructions,
                seed,
            }
        })
        return NextResponse.json(companion)

    } catch (error) {
        console.log("[COMPANION_POST]",error)
        return new NextResponse("Internal server error",{status:500})
    }
}