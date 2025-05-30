import {auth} from "@clerk/nextjs/server"
import prismadb from "@/lib/prismadb";
import CompanionForm from "./components/companion-form";
import { RedirectToSignIn } from "@clerk/nextjs";
interface CompanionIdPageProps {
    params:{
        companionId: string,
    }
}
const CompanionPage = async({params}:CompanionIdPageProps)=>{
    const {userId} = await auth();
    if(!userId){
        return <RedirectToSignIn/>
    }
    
    //todo check subscription
    const {companionId} = await params;
    const companion = await prismadb.companion.findUnique({
        where:{
            id: companionId
        }
    })
    const categories = await prismadb.category.findMany();

    return(
        <div>
            <CompanionForm initialData = {companion} categories = {categories}/>
        </div>
    )
}
export default CompanionPage;