import { prisma } from '../config/prisma.js';

const validateSignupPayload = ({ email, password }) => {
  if (!email || typeof email !== 'string') {
    const error = new Error('A valid email is required.');
    error.status = 400;
    throw error;
  }

  if (!password || typeof password !== 'string') {
    const error = new Error('A valid password is required.');
    error.status = 400;
    throw error;
  }
};

export const userController = {
  async signup(req, res) {
    const { email, password } = req.body;
    validateSignupPayload({ email, password });

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash: password,
      },
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
    });
  },
};
