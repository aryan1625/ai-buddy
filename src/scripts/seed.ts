const {PrismaClient} = require("@prisma/client");
const db = new PrismaClient();
async function main(){
    try {
        await db.category.createMany({
            data: [
                {name: "Famous People"},
                {name: "Movies and TV"},
                {name: "Musicians"},
                {name: "Athletes"},
                {name: "Scientists"},
                {name: "Politicians"},
            ]
        });
    } catch (error) {
        console.error("Error seeding default categories",error);
    } finally{
        await db.$disconnect();
    }
}
main()
