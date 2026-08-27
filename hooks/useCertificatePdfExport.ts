"use client";

import { useCallback, useState } from "react";
import { toast } from "sonner";

export function useCertificatePdfExport() {
  const [busy, setBusy] = useState(false);

  const downloadFromApi = useCallback(async (url: string, filename: string) => {
    setBusy(true);
    const t = toast.loading("Preparing certificate…");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Download failed");
      const blob = await res.blob();
      const href = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = href;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setTimeout(() => window.URL.revokeObjectURL(href), 500);
      toast.success("Download ready", { id: t });
    } catch (e) {
      console.error(e);
      toast.error("Could not download certificate", { id: t });
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  const printFromApi = useCallback(async (url: string) => {
    setBusy(true);
    const t = toast.loading("Preparing print…");
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error("Print prepare failed");
      const blob = await res.blob();
      const href = window.URL.createObjectURL(blob);
      const w = window.open(href, "_blank");
      if (w) {
        w.addEventListener("load", () => {
          w.focus();
          w.print();
        });
      }
      toast.success("Opening print dialog…", { id: t });
      setTimeout(() => window.URL.revokeObjectURL(href), 60_000);
    } catch (e) {
      console.error(e);
      toast.error("Could not prepare print", { id: t });
      throw e;
    } finally {
      setBusy(false);
    }
  }, []);

  return { busy, downloadFromApi, printFromApi };
}
