import { AvraLogo } from "@/app/components/AvraLogo";

export function BrandHeader({
  nomeProdutora,
  logoUrl,
  className,
}: {
  nomeProdutora: string;
  logoUrl: string | null;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 ${className ?? ""}`}>
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt={nomeProdutora} className="h-7 w-11 object-contain" />
      ) : (
        <AvraLogo className="h-7 w-11" />
      )}
      <span className="text-lg font-semibold text-foreground">{nomeProdutora}</span>
    </div>
  );
}
