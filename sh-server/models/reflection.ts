import 'reflect-metadata';

export interface IMappedPropertiesMetaData {
    [jsonPropName: string] : string | any
}

export enum InterfaceDescriminator {
    IOneToManyDbMapping = 0,
    IOneToOneDbMapping = 1,
    IOneToOneMapping = 2,
    IOneToManyMapping = 3,
    ISimpleMapping = 4
}

/**
 * source[sourceProp] > connection[connToSourceProp]
 * connection[connectionToMainProp] > main[primaryKey]
 */
export interface IOneToManyDbMapping {
    descriminator: InterfaceDescriminator.IOneToManyDbMapping;
    sourceTable: string;
    sourceProp: string;
    sourceAlias: string;
    sourceAdditionalData: string[];

    connTable:string;
    connAlias:string;
    connToSourceProp:string;

    connToMainProp:string;
}

export interface IOneToOneDbMapping {
    descriminator: InterfaceDescriminator.IOneToOneDbMapping;
    sourceTable: string;
    sourceProp: string;
    mainProp: string;
    sourceAlias: string;
    sourceAdditionalData: string[];
}

export interface IOneToOneMapping {
    descriminator: InterfaceDescriminator.IOneToOneMapping;
    jsonProperty: string,
    sourceType: string,
    db: IOneToOneDbMapping;
    toItemMap: (primaryKeyValues:string[] | number[], items:any[], alias?:string) => Map<string | number,any>;
}

export interface IOneToManyMapping {
    descriminator: InterfaceDescriminator.IOneToManyMapping;
    jsonProperty:string;
    sourceType: string;
    db: IOneToManyDbMapping;
    toItemsMap: (primaryKeyValues:string[] | number[], items:any[]) => Map<string | number,any[]>;
}

export interface ISimpleMapping {
    descriminator: InterfaceDescriminator.ISimpleMapping;
    dbColumnName: string;
    type:MappingType;
    isPrimaryKey?:boolean;
}

export enum MappingType {
    string,
    number,
    boolean,
    date
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

    static getSimpleMappedProperties(type: Function): {[jsonPropName: string] : ISimpleMapping} {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var simpleProps = ownKeys.filter(ok => mappedProperties[ok].descriminator == InterfaceDescriminator.ISimpleMapping)

        var simpleMappedProps: IMappedPropertiesMetaData = {};

        for(let sp of simpleProps) {
            simpleMappedProps[sp] = mappedProperties[sp];
        }

        return simpleMappedProps;
    }

    static getOneToManyMappedProperties(type: Function): {[jsonPropName: string] : IOneToManyMapping} {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var oneToManyProps = ownKeys.filter(ok => mappedProperties[ok].descriminator == InterfaceDescriminator.IOneToManyMapping)

        var oneToManyMappedProps: IMappedPropertiesMetaData = {};

        for(let sp of oneToManyProps) {
            oneToManyMappedProps[sp] = mappedProperties[sp];
        }

        return oneToManyMappedProps;
    }

    static getOneToOneMappedProperties(type: Function): {[jsonPropName: string] : IOneToManyMapping} {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var oneToOneProps = ownKeys.filter(ok => mappedProperties[ok].descriminator == InterfaceDescriminator.IOneToOneMapping)

        var oneToOneMappedProps: IMappedPropertiesMetaData = {};

        for(let sp of oneToOneProps) {
            oneToOneMappedProps[sp] = mappedProperties[sp];
        }

        return oneToOneMappedProps;
    }

    static getMappingsByType(type: Function, descriminator: InterfaceDescriminator){
        let mappedProperties = ReflectionHelper.getMappedProperties(type);
        let mappings = Reflect.ownKeys(mappedProperties).map(x => mappedProperties[x.toString()]).filter(x => x.descriminator == descriminator);

        return mappings;
    }

    static getPrimaryDbKey(type: Function): string {
        var simpleMappedProps = this.getMappingsByType(type, InterfaceDescriminator.ISimpleMapping);

        var primaryDbKey:string = simpleMappedProps.find(x => x.isPrimaryKey).dbColumnName;

        return primaryDbKey;
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

export function Mapped(mapping: ISimpleMapping | IOneToManyMapping | IOneToOneMapping) {
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