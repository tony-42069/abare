/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Analysis = {
    id: string;
    propertyId: string;
    type: Analysis.type;
    status?: Analysis.status;
    results?: Record<string, any>;
    createdAt?: string;
    completedAt?: string;
};
export namespace Analysis {
    export enum type {
        FINANCIAL = 'financial',
        MARKET = 'market',
        TENANT = 'tenant',
    }
    export enum status {
        PENDING = 'pending',
        IN_PROGRESS = 'in_progress',
        COMPLETED = 'completed',
        FAILED = 'failed',
    }
}

