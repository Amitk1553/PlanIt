import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { env } from '../config/env.js';

const SALT_ROUNDS = 10;
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  maxAge: COOKIE_MAX_AGE,
};

const signToken = (user) =>
  jwt.sign({ userId: user.id, email: user.email }, env.jwtSecret, { expiresIn: '7d' });

const validateSignupPayload = ({ email, password }) => {
  if (!email || typeof email !== 'string') {
    const error = new Error('A valid email is required.');
    error.status = 400;
    throw error;
  }

  if (!password || typeof password !== 'string' || password.length < 6) {
    const error = new Error('Password must be at least 6 characters.');
    error.status = 400;
    throw error;
  }
};

export const userController = {
  async signup(req, res) {
    const { email, password } = req.body;
    validateSignupPayload({ email, password });

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return res.status(409).json({ status: 'error', message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
      },
    });

    const token = signToken(user);
    res.cookie('token', token, cookieOptions);

    return res.status(201).json({ id: user.id, email: user.email });
  },

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: 'error', message: 'Email and password are required.' });
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ status: 'error', message: 'Invalid email or password.' });
    }

    const token = signToken(user);
    res.cookie('token', token, cookieOptions);

    return res.json({ id: user.id, email: user.email });
  },

  async me(req, res) {
    return res.json({ id: req.user.id, email: req.user.email });
  },

  async logout(req, res) {
    res.clearCookie('token', cookieOptions);
    return res.json({ status: 'ok' });
  },
};
