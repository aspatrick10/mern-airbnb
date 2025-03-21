import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { promisify } from "util";

import { LoginSchema, RegisterSchema } from "./auth.schemas";
import prisma from "../config/prisma";
import AppError from "../utils/appError";
import catchAsync from "../utils/catchAsync";
import { JWT_SECRET, NODE_ENV } from "../constants/env";

export const registerHandler = catchAsync(async (req, res, next) => {
  // validate input (parse will throw error if invalid)
  const { name, email, password } = RegisterSchema.parse(req.body);

  // verify email is not taken
  const existingUser = await prisma.user.findUnique({
    where: {
      email: email,
    },
  });

  if (existingUser) {
    return next(new AppError("Email already exists", 400));
  }

  // hash password
  const hashedPassword = await bcrypt.hash(password, 12);

  // create user
  const user = await prisma.user.create({
    data: {
      name: name,
      email: email,
      hashedPassword,
    },
  });

  // send a token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "30d",
  });

  // set cookie on response object
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV !== "development",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(201).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

export const loginHandler = catchAsync(async (req, res, next) => {
  // validate input (parse will throw error if invalid)
  const { email, password } = LoginSchema.parse(req.body);

  // find user
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    omit: {
      hashedPassword: false,
    },
  });

  if (!user) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // validate password
  const isValidPassword = await bcrypt.compare(password, user.hashedPassword);

  if (!isValidPassword) {
    return next(new AppError("Incorrect email or password", 401));
  }

  // send token
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: "30d",
  });

  // set cookie on response object
  res.cookie("accessToken", token, {
    httpOnly: true,
    secure: NODE_ENV !== "development",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return res.status(200).json({
    status: "success",
    token,
    data: {
      user,
    },
  });
});

export const verifyAsync = (
  token: string,
  secret: string
): Promise<jwt.JwtPayload> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secret, (err, decoded) => {
      if (err) reject(new AppError("Invalid or expired token", 401));
      else resolve(decoded as jwt.JwtPayload);
    });
  });
};

export const logoutHandler = catchAsync(async (req, res, next) => {
  const accessToken = (req.cookies.accessToken as string) || undefined;

  if (!accessToken) {
    return next(new AppError("You are not logged in", 401));
  }

  // wrap jwt.verify in a promise to use await
  await verifyAsync(accessToken, JWT_SECRET);

  res.clearCookie("accessToken");
  return res.status(200).json({
    status: "success",
  });
});
