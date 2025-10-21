export interface MacAddress {
  _id?: string;
  name: string;
  address: string;
  created_by: string;
}

export interface MacAddressQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}

export interface MacAddressResponse {
  data: MacAddress[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}