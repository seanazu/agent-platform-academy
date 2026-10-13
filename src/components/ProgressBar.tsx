type Props = { value: number; max: number; label?: string };

function ProgressBar({ value, max, label }: Props) {
  const pct = max === 0 ? 0 : Math.round((value / max) * 100);
  return (
    <div className="progress" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label ?? `${value} of ${max} done`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export default ProgressBar;
