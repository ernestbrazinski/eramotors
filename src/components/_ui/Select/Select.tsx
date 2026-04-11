import { Select as HeroSelect, SelectItem } from "@heroui/react";
import type { Key } from "react";
import clsx from "clsx";
import Img from "@/src/components/_ui/Img/Img";

export type SelectOption = {
  label: string;
  value: string;
  icon?: string;
  /** Secondary line (e.g. category, specs) */
  description?: string;
};

type Props = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
  placeholder?: string;
  /** Narrow trigger, no chevron (e.g. header) */
  compact?: boolean;
};

function SelectedValue({ option }: { option: SelectOption }) {
  const { icon, label, description } = option;
  if (!icon && !description) {
    return <>{label}</>;
  }
  if (description) {
    return (
      <span className="er-select-value-with-icon er-select-value-rich">
        {icon ? (
          <span className="er-select-option-icon er-select-car-thumb">
            <Img src={icon} alt="" />
          </span>
        ) : null}
        <span className="flex min-w-0 flex-1 flex-col gap-[0.1em] text-left">
          <span className="truncate font-semibold">{label}</span>
          <span className="truncate text-[calc(var(--base-size)*1.2)] leading-[1.35] opacity-65">{description}</span>
        </span>
      </span>
    );
  }
  return (
    <span className="er-select-value-with-icon">
      <span className="er-select-option-icon">
        <Img src={icon!} alt="" />
      </span>
      {label}
    </span>
  );
}

export default function Select({
  options,
  value,
  onChange,
  ariaLabel,
  placeholder,
  compact = false,
}: Props) {
  const onSelectionChange = (keys: Set<Key> | "all") => {
    const key = keys instanceof Set ? Array.from(keys)[0] : null;
    onChange(key != null ? String(key) : "");
  };

  const selectedOption = options.find((o) => o.value === value);
  const isRichTrigger = Boolean(selectedOption?.description);
  const useCustomRender =
    selectedOption && (selectedOption.icon || selectedOption.description);

  return (
    <HeroSelect
      classNames={{
        listbox: "er-select-listbox",
        trigger: clsx(
          compact
            ? "er-select-trigger er-select-trigger-compact"
            : "er-select-trigger",
          !compact && isRichTrigger && "er-select-trigger-rich",
        ),
        ...(compact && {
          selectorIcon: "er-select-selector-hidden",
          innerWrapper: "er-select-inner-compact",
        }),
      }}
      selectorIcon={
        compact ? (
          <span aria-hidden className="er-select-selector-hidden" />
        ) : undefined
      }
      placeholder={placeholder}
      selectedKeys={value ? new Set([value]) : new Set()}
      onSelectionChange={onSelectionChange}
      aria-label={ariaLabel}
      fullWidth
      renderValue={
        useCustomRender && selectedOption
          ? () => <SelectedValue option={selectedOption} />
          : undefined
      }
    >
      {options.map((option) => (
        <SelectItem
          key={option.value}
          hideSelectedIcon
          startContent={
            option.icon ? (
              <span
                className={clsx(
                  "er-select-option-icon",
                  option.description && "er-select-car-thumb",
                )}
              >
                <Img src={option.icon} alt="" />
              </span>
            ) : undefined
          }
          textValue={
            option.description
              ? `${option.label} ${option.description}`
              : option.label
          }
        >
          {option.description ? (
            <div className="flex min-w-0 flex-col gap-[calc(var(--base-size)*0.2)] py-[calc(var(--base-size)*0.15)]">
              <span className="text-[calc(var(--base-size)*1.5)] font-semibold leading-tight">
                {option.label}
              </span>
              <span className="text-[calc(var(--base-size)*1.2)] leading-snug opacity-65">
                {option.description}
              </span>
            </div>
          ) : (
            option.label
          )}
        </SelectItem>
      ))}
    </HeroSelect>
  );
}
