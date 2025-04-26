const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getservicesName = async (req, res) => {
    const { type } = req.query;

    const validModels = {
        Industry: prisma.industry,
        MentorService: prisma.mentorService,
        RecService: prisma.recService,
        Language: prisma.language,
        Skill: prisma.skill,
    };

    if (!validModels[type]) {
        return res.status(400).json({ error: 'Invalid service type' });
    }

    try {
        const results = await validModels[type].findMany({
            select: { name: true }
        });
        return res.status(200).json(results);
    } catch (error) {
        console.error('Error fetching service names:', error);
        return res.status(500).json({ error: 'Server error' });
    }
};
