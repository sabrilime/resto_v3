// Remove Clerk middleware. If you need custom middleware, add it here.
export default function middleware() {
  // No-op
  return;
}

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};