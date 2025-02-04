require('dotenv').config();

const generateAvatarUrl = (avatarId) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:9000"; // Fallback to localhost if BASE_URL is not set

    if (!avatarId) {
        // Return a default avatar URL if no avatarId is provided
        return `${baseUrl}/utils/profilephotos/default-avatar.png`;
    }
    return `${baseUrl}/utils/profilephotos/${avatarId}`;
};

const generateResumeUrl = (resume) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:9000"; // Fallback to localhost if BASE_URL is not set

    if (!resume) {
        // Return a default avatar URL if no avatarId is provided
        return `${baseUrl}/utils/resumes/default-avatar.png`;
    }
    return `${baseUrl}/utils/resumes/${resume}`;
};


const generateVideoUrl = (video) => {
    const baseUrl = process.env.BASE_URL || "http://localhost:9000"; // Fallback to localhost if BASE_URL is not set

    if (!video) {
        // Return a default avatar URL if no avatarId is provided
        return `${baseUrl}/utils/video/default-avatar.png`;
    }
    return `${baseUrl}/utils/video/${video}`;
};


module.exports = { generateAvatarUrl, generateResumeUrl, generateVideoUrl };
