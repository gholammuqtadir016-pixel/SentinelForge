import { useEffect, useState } from "react";

import api from "../api/axios";

function Dashboard() {
    const [stats, setStats] =
        useState(null);

    const [events, setEvents] =
        useState([]);

    const [logs, setLogs] =
        useState([]);

    const [severity, setSeverity] =
        useState("");

    const [status, setStatus] =
        useState("");

    const [view, setView] =
        useState("events");

    const [loading, setLoading] =
        useState(true);

    const [updating, setUpdating] =
        useState(null);

    const user = JSON.parse(
        localStorage.getItem(
            "user"
        ) || "{}"
    );

    const loadData = async () => {
        try {
            setLoading(true);

            const eventQuery =
                new URLSearchParams();

            if (severity) {
                eventQuery.set(
                    "severity",
                    severity
                );
            }

            if (status) {
                eventQuery.set(
                    "status",
                    status
                );
            }

            const query =
                eventQuery.toString();

            const [
                statsResponse,
                eventsResponse,
            ] = await Promise.all([
                api.get(
                    "/security-events/stats"
                ),

                api.get(
                    `/security-events${
                        query
                            ? `?${query}`
                            : ""
                    }`
                ),
            ]);

            setStats(
                statsResponse.data
            );

            setEvents(
                eventsResponse.data.events
            );

        } catch (error) {
            console.error(
                "Dashboard error:",
                error
            );
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            const response =
                await api.get(
                    "/audit-logs"
                );

            setLogs(
                response.data.logs
            );
        } catch (error) {
            console.error(
                "Audit log error:",
                error
            );
        }
    };

    useEffect(() => {
        loadData();
    }, [severity, status]);

    useEffect(() => {
        if (
            view === "logs" &&
            user.role !== "USER"
        ) {
            loadLogs();
        }
    }, [view]);

    const updateStatus = async (
        id,
        newStatus
    ) => {
        try {
            setUpdating(id);

            await api.patch(
                `/security-events/${id}/status`,
                {
                    status: newStatus,
                }
            );

            await loadData();

            if (view === "logs") {
                await loadLogs();
            }

        } catch (error) {
            console.error(
                "Status update error:",
                error
            );
        } finally {
            setUpdating(null);
        }
    };

    const logout = () => {
        localStorage.removeItem(
            "token"
        );

        localStorage.removeItem(
            "user"
        );

        window.location.href =
            "/login";
    };

    return (
        <div className="dashboard">

            <aside className="sidebar">

                <div className="logo">
                    🛡️ SentinelForge
                </div>

                <div className="sidebar-section">
                    MONITORING
                </div>

                <button
                    className={
                        view === "events"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() =>
                        setView("events")
                    }
                >
                    📊 Dashboard
                </button>

                <button
                    className={
                        view === "logs"
                            ? "nav-item active"
                            : "nav-item"
                    }
                    onClick={() =>
                        setView("logs")
                    }
                    disabled={
                        user.role ===
                        "USER"
                    }
                >
                    📜 Audit Logs
                </button>

                <div className="sidebar-bottom">

                    <div className="sidebar-user">
                        <div className="avatar">
                            {user.name
                                ?.charAt(
                                    0
                                )
                                ?.toUpperCase() ||
                                "U"}
                        </div>

                        <div>
                            <strong>
                                {user.name ||
                                    "User"}
                            </strong>

                            <span>
                                {user.role ||
                                    "USER"}
                            </span>
                        </div>
                    </div>

                    <button
                        className="logout"
                        onClick={logout}
                    >
                        🚪 Logout
                    </button>

                </div>

            </aside>

            <main className="main">

                <header className="topbar">

                    <div>
                        <h1>
                            {view ===
                            "events"
                                ? "Security Dashboard"
                                : "Audit Logs"}
                        </h1>

                        <p>
                            SentinelForge Security Operations
                        </p>
                    </div>

                    <div className="user-pill">
                        <span>
                            ●
                        </span>

                        {user.role ||
                            "USER"}
                    </div>

                </header>

                {view ===
                    "events" && (
                    <>
                        {stats && (
                            <section className="stats">

                                <div className="card">
                                    <span>
                                        Total Events
                                    </span>

                                    <strong>
                                        {
                                            stats.totalEvents
                                        }
                                    </strong>
                                </div>

                                <div className="card critical">
                                    <span>
                                        Critical
                                    </span>

                                    <strong>
                                        {
                                            stats
                                                .severity
                                                .critical
                                        }
                                    </strong>
                                </div>

                                <div className="card high">
                                    <span>
                                        High
                                    </span>

                                    <strong>
                                        {
                                            stats
                                                .severity
                                                .high
                                        }
                                    </strong>
                                </div>

                                <div className="card open">
                                    <span>
                                        Open
                                    </span>

                                    <strong>
                                        {
                                            stats
                                                .status
                                                .open
                                        }
                                    </strong>
                                </div>

                            </section>
                        )}

                        {stats && (
                            <section className="status-summary">

                                <div>
                                    <span>
                                        🟢 Open
                                    </span>

                                    <strong>
                                        {
                                            stats
                                                .status
                                                .open
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        🟡 Acknowledged
                                    </span>

                                    <strong>
                                        {
                                            stats
                                                .status
                                                .acknowledged
                                        }
                                    </strong>
                                </div>

                                <div>
                                    <span>
                                        ✅ Resolved
                                    </span>

                                    <strong>
                                        {
                                            stats
                                                .status
                                                .resolved
                                        }
                                    </strong>
                                </div>

                            </section>
                        )}

                        <section className="events">

                            <div className="events-header">

                                <div>
                                    <h2>
                                        Security Events
                                    </h2>

                                    <p>
                                        Monitor and manage detected threats
                                    </p>
                                </div>

                                <div className="controls">

                                    <select
                                        value={
                                            severity
                                        }
                                        onChange={(e) =>
                                            setSeverity(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            All Severity
                                        </option>

                                        <option value="CRITICAL">
                                            Critical
                                        </option>

                                        <option value="HIGH">
                                            High
                                        </option>

                                        <option value="MEDIUM">
                                            Medium
                                        </option>

                                        <option value="LOW">
                                            Low
                                        </option>
                                    </select>

                                    <select
                                        value={
                                            status
                                        }
                                        onChange={(e) =>
                                            setStatus(
                                                e.target.value
                                            )
                                        }
                                    >
                                        <option value="">
                                            All Status
                                        </option>

                                        <option value="OPEN">
                                            Open
                                        </option>

                                        <option value="ACKNOWLEDGED">
                                            Acknowledged
                                        </option>

                                        <option value="RESOLVED">
                                            Resolved
                                        </option>
                                    </select>

                                    <button
                                        onClick={
                                            loadData
                                        }
                                    >
                                        ↻ Refresh
                                    </button>

                                </div>

                            </div>

                            <div className="table-container">

                                <table>

                                    <thead>
                                        <tr>
                                            <th>
                                                ID
                                            </th>

                                            <th>
                                                Threat
                                            </th>

                                            <th>
                                                Severity
                                            </th>

                                            <th>
                                                Status
                                            </th>

                                            <th>
                                                Source
                                            </th>

                                            <th>
                                                IP
                                            </th>

                                            <th>
                                                Time
                                            </th>

                                            <th>
                                                Action
                                            </th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {loading ? (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="empty"
                                                >
                                                    Loading events...
                                                </td>
                                            </tr>
                                        ) : events.length ===
                                          0 ? (
                                            <tr>
                                                <td
                                                    colSpan="8"
                                                    className="empty"
                                                >
                                                    No security events found.
                                                </td>
                                            </tr>
                                        ) : (
                                            events.map(
                                                (
                                                    event
                                                ) => (
                                                    <tr
                                                        key={
                                                            event.id
                                                        }
                                                    >
                                                        <td>
                                                            #
                                                            {
                                                                event.id
                                                            }
                                                        </td>

                                                        <td>
                                                            <strong>
                                                                {
                                                                    event.type
                                                                }
                                                            </strong>

                                                            <small>
                                                                {
                                                                    event.description
                                                                }
                                                            </small>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`badge ${event.severity.toLowerCase()}`}
                                                            >
                                                                {
                                                                    event.severity
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            <span
                                                                className={`status-badge ${event.status.toLowerCase()}`}
                                                            >
                                                                {
                                                                    event.status
                                                                }
                                                            </span>
                                                        </td>

                                                        <td>
                                                            {
                                                                event.source
                                                            }
                                                        </td>

                                                        <td>
                                                            {
                                                                event.ipAddress ||
                                                                "N/A"
                                                            }
                                                        </td>

                                                        <td>
                                                            {new Date(
                                                                event.createdAt
                                                            ).toLocaleString()}
                                                        </td>

                                                        <td>
                                                            {user.role !==
                                                                "USER" &&
                                                                event.status !==
                                                                    "RESOLVED" && (
                                                                    <button
                                                                        className="action-button"
                                                                        disabled={
                                                                            updating ===
                                                                            event.id
                                                                        }
                                                                        onClick={() =>
                                                                            updateStatus(
                                                                                event.id,
                                                                                event.status ===
                                                                                    "OPEN"
                                                                                    ? "ACKNOWLEDGED"
                                                                                    : "RESOLVED"
                                                                            )
                                                                        }
                                                                    >
                                                                        {updating ===
                                                                        event.id
                                                                            ? "..."
                                                                            : event.status ===
                                                                              "OPEN"
                                                                            ? "Acknowledge"
                                                                            : "Resolve"}
                                                                    </button>
                                                                )}

                                                            {event.status ===
                                                                "RESOLVED" && (
                                                                <span className="resolved-text">
                                                                    ✓ Resolved
                                                                </span>
                                                            )}
                                                        </td>
                                                    </tr>
                                                )
                                            )
                                        )}

                                    </tbody>

                                </table>

                            </div>

                        </section>
                    </>
                )}

                {view ===
                    "logs" && (
                    <section className="events">

                        <div className="events-header">
                            <div>
                                <h2>
                                    Audit Trail
                                </h2>

                                <p>
                                    Security activity and administrative actions
                                </p>
                            </div>

                            <button
                                onClick={
                                    loadLogs
                                }
                            >
                                ↻ Refresh
                            </button>
                        </div>

                        <div className="table-container">

                            <table>

                                <thead>
                                    <tr>
                                        <th>
                                            Action
                                        </th>

                                        <th>
                                            User
                                        </th>

                                        <th>
                                            Role
                                        </th>

                                        <th>
                                            IP Address
                                        </th>

                                        <th>
                                            Timestamp
                                        </th>
                                    </tr>
                                </thead>

                                <tbody>

                                    {logs.map(
                                        (
                                            log
                                        ) => (
                                            <tr
                                                key={
                                                    log.id
                                                }
                                            >
                                                <td>
                                                    <span className="audit-action">
                                                        {
                                                            log.action
                                                        }
                                                    </span>
                                                </td>

                                                <td>
                                                    {
                                                        log.user
                                                            ?.name ||
                                                        "System"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        log.user
                                                            ?.role ||
                                                        "N/A"
                                                    }
                                                </td>

                                                <td>
                                                    {
                                                        log.ipAddress ||
                                                        "N/A"
                                                    }
                                                </td>

                                                <td>
                                                    {new Date(
                                                        log.createdAt
                                                    ).toLocaleString()}
                                                </td>
                                            </tr>
                                        )
                                    )}

                                </tbody>

                            </table>

                        </div>

                    </section>
                )}

            </main>

        </div>
    );
}

export default Dashboard;