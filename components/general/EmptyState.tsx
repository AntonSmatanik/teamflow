import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Cloud, PlusCircle } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "../ui/button";

type EmptyStateProps = {
  title: string;
  description: string;
  buttonText: string;
  href: string;
};

const EmptyState = ({
  title = "No messages yet",
  description,
  buttonText,
  href,
}: EmptyStateProps) => {
  return (
    <Empty className="border border-dashed">
      <EmptyHeader>
        <EmptyMedia variant="icon" className="bg-primary/10">
          <Cloud className="size-5 text-primary" />
        </EmptyMedia>

        <EmptyTitle className="mt-4">{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>

        <Link href={href} className={buttonVariants()}>
          <PlusCircle />
          {buttonText}
        </Link>
      </EmptyHeader>
    </Empty>
  );
};

export default EmptyState;
