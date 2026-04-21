import EmptyState from "@/components/general/EmptyState";
import { Button } from "@/components/ui/button";
import { orpc } from "@/lib/orpc";
import { useInfiniteQuery, useSuspenseQuery } from "@tanstack/react-query";
import { ChevronDown, Loader2 } from "lucide-react";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import MessageItem from "./message/MessageItem";

const threshold = 80;

const MessageList = () => {
  const { channelId } = useParams<{ channelId: string }>();

  const [hasInitialScrolled, setHasInitialScrolled] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const scrollRef = useRef<HTMLDivElement | null>(null);
  const bottomRef = useRef<HTMLDivElement | null>(null);
  const lastItemIdRef = useRef<string | undefined>(undefined);

  const infiniteOptions = orpc.message.list.infiniteOptions({
    input: (pageParam: string | undefined) => ({
      channelId,
      cursor: pageParam,
      limit: 15,
    }),
    queryKey: ["message.list", channelId],
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    select: (data) => ({
      pages: [...data.pages]
        .map((p) => ({
          ...p,
          items: [...p.items].reverse(),
        }))
        .reverse(),
      pageParams: [...data.pageParams].reverse(),
    }),
  });

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isFetching,
    error,
  } = useInfiniteQuery({
    ...infiniteOptions,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  const {
    data: { user },
  } = useSuspenseQuery(orpc.workspace.list.queryOptions());

  const isNearBottom = useCallback(
    (el: HTMLDivElement) =>
      el.scrollHeight - el.scrollTop - el.clientHeight <= threshold,
    [],
  );

  const handleScroll = () => {
    const el = scrollRef.current;

    if (!el) return;

    if (el.scrollTop <= threshold && hasNextPage && !isFetching) {
      const prevScrollHeight = el.scrollHeight;
      const prevScrollTop = el.scrollTop;

      fetchNextPage().then(() => {
        const newScrollHeight = el.scrollHeight;

        el.scrollTop = prevScrollTop + newScrollHeight - prevScrollHeight;
      });
    }

    setIsAtBottom(isNearBottom(el));
  };

  // scroll to bottom when messages are loaded for the first time
  useEffect(() => {
    if (!hasInitialScrolled && data?.pages.length) {
      if (bottomRef) {
        bottomRef.current?.scrollIntoView({ block: "end" });
        setHasInitialScrolled(true);
        setIsAtBottom(true);
      }
    }
  }, [data?.pages.length, hasInitialScrolled]);

  // keep view pinned to bottom on late content load (e.g. images)
  useEffect(() => {
    const el = scrollRef.current;

    if (!el) return;

    const scrollToBottomIfNeeded = () => {
      if (isAtBottom || !hasInitialScrolled) {
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
  }, [isAtBottom, hasInitialScrolled]);

  const items = useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const isEmpty = items.length === 0 && !isLoading && !error;

  //  auto-scrolling to bottom due to new messages
  useEffect(() => {
    if (!items.length) return;

    const lastId = items[items.length - 1].id;
    const prevLastId = lastItemIdRef.current;
    const el = scrollRef.current;

    if (prevLastId && prevLastId !== lastId) {
      if (el && isNearBottom(el)) {
        requestAnimationFrame(() => {
          el.scrollTop = el.scrollHeight;
        });

        setIsAtBottom(true);
      }
    }

    lastItemIdRef.current = lastId;
  }, [items, isNearBottom]);

  const scrollToBottom = () => {
    const el = scrollRef.current;

    if (!el) return;

    bottomRef.current?.scrollIntoView({ block: "end", behavior: "smooth" });

    setIsAtBottom(true);
  };

  return (
    <div className="relative h-full">
      <div
        className="h-full overflow-y-auto px-4 flex flex-col space-y-1"
        ref={scrollRef}
        onScroll={handleScroll}
      >
        {isEmpty ? (
          <div className="flex h-full pt-4">
            <EmptyState
              title="No messages yet"
              description="Start the conversation by sending the first message"
              buttonText="Send a message"
              href="#"
            />
          </div>
        ) : (
          items.map((msg) => (
            <MessageItem key={msg.id} message={msg} currentUserId={user.id} />
          ))
        )}

        <div ref={bottomRef} />
      </div>

      {isFetchingNextPage && (
        <div
          className="absolute pointer-events-none top-0 left-0 right-0 z-20
        flex items-center justify-center py-2"
        >
          <div
            className="flex items-center gap-2 rounded-md bg-linear-to-b from-white/80
          to-transparent dark:from-neutral-900/80 backdrop-blur px-3 py-1"
          >
            <Loader2 className="animate-spin size-4 text-muted-foreground" />
            <span>Loading previous messages...</span>
          </div>
        </div>
      )}

      {!isAtBottom && (
        <Button
          type="button"
          size="sm"
          className="absolute bottom-4 right-5 z-20 size-10 rounded-full
          hover:shadow-xl transition-all duration-200"
          onClick={scrollToBottom}
        >
          <ChevronDown className="size-4" />
        </Button>
      )}
    </div>
  );
};

export default MessageList;
