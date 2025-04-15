const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

class UserViewModel {
  async signup(username, password, email, role, fullname, avatarId) {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) {
      throw new Error("User already exists");
    }
    console.log(role);
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log(hashedPassword);
    const newUser = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
        role,
      },
    });

    // Create the profile associated with the user
    await prisma.profile.create({
      data: {
        userId: newUser.id,
        fullname,
        avatarId,
      },
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return { user: userWithoutPassword };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new Error("User not found");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Check if the user is deactivated
    if (user.deActivate === true) {
      throw new Error("Account deactivated");
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );

    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }



  async adminLogin(email, password) {
    console.log(email, password);

    // Find the user by email
    const user = await prisma.user.findUnique({ where: { email } });
    console.log(user);

    // Check if user exists
    if (!user) {
      throw new Error("User not found");
    }

    // Check if password matches
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new Error("Invalid credentials");
    }

    // Check if the user role is ADMIN
    if (user.role !== "ADMIN") {
      throw new Error("Access denied: User is not an admin");
    }

    // Generate token
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      {
        expiresIn: "30d",
      }
    );

    // Exclude password before returning the user object
    const { password: _, ...userWithoutPassword } = user;

    return { user: userWithoutPassword, token };
  }

}

module.exports = new UserViewModel();
