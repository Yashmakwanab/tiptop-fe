export interface Roster {
  _id?: string;
  start_time: string;
  end_time: string;
  total_hrs: string;
  created_by: string;
  date_entered?: Date;
}

export interface RosterQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}

export interface RosterResponse {
  data: Roster[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}