/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Tenant } from './Tenant';
export type Property = {
    id: string;
    name: string;
    address: string;
    propertyType?: Property.propertyType;
    squareFeet?: number;
    yearBuilt?: number;
    tenants?: Array<Tenant>;
};
export namespace Property {
    export enum propertyType {
        OFFICE = 'office',
        RETAIL = 'retail',
        INDUSTRIAL = 'industrial',
        MULTIFAMILY = 'multifamily',
    }
}

