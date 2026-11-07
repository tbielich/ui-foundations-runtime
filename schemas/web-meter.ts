export interface MeterProps {
  label?: string;
  value?: number;
  min?: number;
  max?: number;
  variant?: "default" | "positive" | "notice" | "negative";
  size?: "md" | "sm";
  valueText?: string;
}
