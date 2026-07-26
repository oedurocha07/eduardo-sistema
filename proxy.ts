import { NextRequest, NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE } from "@/app/lib/auth";

const PUBLIC_PATHS = [
  "/login",
  "/esqueci-senha",
  "/redefinir-senha",
  "/api/auth/login",
  "/api/health",
  "/api/setup",
  "/api/clientes-recorrentes/import",
  "/api/v1/clientes-recorrentes",
  "/api/v1/lancamentos",
];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (PUBLIC_PATHS.some((p) => pathname === p) || pathname.startsWith("/_next")) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? verifySessionToken(token) : null;

  if (!session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
