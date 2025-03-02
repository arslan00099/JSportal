const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
async function main() {
    await prisma.subscription.createMany({
        data: [
            {
                name: "GOLD",
                price: 225,
                jobSlots: 2,
                description: "Perfect for small businesses or startups looking to hire for a few roles efficiently. Post up to 2 jobs in one month and access quality talent to match your teams’ requirements. This subscription will renew automatically at the end of each month. Need more flexibility? Upgrade to Diamond or Platinum to match your hiring needs!",
            },
            {
                name: "DIAMOND",
                price: 540,
                jobSlots: 4,
                description: "Ideal for growing teams looking to hire for a few roles efficiently. Post up to 4 jobs in one month for top-tier talent. This subscription will renew automatically at the end of each month. Need more flexibility? Switch to Platinum for your increasing hiring needs!",
            },
            {
                name: "PLATINUM",
                price: 225,
                jobSlots: 10,
                description: "Best suited for large businesses looking to hire for multiple roles in different teams. Post up to 10 jobs to scale your recruitment efforts. This subscription will renew automatically at the end of each month.",
            },
            {
                name: "STARTER",
                price: 75,
                resumeSearches: 25,
                description: "Best for businesses seeking quick access to a talent pool. View up to 25 resumes and save time with quick shortlisting of candidates.",
            },
            {
                name: "LITE",
                price: 145,
                resumeSearches: 50,
                description: "Perfect for teams looking to add to their recruitment pipeline and download up to 50 candidates’ resumes if you’re looking to hire for multiple roles.",
            },
            {
                name: "PRO",
                price: 225,
                resumeSearches: 100,
                description: "Expansive hiring needs? Access a large talent pool with 100 candidates’ resumes available for download.",
            },
        ],
    });

    console.log("Seed data inserted successfully");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
