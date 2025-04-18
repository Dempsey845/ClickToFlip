import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import db from "./db.js";

passport.use(
  new LocalStrategy(
    { usernameField: "email" },
    async (email, password, done) => {
      try {
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          email,
        ]);
        const user = result.rows[0];
        if (!user) return done(null, false, { message: "User not found" });

        const match = await bcrypt.compare(password, user.password);
        return match
          ? done(null, user)
          : done(null, false, { message: "Invalid password" });
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    return done(null, result.rows[0]);
  } catch (err) {
    return done(err);
  }
});

export default passport;
