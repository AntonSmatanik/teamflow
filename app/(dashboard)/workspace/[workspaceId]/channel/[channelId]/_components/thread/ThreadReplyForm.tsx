"use client";

import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import useAttachmentUpload from "@/hooks/use-attachment-upload";
import { getAvatar } from "@/lib/get-avatar";
import { orpc } from "@/lib/orpc";
import { InfiniteMessages, MessageListItem } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MessageComposer from "../message/MessageComposer";

type ThreadReplyFormProps = {
  threadId: string;
  user: KindeUser<Record<string, unknown>>;
};

const ThreadReplyForm = ({ threadId, user }: ThreadReplyFormProps) => {
  const { channelId } = useParams<{ channelId: string }>();
  const [editorKey, setEditorKey] = useState(0);
  const queryClient = useQueryClient();

  const upload = useAttachmentUpload();
  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      content: "",
      channelId,
      threadId,
    },
  });

  useEffect(() => {
    form.setValue("threadId", threadId);
  }, [threadId, form]);

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        const listOptions = orpc.message.thread.list.queryOptions({
          input: { messageId: threadId },
        });

        await queryClient.cancelQueries({ queryKey: listOptions.queryKey });

        const previousData = queryClient.getQueryData(listOptions.queryKey);

        const optimisticMessage: MessageListItem = {
          id: `temp-${Math.random()}`,
          content: data.content,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId: data.channelId,
          threadId: data.threadId!,
          imageUrl: data.imageUrl ?? null,
          replyCount: 0,
        };

        queryClient.setQueryData(listOptions.queryKey, (old) => {
          if (!old) return old;

          return {
            ...old,
            messages: [...old.messages, optimisticMessage],
          };
        });

        // optimistically bump the replies count in the main message list
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (old) => {
            if (!old) return old;

            const pages = old.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === threadId ? { ...m, replyCount: m.replyCount + 1 } : m,
              ),
            }));

            return {
              ...old,
              pages,
            };
          },
        );

        return {
          listOptions,
          previousData,
        };
      },
      onSuccess: (_data, _vars, ctx) => {
        queryClient.invalidateQueries({ queryKey: ctx.listOptions.queryKey });

        form.reset({
          content: "",
          channelId,
          threadId,
        });
        upload.clear();
        setEditorKey((prev) => prev + 1);

        toast.success("Message created successfully");
      },
      onError: (_err, _var, ctx) => {
        if (!ctx) return;

        const { listOptions, previousData } = ctx;

        if (previousData) {
          queryClient.setQueryData(listOptions.queryKey, previousData);
        }

        toast.error("Something went wrong.");
      },
    }),
  );

  const onSubmit = (data: CreateMessageSchemaType) => {
    createMessageMutation.mutate({
      ...data,
      imageUrl: upload.stagedUrl ?? undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={(e) => e.preventDefault()}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <MessageComposer
                  key={editorKey}
                  value={field.value}
                  onChange={field.onChange}
                  upload={upload}
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                />
              </FormControl>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default ThreadReplyForm;
