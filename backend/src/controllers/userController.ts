import { RequestHandler } from "express";
import { User } from "../models/user";
import bcrypt from "bcrypt";
import { UniqueConstraintError } from "sequelize";
import "dotenv/config";
import jwt from "jsonwebtoken";

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

export const register: RequestHandler = async (req, res) => {
  bcrypt.hash(req.body.password, 10).then(async (result) => {
    await User.create({
      name: req.body.name,
      email: req.body.email,
      password: result,
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
export const getAllUsers: RequestHandler = async (req, res) => {
  let users = await User.findAll({});

  res.status(200).send(users);
};
