const serviceViewModel = require('../../viewmodels/mentorviewmodels/services.viewmodel');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


exports.addService = async (req, res) => {
    console.log('test');
    try {
      const { name, description, pricing, recId } = req.body; // Extracting data from request body
      console.log(name);
      console.log(recId);
    
      // Insert new service into the database using Prisma
      const newService = await prisma.Service.create({
        data: {
          name,        // Directly passing the name
          description, // Directly passing the description
          pricing: parseInt(pricing),     // Convert pricing to integer
          mentorId: recId ? parseInt(recId) : null,   // Convert mentorId to integer, allow nullable
        }
      });
    
      // Responding with the newly created service
      res.status(200).json({ success: true, data: newService });
    } catch (error) {
      // Handling any errors and sending response
      res.status(400).json({ success: false, message: error.message });
    }
  };
  

// Update Service
exports.updateService = async (req, res) => {
    try {
      const { serviceId } = req.query; // Get the service ID from request parameters
      const { name, description, pricing } = req.body; // Get updated fields from request body
      console.log(serviceId);
      console.log("+++++++++++");
  
      // Ensure serviceId is a valid integer
      const serviceIdInt = parseInt(serviceId);
      if (isNaN(serviceIdInt)) {
        return res.status(400).json({ success: false, message: 'Invalid service ID' });
      }
  
      // Update the service in the database
      const updatedService = await prisma.Service.update({
        where: { id: serviceIdInt }, // Update based on service ID
        data: {
          name,        // Update name if provided
          description, // Update description if provided
          pricing: pricing ? parseInt(pricing) : undefined, // Convert pricing to integer if provided
        },
      });
  
      res.status(200).json({ success: true, data: updatedService });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  

  exports.deleteService = async (req, res) => {
    try {
      const { serviceId } = req.query; // Get the service ID from request parameters
  
      // Ensure serviceId is a valid integer
      const serviceIdInt = parseInt(serviceId);
      if (isNaN(serviceIdInt)) {
        return res.status(400).json({ success: false, message: 'Invalid service ID' });
      }
  
      // Check if the service exists before attempting to delete
      const service = await prisma.Service.findUnique({
        where: { id: serviceIdInt },
      });
  
      if (!service) {
        return res.status(404).json({ success: false, message: 'Service not found' });
      }
  
      // Delete the service from the database
      const deletedService = await prisma.Service.delete({
        where: { id: serviceIdInt },
      });
  
      res.status(200).json({ success: true, data: deletedService });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  };
  
