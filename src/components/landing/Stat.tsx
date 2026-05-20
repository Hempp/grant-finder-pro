interface StatProps {
  value: string;
  label: string;
  tone?: "default" | "success";
}

export function Stat({ value, label, tone = "default" }: StatProps) {
  return (
    <div className="text-center">
      <dt
        className={`font-bold text-[clamp(28px,4.2vw,44px)] leading-none tracking-[-0.02em] tabular-nums ${
          tone === "success" ? "text-success" : "text-ink"
        }`}
      >
        {value}
      </dt>
      <dd className="mt-2 text-[12px] font-semibold tracking-[0.12em] uppercase text-ink-2">
        {label}
      </dd>
    </div>
  );
}
