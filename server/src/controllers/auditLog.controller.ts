import { Request, Response } from "express";

import prisma from "../utils/prisma.ts";

export const getAuditLogs = async (
    _req: Request,
    res: Response
) => {
    try {
        const logs =
            await prisma.auditLog.findMany({
                orderBy: {
                    createdAt: "desc",
                },

                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            role: true,
                        },
                    },
                },

                take: 100,
            });

        return res.status(200).json({
            count: logs.length,
            logs,
        });
    } catch (error) {
        console.error(
            "GET AUDIT LOGS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error",
        });
    }
};