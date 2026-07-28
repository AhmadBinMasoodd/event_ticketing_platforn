class ApiFeature{
    constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    this.page = Number(queryString.page) || 1;
    this.limit = Number(queryString.limit) || 10;
    this.queryObj = {};
}

    //search
    search(searchFields = []) {
        if (this.queryString.search && searchFields.length > 0) {

            const keyword = this.queryString.search;

            this.queryObj.$or = searchFields.map(field => ({
                [field]: {
                    $regex: keyword,
                    $options: "i"
                }
            }));

            this.query = this.query.find({
                $or: this.queryObj.$or
            });
        }

        return this;
    }

    //Filtering
    filter() {
        this.queryObj = { ...this.queryString };
        const excludedFields = [
            "page",
            "limit",
            "sort",
            "order",
            "search"
        ];
        excludedFields.forEach(field => delete this.queryObj[field]);
        this.query = this.query.find(this.queryObj);
        return this;
    }

    sort(){
        const sortBy=this.queryString.sort || "createdAt";
        const order = this.queryString.order === "asc" ? 1 : -1;
        this.query=this.query.sort({
            [sortBy]:order
        })
        return this;
    }

    paginate(){
        const skip=(this.page-1)*this.limit;

        this.query=this.query.skip(skip).limit(this.limit);
        return this;
    }
    getPagination(total) {
        const totalPages = Math.ceil(total / this.limit);

        return {
            total,
            page: this.page,
            limit: this.limit,
            totalPages,
            hasNextPage: this.page < totalPages,
            hasPrevPage: this.page > 1,
        };
    }

    getFilterQuery() {
        return this.queryObj;
    }
}
export default ApiFeature;