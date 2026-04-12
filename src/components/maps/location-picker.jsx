"use client";

import dynamic from "next/dynamic";

const LocationPickerInner = dynamic(() => import("./location-picker-inner"), {
  ssr: false,
  loading: () => (
    <div className="flex h-[320px] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-sm text-slate-500">
      Loading map...
    </div>
  ),
});

export default function LocationPicker(props) {
  return <LocationPickerInner {...props} />;
}
