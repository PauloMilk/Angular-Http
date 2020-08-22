import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators, NgForm } from '@angular/forms';
import { Department } from '../department';
import { Product } from '../product';
import { DepartmentService } from './../department.service';
import { ProductService } from './../product.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css']
})
export class ProductComponent implements OnInit, OnDestroy {
  productForm: FormGroup = this.fb.group({
    _id: [null],
    name: ['', [Validators.required]],
    stock: [0, [Validators.required, Validators.min(0)]],
    price: [0, [Validators.required, Validators.min(0)]],
    departments: [[], [Validators.required, Validators.minLength(1)]]
  });

  @ViewChild('form') form: NgForm;
  private unsubscribe$: Subject<any> = new Subject<any>();
  products: Product[] = [];
  departments: Department[] = [];
  constructor(
    private productService: ProductService,
    private fb: FormBuilder,
    private departmentService: DepartmentService,
    private snack: MatSnackBar) { }

  ngOnInit(): void {
    this.productService.get()
    .pipe( takeUntil(this.unsubscribe$))
    .subscribe((prods) => this.products = prods);
    this.departmentService.get()
    .pipe( takeUntil(this.unsubscribe$))
    .subscribe((deps) => this.departments = deps);
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
  }

  save(): void {
    let data = this.productForm.value;
    if (data._id != null) {
      this.productService.update(data)
        .subscribe(
          () => this.notify('Updated!'),
          (err) => console.log
        );
    } else {
      this.productService.add(data)
        .subscribe(
          () => this.notify('Saved!'),
          (err) => console.log
        );
    }
    this.resetForm();
  }

  delete(prod: Product): void {
    this.productService.delete(prod)
      .subscribe(
        () => this.notify('Deleted!'),
        (err) => console.log
      );
  }

  edit(prod: Product): void {
    this.productForm.setValue(prod);
  }

  notify(msg: string): void {
    this.snack.open(msg, 'OK', {duration: 3000});
  }

  resetForm(): void {
    this.form.resetForm();
  }

}
