import { Request, Response, NextFunction } from "express";

export const requireRole = (...allowedRoles: string[]) => {
    return (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {
        const role = req.user?.role;

        if (!role) {
            return res.status(403).json({
                message: "User role not found",
            });
        }

        if (!allowedRoles.includes(String(role))) {
            return res.status(403).json({
                message: "Insufficient permissions",
            });
        }

        next();
    };
};