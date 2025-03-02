const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  // Step 1: Create a user
  const user = await prisma.user.create({
    data: {
      email: 'employer1100@example.com',
      password: 'securepassword',
      role: 'EMPLOYER',
      profileStatus: 'UNVARIFIED',
      userStatus: 'APPROVED',
      isActive: true,
      isAdmin: false,
    },
  });

  // Step 2: Create a profile linked to the user
  const profile = await prisma.profile.create({
    data: {
      userId: user.id,
      fullname: 'John Doe',
      companyName: 'TechCorp',
      companySize: '100-500',
      industry: 'Technology',
      location: 'San Francisco, CA',
    },
  });

  console.log('Created user:', user);

  // Step 3: Fetch the subscription details
  const subscription = await prisma.subscription.findUnique({
    where: {
      id: 1, // Assuming you want to fetch subscription with ID 1
    },
  });

  if (!subscription) {
    throw new Error("Subscription with ID 1 not found.");
  }

  // Step 4: Create a subscription purchase record
  const subscriptionBought = await prisma.subscriptionBought.create({
    data: {
      userId: user.id,
      subscriptionId: subscription.id,
      price: subscription.price,
      jobSlots: subscription.jobSlots,
      resumeSearches: subscription.resumeSearches,
    },
  });

  console.log('Created subscriptionBought:', subscriptionBought);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
