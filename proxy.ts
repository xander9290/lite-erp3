import { auth } from "@/app/libs/auth";

export const proxy = auth((req) => {
  if (!req.auth && req.nextUrl.pathname !== "/") {
    const newUrl = new URL("/login", req.nextUrl.origin);
    return Response.redirect(newUrl);
  }
});

export const config = {
  matcher: ["/app/:path*"], // Specify the routes the middleware applies to
};
