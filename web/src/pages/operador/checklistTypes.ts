export type RespostaStatus = "ok" | "nao_ok" | "nao_aplica";

/** Foto comprimida que ainda so existe no aparelho. */
export interface FotoLocal {
  /** Sem o prefixo "data:image/jpeg;base64,". E o que vai no payload. */
  base64: string;
  mime: string;
  /** Object URL para mostrar a previa sem reprocessar. */
  previewUrl: string;
  bytes: number;
}

/** Nota de um item reprovado: vira uma linha em work_order_issues com o item vinculado. */
export interface NotaReprovado {
  descricao: string;
  foto: FotoLocal | null;
}

/** Anormalidade avulsa, sem item do checklist por tras (ex: peca quebrada). */
export interface AnormalidadeAvulsa {
  tempId: string;
  descricao: string;
  foto: FotoLocal | null;
}

/**
 * Formato exato que a Edge Function operador-finalizar-os (Fase 3) vai receber.
 * A simulacao do modo dev monta este mesmo objeto, entao o contrato ja fica
 * validado antes da funcao existir.
 */
export interface FinalizarPayload {
  qr_code_id: string | null;
  /** String crua do QR, para auditoria quando qr_code_id vem nulo. */
  qr_code_data: string;
  responsible_name: string;
  service_type_name: string | null;
  observation: string | null;
  status: "concluida" | "sem_acesso";
  latitude: number | null;
  longitude: number | null;
  geo_accuracy: number | null;
  completed_at: string;
  answers: { item_id: string; status: RespostaStatus }[];
  issues: {
    kind: "anormalidade" | "sem_acesso";
    checklist_item_id: string | null;
    description: string | null;
    photo_base64: string | null;
  }[];
}

export const MAX_ANORMALIDADES_AVULSAS = 3;
