import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, "users.json");

const JWT_SECRET = process.env.JWT_SECRET || "neural-galaxy-dev-secret-change-me";
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

function readUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  try {
    return JSON.parse(fs.readFileSync(USERS_FILE, "utf-8"));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, email: user.email, name: user.name },
    JWT_SECRET,
    { expiresIn: "30d" }
  );
}

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, avatar: user.avatar || null };
}

export async function signup({ email, password, name }) {
  if (!email || !password || !name) {
    throw Object.assign(new Error("Name, email, and password are all required."), { status: 400 });
  }
  const users = readUsers();
  if (users.some((u) => u.email.toLowerCase() === email.toLowerCase())) {
    throw Object.assign(new Error("An account with that email already exists."), { status: 409 });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = {
    id: `u_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    email,
    name,
    passwordHash,
    provider: "password",
    createdAt: new Date().toISOString(),
  };
  users.push(user);
  writeUsers(users);
  return { token: signToken(user), user: publicUser(user) };
}

export async function login({ email, password }) {
  if (!email || !password) {
    throw Object.assign(new Error("Email and password are required."), { status: 400 });
  }
  const users = readUsers();
  const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user || !user.passwordHash) {
    throw Object.assign(new Error("No account found with that email."), { status: 404 });
  }
  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) {
    throw Object.assign(new Error("Incorrect password."), { status: 401 });
  }
  return { token: signToken(user), user: publicUser(user) };
}

export async function googleSignIn({ credential }) {
  if (!googleClient) {
    throw Object.assign(
      new Error("Google sign-in isn't configured on the server yet. Add GOOGLE_CLIENT_ID to .env."),
      { status: 503 }
    );
  }
  if (!credential) {
    throw Object.assign(new Error("Missing Google credential."), { status: 400 });
  }

  const ticket = await googleClient.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  const { email, name, picture, sub } = payload;

  const users = readUsers();
  let user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

  if (!user) {
    user = {
      id: `u_google_${sub}`,
      email,
      name: name || email.split("@")[0],
      avatar: picture || null,
      provider: "google",
      createdAt: new Date().toISOString(),
    };
    users.push(user);
    writeUsers(users);
  }

  return { token: signToken(user), user: publicUser(user) };
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

// Soft auth: attaches req.user if a valid token is present, but never blocks
// the request. Keeps the offline/demo experience working even if someone
// hits the API without being logged in.
export function softAuth(req, _res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  req.user = token ? verifyToken(token) : null;
  next();
}
