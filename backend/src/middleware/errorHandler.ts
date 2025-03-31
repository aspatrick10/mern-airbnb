import { ErrorRequestHandler, Response } from "express";
import { ZodError } from "zod";
import AppError from "../utils/appError";

const handleZodError = (error: ZodError, res: Response) => {
  const errors = error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));

  res.status(400).json({
    status: "fail",
    errors,
  });
};

const handleAppError = (error: AppError, res: Response) => {
  res.status(error.statusCode).json({
    status: "fail",
    message: error.message,
  });
};

const errorHandler: ErrorRequestHandler = (err, req, res, next) => {
  if (err instanceof ZodError) {
    handleZodError(err, res);
    return;
  }

  if (err instanceof AppError) {
    handleAppError(err, res);
    return;
  }

  res.status(500).json({
    status: "error",
    message: err.message,
  });
};

export default errorHandler;
