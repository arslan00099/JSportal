const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Controller for creating a new blog
exports.createBlog = async (req, res) => {
    try {
        const { title, content, status, postedBy } = req.body;

        // Validate input
        if (!title || !content) {
            return res.status(400).json({ error: 'Title and content are required.' });
        }

        // Create new blog entry
        const newBlog = await prisma.blog.create({
            data: {
                title,
                content,
                postedBy: postedBy || null,
            },
        });

        res.status(201).json(newBlog);
    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ error: 'An error occurred while creating the blog.' });
    }
};
