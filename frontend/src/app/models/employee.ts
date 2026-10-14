/** Shape of an employee record, matching the MySQL "employees" table. */
export interface Employee {
  id?: number;
  name: string;
  email: string;
  department: string;
  designation: string;
  salary: number;
  created_at?: string;
  updated_at?: string;
}
