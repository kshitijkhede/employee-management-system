import { Component, OnInit } from '@angular/core';
import { Employee } from '../../models/employee';
import { EmployeeService } from '../../services/employee.service';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.css'],
})
export class EmployeeListComponent implements OnInit {
  employees: Employee[] = [];
  loading = false;
  error = '';
  successMessage = '';
  searchTerm = '';

  constructor(private employeeService: EmployeeService) {}

  ngOnInit(): void {
    this.loadEmployees();
  }

  loadEmployees(): void {
    this.loading = true;
    this.error = '';
    this.employeeService.getAll().subscribe({
      next: (data) => {
        this.employees = data;
        this.loading = false;
      },
      error: (err) => {
        this.error = this.readError(err, 'Could not load employees. Is the backend running?');
        this.loading = false;
      },
    });
  }

  get filteredEmployees(): Employee[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.employees;
    return this.employees.filter(
      (e) =>
        e.name.toLowerCase().includes(term) ||
        e.email.toLowerCase().includes(term) ||
        e.department.toLowerCase().includes(term) ||
        e.designation.toLowerCase().includes(term)
    );
  }

  deleteEmployee(employee: Employee): void {
    if (!employee.id) return;
    const ok = confirm(`Delete "${employee.name}"? This cannot be undone.`);
    if (!ok) return;

    this.employeeService.delete(employee.id).subscribe({
      next: () => {
        this.employees = this.employees.filter((e) => e.id !== employee.id);
        this.flash(`"${employee.name}" was deleted.`);
      },
      error: (err) => {
        this.error = this.readError(err, 'Failed to delete employee.');
      },
    });
  }

  private flash(message: string): void {
    this.successMessage = message;
    setTimeout(() => (this.successMessage = ''), 3000);
  }

  private readError(err: any, fallback: string): string {
    return err?.error?.message || fallback;
  }
}
