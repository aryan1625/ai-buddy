import { SearchInput } from "@/components/searchInput";
import { Categories } from "@/components/categories";
import prismadb from "@/lib/prismadb";
import { Companions } from "@/components/companions";
interface RootPageProps{
  searchParams:{
    categoryId: string;
    name: string;
  }
}
const RootPage = async({
  searchParams
}:RootPageProps)=>{
  const {categoryId,name} = await searchParams;
  const data = await prismadb.companion.findMany({
    where:{
      categoryId: categoryId,
      name:{
        contains: name
      }
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
