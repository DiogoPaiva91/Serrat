import { supabase } from "@/lib/supabase";
import { compressImage } from "@/lib/image";

export const COMPANY_LOGOS_BUCKET = "company-logos";

/** Extensao a partir do mime, para o arquivo abrir certo em qualquer visualizador. */
function extensaoDe(mime: string) {
  if (mime === "image/png") return "png";
  if (mime === "image/webp") return "webp";
  if (mime === "image/svg+xml") return "svg";
  return "jpg";
}

/**
 * Sobe o logo e devolve a URL publica.
 * O caminho tem um sufixo aleatorio para nao esbarrar no cache do CDN quando a
 * empresa troca de logo mantendo o mesmo id.
 */
export async function uploadCompanyLogo(file: File, companyId: string): Promise<string> {
  const img = await compressImage(file, { maxSide: 512, quality: 0.85 });
  const path = `${companyId}/${crypto.randomUUID()}.${extensaoDe(img.mime)}`;

  const { error } = await supabase.storage
    .from(COMPANY_LOGOS_BUCKET)
    .upload(path, img.blob, { contentType: img.mime, upsert: false });

  if (error) {
    // Mensagem crua do Storage nao ajuda quem esta na tela.
    if (/bucket not found/i.test(error.message)) {
      throw new Error("O bucket company-logos ainda nao existe. Aplique a migration 006_company_logo.sql.");
    }
    throw error;
  }

  const { data } = supabase.storage.from(COMPANY_LOGOS_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Apaga o arquivo antigo quando o logo e trocado ou removido.
 * URL externa (colada a mao) nao pertence ao bucket, entao e ignorada.
 * Falha aqui nao derruba o salvamento: sobra um arquivo orfao, nada mais.
 */
export async function deleteCompanyLogo(publicUrl: string | null | undefined): Promise<void> {
  if (!publicUrl) return;
  const marcador = `/${COMPANY_LOGOS_BUCKET}/`;
  const i = publicUrl.indexOf(marcador);
  if (i === -1) return;
  const path = publicUrl.slice(i + marcador.length);
  await supabase.storage.from(COMPANY_LOGOS_BUCKET).remove([path]);
}
