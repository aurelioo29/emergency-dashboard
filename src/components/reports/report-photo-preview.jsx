"use client";

import { useMemo, useState } from "react";
import { Modal } from "antd";

function resolveFileUrl(path) {
  if (!path) return "";

  if (path.startsWith("http://") || path.startsWith("https://")) {
    return path;
  }

  const baseUrl =
    process.env.NEXT_PUBLIC_FILE_BASE_URL || "http://localhost:4000";

  return `${baseUrl}${path}`;
}

export default function ReportPhotoPreview({ photoUrl, reportCode }) {
  const [open, setOpen] = useState(false);

  const resolvedUrl = useMemo(() => resolveFileUrl(photoUrl), [photoUrl]);

  if (!resolvedUrl) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-500">
        Foto bukti tidak tersedia.
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="block w-full overflow-hidden rounded-xl border border-slate-200 bg-white text-left transition hover:shadow-md"
        >
          <div className="flex h-[280px] w-full items-center justify-center overflow-hidden bg-slate-100">
            <img
              src={resolvedUrl}
              alt={`Photo report ${reportCode || ""}`}
              className="h-full w-full object-cover"
              onError={(e) => {
                console.error("Failed to load image:", resolvedUrl);
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </button>

        <p className="m-0 text-xs text-slate-500">
          Klik gambar untuk membuka preview.
        </p>
      </div>

      <Modal
        open={open}
        onCancel={() => setOpen(false)}
        footer={null}
        width={1000}
        centered
        title={reportCode ? `Foto Bukti - ${reportCode}` : "Foto Bukti"}
      >
        <div className="max-h-[75vh] overflow-auto rounded-lg bg-slate-50 p-3">
          <div className="flex min-h-[70vh] w-full items-center justify-center">
            <img
              src={resolvedUrl}
              alt={`Photo report ${reportCode || ""}`}
              className="max-h-[70vh] max-w-full object-contain"
              onError={(e) => {
                console.error("Failed to load modal image:", resolvedUrl);
                e.currentTarget.style.display = "none";
              }}
            />
          </div>
        </div>
      </Modal>
    </>
  );
}
