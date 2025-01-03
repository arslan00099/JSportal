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


exports.getBlogs = async (req, res) => {
    try {
        const { title, status } = req.query; // Get filters from query params

        // Build query conditions dynamically
        const conditions = {};
        if (title) {
            conditions.title = {
                contains: title, // Search for partial match in title
            };
        }
        conditions.status = status === 'APPROVED' ? 'APPROVED' : 'APPROVED'; // Default to 'APPROVED'

        // Fetch blogs from the database based on conditions
        const blogs = await prisma.blog.findMany({
            where: conditions,
        });

        res.status(200).json(blogs);
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ error: 'An error occurred while fetching the blogs.' });
    }
};
