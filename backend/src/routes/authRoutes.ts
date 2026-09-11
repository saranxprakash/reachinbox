import "dotenv/config";

import { Router, Request, Response } from "express";
import passport from "../config/passport";
import jwt from "jsonwebtoken";

const router = Router();

const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

interface AuthUser {
  id: number;
  googleId: string;
  email: string;
  name: string;
  avatar: string | null;
}

// Start Google login
router.get(
  "/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  }),
);

// Google redirects here after login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${FRONTEND_URL}/`,
  }),
  (req: Request, res: Response) => {
    const user = req.user as AuthUser;

    const token = jwt.sign(
      {
        id: user.id,
        googleId: user.googleId,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "7d",
      },
    );

    res.cookie("auth_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });

    res.redirect(`${FRONTEND_URL}/dashboard`);
  },
);

// Check currently logged-in user
router.get("/me", (req: Request, res: Response) => {
  try {
    const token = req.cookies?.auth_token;

    if (!token) {
      return res.status(401).json({
        authenticated: false,
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as AuthUser;

    return res.json({
      authenticated: true,
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        avatar: decoded.avatar,
      },
    });
  } catch {
    return res.status(401).json({
      authenticated: false,
    });
  }
});

// Logout
router.post("/logout", (_req: Request, res: Response) => {
  res.clearCookie("auth_token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    path: "/",
  });

  res.json({
    success: true,
    message: "Logged out successfully",
  });
});

export default router;
