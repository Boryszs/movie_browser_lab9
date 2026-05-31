import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { Variants } from "framer-motion";

export type ToastType = "success" | "error" | "info";

export type Toast = {
  id: number;
  message: string;
  type?: ToastType;
};

type ToastContainerProps = {
  toasts: Toast[];
  onDismiss: (toastId: number) => void;
};

function createToastVariants(shouldReduceMotion: boolean): Variants {
  return {
    initial: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : 48,
      scale: shouldReduceMotion ? 1 : 0.9,
    },
    animate: {
      opacity: 1,
      x: 0,
      scale: 1,
      transition: shouldReduceMotion
        ? {
            duration: 0.01,
          }
        : {
            type: "spring",
            stiffness: 300,
            damping: 24,
          },
    },
    exit: {
      opacity: 0,
      x: shouldReduceMotion ? 0 : 48,
      scale: shouldReduceMotion ? 1 : 0.85,
      transition: {
        duration: shouldReduceMotion ? 0.01 : 0.18,
      },
    },
  };
}

export function ToastContainer({ toasts, onDismiss }: ToastContainerProps) {
  const shouldReduceMotion = useReducedMotion() ?? false;
  const toastVariants = createToastVariants(shouldReduceMotion);

  return (
    <div className="toast-container" aria-live="polite" aria-atomic="true">
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout={!shouldReduceMotion}
            className={`toast toast-${toast.type ?? "info"}`}
            variants={toastVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <span>{toast.message}</span>

            <button
              type="button"
              className="toast-close"
              onClick={() => onDismiss(toast.id)}
              aria-label="Zamknij powiadomienie"
            >
              ×
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
