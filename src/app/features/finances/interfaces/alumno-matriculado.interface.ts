export interface AlumnoMatriculadoDto {
  id: number;
  dni: string;
  fullName: string;
  gradoName: string;
  cursoId: number;
  pagos: PagosResDto[];
}

export interface PagosResDto {
  id: number;
  fechaLimite?: Date;
  descripcion?: string;
  monto?: number;
  montoTransporte?: number;
  tipoPlanilla: TipoPlanilla;
  tipoPago: TipoPago;
  estado: EstadoPago;
  seleccionado: boolean;
  referencia?: string;
}

export enum TipoPlanilla {
  Matricula = 0,
  Mensualidad = 1,
  Transporte = 2,
  Otros = 3
}

export enum EstadoPago {
  Pendiente = 0,
  Pagado = 1,
  Anulado = 2
}

export enum TipoPago {
  Efectivo = 0,
  Tarjeta = 1,
  Transferencia = 2
}
