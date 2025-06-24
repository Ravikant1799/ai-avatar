import { useState, ChangeEvent, DragEvent } from "react";
import styles from "./UploadImage.module.scss";

type UploadImageProps = {
  onImageUpload: (file: File) => void;
};

export default function UploadImage({ onImageUpload }: UploadImageProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (file: File) => {
    if (file && file.type.startsWith("image/")) {
      setPreviewUrl(URL.createObjectURL(file));
      onImageUpload(file);
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div
      className={`${styles.uploadContainer} ${
        isDragging ? styles.dragActive : ""
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}>
      <label htmlFor="image-upload" className={styles.uploadLabel}>
        Upload or Drag an Image
      </label>

      <div className={styles.inputWrapper}>
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className={styles.fileInput}
        />

        {previewUrl && (
          <img src={previewUrl} alt="Preview" className={styles.imagePreview} />
        )}
      </div>
    </div>
  );
}
