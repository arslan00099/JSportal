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

exports.getBlogDetails = async (req, res) => {
    try {
        const { id } = req.params; // Corrected: Use 'params' to access the route parameter

        // Fetch the blog by its ID with related user and profile
        const blog = await prisma.blog.findUnique({
            where: {
                id: parseInt(id), // Make sure to parse the id as an integer
            },
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

        // Check if the blog was found
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: "Blog not found",
            });
        }

        // Format the response to include additional details
        const formattedResponse = {
            id: blog.id,
            title: blog.title,
            content: blog.content,
            status: blog.status,
            postedBy: blog.user?.Profile[0]?.fullname || "n/a", // Default to "Anonymous" if no fullname
            createdAt: blog.createdAt,
            updatedAt: blog.updatedAt,
        };

        res.status(200).json({
            success: true,
            message: "Blog fetched successfully",
            data: formattedResponse,
        });
    } catch (error) {
        console.error('Error fetching blog:', error);
        res.status(500).json({
            success: false,
            message: "An error occurred while fetching the blog.",
            error: error.message,
        });
    }
};



