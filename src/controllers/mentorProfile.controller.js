const viewmodel = require('../viewmodels/mentorProfile.viewmodel');


exports.insert = async (req, res) => {
  try {
    const {
        name, tagline, about, languages, resume, rating, totalReview, profileId, linkedinProfile, services
      } = req.body;
    const result = await viewmodel.insert(name, tagline, about, languages, resume, rating, totalReview, profileId, linkedinProfile, services
    );
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};


exports.getMentorProfile = async (req, res) => {
    try {
        const result = await viewmodel.getMentorProfile();
        res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };

