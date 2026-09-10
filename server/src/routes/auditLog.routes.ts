import { Router } from "express";

import {
    getAuditLogs,
} from "../controllers/auditLog.controller.ts";

import {
    authenticateToken,
} from "../middleware/auth.middleware.ts";

import {
    requireRole,
} from "../middleware/role.middleware.ts";

const router = Router();

router.get(
    "/",
    authenticateToken,
    requireRole("ANALYST", "ADMIN"),
    getAuditLogs
);

export default router;