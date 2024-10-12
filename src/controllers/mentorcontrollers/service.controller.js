const serviceViewModel = require('../../viewmodels/mentorviewmodels/services.viewmodel');

// Add Service
exports.addService = async (req, res) => {
    try {
        const { name, description, pricing, mentorId } = req.body; // Fetching data from the request body
        console.log(description);
        // Passing data to ViewModel
        const newService = await serviceViewModel.addService({
            name,
            description,
            pricing: parseInt(pricing), // Convert pricing to integer
            mentorId: parseInt(mentorId), // Convert mentorId to integer
        });

        res.status(200).json({ success: true, data: newService });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update Service
exports.updateService = async (req, res) => {
    try {
        const { serviceId } = req.query; // Get the service ID from request parameters
      console.log(serviceId);
      console.log("+++++++++++");
        const { name, description, pricing } = req.body; // Fetching data from the request body

        // Passing data to ViewModel
        const updatedService = await serviceViewModel.updateService({serviceId : parseInt(serviceId),
            name,
            description,
            pricing: parseInt(pricing), // Convert pricing to integ
        });

        res.status(200).json({ success: true, data: updatedService });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete Service
exports.deleteService = async (req, res) => {
    try {
        const { serviceId } = req.query; // Get the service ID from request parameters

        // Call the ViewModel's deleteService method
        await serviceViewModel.deleteService({serviceId: parseInt(serviceId)});
        

        res.status(200).json({ success: true, message: "Service deleted successfully" });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
