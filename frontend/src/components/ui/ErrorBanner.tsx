import { Button } from "./Button";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
      <p>{message}</p>
      {onRetry ? (
        <Button variant="ghost" type="button" className="mt-2 text-red-800" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
