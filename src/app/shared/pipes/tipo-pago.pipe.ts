import { Pipe, PipeTransform } from "@angular/core";
import { TipoPago } from "../../features/finances/interfaces/alumno-matriculado.interface";

@Pipe({ name: 'tipoPago', standalone: true })

export class TipoPagoPipe implements PipeTransform {
  transform(value: TipoPago): string {
    return TipoPago[value];
  }
}