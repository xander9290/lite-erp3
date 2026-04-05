import clsx from "clsx";

type StatusOption = {
  label: string;
  color?: string; // success, danger, warning, etc
  className?: string;
};

type Props = {
  value: string;
  options: Record<string, StatusOption>;
  defaultValue?: StatusOption;
};

export function WidgetBadgeStatus({
  value,
  options,
  defaultValue = { label: value, color: "secondary" },
}: Props) {
  const option = options[value] || defaultValue;

  return (
    <span
      className={clsx(
        "badge",
        option.color && `bg-${option.color}`,
        option.className,
      )}
    >
      {option.label}
    </span>
  );
}
