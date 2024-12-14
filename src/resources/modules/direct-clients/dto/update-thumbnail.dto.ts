import { NextFunction, Request, Response } from "express";
import logger from "@/utils/logger";

export const updateThumbnailValidator = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    logger.info("-> validating thumbnail update request");

    if (!req.file) {
      logger.warn("Thumbnail file is missing");
      res
        .status(400)
        .send({ message: "No thumbnail file provided 123" });
      return;
    }
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/jpg"];
    if (!allowedMimeTypes.includes(req.file.mimetype)) {
      logger.warn(`Invalid file type: ${req.file.mimetype}`);
      res.status(400).send({
        message:
          "Invalid file type. Only JPEG, JPG and PNG files are allowed"
      });
      return;
    }

    const maxSize = 5 * 1024 * 1024;
    if (req.file.size > maxSize) {
      logger.warn(`File too large: ${req.file.size} bytes`);
      res.status(400).send({
        message: "File too large. Maximum size is 5MB"
      });
      return;
    }

    logger.info("-> thumbnail update request validated successfully");
    next();
  } catch (e) {
    logger.error("-> thumbnail validation failed");
    logger.error(e);
    res.status(400).send({ message: "Invalid request" });
    return;
  }
};
