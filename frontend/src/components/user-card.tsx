import Link from "next/link";

type UserCardProps = {
  href: string;
  name: string;
};

export function UserCard({ href, name }: UserCardProps) {
  return (
    <Link
      href={href}
      className="flex w-full items-center gap-4 rounded-[24px] px-4 py-4 text-left transition hover:bg-amber-50 focus:outline-none focus:ring-2 focus:ring-amber-300"
    >
      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-stone-900 text-lg font-semibold text-amber-50">
        {name[0]}
      </div>

      <div className="min-w-0 flex-1">
        <h2 className="truncate text-lg font-semibold text-stone-900">{name}</h2>
      </div>
    </Link>
  );
}
