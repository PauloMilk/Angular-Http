import { DepartmentService } from './../department.service';
import { Department } from './../department';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-department',
  templateUrl: './department.component.html',
  styleUrls: ['./department.component.css']
})
export class DepartmentComponent implements OnInit, OnDestroy {
  depName: string = '';
  departments: Department[] = [];
  private unsubcribe$: Subject<any> = new Subject();
  depEdit: Department = null;
  constructor(private departmentService: DepartmentService, private snackBar: MatSnackBar) { }

  ngOnInit(): void {
    this.departmentService.get()
      .pipe(takeUntil(this.unsubcribe$))
      .subscribe(
        (deps) => {
          this.departments = deps;
        },
        (err) => console.log(err)
      );
  }

  ngOnDestroy(): void {
    this.unsubcribe$.next();
  }

  save(): void {
    if (this.depEdit) {
      this.departmentService.update({ name: this.depName, _id: this.depEdit._id })
        .subscribe(
          (dep) => {
            this.notify('Updated');
          },
          (err) => {
            this.notify('Error');
            console.log(err);
          }
        );
    } else {
      this.departmentService.add({ name: this.depName })
        .subscribe(
          (dep) => {
            this.notify('Saved');
            this.clearFilds();
          },
          (err) => {
            this.notify('Error');
            console.log(err);
          }
        );
    }
  }

  clearFilds(): void {
    this.depName = '';
    this.depEdit = null;
  }

  cancel(): void {
    this.clearFilds();
  }

  edit(dep: Department): void {
    this.depName = dep.name;
    this.depEdit = dep;
  }

  delete(dep: Department): void {
    this.departmentService.delete(dep)
      .subscribe(
        () => {
          this.notify('Removed');
        },
        (err) => {
          this.notify(err.error.msg);
          console.log(err);
        }
      );
  }

  notify(msg: string): void {
    this.snackBar.open(msg, 'OK', { duration: 3000 });
  }
}
