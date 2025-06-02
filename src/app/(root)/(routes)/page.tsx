import { SearchInput } from "@/components/searchInput";
import { Categories } from "@/components/categories";
import prismadb from "@/lib/prismadb";
import { checkSubscription } from "@/lib/subscription";
import { Companions } from "@/components/companions";
import { currentUser } from "@clerk/nextjs/server";
interface RootPageProps{
  searchParams:Promise<{
    categoryId: string;
    name: string;
  }>
}
const RootPage = async({
  searchParams
}:RootPageProps)=>{
  const isPro = await checkSubscription();
  const user = await currentUser();
  const {categoryId,name} = await searchParams;
  const data = await prismadb.companion.findMany({
    where:{
      categoryId: categoryId,
      name:{
        contains: name
      },
      OR: [
      { isPublic: true },
      ...(isPro && user?.id ? [{userId:user.id}] : [])
      ]
    },
    orderBy:{
      createdAt: "desc",
    },
    include: {
      _count:{
        select:{
          messages:true
        }
      }
    }
  })
  const categories = await prismadb.category.findMany();
  return (
    <div className="h-full p-4 space-y-2">
      <SearchInput/>
      <Categories data = {categories}/>
      <Companions data={data} />
    </div>
  );
}
export default RootPage;
