type AdBannerProps = {
  adKey: string;
  width: number;
  height: number;
  scriptSrc: string;
  className?: string;
};

export default function AdBanner({
  adKey,
  width,
  height,
  scriptSrc,
  className = "",
}: AdBannerProps) {
  if (process.env.NODE_ENV === "development") {
    return (
      <div
        style={{ width, height }}
        className={`flex max-w-full items-center justify-center rounded-lg border border-dashed border-border text-xs text-muted ${className}`}
      >
        Slot iklan {width}×{height}
      </div>
    );
  }

  const options = { key: adKey, format: "iframe", height, width, params: {} };

  const srcDoc = `<!doctype html><html><body style="margin:0"><script>atOptions=${JSON.stringify(
    options,
  )};</script><script src="${scriptSrc}"></script></body></html>`;

  return (
    <iframe
      title="Iklan"
      srcDoc={srcDoc}
      width={width}
      height={height}
      loading="lazy"
      scrolling="no"
      sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
      className={`max-w-full border-0 [color-scheme:normal] ${className}`}
    />
  );
}
