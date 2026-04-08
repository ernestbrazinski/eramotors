import styles from "./Select.module.scss";

import { Select as HeroSelect, SelectItem } from "@heroui/react";
import type { Key } from "react";
import Img from "@/src/components/_ui/Img/Img";

export type SelectOption = {
  label: string;
  value: string;
  icon?: string;
};

type Props = {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  ariaLabel?: string;
};

export default function Select({ options, value, onChange, ariaLabel }: Props) {
  const onSelectionChange = (keys: Set<Key> | "all") => {
    const key = keys instanceof Set ? Array.from(keys)[0] : null;
    if (key != null) onChange(String(key));
  };

  const selectedOption = options.find((o) => o.value === value);

  return (
    <HeroSelect
      classNames={{
        listbox: styles.selectListbox,
      }}
      selectedKeys={new Set([value])}
      onSelectionChange={onSelectionChange}
      aria-label={ariaLabel}
      fullWidth
      renderValue={
        selectedOption?.icon
          ? () => {
              const icon = selectedOption.icon!;
              return (
                <span className={styles.selectValueWithIcon}>
                  <span className={styles.optionIconWrap}>
                    <Img src={icon} alt="" />
                  </span>
                  {selectedOption.label}
                </span>
              );
            }
          : undefined
      }
    >
      {options.map((option) => (
        <SelectItem
          key={option.value}
          hideSelectedIcon
          startContent={
            option.icon ? (
              <span className={styles.optionIconWrap}>
                <Img src={option.icon} alt="" />
              </span>
            ) : undefined
          }
        >
          {option.label}
        </SelectItem>
      ))}
    </HeroSelect>
  );
}
