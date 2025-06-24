import { useState } from "react";
import UploadImage from "@/components/UploadImage";
import Stylizer from "@/components/Stylizer";
import StyleSelector from "@/components/StyleSelector";
import styles from "../styles/App.module.scss";

const availableStyles = [
  { label: "Ghibli 1", url: "/styles/ghibli1.jpg" },
  { label: "Ghibli 2", url: "/styles/ghibli2.jpg" },
  { label: "Cartoon", url: "/styles/cartoon1.jpg" },
  { label: "Starry", url: "/styles/starry.jpg" },
  { label: "Mosaic", url: "/styles/mosaic.jpg" },
  { label: "Wave", url: "/styles/wave.jpg" },
  { label: "Sketch", url: "/styles/sketch.jpg" },
];

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [styleImageUrl, setStyleImageUrl] = useState<string | null>(null);

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>AI Avatar Generator</h1>

      <div className={styles.topSection}>
        <div className={styles.leftPane}>
          <UploadImage onImageUpload={setUploadedImage} />
        </div>

        <div className={styles.rightPane}>
          <Stylizer
            contentImage={uploadedImage}
            styleImageUrl={styleImageUrl}
          />
        </div>
      </div>

      <div className={styles.styleSelector}>
        <StyleSelector
          styles={availableStyles}
          onStyleSelect={setStyleImageUrl}
        />
      </div>
    </div>
  );
}
