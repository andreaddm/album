type FieldProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  hint?: string;
  onChange: (value: string) => void;
  type?: string;
  autoComplete?: string;
  inputMode?: "numeric" | "decimal" | "text";
  required?: boolean;
};

export function Field({
  id,
  label,
  value,
  error,
  hint,
  onChange,
  type = "text",
  autoComplete,
  inputMode,
  required,
}: FieldProps) {
  const describedBy = [
    hint ? `${id}-hint` : null,
    error ? `${id}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <label className="block text-sm text-ink" htmlFor={id}>
      {label}
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="mt-2 w-full rounded-full border border-ink/20 bg-ivory px-3 py-2"
      />
      {hint ? (
        <span id={`${id}-hint`} className="mt-1 block text-xs text-ink/60">
          {hint}
        </span>
      ) : null}
      {error ? (
        <span id={`${id}-error`} className="mt-1 block text-terracotta" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type TextAreaProps = {
  id: string;
  label: string;
  value: string;
  error?: string;
  onChange: (value: string) => void;
  rows?: number;
};

export function TextArea({
  id,
  label,
  value,
  error,
  onChange,
  rows = 5,
}: TextAreaProps) {
  return (
    <label className="block text-sm text-ink" htmlFor={id}>
      {label}
      <textarea
        id={id}
        rows={rows}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="mt-2 w-full rounded-2xl border border-ink/20 bg-ivory px-3 py-2"
      />
      {error ? (
        <span id={`${id}-error`} className="mt-1 block text-terracotta" role="alert">
          {error}
        </span>
      ) : null}
    </label>
  );
}

type CheckboxProps = {
  id: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  hint?: string;
};

export function CheckboxField({
  id,
  label,
  checked,
  onChange,
  disabled,
  hint,
}: CheckboxProps) {
  return (
    <label
      className={`flex items-start gap-3 text-sm ${disabled ? "text-stone" : "text-ink"}`}
      htmlFor={id}
    >
      <input
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 size-4 accent-ink-button disabled:cursor-not-allowed"
      />
      <span>
        {label}
        {hint ? <span className="mt-1 block text-xs text-ink/60">{hint}</span> : null}
      </span>
    </label>
  );
}
