"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
var InterfaceDescriminator;
(function (InterfaceDescriminator) {
    InterfaceDescriminator[InterfaceDescriminator["IOneToManyDbMapping"] = 0] = "IOneToManyDbMapping";
    InterfaceDescriminator[InterfaceDescriminator["IOneToOneDbMapping"] = 1] = "IOneToOneDbMapping";
    InterfaceDescriminator[InterfaceDescriminator["IOneToOneMapping"] = 2] = "IOneToOneMapping";
    InterfaceDescriminator[InterfaceDescriminator["IOneToManyMapping"] = 3] = "IOneToManyMapping";
    InterfaceDescriminator[InterfaceDescriminator["ISimpleMapping"] = 4] = "ISimpleMapping";
})(InterfaceDescriminator = exports.InterfaceDescriminator || (exports.InterfaceDescriminator = {}));
var MappingType;
(function (MappingType) {
    MappingType[MappingType["string"] = 0] = "string";
    MappingType[MappingType["number"] = 1] = "number";
    MappingType[MappingType["boolean"] = 2] = "boolean";
    MappingType[MappingType["date"] = 3] = "date";
})(MappingType = exports.MappingType || (exports.MappingType = {}));
class ReflectionHelper {
    static getMappedProperties(type) {
        var mappedProperties = Reflect.getMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, type.prototype);
        return mappedProperties;
    }
    static getTableName(type) {
        var typeMetaData = Reflect.getMetadata(ReflectionHelper.TYPE_META_KEY, type);
        return typeMetaData.table;
    }
    static getSimpleMappedProperties(type) {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var simpleProps = ownKeys.filter(ok => mappedProperties[ok].descriminator == InterfaceDescriminator.ISimpleMapping);
        var simpleMappedProps = {};
        for (let sp of simpleProps) {
            simpleMappedProps[sp] = mappedProperties[sp];
        }
        return simpleMappedProps;
    }
    static getOneToManyMappedProperties(type) {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var oneToManyProps = ownKeys.filter(ok => mappedProperties[ok].descriminator == InterfaceDescriminator.IOneToManyMapping);
        var oneToManyMappedProps = {};
        for (let sp of oneToManyProps) {
            oneToManyMappedProps[sp] = mappedProperties[sp];
        }
        return oneToManyMappedProps;
    }
    static getOneToOneMappedProperties(type) {
        var mappedProperties = this.getMappedProperties(type);
        var ownKeys = Reflect.ownKeys(mappedProperties).map(x => x.toString());
        var oneToOneProps = ownKeys.filter(ok => mappedProperties[ok].descriminator == InterfaceDescriminator.IOneToOneMapping);
        var oneToOneMappedProps = {};
        for (let sp of oneToOneProps) {
            oneToOneMappedProps[sp] = mappedProperties[sp];
        }
        return oneToOneMappedProps;
    }
    static getMappingsByType(type, descriminator) {
        let mappedProperties = ReflectionHelper.getMappedProperties(type);
        let mappings = Reflect.ownKeys(mappedProperties).map(x => mappedProperties[x.toString()]).filter(x => x.descriminator == descriminator);
        return mappings;
    }
    static getPrimaryDbKey(type) {
        var simpleMappedProps = this.getMappingsByType(type, InterfaceDescriminator.ISimpleMapping);
        var primaryDbKey = simpleMappedProps.find(x => x.isPrimaryKey).dbColumnName;
        return primaryDbKey;
    }
}
exports.ReflectionHelper = ReflectionHelper;
ReflectionHelper.PROPERTY_METADATA_KEY = Symbol("propertyMetadata");
ReflectionHelper.TYPE_META_KEY = Symbol("typeMetadata");
function Table(tableName) {
    return (target) => {
        // Pull the existing metadata or create an empty object
        const allMetadata = (Reflect.getMetadata(ReflectionHelper.TYPE_META_KEY, target)
            ||
                {});
        allMetadata["table"] = tableName;
        // Update the metadata
        Reflect.defineMetadata(ReflectionHelper.TYPE_META_KEY, allMetadata, target);
    };
}
exports.Table = Table;
function Mapped(mapping) {
    return (target, propertyKey) => {
        // Pull the existing metadata or create an empty object
        const allMetadata = (Reflect.getMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, target)
            ||
                {});
        allMetadata[propertyKey] = mapping;
        // Update the metadata
        Reflect.defineMetadata(ReflectionHelper.PROPERTY_METADATA_KEY, allMetadata, target);
    };
}
exports.Mapped = Mapped;
//# sourceMappingURL=reflection.js.map