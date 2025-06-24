import { useEffect, useRef, useState } from "react";
import * as tf from "@tensorflow/tfjs";
import s from "./Stylizer.module.scss";

type StylizerProps = {
  contentImage: File | null;
  styleImageUrl: string | null;
};

export default function Stylizer({
  contentImage,
  styleImageUrl,
}: StylizerProps) {
  const [predictorModel, setPredictorModel] = useState<tf.GraphModel | null>(
    null
  );
  const [transformerModel, setTransformerModel] =
    useState<tf.GraphModel | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [processing, setProcessing] = useState(false);
  const [downloadFormat, setDownloadFormat] = useState<"png" | "jpeg">("png");

  useEffect(() => {
    async function loadModels() {
      const [pred, transf] = await Promise.all([
        tf.loadGraphModel("/models/style_predictor/model.json"),
        tf.loadGraphModel("/models/style_transformer/model.json"),
      ]);
      setPredictorModel(pred);
      setTransformerModel(transf);
    }
    loadModels();
  }, []);

  console.log("Processing with:", {
    contentImage,
    styleImageUrl,
  });
  const applyStyleTransfer = async () => {
    if (
      !predictorModel ||
      !transformerModel ||
      !contentImage ||
      !styleImageUrl ||
      !canvasRef.current
    )
      return;

    setProcessing(true);

    const contentImg = await loadImageFromFile(contentImage);
    const styleImg = await loadImageFromUrl(styleImageUrl);

    const contentTensor = imageToTensor(contentImg);
    const styleTensor = imageToTensor(styleImg);

    try {
      const styleBottleneck = (await predictorModel.executeAsync(
        styleTensor
      )) as tf.Tensor;
      const stylized = tf.tidy(() => {
        return transformerModel.execute([
          contentTensor,
          styleBottleneck,
        ]) as tf.Tensor;
      });

      await renderToCanvas(stylized, canvasRef.current);
      stylized.dispose();
    } catch (err) {
      console.error("Error during style transfer:", err);
    } finally {
      tf.dispose([contentTensor, styleTensor]);
      setProcessing(false);
    }
  };

  return (
    <div className={s["output-container"]}>
      <canvas ref={canvasRef} className={s["canvas-preview"]} />
      {!styleImageUrl && (
        <p className={s.warningText}>Please select a style to proceed.</p>
      )}

      <div className={s.controls}>
        <button
          onClick={applyStyleTransfer}
          disabled={
            !predictorModel ||
            !transformerModel ||
            !contentImage ||
            !styleImageUrl ||
            processing
          }>
          {processing ? "Generating..." : "Generate Avatar"}
        </button>

        <label>
          Format:
          <select
            value={downloadFormat}
            onChange={(e) =>
              setDownloadFormat(e.target.value as "png" | "jpeg")
            }>
            <option value="png">PNG</option>
            <option value="jpeg">JPEG</option>
          </select>
        </label>

        <button
          onClick={() =>
            downloadCanvasImage(canvasRef.current, downloadFormat)
          }>
          Download Avatar
        </button>
      </div>
    </div>
  );
}

// Helpers

const resizeImage = (img: HTMLImageElement, size = 256): HTMLImageElement => {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  ctx.drawImage(img, 0, 0, size, size);
  const resized = new Image();
  resized.src = canvas.toDataURL();
  return resized;
};

const loadImageFromFile = (file: File): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(resizeImage(img));
    img.src = URL.createObjectURL(file);
  });
};

const loadImageFromUrl = (url: string): Promise<HTMLImageElement> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(resizeImage(img));
    img.src = url;
  });
};

const imageToTensor = (img: HTMLImageElement): tf.Tensor4D => {
  const tensor = tf.browser.fromPixels(img).toFloat();
  return tensor.expandDims(0).div(tf.scalar(255));
};

const renderToCanvas = async (tensor: tf.Tensor, canvas: HTMLCanvasElement) => {
  const [height, width] = tensor.shape.slice(1, 3);
  canvas.width = width;
  canvas.height = height;
  await tf.browser.toPixels(tensor.squeeze(), canvas);
};

const downloadCanvasImage = (
  canvas: HTMLCanvasElement | null,
  format: "png" | "jpeg"
) => {
  if (!canvas) return;
  const mimeType = `image/${format}`;
  const dataURL = canvas.toDataURL(mimeType);
  const link = document.createElement("a");
  link.href = dataURL;
  link.download = `stylized-avatar.${format}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
