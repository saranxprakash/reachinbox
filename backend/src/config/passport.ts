import "dotenv/config";
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import pool from "./db";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: process.env.GOOGLE_CALLBACK_URL!,
    },

    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const googleId = profile.id;
        const email = profile.emails?.[0]?.value;

        if (!email) {
          return done(new Error("Google account does not have an email"));
        }

        const name = profile.displayName || "Google User";
        const avatar = profile.photos?.[0]?.value || null;

        // Check whether user already exists
        const existingUser = await pool.query(
          `
          SELECT id, email, google_id
          FROM users
          WHERE google_id = $1 OR email = $2
          `,
          [googleId, email],
        );

        if (existingUser.rows.length > 0) {
          const existing = existingUser.rows[0];

          // If the email exists but Google ID is different,
          // connect this Google account to that user.
          if (existing.google_id !== googleId) {
            await pool.query(
              `
              UPDATE users
              SET google_id = $1
              WHERE id = $2
              `,
              [googleId, existing.id],
            );
          }

          return done(null, {
            id: existing.id,
            googleId,
            email,
            name,
            avatar,
          });
        }

        // Create new user
        const result = await pool.query(
          `
          INSERT INTO users
          (email, google_id, hourly_limit)
          VALUES ($1, $2, 100)
          RETURNING id, email
          `,
          [email, googleId],
        );

        const user = result.rows[0];

        return done(null, {
          id: user.id,
          googleId,
          email: user.email,
          name,
          avatar,
        });
      } catch (error) {
        console.error("Google authentication error:", error);
        return done(error as Error);
      }
    },
  ),
);

export default passport;
