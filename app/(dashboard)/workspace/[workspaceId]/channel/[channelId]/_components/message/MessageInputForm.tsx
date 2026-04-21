"use client";

import {
  createMessageSchema,
  CreateMessageSchemaType,
} from "@/app/schemas/message";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import useAttachmentUpload from "@/hooks/use-attachment-upload";
import { Message } from "@/lib/generated/prisma/client";
import { getAvatar } from "@/lib/get-avatar";
import { orpc } from "@/lib/orpc";
import { InfiniteMessages, MessagePage } from "@/lib/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import MessageComposer from "./MessageComposer";

type MessageInputFormProps = {
  channelId: string;
  user: KindeUser<Record<string, unknown>>;
};

const MessageInputForm = ({ channelId, user }: MessageInputFormProps) => {
  const [editorKey, setEditorKey] = useState(0);
  const queryClient = useQueryClient();
  const upload = useAttachmentUpload();

  const form = useForm({
    resolver: zodResolver(createMessageSchema),
    defaultValues: {
      channelId,
      content: "",
    },
  });

  const createMessageMutation = useMutation(
    orpc.message.create.mutationOptions({
      onMutate: async (data) => {
        await queryClient.cancelQueries({
          queryKey: ["message.list", channelId],
        });

        const previousData = queryClient.getQueryData<InfiniteMessages>([
          "message.list",
          channelId,
        ]);

        const tempId = `temp-${Math.random()}`;

        const optimisticMessage: Message = {
          id: tempId,
          content: data.content,
          imageUrl: data.imageUrl ?? null,
          createdAt: new Date(),
          updatedAt: new Date(),
          authorId: user.id,
          authorEmail: user.email!,
          authorName: user.given_name ?? "John Doe",
          authorAvatar: getAvatar(user.picture, user.email!),
          channelId,
          threadId: null,
        };

        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (oldData) => {
            if (!oldData)
              return {
                pages: [
                  {
                    items: [optimisticMessage],
                    nextCursor: undefined,
                  },
                ],
                pageParams: [undefined],
              } satisfies InfiniteMessages;

            const firstPage = oldData.pages[0] ?? {
              items: [],
              nextCursor: undefined,
            };

            const updatedFirstPage: MessagePage = {
              ...firstPage,
              items: [optimisticMessage, ...firstPage.items],
            };

            return {
              ...oldData,
              pages: [updatedFirstPage, ...oldData.pages.slice(1)],
            };
          },
        );

        return { previousData, tempId };
      },
      onSuccess: (data, _variables, context) => {
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", channelId],
          (oldData) => {
            if (!oldData) return oldData;

            const updatedPages = oldData.pages.map((page) => ({
              ...page,
              items: page.items.map((m) =>
                m.id === context?.tempId ? { ...data } : m,
              ),
            }));

            return {
              ...oldData,
              pages: updatedPages,
            };
          },
        );

        form.reset({ channelId, content: "" });
        upload.clear();
        setEditorKey((prev) => prev + 1);
        toast.success("Message created successfully");
      },
      onError: (_err, _variables, context) => {
        if (context?.previousData) {
          queryClient.setQueryData(
            ["message.list", channelId],
            context.previousData,
          );
        }

        toast.error("Failed to create message");
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
                  onSubmit={() => onSubmit(form.getValues())}
                  isSubmitting={createMessageMutation.isPending}
                  upload={upload}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
};

export default MessageInputForm;
