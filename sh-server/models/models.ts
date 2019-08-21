import { Mapped, Table } from "../database/database";
import { stringify } from "querystring";

@Table("Profiles")
export class Profile {
    @Mapped("P;id") id! : string;
    @Mapped("R;name") name!: string;
    @Mapped({
        property: "professions",
        db : {
            sourceTable: "Professions",
            sourceProp:"id", 
            sourceAlias: "prof",
            sourceAdditionalData: ["name"],

            connTable: "ProfilesProfessions", 
            connAlias: "PP",
            connToSourceProp: "ProfessionId",

            connToMainProp: "ProfileId"
        },
        toItemsMap: (primaryKeys: string[], results: any[]) => {
            var map: Map<string, Tag[]> = new Map<string, Tag[]>();

            for(let id of primaryKeys) {
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
    }) professions: Tag[] = [];
    profilePic:string = "";
}

export class Tag {
    id!: number;
    name!: string;
}

export class Room {
    id!: number;
    name!: string;
    conditions: any[] = [];
}

export const typeMaps = {
    "Tag" : Tag
}