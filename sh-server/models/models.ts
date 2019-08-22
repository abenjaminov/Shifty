import { Table, Mapped, MappingType } from "./reflection";

var profileProfessionsMapping = {
    property: "professions",
    sourceType: "Tag",
    db : {
        sourceTable: "Professions",
        sourceProp:"id", 
        sourceAlias: "prof",
        sourceAdditionalData: ["name"],

        connTable: "ProfilesProfessions", 
        connAlias: "PP",
        connToSourceProp: "ProfessionId",

        connToMainProp: "ProfileId",
    },
    toItemsMap: (primaryKeyValues: string[], results: any[]) => {
        var map: Map<string, Tag[]> = new Map<string, Tag[]>();

        for(let id of primaryKeyValues) {
            var professions = results.filter(x => x.id == id && x["prof_id"] != null);
            var tags = [];
            for(let prof of professions) {
                var tag = new Tag();
                tag.id = prof["prof_id"];
                tag.name = prof["prof_name"];

                tags.push(tag);
            }

            map.set(id, tags);
        }

        return map;
    }
}

@Table("Profiles")
export class Profile {
    @Mapped({ dbColumnName: "id", type: MappingType.string, isPrimaryKey:true }) id! : string;
    @Mapped({ dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
    @Mapped(profileProfessionsMapping) professions: Tag[] = [];
    profilePic:string = "";
}

@Table("Professions")
export class Tag {
    @Mapped({ dbColumnName: "id", type: MappingType.number, isPrimaryKey:true }) id! : number;
    @Mapped({ dbColumnName: "name", type: MappingType.string, isPrimaryKey:false }) name!: string;
}

export class Room {
    id!: number;
    name!: string;
    conditions: any[] = [];
}

export class TypesHelper {
    static typesMapping: {[typeName:string] : Function} = {"Tag" : Tag};
}