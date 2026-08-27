import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
    function middleware(req) {
        const token = req.nextauth.token;
        const role = (token as any)?.role;
        const pathname = req.nextUrl.pathname;

        const getDashboardUrl = (role?: string) => {
            switch (role) {
              case "SUPER_ADMIN":
                return "/super-admin";
              case "STAKEHOLDER":
                return "/stakeholder";
              case "ADMIN":
                return "/admins-new";
              case "REGIONAL_ADMIN":
                return "/regional-admin";
              case "HUB_MANAGER":
                return "/hub-portal";
              case "MENTOR":
                return "/mentor-portal";
              case "COMMITTEE":
              case "REVIEWER":
                return "/committee-portal/dashboard";
              case "ECOSYSTEM_BUILDER":
                return "/ecosystem-builder";
              default:
                return "/dashboard/home";
            }
        };

        const dashboardUrl = getDashboardUrl(role);

        // 1. Admin Portal (ADMIN only)
        if ((pathname.startsWith("/admins-new") || pathname.startsWith("/api/admins-new")) && role !== "ADMIN" && role !== "SUPER_ADMIN") {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 2. Committee Portal (COMMITTEE, REVIEWER)
        if ((pathname.startsWith("/committee-portal") || pathname.startsWith("/api/committee-portal")) && !["COMMITTEE", "REVIEWER", "SUPER_ADMIN"].includes(role)) {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 3. Ecosystem Builder Portal
        if ((pathname.startsWith("/ecosystem-builder") || pathname.startsWith("/api/ecosystem-builder")) && role !== "ECOSYSTEM_BUILDER" && role !== "SUPER_ADMIN") {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 4. Super Admin Portal (SUPER_ADMIN only)
        if ((pathname.startsWith("/super-admin") || pathname.startsWith("/api/super-admin")) && role !== "SUPER_ADMIN") {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 5. Stakeholder Portal (STAKEHOLDER or SUPER_ADMIN)
        if ((pathname.startsWith("/stakeholder") || pathname.startsWith("/api/stakeholder")) && !["STAKEHOLDER", "SUPER_ADMIN"].includes(role)) {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 6. Regional Admin Portal (REGIONAL_ADMIN or SUPER_ADMIN)
        if ((pathname.startsWith("/regional-admin") || pathname.startsWith("/api/regional-admin")) && !["REGIONAL_ADMIN", "SUPER_ADMIN"].includes(role)) {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 7. Hub Portal (HUB_MANAGER or SUPER_ADMIN)
        if ((pathname.startsWith("/hub-portal") || pathname.startsWith("/api/hub-portal")) && !["HUB_MANAGER", "SUPER_ADMIN"].includes(role)) {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 8. Mentor Portal (MENTOR or SUPER_ADMIN)
        if ((pathname.startsWith("/mentor-portal") || pathname.startsWith("/api/mentor-portal")) && !["MENTOR", "SUPER_ADMIN"].includes(role)) {
            if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        // 9. Dashboard (USER only, plus messages shared)
        if (pathname.startsWith("/dashboard") && role !== "USER") {
            if (pathname.includes("/messages")) return NextResponse.next();
            return NextResponse.redirect(new URL(dashboardUrl, req.url));
        }

        return NextResponse.next();
    },
    {
        callbacks: {
            authorized: ({ token }) => !!token && !(token as any)?.revoked,
        },
    }
);

export const config = {
    matcher: [
        "/dashboard/:path*",
        "/admins-new/:path*",
        "/committee-portal/:path*",
        "/ecosystem-builder/:path*",
        "/super-admin/:path*",
        "/stakeholder/:path*",
        "/regional-admin/:path*",
        "/hub-portal/:path*",
        "/mentor-portal/:path*",
        "/api/admins-new/:path*",
        "/api/committee-portal/:path*",
        "/api/ecosystem-builder/:path*",
        "/api/super-admin/:path*",
        "/api/stakeholder/:path*",
        "/api/regional-admin/:path*",
        "/api/hub-portal/:path*",
        "/api/mentor-portal/:path*",
        "/api/protected/:path*",
    ],
};
