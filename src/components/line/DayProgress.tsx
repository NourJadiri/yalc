import "./DayProgress.css";

export default function DayProgress({ pct }: { pct: number }) {
  return (
    <div className="dayprog" data-empty={pct === 0 || undefined}>
      <i style={{ width: pct + "%" }} />
    </div>
  );
}
