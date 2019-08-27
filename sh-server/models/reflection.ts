import 'reflect-metadata';

export interface IMappedPropertiesMetaData {
    [jsonPropName: string] : string | any
}

export interface IComplexDbMapping {
    sourceTable: string;
    sourceProp: string;
    sourceAlias: string;
    sourceAdditionalData: string[];

    connTable:string;
    connAlias:string;
    connToSourceProp:string;

    connToMainProp:string;
}

export interface IComplexMapping {
    property:string;
    sourceType: string;
    db: IComplexDbMapping;
    toItemsMap: (primaryKeyValues:string[] | number[], items:any[]) => Map<string,any[]>;
}

export interface IMapping {
    dbColumnName: string;
    type:MappingType;
    isPrimaryKey?:boolean;
}

export enum MappingType {
    string,
    number,
    boolean
}

export class ReflectionHelper {
    static PROPERTY_METADATA_KEY = Symbol("propertyMetadata");
    static TYPE_META_KEY = Symbol("typeMetadata");

    static getMappedProperties(type: Function): IMappedPropertiesMetaData {
        var mappedProperties = Reflect.getMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, type.prototype);

        return mappedProperties;
    }

    static getTableName(type: Function): string {
        var typeMetaData = Reflect.getMetadata(ReflectionHelper.TYPE_META_KEY, type);

        return typeMetaData.table;
    }

    static getSimpleMappedProperties(type: Function) {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var simpleProps = ownKeys.filter(ok => mappedProperties[ok].dbColumnName)

        var simpleMappedProps: IMappedPropertiesMetaData = {};

        for(let sp of simpleProps) {
            simpleMappedProps[sp] = mappedProperties[sp];
        }

        return simpleMappedProps;
    }

    static getComplexMappedProperties(type: Function) {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var simpleProps = ownKeys.filter(ok => mappedProperties[ok].property)

        var simpleMappedProps: IMappedPropertiesMetaData = {};

        for(let sp of simpleProps) {
            simpleMappedProps[sp] = mappedProperties[sp];
        }

        return simpleMappedProps;
    }
}

export function Table(tableName: string) {
    return (target:any) => {
        // Pull the existing metadata or create an empty object
        const allMetadata = (
            Reflect.getMetadata(ReflectionHelper.TYPE_META_KEY, target)
            ||
            {}
        );
        
        allMetadata["table"] = tableName;

        // Update the metadata
        Reflect.defineMetadata(
            ReflectionHelper.TYPE_META_KEY,
            allMetadata,
            target,
        );
    }
}

export function Mapped(mapping: IMapping | IComplexMapping) {
    return (target: any, propertyKey: string | symbol) => {
        // Pull the existing metadata or create an empty object
        const allMetadata = (
            Reflect.getMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, target)
            ||
            {}
        );
        
        allMetadata[propertyKey] = mapping;

        // Update the metadata
        Reflect.defineMetadata(
            ReflectionHelper.PROPERTY_METADATA_KEY,
            allMetadata,
            target,
        );
    }
}