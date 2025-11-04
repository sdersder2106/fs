import { withAuth } from "next-auth/middleware";

export default withAuth({
  pages: {
    signIn: '/login',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/comments/:path*',
    '/api/companies/:path*',
    '/api/dashboard/:path*',
    '/api/findings/:path*',
    '/api/notifications/:path*',
    '/api/pentests/:path*',
    '/api/reports/:path*',
    '/api/targets/:path*',
    '/api/templates/:path*',
  ]
};