import {
  updateMessageSchema,
  UpdateMessageSchemaType,
} from "@/app/schemas/message";
import RichTextEditor from "@/components/rich-text-editor/Editor";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Message } from "@/lib/generated/prisma/client";
import { orpc } from "@/lib/orpc";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { InfiniteMessages } from "../message/MessageInputForm";

type EditMessageProps = {
  message: Message;
  onCancel: () => void;
  onSave: () => void;
};

export const EditMessage = ({
  message,
  onCancel,
  onSave,
}: EditMessageProps) => {
  const queryClient = useQueryClient();

  const form = useForm({
    resolver: zodResolver(updateMessageSchema),
    defaultValues: {
      messageId: message.id,
      content: message.content,
    },
  });

  const updateMutation = useMutation(
    orpc.message.update.mutationOptions({
      onSuccess: (updatedData) => {
        queryClient.setQueryData<InfiniteMessages>(
          ["message.list", message.channelId],
          (oldData) => {
            if (!oldData) return oldData;

            const updatedMessage = updatedData.message;

            const pages = oldData.pages.map((page) => {
              const items = page.items.map((msg) =>
                msg.id === updatedMessage.id
                  ? { ...msg, ...updatedMessage }
                  : msg,
              );

              return { ...page, items };
            });

            return { ...oldData, pages };
          },
        );

        toast.success("Message updated successfully");
        onSave();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    }),
  );

  const onSubmit = (data: UpdateMessageSchemaType) => {
    updateMutation.mutate(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <RichTextEditor
                  field={field}
                  sendButton={
                    <div className="flex items-center gap-4">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={onCancel}
                        disabled={updateMutation.isPending}
                      >
                        Cancel
                      </Button>
                      <Button
                        disabled={updateMutation.isPending}
                        type="submit"
                        size="sm"
                      >
                        {updateMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                    </div>
                  }
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

export default EditMessage;
