export function toUtcDate(date: Date) {
    return new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
}

export function getHttpResposeJson(data? : any, clearClientCache?:boolean) {
    return {
        status: 200,
        data: data,
        clearCache: clearClientCache != undefined && clearClientCache
    }
}

export function getHttpResponseError() {

}