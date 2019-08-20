export class ModuleConfiguration {
    constructor(public tableName:string ) {

    }

    get selectAllQuery() {
        return "SELECT * FROM " + this.tableName;
    }

    selectQuery(...fields: string[]) {
        var joinedFields = fields.join(', ');

        return "SELECT " + joinedFields + " FROM " + this.tableName;
    }
}

export class DataBaseConfig {
    Profiles!: ModuleConfiguration;   
}

var ShConfig = new DataBaseConfig();
ShConfig.Profiles = new ModuleConfiguration("Profiles");

export { ShConfig };