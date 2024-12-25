const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


async function main() {
  // Step 1: Create a subscription
  const subscription = await prisma.subscription.create({
    data: {
      name: 'GOLD', // Enum value from SubscriptionType
      price: 99.99,
      jobSlots: 10,
      resumeSearches: 50,
      description: 'Gold subscription with 10 job slots and 50 resume searches',
    },
  });

  console.log('Created subscription:', subscription);

  const user = await prisma.user.create({
    data: {
      email: 'employer00@example.com',
      password: 'securepassword',
      role: 'EMPLOYER',
      profileStatus: 'UNVARIFIED',
      userStatus: 'APPROVED',
      isActive: true,
      isAdmin: false,
    },
  });
  
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

  // Step 3: Create a subscription purchase
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
