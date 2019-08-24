export enum ServiceState {
    loading = "loading",
    ready = "ready",
    error = "error"
}

export interface IShService<T> {
    state: ServiceState;
    load(): Promise<T[]>;
}