import db from "../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Helper to generate unique UserID
const generateUserID = async () => {
    const prefix = "BILL";
    const [rows] = await db.promise().query("SELECT COUNT(*) as count FROM users");
    const count = rows[0].count + 1;
    return `${prefix}${count.toString().padStart(4, '0')}`;
};

export const register = async (req, res) => {
    const { name, email, password, role } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const userId = await generateUserID();
        
        const [result] = await db.promise().query(
            "INSERT INTO users (userId, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
            [userId, name, email, hashedPassword, role || 'user']
        );
        
        res.status(201).json({ message: "User registered successfully", userId });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Registration failed", error: error.message });
    }
};

export const login = async (req, res) => {
    const { email, identifier, password } = req.body;
    const loginIdentifier = identifier || email;
    try {
        const [rows] = await db.promise().query("SELECT * FROM users WHERE email = ? OR name = ?", [loginIdentifier, loginIdentifier]);
        if (rows.length === 0) return res.status(404).json({ message: "User not found" });

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

        const token = jwt.sign(
            { id: user.id, role: user.role, userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token, user: { id: user.id, name: user.name, role: user.role, userId: user.userId } });
    } catch (error) {
        res.status(500).json({ message: "Login failed", error: error.message });
    }
};

export const googleLogin = async (req, res) => {
    const { token } = req.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const { name, email, sub: googleId } = ticket.getPayload();

        let [rows] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        let user;

        if (rows.length === 0) {
            const userId = await generateUserID();
            await db.promise().query(
                "INSERT INTO users (userId, name, email, googleId, role) VALUES (?, ?, ?, ?, ?)",
                [userId, name, email, googleId, 'user']
            );
            [rows] = await db.promise().query("SELECT * FROM users WHERE email = ?", [email]);
        }
        
        user = rows[0];
        const jwtToken = jwt.sign(
            { id: user.id, role: user.role, userId: user.userId },
            process.env.JWT_SECRET,
            { expiresIn: "1d" }
        );

        res.json({ token: jwtToken, user: { id: user.id, name: user.name, role: user.role, userId: user.userId } });
    } catch (error) {
        res.status(500).json({ message: "Google login failed", error: error.message });
    }
};
