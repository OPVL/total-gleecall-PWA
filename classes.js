class Entity{
    constructor(json){
        console.log(json);
    }
}

class ClientCorporation extends Entity{

    constructor(_json){
        super(_json);

        this.name = _json.name;
        this.status = _json.status;
        this.website = _json.companyURL || null;
    }
}
