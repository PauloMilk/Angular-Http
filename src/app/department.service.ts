import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Department } from './department';
import { tap } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class DepartmentService {
  readonly url = 'http://localhost:3000/departments';
  constructor(private http: HttpClient) { }

  private departmentsSubject$: BehaviorSubject<Department[]> = new BehaviorSubject<Department[]>(null);
  private loaded: boolean = false;

  get(): Observable<Department[]> {
    if (!this.loaded) {
      this.http.get<Department[]>(this.url)
        .pipe(tap((deps) => console.log(deps)))
        .subscribe(this.departmentsSubject$);
      this.loaded = true;
    }
    return this.departmentsSubject$.asObservable();
  }

  add(dep: Department): Observable<Department> {
    return this.http.post<Department>(this.url, dep)
      .pipe(
        tap((depa: Department) => this.departmentsSubject$.getValue().push(depa))
      );
  }

  delete(dep: Department): Observable<any> {
    return this.http.delete(`${this.url}/${dep._id}`)
      .pipe(
        tap(() => {
          let departments = this.departmentsSubject$.getValue();
          let index = departments.findIndex(d => d._id === dep._id);
          if (index >= 0) {
            departments.splice(index, 1);
          }
        })
      );
  }

  update(dep: Department): Observable<Department> {
    return this.http.patch<Department>(`${this.url}/${dep._id}`, dep)
      .pipe(
        tap((d) => {
          let departments = this.departmentsSubject$.getValue();
          let index = departments.findIndex(dd => dd._id === d._id);
          if (index >= 0) {
            departments[index].name = d.name;
          }
        })
      );
  }
}
