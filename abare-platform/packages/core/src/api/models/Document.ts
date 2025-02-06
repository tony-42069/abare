/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
export type Document = {
    id: string;
    name: string;
    type: Document.type;
    url: string;
    propertyId?: string;
    uploadedAt?: string;
    processingStatus?: Document.processingStatus;
};
export namespace Document {
    export enum type {
        LEASE = 'lease',
        OPERATING_STATEMENT = 'operating_statement',
        RENT_ROLL = 'rent_roll',
        OTHER = 'other',
    }
    export enum processingStatus {
        PENDING = 'pending',
        PROCESSING = 'processing',
        COMPLETED = 'completed',
        FAILED = 'failed',
    }
}

