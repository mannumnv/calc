import type { CalculatorInputs } from "../lib/calculator";

interface CalculatorInputProps {
  field: keyof CalculatorInputs;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  hint?: string;
  unit?: string;
  error?: string;
  onChange: (field: keyof CalculatorInputs, value: number) => void;
}

export function CalculatorInput({
  field,
  label,
  value,
  min,
  max,
  step = 1,
  hint,
  unit,
  error,
  onChange,
}: CalculatorInputProps) {
  const inputId = `input-${field}`;
  const errorId = `${inputId}-error`;

  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between gap-3">
        <label className="text-sm font-medium text-slate-700" htmlFor={inputId}>
          {label}
        </label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      <div
        className={`input-shell ${error ? "border-rose-300 ring-2 ring-rose-100" : "focus-within:border-teal-700 focus-within:ring-2 focus-within:ring-teal-100"}`}
      >
        {unit && <span className="text-sm font-semibold text-slate-400">{unit}</span>}
        <input
          aria-describedby={error ? errorId : undefined}
          aria-invalid={Boolean(error)}
          className="w-full bg-transparent text-sm font-semibold tabular-nums text-slate-900 outline-none"
          id={inputId}
          inputMode="decimal"
          max={max}
          min={min}
          onChange={(event) => onChange(field, event.target.value === "" ? 0 : Number(event.target.value))}
          step={step}
          type="number"
          value={value}
        />
      </div>
      {error && (
        <p className="text-xs font-medium text-rose-600" id={errorId}>
          {error}
        </p>
      )}
    </div>
  );
}
