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
    const { name, email, password, role, phone } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({ message: "Name, email and password are required" });
    }

    let userId;

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        userId = await generateUserID();

        await db.promise().query(
            "INSERT INTO users (userId, name, email, password, role, phone) VALUES (?, ?, ?, ?, ?, ?)",
            [userId, name, email, hashedPassword, role || 'user', phone || null]
        );

        res.status(201).json({ message: "User registered successfully", userId });
    } catch (error) {
        console.error("[register]", error);

        // If the users table doesn't yet have a `phone` column, retry without it
        if (error.code === "ER_BAD_FIELD_ERROR" && error.sqlMessage?.includes("phone")) {
            try {
                await db.promise().query(
                    "INSERT INTO users (userId, name, email, password, role) VALUES (?, ?, ?, ?, ?)",
                    [userId, name, email, await bcrypt.hash(password, 10), role || 'user']
                );
                return res.status(201).json({ message: "User registered successfully (phone field not stored)", userId });
            } catch (retryError) {
                console.error("[register retry]", retryError);
                return res.status(500).json({ message: "Registration failed", error: retryError.message });
            }
        }

        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ message: "A user with this email already exists" });
        }

        return res.status(500).json({ message: "Registration failed", error: error.message });
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

        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                userId: user.userId,
                email: user.email,
                phone: user.phone,
            },
        });
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

        res.json({
            token: jwtToken,
            user: {
                id: user.id,
                name: user.name,
                role: user.role,
                userId: user.userId,
                email: user.email,
                phone: user.phone,
            },
        });
    } catch (error) {
        res.status(500).json({ message: "Google login failed", error: error.message });
    }
};

export const getUsers = async (req, res) => {
    try {
        const [rows] = await db.promise().query("SELECT id, userId, name, email, role, phone, created_at FROM users");
        res.json(rows);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch users", error: error.message });
    }
};

export const updateUser = async (req, res) => {
    const { id } = req.params;
    const { name, email, role, phone } = req.body;
    try {
        await db.promise().query(
            "UPDATE users SET name = ?, email = ?, role = ?, phone = ? WHERE id = ?",
            [name, email, role, phone, id]
        );
        res.json({ message: "User updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to update user", error: error.message });
    }
};

export const deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await db.promise().query("DELETE FROM users WHERE id = ?", [id]);
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete user", error: error.message });
    }
};
