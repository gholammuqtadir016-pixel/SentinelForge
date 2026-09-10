import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import prisma from "./utils/prisma.ts";

import authRoutes from "./routes/auth.routes.ts";
import securityEventRoutes from "./routes/securityEvent.routes.ts";
import auditLogRoutes from "./routes/auditLog.routes.ts";

const app = express();

app.use(helmet());

app.use(
    cors({
        origin: "http://localhost:5173",
    })
);

app.use(express.json());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

app.use(
    "/api/auth",
    authRoutes
);

app.use(
    "/api/security-events",
    securityEventRoutes
);

app.use(
    "/api/audit-logs",
    auditLogRoutes
);

app.get("/", (_req, res) => {
    res.json({
        message:
            "SentinelForge API is running",
    });
});

app.get(
    "/api/health",
    async (_req, res) => {
        try {
            await prisma.$queryRaw`SELECT 1`;

            res.json({
                status: "healthy",
                database: "connected",
            });
        } catch (error) {
            console.error(
                "Database health check failed:",
                error
            );

            res.status(500).json({
                status: "unhealthy",
                database: "disconnected",
            });
        }
    }
);

const PORT =
    process.env.PORT || 5000;

app.listen(
    PORT,
    () => {
        console.log(
            `SentinelForge server running on port ${PORT}`
        );
    }
);