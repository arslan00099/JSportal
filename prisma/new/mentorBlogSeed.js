const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Ensure related Mentor and MentorProfile exist
    // const mentor = await prisma.user.upsert({
    //     where: { email: 'mentor@example.com' },
    //     update: {},
    //     create: {
    //         email: 'mentor@example.com',
    //         password:'test',
    //         role: 'MENTOR',
    //         isActive: true,
    //     },
    // });

    // const mentorProfile = await prisma.profile.upsert({
    //     where: { id: mentor.id },
    //     update: {},
    //     create: {
    //         fullname: 'John Doe Profile',
    //         userId: mentor.id,
    //     },
    // });

    // Seed Blog
    await prisma.blog.create({
        data: {
            title: 'How to Mentor Effectively',
            content: 'Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.Mentoring is a process where a more experienced individual helps guide a less experienced person.gfdfgdf',
            status: 'PENDING', // Set status based on BlogStatus enum
            blogStatus: 'PENDING', // Duplicate BlogStatus field
            mentorId: 11,
        },
    });

    console.log('Seed data created successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding data:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
