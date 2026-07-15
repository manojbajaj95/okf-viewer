import { ViewerShell } from "@/components/viewer-shell";
import { getBundleRoot, listTree } from "@/lib/bundle";

export const dynamic = "force-dynamic";

export default function ViewerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let tree: ReturnType<typeof listTree> = [];
  let bundleLabel = "(OKF_BUNDLE_PATH not set)";
  let error: string | null = null;

  try {
    const root = getBundleRoot();
    bundleLabel = root;
    tree = listTree(root);
  } catch (err) {
    error = err instanceof Error ? err.message : String(err);
  }

  return (
    <ViewerShell nodes={tree} bundleLabel={bundleLabel} error={error}>
      {children}
    </ViewerShell>
  );
}
