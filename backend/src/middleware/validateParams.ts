import { NextFunction, Request, Response } from "express";

import { ObjectIdSchema } from "../schemas/objectId.schema";
import AppError from "../utils/appError";

const validateParams = (req: Request, res: Response, next: NextFunction) => {
  const parsedId = ObjectIdSchema.safeParse(req.params.id);

  if (!parsedId.success) {
    const { issues } = parsedId.error;
    return next(new AppError(issues[0].message, 400));
  }

  next();
};

export default validateParams;
