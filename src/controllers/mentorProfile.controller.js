const viewmodel = require('../viewmodels/mentorProfile.viewmodel');


exports.insert = async (req, res) => {
  try {
    const {
        name, tagline, about, languages, resume, rating, totalReview, linkedinProfile, services,industry,discipline,location,yearOfExperience} = req.body;
      let {userId}=req.user;
    const result = await viewmodel.insert(name, tagline, about, languages, resume, rating, totalReview, userId, linkedinProfile, services,industry,discipline,location,yearOfExperience
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getMentorProfile = async (req, res) => {
  try {
    const { serviceName, location, discipline, industry, yearOfExperience } = req.query;

    const result = await viewmodel.getMentorProfile({ serviceName, location, discipline, industry, yearOfExperience });
    
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


