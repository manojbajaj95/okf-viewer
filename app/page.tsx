export const dynamic = "force-dynamic";

export default function Home() {
  const bundlePath =
    process.env.OKF_BUNDLE_PATH ?? "(not set — run via okf-lib open)";

  return (
    <main className="mx-auto flex min-h-screen max-w-2xl flex-col justify-center gap-4 px-6 py-16 font-sans">
      <p className="text-sm uppercase tracking-wide text-zinc-500">okf-lib</p>
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
        OKF Viewer
      </h1>
      <p className="text-lg text-zinc-600">
        Browse an Open Knowledge Format Knowledge Bundle. Bundle browsing UI is
        next; Open already wires the local path into the server.
      </p>
      <p className="rounded-md bg-zinc-100 px-3 py-2 font-mono text-sm text-zinc-800">
        OKF_BUNDLE_PATH={bundlePath}
      </p>
    </main>
  );
}
