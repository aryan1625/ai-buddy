import {auth} from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb"
import { stripe } from "./stripe";
const DAY_IN_MS = 86_400_000;
export const checkSubscription = async () => {
    const {userId} = await auth();
    if(!userId) {
        return false;
    }
    const userSubscription = await prismadb.userSubscription.findUnique({
        where:{
            userId: userId
        },
        select:{
            stripeCurrentPeriodEnd: true,
            stripeCustomerId: true,
            stripePriceId: true,
            stripeSubscriptionId: true,  
        }
    })
    //check if user subscribed or not 
    if(!userSubscription) {
        return false;
    }
    //we check if user has valid subscription and then if subscription is still active + 1 day 
    const isValid = userSubscription.stripePriceId && userSubscription.stripeCurrentPeriodEnd?.getTime()! + DAY_IN_MS > Date.now();
    //! reverse value , !! ensure isValid is a boolean
    return !!isValid;
}
