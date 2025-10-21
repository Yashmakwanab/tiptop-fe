export interface IpAddress {
  _id?: string;
  name: string;
  address: string;
  created_by: string;
}

export interface IpAddressQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  created_by?: string;
}

export interface IpAddressResponse {
  data: IpAddress[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}