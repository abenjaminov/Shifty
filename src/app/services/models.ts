export enum ServiceState {
    loading,
    ready,
    error
}

export interface IShService<T> {
    state: ServiceState;
    load(): Promise<T[]>;
}