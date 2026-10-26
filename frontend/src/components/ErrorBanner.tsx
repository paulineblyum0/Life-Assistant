type Props = {
  message: string;
  onRetry: () => void;
};

export default function ErrorBanner({ message, onRetry }: Props) {
  return (
    <div className="error-banner" role="alert">
      <span>{message}</span>
      <button onClick={onRetry}>Retry</button>
    </div>
  );
}
