import { Button } from "./Button";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger">
      <p>{message}</p>
      {onRetry ? (
        <Button variant="ghost" type="button" className="mt-2 text-danger" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  );
}
