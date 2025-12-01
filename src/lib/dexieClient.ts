'use client';

import Dexie, { Table } from 'dexie';

/** Lo que vamos a guardar como borrador del dictamen */
export interface DictamenDraft {
  /** Usaremos el id del dictamen como clave (o 0 si es uno nuevo) */
  id: number;
  /** JSON con todo el formulario/bloque que quieras persistir */
  data: any;
  /** Para saber la última vez que se guardó */
  updatedAt: number;
}

class DictamyDB extends Dexie {
  // nombreTabla!: Table<Tipo, ClavePrimaria>
  dictamenDrafts!: Table<DictamenDraft, number>;

  constructor() {
    super('DictamyDB');

    this.version(1).stores({
      // índice principal: id, extra: updatedAt
      dictamenDrafts: 'id, updatedAt',
    });
  }
}

export const db = new DictamyDB();
