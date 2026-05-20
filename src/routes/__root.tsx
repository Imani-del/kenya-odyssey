import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";

import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl text-gradient-sunset">404</h1>
        <h2 className="mt-4 text-xl">This trail doesn't exist</h2>
        <p className="mt-2 text-sm text-muted-foreground">The path you wandered down can't be found on our map.</p>
        <Link to="/" className="mt-6 inline-flex px-5 py-2.5 rounded-xl bg-gradient-sunset text-primary-foreground font-medium">Back to base camp</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went off-trail</h1>
        <p className="mt-2 text-sm text-muted-foreground">Try again or head back home.</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="px-4 py-2 rounded-xl bg-gradient-sunset text-primary-foreground text-sm font-medium">Try again</button>
          <a href="/" className="px-4 py-2 rounded-xl border border-border text-sm">Home</a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Safari — Discover Kenya Beyond the Ordinary" },
      { name: "description", content: "AI-powered Kenyan travel discovery. Find hidden gems, plan itineraries, map hiking trails, and follow creators across Kenya." },
      { property: "og:title", content: "Safari — Discover Kenya Beyond the Ordinary" },
      { property: "og:description", content: "Hidden gems, AI itineraries, hiking trails, and travel stories from Kenya." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "stylesheet", href: appCss }],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Nav />
      <main className="min-h-screen pt-20">
        <Outlet />
      </main>
      <Footer />
    </QueryClientProvider>
  );
}
