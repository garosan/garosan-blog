import Image from "next/image";
import { cn } from "@/lib/utils";
import { formatDate, getAuthorAvatar } from "@/lib/posts";

export function Byline({
  author,
  date,
  avatarSize = 20,
  showAvatar = true,
  className,
}: {
  author: string;
  date: string;
  avatarSize?: number;
  showAvatar?: boolean;
  className?: string;
}) {
  const avatar = showAvatar ? getAuthorAvatar(author) : undefined;

  return (
    <p
      className={cn(
        "flex items-center gap-2 text-muted-foreground",
        className
      )}
    >
      {avatar && (
        <Image
          src={avatar}
          alt={author}
          width={avatarSize}
          height={avatarSize}
          className="rounded-full object-cover shrink-0"
        />
      )}
      <span>
        By {author} — {formatDate(date)}
      </span>
    </p>
  );
}
