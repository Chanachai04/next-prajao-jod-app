export interface LabelAndInputFormProps {
  title: string;
  id: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  placeholder?: string;
  type?: string;
  className?: string;
  labelClassName?: string;
  maxLength?: number;
}
