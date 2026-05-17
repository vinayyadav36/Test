"use client";

type Props = {
  title: string;
  subtitle?: string;
  children?: React.ReactNode;
};

export function PageHeader({ title, subtitle, children }: Props) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 animate-fade-in">
      <div className="min-w-0">
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
    </div>
  );
}
