export interface Role {
    _id: string;
    name: string;
    isActive: boolean;
    permissions?: {
        _id: string;
        menuId: string;
        menuName: string;
    }[]
}

export interface RoleQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    work_status?: string;
    category?: string;
}

export interface RoleResponse {
    data: Role[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}