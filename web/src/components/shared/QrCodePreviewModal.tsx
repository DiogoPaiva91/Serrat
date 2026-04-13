import { useRef, useCallback } from "react";
import { QRCodeCanvas } from "qrcode.react";
import { Download } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface QrCodePreviewModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrData: {
    idCodigo: string;
    idNome: string;
    company?: string;
    address?: string;
  } | null;
}

export function QrCodePreviewModal({ open, onOpenChange, qrData }: QrCodePreviewModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handleDownload = useCallback(() => {
    if (!printRef.current || !qrData) return;

    const scale = 3;
    const width = 400;
    const height = 560;
    const canvas = document.createElement("canvas");
    canvas.width = width * scale;
    canvas.height = height * scale;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(scale, scale);

    const drawContent = (logoImg?: HTMLImageElement) => {
      // Background
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.roundRect(0, 0, width, height, 16);
      ctx.fill();

      // Border
      ctx.strokeStyle = "#1e3a5f";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(8, 8, width - 16, height - 16, 12);
      ctx.stroke();

      // Header background
      ctx.fillStyle = "#1e3a5f";
      ctx.beginPath();
      ctx.roundRect(8, 8, width - 16, 70, [12, 12, 0, 0]);
      ctx.fill();

      // Logo image or text fallback
      if (logoImg) {
        const logoH = 40;
        const logoW = (logoImg.naturalWidth / logoImg.naturalHeight) * logoH;
        ctx.drawImage(logoImg, (width - logoW) / 2, 22, logoW, logoH);
      } else {
        ctx.fillStyle = "#f59e0b";
        ctx.font = "bold 30px Arial, sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("SERRAT", width / 2, 52);
      }

      // QR Code
      const qrCanvas = printRef.current!.querySelector("canvas");
      if (qrCanvas) {
        const qrSize = 240;
        ctx.drawImage(qrCanvas, (width - qrSize) / 2, 95, qrSize, qrSize);
      }

      // Cabin ID
      ctx.fillStyle = "#1e293b";
      ctx.font = "bold 26px Arial, sans-serif";
      ctx.textAlign = "center";
      ctx.fillText(qrData.idCodigo, width / 2, 370);

      // Cabin Name
      ctx.fillStyle = "#475569";
      ctx.font = "600 18px Arial, sans-serif";
      ctx.fillText(qrData.idNome, width / 2, 400);

      // Divider
      ctx.strokeStyle = "#e2e8f0";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(40, 420);
      ctx.lineTo(width - 40, 420);
      ctx.stroke();

      // Company
      if (qrData.company) {
        ctx.fillStyle = "#64748b";
        ctx.font = "12px Arial, sans-serif";
        ctx.fillText(qrData.company, width / 2, 445);
      }

      // Address
      if (qrData.address) {
        ctx.fillStyle = "#94a3b8";
        ctx.font = "11px Arial, sans-serif";
        const words = qrData.address.split(" ");
        let line = "";
        let y = 465;
        for (const word of words) {
          const test = line + word + " ";
          if (ctx.measureText(test).width > width - 80) {
            ctx.fillText(line.trim(), width / 2, y);
            line = word + " ";
            y += 16;
          } else {
            line = test;
          }
        }
        if (line.trim()) ctx.fillText(line.trim(), width / 2, y);
      }

      // Footer
      ctx.fillStyle = "#cbd5e1";
      ctx.font = "10px Arial, sans-serif";
      ctx.fillText("serrat.com.br", width / 2, height - 20);

      // Download
      const link = document.createElement("a");
      link.download = `QRCode-${qrData.idCodigo.replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    // Try to load the logo image for the PNG
    const logo = new Image();
    logo.crossOrigin = "anonymous";
    logo.onload = () => drawContent(logo);
    logo.onerror = () => drawContent();
    logo.src = "/serrat-logo.png";
  }, [qrData]);

  if (!qrData) return null;

  const qrValue = `${qrData.idCodigo}|${qrData.idNome}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden">
        <DialogTitle className="sr-only">QR Code - {qrData.idCodigo}</DialogTitle>

        {/* Preview card */}
        <div ref={printRef} className="flex flex-col items-center">
          {/* Sticker preview */}
          <div className="w-full bg-white border-2 border-[#1e3a5f] rounded-xl m-6 mb-0 max-w-[320px] mx-auto overflow-hidden">
            {/* Header with logo */}
            <div className="bg-[#1e3a5f] py-4 flex items-center justify-center">
              <img
                src="/serrat-logo.png"
                alt="Serrat"
                className="h-12 object-contain"
              />
            </div>

            {/* QR Code */}
            <div className="flex justify-center py-6 px-4">
              <QRCodeCanvas
                value={qrValue}
                size={220}
                level="H"
                marginSize={2}
              />
            </div>

            {/* Info */}
            <div className="text-center pb-4 px-4">
              <p className="text-xl font-bold text-slate-900 tracking-wide">{qrData.idCodigo}</p>
              <p className="text-base font-semibold text-slate-600 mt-1">{qrData.idNome}</p>
            </div>

            {/* Divider + company */}
            {qrData.company && (
              <div className="border-t border-slate-200 mx-6 py-3">
                <p className="text-[11px] text-slate-400 text-center">{qrData.company}</p>
                {qrData.address && (
                  <p className="text-[10px] text-slate-300 text-center mt-0.5 leading-tight">{qrData.address}</p>
                )}
              </div>
            )}

            {/* Footer */}
            <div className="bg-slate-50 py-2 border-t border-slate-100">
              <p className="text-[9px] text-slate-300 text-center">serrat.com.br</p>
            </div>
          </div>
        </div>

        {/* Download button */}
        <div className="p-6 pt-4">
          <Button
            onClick={handleDownload}
            className="w-full gap-2 bg-[#1e3a5f] hover:bg-[#162d4a] text-white h-12 text-base font-bold"
          >
            <Download className="h-5 w-5" />
            BAIXAR PNG
          </Button>
          <p className="text-[11px] text-muted-foreground text-center mt-2">
            Imagem em alta resolucao para impressao de adesivo
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
