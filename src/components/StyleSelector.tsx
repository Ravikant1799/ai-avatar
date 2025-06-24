import { useState } from "react";
import s from "./StyleSelector.module.scss";

type StyleOption = {
  label: string;
  url: string;
};

type StyleSelectorProps = {
  styles: StyleOption[];
  onStyleSelect: (url: string) => void;
};

export default function StyleSelector({
  styles,
  onStyleSelect,
}: StyleSelectorProps) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleClick = (url: string) => {
    setSelected(url);
    onStyleSelect(url);
  };

  return (
    <div className={s.grid}>
      {styles.map(({ url, label }) => (
        <div key={url} className={s.item}>
          <img
            src={url}
            alt={label}
            onClick={() => handleClick(url)}
            className={`${s.thumbnail} ${selected === url ? s.selected : ""}`}
          />
          <p className={s.label}>{label}</p>
        </div>
      ))}
    </div>
  );
}
