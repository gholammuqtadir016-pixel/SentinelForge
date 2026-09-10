
import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export const authenticateToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (
            !authHeader ||
            !authHeader.startsWith("Bearer ")
        ) {
            return res.status(401).json({
                message: "Access token required",
            });
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            return res.status(401).json({
                message: "Access token required",
            });
        }

        const jwtSecret = process.env.JWT_SECRET;

        if (!jwtSecret) {
            console.error(
                "JWT_SECRET is not configured"
            );

            return res.status(500).json({
                message:
                    "Authentication configuration error",
            });
        }

        const decoded = jwt.verify(
            token,
            jwtSecret
        ) as JwtPayload;

        req.user = decoded;

        next();
    } catch (error) {
        console.error(
            "AUTHENTICATION ERROR:",
            error
        );

        return res.status(401).json({
            message:
                "Invalid or expired token",
        });
    }
};