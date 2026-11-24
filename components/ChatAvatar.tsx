export default function ChatAvatar({
  name,
  src,
  className = "h-9 w-9",
}: {
  name: string;
  src: string | null;
  className?: string;
}) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-hover text-sm font-bold text-muted ${className}`}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt=""
          referrerPolicy="no-referrer"
          draggable={false}
          className="h-full w-full object-cover"
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}
