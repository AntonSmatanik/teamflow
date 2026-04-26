import { GroupReactionSchemaType } from "@/app/schemas/message";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { InfiniteMessages } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import EmojiReaction from "./EmojiReaction";

type ThreadContext = {
  type: "thread";
  threadId: string;
};

type ListContext = {
  type: "list";
  channelId: string;
};

type ReactionsBarProps = {
  messageId: string;
  reactions: GroupReactionSchemaType[];
  context?: ThreadContext | ListContext;
};

const ReactionsBar = ({ messageId, reactions, context }: ReactionsBarProps) => {
  const { channelId } = useParams<{ channelId: string }>();

  const queryClient = useQueryClient();

  const toggleMutation = useMutation(
    orpc.message.reaction.toggle.mutationOptions({
      onMutate: async ({ messageId, emoji }) => {
        const isThread = context?.type === "thread";

        if (isThread) {
          console.log("this is a thread reaction");
        }

        const listKey = ["message.list", channelId];
        await queryClient.cancelQueries({ queryKey: listKey });
        const previous = queryClient.getQueryData(listKey);

        queryClient.setQueryData<InfiniteMessages>(listKey, (old) => {
          if (!old) return old;

          const pages = old.pages.map((page) => ({
            ...page,
            items: page.items.map((m) => {
              if (m.id !== messageId) return m;

              const current = m.reactions;
              const existing = current.find((r) => r.emoji === emoji);

              let next: GroupReactionSchemaType[];

              if (existing) {
                const dec = existing.count - 1;

                if (dec === 0) {
                  next = current.filter((r) => r.emoji !== existing.emoji);
                } else {
                  next = current.map((r) =>
                    r.emoji === existing.emoji
                      ? { ...r, count: dec, reactedByMe: false }
                      : r,
                  );
                }
              } else {
                next = [...current, { emoji, count: 1, reactedByMe: true }];
              }

              return {
                ...m,
                reactions: next,
              };
            }),
          }));

          return {
            ...old,
            pages,
          };
        });
      },
      onSuccess: () => {
        toast.success("Reaction toggled successfully");
      },
      onError: (error) => {
        console.error("Failed to toggle reaction:", error);
      },
    }),
  );

  const handleToggleReaction = (emoji: string) => {
    toggleMutation.mutate({ emoji, messageId });
  };

  return (
    <div className="mt-1 flex items-center gap-1">
      {reactions.map((r) => (
        <Button
          key={r.emoji}
          type="button"
          variant="secondary"
          size="sm"
          className={cn(
            "h-6 px-2 text-xs",
            r.reactedByMe && "bg-primary/10 border border-primary",
          )}
          onClick={() => handleToggleReaction(r.emoji)}
        >
          <span>{r.emoji}</span>
          <span>{r.count}</span>
        </Button>
      ))}

      <EmojiReaction onSelect={handleToggleReaction} />
    </div>
  );
};

export default ReactionsBar;
