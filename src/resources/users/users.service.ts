import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { config } from "dotenv";
import { prisma } from "@/clients/prisma";
import { CreateUserDTO } from "./dto/create-user.dto";
import { SignInUserDTO } from "./dto/sign-in-user.dto";
import { JWTTokenPayload } from "@/guards/types";

config();

const SALT_ROUNDS = 256;

const getUserContext = async (userId: string) => {
  return await prisma.user.findUnique({
    where: { id: userId },
    include: {
      stores: true,
      manages: {
        include: {
          store: true
        }
      }
    }
  });
};

const createUser = async (user: CreateUserDTO, ip?: string) => {
  const hashedPassword = await bcrypt.hash(
    user.password,
    SALT_ROUNDS
  );
  await prisma.user.create({
    data: {
      ...user,
      password: hashedPassword,
      ip,
      is_email_verified: process.env.NODE_ENV !== "production"
    }
  });
};

const signInUser = async (user: SignInUserDTO) => {
  const response = await prisma.$transaction(async tx => {
    const dbUser = await tx.user.findUnique({
      where: {
        email: user.email,
        is_banned: false
      }
    });
    if (!dbUser) {
      throw new Error("User not found");
    }
    const doesPasswordMatch = await bcrypt.compare(
      user.password,
      dbUser.password
    );
    if (!doesPasswordMatch) {
      throw new Error("Invalid password");
    }
    const updatedUser = await tx.user.update({
      where: { id: dbUser.id },
      data: { is_active: true },
      select: {
        id: true,
        is_email_verified: true,
        stores: true,
        manages: {
          include: {
            store: true
          }
        }
      }
    });
    return updatedUser;
  });
  const accessToken = jwt.sign(
    response as JWTTokenPayload,
    process.env.JWT_SECRET!,
    {
      expiresIn: "180d"
    }
  );
  const refreshToken = jwt.sign(
    response,
    process.env.REFRESH_TOKEN_SECRET!
  );
  return { user: response, accessToken, refreshToken };
};

export const usersService = {
  createUser,
  signInUser,
  getUserContext
};
