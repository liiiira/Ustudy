import { useRef, useState } from "react";
import { ImageIcon } from "lucide-react";
import Button from "./button";
import Modal from "./modal";

type ImageFieldProps = {
  id: string;
  label: string;
  value?: string;
  onFileSelect: (file: File) => void;
  uploading?: boolean;
  error?: string;
  variant?: "cover" | "avatar";
  accept?: string;
};

const VARIANTS: Record<NonNullable<ImageFieldProps["variant"]>, string> = {
  cover: "w-full aspect-video rounded-md",
  avatar: "w-24 aspect-square rounded-full",
};

export default function ImageField({
  id,
  label,
  value,
  onFileSelect,
  uploading = false,
  error = "",
  variant = "cover",
  accept = "image/png, image/jpeg, image/webp",
}: ImageFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [viewOpen, setViewOpen] = useState<boolean>(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
    // reset so picking the same file again still fires change
    e.target.value = "";
  }

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-700 font-medium" htmlFor={id}>
        {label}
      </label>

      <div
        className={`relative overflow-hidden border-2 border-gray-300 bg-gray-100 ${VARIANTS[variant]}`}
      >
        {value ? (
          <img src={value} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <ImageIcon className="w-8 h-8" />
          </div>
        )}

        {uploading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/70 text-sm font-medium text-gray-700">
            Uploading…
          </div>
        )}
      </div>

      <div className="flex flex-row gap-2">
        {value && (
          <Button
            type="button"
            variant="Primary"
            disabled={uploading}
            onClick={() => setViewOpen(true)}
          >
            View
          </Button>
        )}
        <Button
          type="button"
          variant="Primary"
          disabled={uploading}
          onClick={() => inputRef.current?.click()}
        >
          {value ? "Modify" : "Add image"}
        </Button>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        className="sr-only"
        onChange={handleChange}
      />

      <div className="min-h-5 text-red-500 text-xs">{error}</div>

      <Modal open={viewOpen} onClose={() => setViewOpen(false)} title={label}>
        {value && (
          <img
            src={value}
            alt=""
            className="max-h-[80vh] max-w-[90vw] object-contain rounded-md"
          />
        )}
      </Modal>
    </div>
  );
}
