import { RequestHandler } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import { UniqueConstraintError } from "sequelize";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { generateApiKey } from "../utils";

/**
 * @openapi
 * /api/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login User
 *     description: This endpoint logs in a user.
 *     requestBody:
 *       description: User credentials
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully logged in with user details and accessToken.
 *         content:
 *           application/json:
 *            schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The user's name.
 *                     email:
 *                       type: string
 *                       description: The user's email. This is the primary key.
 *                     apiKey:
 *                       type: string
 *                       description: The user's API key.
 *                     publicAccess:
 *                       type: integer
 *                       description: A number indicating the user's level of public access.
 *                 accessToken:
 *                   type: string
 *       401:
 *         description: Invalid credentials.
 */
export const loginUser: RequestHandler = async (req, res) => {
  const user = await User.findOne({ where: { email: req.body.email } });
  if (user) {
    bcrypt.compare(req.body.password, user.password).then((result) => {
      if (result) {
        const token = jwt.sign(
          { email: user.email },
          process.env.JWT_KEY ?? "jwt_key",
          {
            expiresIn: "1h",
          }
        );
        res.status(200).json({ user: user, accessToken: token });
      } else {
        res.status(401).send("Invalid credentials!");
      }
    });
  } else {
    res.status(401).send("Invalid credentials!");
  }
};

/**
 * @openapi
 * /api/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register User
 *     description: This endpoint registers a new user.
 *     requestBody:
 *       description: User details for registration
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully registered with user details and accessToken.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The user's name.
 *                     email:
 *                       type: string
 *                       description: The user's email. This is the primary key.
 *                     apiKey:
 *                       type: string
 *                       description: The user's API key.
 *                     publicAccess:
 *                       type: integer
 *                       description: A number indicating the user's level of public access.
 *                 accessToken:
 *                   type: string
 *       400:
 *         description: Something went wrong or Email already exists.
 */
export const register: RequestHandler = async (req, res) => {
  bcrypt.hash(req.body.password, 10).then(async (result) => {
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: result,
      apiKey: generateApiKey(),
      publicAccess: 0,
    })
      .then((user) => {
        const token = jwt.sign(
          { email: user.email },
          process.env.JWT_KEY ?? "jwt_key",
          {
            expiresIn: "1h",
          }
        );
        return res.status(200).json({
          message: "Registered successfully",
          user: user,
          accessToken: token,
        });
      })
      .catch((error) => {
        if (error instanceof UniqueConstraintError) {
          return res.status(200).send("Email already exists");
        } else {
          return res
            .status(400)
            .send("Something went wrong. Please try again later.");
        }
      });
  });
};

/**
 * @openapi
 * /api/userInfo:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Fetch User Information
 *     description: This endpoint fetches user information.
 *     responses:
 *       200:
 *         description: Successfully fetched user details.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     name:
 *                       type: string
 *                       description: The user's name.
 *                     email:
 *                       type: string
 *                       description: The user's email. This is the primary key.
 *                     apiKey:
 *                       type: string
 *                       description: The user's API key.
 *                     publicAccess:
 *                       type: integer
 *                       description: A number indicating the user's level of public access.
 *       400:
 *         description: Could not find user.
 */
export const fetchUserInfo: RequestHandler = async (req, res) => {
  if (req.body.decoded && req.body.decoded.email) {
    const user = await User.findByPk(req.body.decoded.email);
    if (user) {
      return res.status(200).json({ user: user });
    } else {
      return res.status(400).send("Could not find user");
    }
  } else {
    return res.status(400).send("Could not find user");
  }
};
