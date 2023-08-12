import { RequestHandler } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import { UniqueConstraintError } from "sequelize";
import "dotenv/config";
import jwt from "jsonwebtoken";
import { generateApiKey } from "../utils";
import crypto from "crypto";
import { PasswordReset } from "../models/passResetTokens";
import nodemailer from "nodemailer";

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
 *         description: Successfully fetched user details
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

export const forgotPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ where: { email } });

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const token = crypto.randomBytes(64).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // token expires in 1 hour

  await PasswordReset.create({ userEmail: user.email, token, expiresAt });

  const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true,
    auth: {
      user: "autodbscan@zohomail.eu",
      pass: "DB$CAN@1",
    },
    debug: true,
  });

  const mailOptions = {
    from: "autodbscan@zohomail.eu",
    to: user.email,
    subject: "Password Reset",
    html: `<div>
              <h2>You are receiving this because you (or someone else) have requested the reset of the password for your account.</h2>
              <h2>Please click on the following link, or paste this into your browser to complete the process within one hour of receiving it:</h2>
              <p>http://localhost:3000/reset/${token}</p>
              <br/>
              <h2>If you did not request this, please ignore this email and your password will remain unchanged.</h2>
           </div>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      res.status(500).json({ message: "Error sending email" });
    } else {
      console.log("Email sent: " + info.response);
      res.status(200).json({
        message: "Password reset email sent successfully!",
      });
    }
  });
};
