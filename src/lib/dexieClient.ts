// src/lib/dexieClient.ts
import Dexie, { Table } from 'dexie';

export type DictamenDraft = {
  id: number;
  data: any;
  updatedAt: number;
};

export type DiagnosticoRowDraft = {
  id: string;
  cie10Codigo?: string;
  cie10Label?: string;
  tipo: 'CONFIRMADO_NUEVO' | 'IMPRESION_DIAGNOSTICA' | 'CONFIRMADO_REPETIDO';
};

export type DictamenDiagnosticosDraft = {
  id: number;
  diagnosticos: DiagnosticoRowDraft[];
  updatedAt: number;
};

// ✅ META para invalidar cache local cuando cambia el servidor
export type DictamenMeta = {
  id: number; // dictamenId
  serverVersion: string;
  updatedAt: number;
};

export class AppDB extends Dexie {
  dictamenDrafts!: Table<DictamenDraft, number>;
  dictamenDiagnosticosDrafts!: Table<DictamenDiagnosticosDraft, number>;
  dictamenMeta!: Table<DictamenMeta, number>;

  constructor() {
    super('dictamenDb');

    this.version(1).stores({
      dictamenDrafts: 'id',
    });

    this.version(2).stores({
      dictamenDrafts: 'id',
      dictamenDiagnosticosDrafts: 'id',
    });

    // ✅ subimos versión para incluir dictamenMeta
    this.version(3).stores({
      dictamenDrafts: 'id',
      dictamenDiagnosticosDrafts: 'id',
      dictamenMeta: 'id, serverVersion, updatedAt',
    });
  }
}

export const db = new AppDB();
