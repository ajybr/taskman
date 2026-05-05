import { Request, Response, NextFunction } from "express";
import { verifyToken, JWTPayload } from "./jwt";

export interface AuthRequest extends Request {
  user?: JWTPayload;
}

export const requireAuth = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // Support both cookie token and Authorization header
  let token = req.cookies?.token;
  
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.slice(7);
  }
  
  if (!token) {
    return res.status(401).json({ error: "Not authenticated" });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res
      .status(401)
      .json({ error: "Session expired, please log in again" });
  }
};
