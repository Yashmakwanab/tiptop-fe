export interface Menu {
    _id?: string;
    tempId: string;
    name: string;
    icon: string;
    path: string;
    order: number;
    groupTitle?: boolean;
    level?: number;
    pro?: boolean;
    parentId?: string;
    subItems: Menu[];
}

export interface MenuQueryParams {
    page?: number;
    limit?: number;
    search?: string;
    work_status?: string;
    category?: string;
}

export interface MenuResponse {
    data: Menu[];
    pagination: {
        total: number;
        page: number;
        limit: number;
        totalPages: number;
    };
}