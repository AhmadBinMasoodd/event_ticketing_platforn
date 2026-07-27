class ApiFeature{
    constructor(query,queryString){
        this.query=query;
        this.queryString=queryString
    }

    //search
    search(searchField=[]){
        if(this.queryString.search && searchField.length>0){
            const keyword=this.queryString.search;
            this.query=this.query.find({
                $or:searchField.map((field)=>({
                    [field]:{
                        $regex:keyword,
                        $options:"i"
                    }
                }))
            })
            return this;
        }
        return this;
    }

    //Filtering
    filter(){
        const queryObj={...this.queryString};
        const excludedFields=[
            "page",
            "limit",
            "sort",
            "order",
            "search"
        ]
        excludedFields.forEach((field)=>delete queryObj[field]);
        this.query=this.query.find(queryObj);
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
        const page=Number(this.queryString.page) || 1;
        const limit=Number(this.queryString.limit) || 10;
        const skip=(page-1)*limit;

        this.query=this.query.skip(skip).limit(limit);
        return this;
    }
}
export default ApiFeature;