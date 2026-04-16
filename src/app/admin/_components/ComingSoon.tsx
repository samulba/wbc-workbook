import { LucideIcon } from "lucide-react";

interface Props {
  icon:  LucideIcon;
  title: string;
  desc:  string;
}

export function ComingSoon({ icon: Icon, title, desc }: Props) {
  return (
    <div className="max-w-5xl">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center mb-5">
          <Icon className="w-7 h-7 text-gray-400 dark:text-gray-500" strokeWidth={1.5} />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">{title}</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 max-w-xs">{desc}</p>
        <div className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-xs font-medium text-gray-500 dark:text-gray-400">In Entwicklung</span>
        </div>
      </div>
    </div>
  );
}
