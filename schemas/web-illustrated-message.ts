export interface IllustratedMessageProps {
  preset: "empty" | "error" | "no-results";
  heading: string;
  description: string;
  actionLabel: string;
  actionHref: string;
  actionVariant: "solid" | "outline" | "ghost";
  illustrationIcon: string;
}
