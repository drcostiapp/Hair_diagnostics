export function ViolationTag({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center px-3 py-1 text-[11px] tracking-wide rounded-full bg-[#FBECEC] text-[#7A2E2E] border border-[#E9C9C9]">
      {label}
    </span>
  );
}
