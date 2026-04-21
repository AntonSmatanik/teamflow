import { UploadDropzone } from "@/lib/uploadthing";
import { toast } from "sonner";
import { ClientUploadedFileData } from "uploadthing/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

type ImageUploadModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUploaded: (url: string) => void;
};

const ImageUploadModal = ({
  open,
  onOpenChange,
  onUploaded,
}: ImageUploadModalProps) => {
  const onClientUploadComplete = (
    res: ClientUploadedFileData<{
      uploadedBy: string;
    }>[],
  ) => {
    const url = res[0].ufsUrl;
    onUploaded(url);
    toast.success("Image uploaded successfully!");
  };

  const onUploadError = (error: Error) => {
    toast.error(error.message);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <UploadDropzone
          className="ut-uploading:opacity-90 ut-ready:bg-card ut-ready:border-border ut-ready:text-foreground
          ut-uploading:bg-muted ut-uploading:border-border ut-uploading:text-muted-foreground
          ut-label:text-sm ut-label:text-muted-foreground ut-allowed-content:text-sm 
          ut-allowed-content:text-muted-foreground ut-button:bg-primary rounded-lg border"
          endpoint={"imageUploader"}
          onClientUploadComplete={onClientUploadComplete}
          onUploadError={onUploadError}
        />
      </DialogContent>
    </Dialog>
  );
};

export default ImageUploadModal;
