export default function Spinner({ size = "md", className = "" }) {
  const sizes = { sm: "w-4 h-4", md: "w-6 h-6", lg: "w-10 h-10", xl: "w-14 h-14" };
  return (
    <div className={`${sizes[size]} border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin ${className}`} />
  );
}

export function PageSpinner({ text = "Loading..." }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[300px] gap-3">
      <Spinner size="lg" />
      <p className="text-sm text-gray-500">{text}</p>
    </div>
  );
}