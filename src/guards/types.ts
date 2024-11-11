import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface JWTTokenPayload extends JwtPayload {
  id: string;
  is_email_verified: boolean;
}

export interface AuthenticatedRequest extends Request {
  jwtPayload?: JWTTokenPayload;
  module?: string;
}
