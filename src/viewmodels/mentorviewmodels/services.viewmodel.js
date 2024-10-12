// src/viewmodels/settingJS.viewmodel.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();


class ServiceViewModel {
    // Add a new service
    async addService({name, description, pricing, mentorId}) {
        console.log("----------------");
        console.log(name);
        try {
          const newService = await prisma.service.create({
            data: {
              name,        // Directly passing the name
              description, // Directly passing the description
              pricing,     // Directly passing the pricing
              mentorId     // Directly passing the mentorId
            }
          });
      
          return newService; // Returns the newly created service
        } catch (error) {
          throw new Error(`Error adding service: ${error.message}`);
        }
      }
      

    // Update an existing service
    async updateService({serviceId, name, description, pricing}) {
       console.log(serviceId);
        try {
            const updatedService = await prisma.service.update({
                where: {
                    id: serviceId
                },
                data: {
                    name,
                    description,
                    pricing
                },
            });

            return updatedService; // Returns the updated service
        } catch (error) {
            throw new Error(`Error updating service: ${error.message}`);
        }
    }

    // Delete a service
    async deleteService({serviceId}) {
        try {
            await prisma.service.delete({
                where: {
                    id: serviceId
                },
            });

            return "Service deleted successfully";
        } catch (error) {
            throw new Error(`Error deleting service: ${error.message}`);
        }
    }
}

module.exports = new ServiceViewModel();

