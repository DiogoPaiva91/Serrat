import { useRef, useState } from "react";
import { Camera, Loader2, RefreshCw, Trash2 } from "lucide-react";
import { compressImage } from "@/lib/image";
import type { FotoLocal } from "./checklistTypes";

interface FotoInputProps {
  foto: FotoLocal | null;
  onChange: (foto: FotoLocal | null) => void;
  label: string;
  obrigatoria?: boolean;
}

/**
 * Captura de foto sem biblioteca: input nativo com capture="environment" abre a
 * camera traseira no celular e o seletor de arquivo no desktop. A imagem e
 * reduzida no proprio aparelho antes de qualquer envio (foto de celular sai com
 * 3 a 8 MB, depois disso fica entre 150 e 300 KB).
 */
export function FotoInput({ foto, onChange, label, obrigatoria }: FotoInputProps) {
  const ref = useRef<HTMLInputElement>(null);
  const [processando, setProcessando] = useState(false);
  const [erro, setErro] = useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setErro("");
    setProcessando(true);
    try {
      const img = await compressImage(file, { maxSide: 1280, quality: 0.7 });
      if (foto) URL.revokeObjectURL(foto.previewUrl);
      onChange({ base64: img.base64, mime: img.mime, previewUrl: URL.createObjectURL(img.blob), bytes: img.bytes });
    } catch (err: any) {
      setErro(err?.message || "Nao foi possivel ler a foto");
    } finally {
      setProcessando(false);
    }
  };

  const remover = () => {
    if (foto) URL.revokeObjectURL(foto.previewUrl);
    onChange(null);
  };

  const btn: React.CSSProperties = {
    display: "inline-flex", alignItems: "center", gap: 6,
    border: "1.5px solid #e2e8f0", background: "#fff", borderRadius: 9,
    padding: "7px 11px", fontSize: 12, fontWeight: 700, color: "#475569", cursor: "pointer",
  };

  return (
    <div>
      <input ref={ref} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleFile} />
      {foto ? (
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <img src={foto.previewUrl} alt={label}
            style={{ width: 56, height: 56, objectFit: "cover", borderRadius: 9, border: "1px solid #e2e8f0", flexShrink: 0 }} />
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            <span style={{ fontSize: 11, color: "#64748b" }}>{Math.round(foto.bytes / 1024)} KB</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button type="button" style={btn} onClick={() => ref.current?.click()}>
                <RefreshCw size={13} /> Trocar
              </button>
              <button type="button" style={{ ...btn, color: "#dc2626" }} onClick={remover}>
                <Trash2 size={13} /> Remover
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button type="button" style={{ ...btn, borderColor: obrigatoria ? "#fdba74" : "#e2e8f0" }}
          disabled={processando} onClick={() => ref.current?.click()}>
          {processando ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {label}{obrigatoria ? " (obrigatória)" : " (opcional)"}
        </button>
      )}
      {erro && <p style={{ fontSize: 11, color: "#dc2626", margin: "6px 0 0" }}>{erro}</p>}
    </div>
  );
}
