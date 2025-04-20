import { TipoPlanilla } from "./alumno-matriculado.interface";

export interface PagoDetalle {
    id: number;
    descripcion?: string;
    periodo: string;
    totalLinea: number;
    tipoPlanilla: TipoPlanilla;
    fecha: Date;
    alumnoId: number;
    cursoId: number;
  }