import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import prisma from "../utils/prisma.ts";

export const register = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            name,
            email,
            password,
        } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({
                message:
                    "Name, email and password are required",
            });
        }

        if (password.length < 8) {
            return res.status(400).json({
                message:
                    "Password must be at least 8 characters",
            });
        }

        const normalizedEmail =
            String(email).toLowerCase().trim();

        const existingUser =
            await prisma.user.findUnique({
                where: {
                    email: normalizedEmail,
                },
            });

        if (existingUser) {
            return res.status(409).json({
                message:
                    "User with this email already exists",
            });
        }

        const passwordHash =
            await bcrypt.hash(password, 12);

        const user =
            await prisma.user.create({
                data: {
                    name: String(name).trim(),
                    email: normalizedEmail,
                    passwordHash,
                },
            });

        return res.status(201).json({
            message:
                "User registered successfully",

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(
            "REGISTRATION ERROR:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};

export const login = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            email,
            password,
        } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                message:
                    "Email and password are required",
            });
        }

        const normalizedEmail =
            String(email).toLowerCase().trim();

        const user =
            await prisma.user.findUnique({
                where: {
                    email: normalizedEmail,
                },
            });

        if (!user) {
            return res.status(401).json({
                message:
                    "Invalid email or password",
            });
        }

        const passwordMatch =
            await bcrypt.compare(
                password,
                user.passwordHash
            );

        if (!passwordMatch) {
            return res.status(401).json({
                message:
                    "Invalid email or password",
            });
        }

        const jwtSecret =
            process.env.JWT_SECRET;

        if (!jwtSecret) {
            throw new Error(
                "JWT_SECRET is not defined"
            );
        }

        const token = jwt.sign(
            {
                userId: user.id,
                role: user.role,
            },
            jwtSecret,
            {
                expiresIn: "1h",
            }
        );

        await prisma.auditLog.create({
            data: {
                action: "USER_LOGIN",
                userId: user.id,
                ipAddress: req.ip,
            },
        });

        return res.status(200).json({
            message: "Login successful",

            token,

            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (error) {
        console.error(
            "LOGIN ERROR:",
            error
        );

        return res.status(500).json({
            message: "Internal server error",
        });
    }
};