import Link from "next/link";

export function PaginationNav({
  basePath,
  page,
  totalPages,
}: {
  basePath: string;
  page: number;
  totalPages: number;
}) {
  if (totalPages <= 1) return null;

  return (
    <nav className="flex items-center justify-between mt-10 pt-6 border-t border-border text-sm">
      {page > 1 ? (
        <Link
          href={page - 1 === 1 ? basePath : `${basePath}?page=${page - 1}`}
          className="text-foreground hover:text-brand"
        >
          ← Previous
        </Link>
      ) : (
        <span />
      )}
      <span className="text-muted-foreground">
        Page {page} of {totalPages}
      </span>
      {page < totalPages ? (
        <Link
          href={`${basePath}?page=${page + 1}`}
          className="text-foreground hover:text-brand"
        >
          Next →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
