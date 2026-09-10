import { Router } from "express";

import {
    createSecurityEvent,
    getSecurityEvents,
    getSecurityStats,
    updateSecurityEventStatus,
} from "../controllers/securityEvent.controller.ts";

import {
    authenticateToken,
} from "../middleware/auth.middleware.ts";

import {
    requireRole,
} from "../middleware/role.middleware.ts";

const router = Router();

router.post(
    "/",
    authenticateToken,
    requireRole("ANALYST", "ADMIN"),
    createSecurityEvent
);

router.get(
    "/",
    authenticateToken,
    getSecurityEvents
);

router.get(
    "/stats",
    authenticateToken,
    getSecurityStats
);

router.patch(
    "/:id/status",
    authenticateToken,
    requireRole("ANALYST", "ADMIN"),
    updateSecurityEventStatus
);

export default router;