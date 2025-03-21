import { RequestHandler } from "express";

import AppError from "../utils/appError";
import { verifyAsync } from "../controllers/auth.controller";
import { JWT_SECRET } from "../constants/env";
import prisma from "../config/prisma";
import catchAsync from "../utils/catchAsync";

const authenticate: RequestHandler = catchAsync(async (req, res, next) => {
  // check if token exists
  let accessToken;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    accessToken = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.accessToken) {
    accessToken = req.cookies.accessToken;
  }

  if (!accessToken) {
    return next(new AppError("You are not logged in", 401));
  }

  const payload = await verifyAsync(accessToken, JWT_SECRET);

  // check if user exists in db
  const user = await prisma.user.findUnique({
    where: {
      id: payload.userId,
    },
  });

  if (!user) {
    return next(new AppError("User no longer exists", 401));
  }

  // grant access to protected route
  req.user = user;

  next();
});

export default authenticate;
