import jwt from "jsonwebtoken";
import { config } from "dotenv";

config();

export const generateAccessToken = parameterizedPayload => {
  return jwt.sign(
    parameterizedPayload || payload,
    process.env.JWT_SECRET,
    {
      expiresIn: "1h"
    }
  );
};

const payload = {
  id: "ff39df09-a44b-479c-a063-e7fbc5f8ef9d",
  is_email_verified: true
};

const token = generateAccessToken(payload);

console.log("---> Generated Access Token:");
console.log(token);
