import jwt from "jsonwebtoken";
import { env } from "../../lib/env";

const SECRET = env.JWT_SECRET;
if (!SECRET) throw new Error("JWT_SECRET is not set");

export type JWTPayload = {
  userId: string;
  email: string;
};

export const signToken = (payload: JWTPayload): string =>
  jwt.sign(payload, SECRET, { expiresIn: "7d" });

export const verifyToken = (token: string): JWTPayload => {
  return jwt.verify(token, SECRET) as JWTPayload;
};
