export interface ProgressBarProps {
  value?: number;
  variant?: "default" | "info" | "positive" | "negative";
  size?: "sm" | "md" | "lg";
  label?: string;
  showValue?: boolean;
  indeterminate?: boolean;
}
