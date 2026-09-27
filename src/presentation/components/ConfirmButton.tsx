import { useEffect, useState } from 'react';
import { Button } from './Button';

export const CONFIRM_WINDOW_MS = 4000;

interface Props {
  label: string;
  confirmLabel: string;
  onConfirm: () => void;
}

/**
 * Destructive action that needs a second tap. Works the same on web and native,
 * unlike Alert.alert, which does nothing in the browser.
 */
export function ConfirmButton({ label, confirmLabel, onConfirm }: Props) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), CONFIRM_WINDOW_MS);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <Button
      label={armed ? confirmLabel : label}
      variant="danger"
      onPress={() => {
        if (!armed) return setArmed(true);
        setArmed(false);
        onConfirm();
      }}
    />
  );
}
