export interface UserLogs {
  _id: string;
  userId: string;
  username: string;
  description: string;
  module?: Date;
  createdAt: string;
}

export interface UserLogsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  createdAt?: string;
}

export interface UserLogsResponse {
  data: UserLogs[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}