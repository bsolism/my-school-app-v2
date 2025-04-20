import { Routes } from "@angular/router";
import { CourseComponent } from "./course/course.component";
import { MatriculaDefinicionComponent } from "./matricula-definicion/matricula-definicion.component";


export const CoursesRoutes: Routes = [
    {
        path: '',
        children: [
            {
                path: 'grades',
                component: CourseComponent,
            },
            {
                path: 'matricula',
                component: MatriculaDefinicionComponent,
            }               
        ],
    }
    
]