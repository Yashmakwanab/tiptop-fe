export interface Employee {
  _id?: string;
  firstName: string;
  lastName: string;
  emailAddress: string;
  password?: string;
  associates: string;
  role: string | {
    permissions: { menuId: string }[];
  };
  full_name: string;
  user_name: string;
  user_name_id: string;
  address: string;
  country: string;
  user_email: string;
  user_phone: string;
  emergency_contact_name?: string;
  emergency_contact: string;
  relationship: string;
  aadhar_no?: string;
  google_play_id?: string;
  bank_name: string;
  bank_account_no: string;
  bank_ifsc_no: string;
  joining_date: string;
  work_status: string;
  resigned_date?: string;
  monthlySalary: string;
  date_of_birth: string;
  identityProofDoc?: string;
  workExperienceDoc?: string;
  educationCertificateDoc?: string;
  paySlipsDoc?: string;
  category: string;
  is_deleted: boolean;
  isSuperAdmin: boolean;
  isActive: boolean;
  created_by: string;
  updated_by: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmployeeQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  work_status?: string;
  category?: string;
}

export interface EmployeeResponse {
  data: Employee[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface EmployeeStatistics {
  total: number;
  working: number;
  resigned: number;
  superAdmins: number;
}