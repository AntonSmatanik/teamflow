import RichTextEditor from "@/components/rich-text-editor/Editor";
import ImageUploadModal from "@/components/rich-text-editor/ImageUploadModal";
import { Button } from "@/components/ui/button";
import { UseAttachmentUploadReturn } from "@/hooks/use-attachment-upload";
import { ImageIcon, Send } from "lucide-react";
import AttachmentChip from "./AttachmentChip";

type MessageComposerProps = {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting?: boolean;
  upload: UseAttachmentUploadReturn;
};

const MessageComposer = ({
  value,
  onChange,
  onSubmit,
  isSubmitting,
  upload,
}: MessageComposerProps) => {
  return (
    <>
      <RichTextEditor
        field={{ value, onChange }}
        footerLeft={
          upload.stagedUrl ? (
            <AttachmentChip url={upload.stagedUrl} onRemove={upload.clear} />
          ) : (
            <Button
              onClick={() => upload.setIsOpen(true)}
              type="button"
              variant="outline"
              size="sm"
            >
              <ImageIcon className="size-4 mr-1" />
              Attach
            </Button>
          )
        }
        sendButton={
          <Button
            type="submit"
            size="sm"
            onClick={onSubmit}
            disabled={isSubmitting}
          >
            <Send className="size-4 mr-1" />
            Send
          </Button>
        }
      />

      <ImageUploadModal
        onUploaded={(url) => upload.onUploaded(url)}
        open={upload.isOpen}
        onOpenChange={upload.setIsOpen}
      />
    </>
  );
};

export default MessageComposer;
