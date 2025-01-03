const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Controller for creating a new blog
exports.createBlog = async (req, res) => {
    try {
        const { userId } = req.user;
        postedBy = userId;
        const { title, content } = req.body;

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

        // Fetch blogs with related user and profile
        const blogs = await prisma.blog.findMany({
            where: conditions,
            include: {
                user: {
                    select: {
                        Profile: {
                            select: {
                                fullname: true, // Include the fullname from Profile
                            },
                        },
                    },
                },
            },
        });

        // Format the response to include additional details
        const formattedResponse = blogs.map(blog => ({
            id: blog.id,
            title: blog.title,
            content: blog.content,
            status: blog.status,
            postedBy: blog.user?.Profile[0]?.fullname || "Anonymous", // Default to "Anonymous" if no fullname
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
        }));

        res.status(200).json({
            success: true,
            message: "Blogs fetched successfully",
            data: formattedResponse,
        });
    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the blogs.",
            error: error.message,
        });
    }
};


