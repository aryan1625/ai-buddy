import Stripe from "stripe";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";
import { absoluteUrl } from "@/lib/utils";
import { sign } from "crypto";

export async function POST(request: Request) {
    const body = await request.text();
    const signature = (await headers()).get("Stripe-signature") as string;
    let event: Stripe.Event;
    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        )
    } catch (error: any) {
        return NextResponse.json(
            { error: `Webhook Error: ${error.message}` },
            { status: 400 }
        );
    }
    const session = event.data.object as Stripe.Checkout.Session;
    if (event.type === "checkout.session.completed") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )
        if(!session?.metadata?.userId){
            return NextResponse.json(
                { error: "User ID is required!!" },
                { status: 400 }
            );  
        }
        
        await prismadb.userSubscription.create({
            data:{
                userId: session?.metadata?.userId,
                stripeSubscriptionId: subscription.id,
                stripeCustomerId: subscription.customer as string,  
                stripePriceId: subscription.items.data[0].price.id,
                stripeCurrentPeriodEnd: new Date(
                    subscription.items.data[0].current_period_end*1000
                )
            }
        })
    }
    if (event.type === "invoice.payment_succeeded") {
        const subscription = await stripe.subscriptions.retrieve(
            session.subscription as string
        )
        await prismadb.userSubscription.update({
            where: {
                stripeSubscriptionId: subscription.id
            },  
            data:{
                stripePriceId: subscription.items.data[0].price.id,  
                stripeCurrentPeriodEnd: new Date(
                    subscription.items.data[0].current_period_end*1000
                )
            }
        })

    }
    return NextResponse.json(
        null, 
        { status: 200 }
    );

}