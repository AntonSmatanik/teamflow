import SafeContent from "@/components/rich-text-editor/SafeContent";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { useThread } from "@/providers/ThreadProvider";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MessageSquare, X } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import ThreadReply from "./ThreadReply";
import ThreadReplyForm from "./ThreadReplyForm";
import ThreadSidebarSkeleton from "./ThreadSidebarSkeleton";

type ThreadSidebarProps = {
  user: KindeUser<Record<string, unknown>>;
};

const threshold = 80;

const ThreadSidebar = ({ user }: ThreadSidebarProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastItemCountRef = useRef(0);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const { selectedThreadId, closeThread } = useThread();
  const { data, isLoading } = useQuery(
    orpc.message.thread.list.queryOptions({
      input: {
        messageId: selectedThreadId!,
      },
      enabled: Boolean(selectedThreadId),
    }),
  );

  const messageCount = data?.messages.length ?? 0;

  const isNearBottom = useCallback(
    (el: HTMLDivElement) =>
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold,
    [],
  );

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) return;

    setIsAtBottom(isNearBottom(el));
  };

  useEffect(() => {
    if (messageCount === 0) return;

    const prevMessageCount = lastItemCountRef.current;
    const el = scrollRef.current;

    if (prevMessageCount > 0 && messageCount !== prevMessageCount) {
      if (el && isNearBottom(el)) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({
            block: "end",
            behavior: "smooth",
          });
        });

        setIsAtBottom(true);
      }
    }

    lastItemCountRef.current = messageCount;
  }, [messageCount, isNearBottom]);

  // keep view pinned to bottom on late content load (e.g. images)
  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    const scrollToBottomIfNeeded = () => {
      if (isAtBottom) {
        requestAnimationFrame(() => {
          bottomRef.current?.scrollIntoView({ block: "end" });
        });
      }
    };

    const onImageLoad = (e: Event) => {
      if (e.target instanceof HTMLImageElement) {
        scrollToBottomIfNeeded();
      }
    };

    // Listen for load events on images
    el.addEventListener("load", onImageLoad, true);

    // ResizeObserver watches for size changes in the container
    const resizeObserver = new ResizeObserver(() => {
      scrollToBottomIfNeeded();
    });

    resizeObserver.observe(el);

    // MutationObserver watches for DOM changes
    const mutationObserver = new MutationObserver(() => {
      scrollToBottomIfNeeded();
    });

    mutationObserver.observe(el, {
      childList: true,
      subtree: true,
      attributes: true,
      characterData: true,
    });

    return () => {
      el.removeEventListener("load", onImageLoad, true);
      resizeObserver.disconnect();
      mutationObserver.disconnect();
    };
  }, [isAtBottom]);

  const scrollToBottom = () => {
    const el = scrollRef.current;

    if (!el) return;

    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });

    setIsAtBottom(true);
  };

  if (isLoading) {
    return <ThreadSidebarSkeleton />;
  }

  return (
    <div className="w-[30rem] border-l flex flex-col h-full">
      <div className="border-b h-14 px-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="size-4" />
          <span>Thread</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={closeThread}>
            <X className="size-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto relative">
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="h-full overflow-y-auto"
        >
          {data && (
            <>
              <div className="p-4 border-b bg-muted/20">
                <div className="flex space-x-3">
                  <Image
                    src={data.parent.authorAvatar}
                    alt={data.parent.authorName}
                    width={32}
                    height={32}
                    className="size-8 rounded-full shrink-0"
                  />
                  <div className="flex-1 space-y-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-sm">
                        {data.parent.authorName}
                      </span>
                      <span className="text-xs text-muted-foreground ">
                        {new Intl.DateTimeFormat("sk-SK", {
                          dateStyle: "short",
                          timeStyle: "short",
                        }).format(data.parent.createdAt)}
                      </span>
                    </div>

                    <SafeContent
                      className="text-sm break-words prose dark:prose-invert max-w-none"
                      content={JSON.parse(data.parent.content)}
                    />

                    {data.parent.imageUrl && (
                      <div className="mt-3">
                        <Image
                          src={data.parent.imageUrl}
                          alt="Attachment"
                          width={300}
                          height={300}
                          className="rounded-md max-h-320 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-2">
                <p className="text-xs text-muted-foreground mb-3 px-2">
                  {data?.messages.length} replies
                </p>

                <div className="space-y-1">
                  {data?.messages.map((message) => (
                    <ThreadReply key={message.id} message={message} />
                  ))}
                </div>
              </div>

              <div ref={bottomRef} />
            </>
          )}
        </div>

        {!isAtBottom && (
          <Button
            type="button"
            size="sm"
            className="absolute bottom-8 right-5 z-20 size-10 rounded-full
          hover:shadow-xl transition-all duration-200"
            onClick={scrollToBottom}
          >
            <ChevronDown className="size-4" />
          </Button>
        )}
      </div>

      <div className="border-t p-4">
        <ThreadReplyForm threadId={selectedThreadId!} user={user} />
      </div>
    </div>
  );
};

export default ThreadSidebar;
