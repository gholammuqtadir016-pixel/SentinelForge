import { Request, Response } from "express";

import prisma from "../utils/prisma.ts";

const VALID_SEVERITIES = [
    "LOW",
    "MEDIUM",
    "HIGH",
    "CRITICAL",
];

const VALID_STATUSES = [
    "OPEN",
    "ACKNOWLEDGED",
    "RESOLVED",
];

export const createSecurityEvent = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            type,
            severity,
            source,
            description,
            ipAddress,
        } = req.body;

        if (
            !type ||
            !severity ||
            !source ||
            !description
        ) {
            return res.status(400).json({
                message:
                    "Type, severity, source and description are required",
            });
        }

        if (
            !VALID_SEVERITIES.includes(
                String(severity).toUpperCase()
            )
        ) {
            return res.status(400).json({
                message:
                    "Invalid severity",
            });
        }

        const event =
            await prisma.securityEvent.create({
                data: {
                    type: String(type).trim(),
                    severity:
                        String(
                            severity
                        ).toUpperCase() as any,
                    source:
                        String(source).trim(),
                    description:
                        String(
                            description
                        ).trim(),
                    ipAddress:
                        ipAddress
                            ? String(
                                  ipAddress
                              ).trim()
                            : null,
                    userId:
                        req.user?.userId
                            ? Number(
                                  req.user.userId
                              )
                            : null,
                },
            });

        await prisma.auditLog.create({
            data: {
                action:
                    "SECURITY_EVENT_CREATED",
                userId:
                    req.user?.userId
                        ? Number(
                              req.user.userId
                          )
                        : null,
                ipAddress:
                    req.ip,
            },
        });

        return res.status(201).json({
            message:
                "Security event created successfully",
            event,
        });
    } catch (error) {
        console.error(
            "CREATE SECURITY EVENT ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error",
        });
    }
};


export const getSecurityEvents = async (
    req: Request,
    res: Response
) => {
    try {
        const {
            severity,
            status,
        } = req.query;

        const where: any = {};

        if (severity) {
            const normalizedSeverity =
                String(
                    severity
                ).toUpperCase();

            if (
                !VALID_SEVERITIES.includes(
                    normalizedSeverity
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid severity filter",
                });
            }

            where.severity =
                normalizedSeverity;
        }

        if (status) {
            const normalizedStatus =
                String(
                    status
                ).toUpperCase();

            if (
                !VALID_STATUSES.includes(
                    normalizedStatus
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid status filter",
                });
            }

            where.status =
                normalizedStatus;
        }

        const events =
            await prisma.securityEvent.findMany({
                where,
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
            count: events.length,
            events,
        });
    } catch (error) {
        console.error(
            "GET SECURITY EVENTS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error",
        });
    }
};


export const getSecurityStats = async (
    _req: Request,
    res: Response
) => {
    try {
        const [
            total,
            open,
            acknowledged,
            resolved,
            low,
            medium,
            high,
            critical,
        ] = await Promise.all([
            prisma.securityEvent.count(),

            prisma.securityEvent.count({
                where: {
                    status: "OPEN",
                },
            }),

            prisma.securityEvent.count({
                where: {
                    status: "ACKNOWLEDGED",
                },
            }),

            prisma.securityEvent.count({
                where: {
                    status: "RESOLVED",
                },
            }),

            prisma.securityEvent.count({
                where: {
                    severity: "LOW",
                },
            }),

            prisma.securityEvent.count({
                where: {
                    severity: "MEDIUM",
                },
            }),

            prisma.securityEvent.count({
                where: {
                    severity: "HIGH",
                },
            }),

            prisma.securityEvent.count({
                where: {
                    severity: "CRITICAL",
                },
            }),
        ]);

        return res.status(200).json({
            total,
            status: {
                open,
                acknowledged,
                resolved,
            },
            severity: {
                low,
                medium,
                high,
                critical,
            },
        });
    } catch (error) {
        console.error(
            "GET SECURITY STATS ERROR:",
            error
        );

        return res.status(500).json({
            message:
                "Internal server error",
        });
    }
};


export const updateSecurityEventStatus =
    async (
        req: Request,
        res: Response
    ) => {
        try {
            const id = Number(
                req.params.id
            );

            const {
                status,
            } = req.body;

            if (
                !Number.isInteger(id) ||
                id <= 0
            ) {
                return res.status(400).json({
                    message:
                        "Invalid event ID",
                });
            }

            if (!status) {
                return res.status(400).json({
                    message:
                        "Status is required",
                });
            }

            const normalizedStatus =
                String(
                    status
                ).toUpperCase();

            if (
                !VALID_STATUSES.includes(
                    normalizedStatus
                )
            ) {
                return res.status(400).json({
                    message:
                        "Invalid status",
                });
            }

            const existingEvent =
                await prisma.securityEvent.findUnique(
                    {
                        where: {
                            id,
                        },
                    }
                );

            if (!existingEvent) {
                return res.status(404).json({
                    message:
                        "Security event not found",
                });
            }

            const updatedEvent =
                await prisma.securityEvent.update(
                    {
                        where: {
                            id,
                        },
                        data: {
                            status:
                                normalizedStatus as any,
                        },
                    }
                );

            let action =
                "SECURITY_EVENT_STATUS_UPDATED";

            if (
                normalizedStatus ===
                "ACKNOWLEDGED"
            ) {
                action =
                    "SECURITY_EVENT_ACKNOWLEDGED";
            }

            if (
                normalizedStatus ===
                "RESOLVED"
            ) {
                action =
                    "SECURITY_EVENT_RESOLVED";
            }

            await prisma.auditLog.create({
                data: {
                    action,
                    userId:
                        req.user?.userId
                            ? Number(
                                  req.user.userId
                              )
                            : null,
                    ipAddress:
                        req.ip,
                },
            });

            return res.status(200).json({
                message:
                    "Security event status updated successfully",
                event: updatedEvent,
            });
        } catch (error) {
            console.error(
                "UPDATE SECURITY EVENT ERROR:",
                error
            );

            return res.status(500).json({
                message:
                    "Internal server error",
            });
        }
    };