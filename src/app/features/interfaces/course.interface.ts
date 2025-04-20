export interface Course{
    id:number;
    courseName:string;
    courseDescription?:string;
    hasLimit:boolean;
    limit:number;
    isActive: boolean;
    cursosPrev:CursoPrev[]
}

export interface CursoPrev{
    id?:number;
    cursoId:number;
    CursoPrevioId: number;
}
export interface CursoMatricula extends Course{
    precio?:number;
    mensualidad?:number;
    grados?:GradosMatricula[];   
}

export interface GradosMatricula {
    matriculaId?:number;
    cursoId: number;
    precio:number;
}