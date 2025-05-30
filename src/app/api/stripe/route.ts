import {auth,currentUser} from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
const settingsUrl = absoluteUrl("/settings");
export async function GET() {
    try {
        const {userId} = await auth();
        const user = await currentUser();
        if(!userId || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        const userSubscription = await prismadb.userSubscription.findUnique({
            where:{
                userId
            }
        })
        if(userSubscription && userSubscription.stripeCustomerId) {
            //if user has subscription then we return the customer portal url
            const stripeSession = await stripe.billingPortal.sessions.create({
                customer: userSubscription.stripeCustomerId,
                return_url: settingsUrl
            });
            return NextResponse.json({ url: stripeSession.url });
        }
        //if usr first time subscribing then we create a new checkout session
        const stripeSession = await stripe.checkout.sessions.create({
            success_url: settingsUrl,
            cancel_url: settingsUrl,
            payment_method_types: ["card"],
            mode: "subscription",
            billing_address_collection: "auto",
            customer_email: user.emailAddresses[0].emailAddress,
            line_items: [
                {
                    price: "price_1RUYeRSH1sNiPMnGIq0ayXdR", // Replace with your actual Stripe Price ID
                    quantity: 1,
                },
            ],
            metadata: {
                userId
            }

        })
        return NextResponse.json({ url: stripeSession.url });
        
    } catch (error) {
        console.log("[STRIPE_GET]", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });  
    }
}

