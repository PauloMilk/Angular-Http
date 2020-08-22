import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map, tap, filter } from 'rxjs/operators';
import { Department } from './department';
import { DepartmentService } from './department.service';
import { Product } from './product';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  readonly url = 'http://localhost:3000/products';
  private productsSubject$: BehaviorSubject<Product[]> = new BehaviorSubject<Product[]>(null);
  private loaded: boolean = false;
  constructor(private http: HttpClient, private departmentService: DepartmentService) { }

  get(): Observable<Product[]> {
    if (!this.loaded) {
      combineLatest(
        this.http.get<Product[]>(this.url),
        this.departmentService.get()
      ).pipe(
        filter(([products, departments]) => products != null && departments != null),
        map(([products, departments]) => {
          for (const p of products) {
            const ids = (p.departments as string[]);
            p.departments = ids.map((id) => departments.find(dep => dep._id === id));
          }
          return products;
        })
      ).subscribe(this.productsSubject$);
      this.loaded = true;
    }
    return this.productsSubject$.asObservable();
  }

  add(prod: Product): Observable<Product> {
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http.post<Product>(this.url, { ...prod, departments })
      .pipe(
        tap((p) => {
          this.productsSubject$.getValue().push({ ...prod, _id: p._id });
        })
      );
  }

  delete(prod: Product): Observable<any> {
    return this.http.delete(`${this.url}/${prod._id}`)
      .pipe(
        tap(() => {
          let products = this.productsSubject$.getValue();
          const i = products.findIndex(x => x._id === prod._id);
          if (i >= 0) {
            products.splice(i, 1);
          }
        })
      );
  }

  update(prod: Product): Observable<Product> {
    let departments = (prod.departments as Department[]).map(d => d._id);
    return this.http.patch<Product>(`${this.url}/${prod._id}`, { ...prod, departments })
      .pipe(
        tap((p) => {
          let products = this.productsSubject$.getValue();
          const i = products.findIndex(x => x._id === prod._id);
          if (i >= 0) {
            products[i] = prod;
          }
        })
      );
  }
}
