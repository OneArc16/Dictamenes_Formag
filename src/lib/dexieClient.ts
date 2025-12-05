// src/lib/dexieClient.ts
import Dexie, { Table } from 'dexie';

/** Borrador genérico (antecedentes, etc.) que ya usas */
export type DictamenDraft = {
  id: number;          // dictamenId
  data: any;           // objeto con campos del draft (antecedentes, etc.)
  updatedAt: number;
};

/** Fila de cada diagnóstico en el borrador local */
export type DiagnosticoRowDraft = {
  id: string; // id local de la fila, por ejemplo "row-1-123456"
  cie10Codigo?: string;
  cie10Label?: string;
  tipo:
    | 'CONFIRMADO_NUEVO'
    | 'IMPRESION_DIAGNOSTICA'
    | 'CONFIRMADO_REPETIDO';
};

/** Borrador local de diagnósticos por dictamen */
export type DictamenDiagnosticosDraft = {
  id: number; // dictamenId
  diagnosticos: DiagnosticoRowDraft[];
  updatedAt: number;
};

export class AppDB extends Dexie {
  dictamenDrafts!: Table<DictamenDraft, number>;
  dictamenDiagnosticosDrafts!: Table<DictamenDiagnosticosDraft, number>;

  constructor() {
    super('dictamenDb');

    // ⚠️ IMPORTANTE: si antes solo tenías dictamenDrafts en version(1),
    // debes subir la versión para agregar la nueva tabla.
    this.version(1).stores({
      dictamenDrafts: 'id',
    });

    this.version(2).stores({
      dictamenDrafts: 'id',
      dictamenDiagnosticosDrafts: 'id',
    });
  }
}

export const db = new AppDB();
