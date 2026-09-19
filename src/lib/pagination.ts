export type PaginationInfos = {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
};

export function calculateSkip(page: number, limit: number): number {
    const skip = (page - 1) * limit;

    return skip;
}

export function buildPaginationInfos(page: number, limit: number, total: number): PaginationInfos {
    const totalPages = Math.ceil(total / limit);

    return {
        page,
        limit,
        total,
        totalPages,
    };
}
