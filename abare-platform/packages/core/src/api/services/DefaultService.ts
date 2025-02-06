/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Analysis } from '../models/Analysis';
import type { Document } from '../models/Document';
import type { Property } from '../models/Property';
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';
export class DefaultService {
    /**
     * List properties
     * @returns Property List of properties
     * @throws ApiError
     */
    public static getProperties(): CancelablePromise<Array<Property>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/properties',
        });
    }
    /**
     * Create property
     * @param requestBody
     * @returns any Property created
     * @throws ApiError
     */
    public static postProperties(
        requestBody: Property,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/properties',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get property details
     * @param propertyId
     * @returns Property Property details
     * @throws ApiError
     */
    public static getProperties1(
        propertyId: string,
    ): CancelablePromise<Property> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/properties/{propertyId}',
            path: {
                'propertyId': propertyId,
            },
        });
    }
    /**
     * Upload document
     * @param formData
     * @returns Document Document uploaded
     * @throws ApiError
     */
    public static postDocuments(
        formData: {
            file?: Blob;
            propertyId?: string;
            type?: 'lease' | 'operating_statement' | 'rent_roll' | 'other';
        },
    ): CancelablePromise<Document> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/documents',
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }
    /**
     * Process document
     * @param documentId
     * @returns any Document processing started
     * @throws ApiError
     */
    public static postDocumentsProcess(
        documentId: string,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/documents/{documentId}/process',
            path: {
                'documentId': documentId,
            },
        });
    }
    /**
     * Create analysis
     * @param requestBody
     * @returns Analysis Analysis started
     * @throws ApiError
     */
    public static postAnalysis(
        requestBody: {
            propertyId: string;
            type: 'financial' | 'market' | 'tenant';
        },
    ): CancelablePromise<Analysis> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/analysis',
            body: requestBody,
            mediaType: 'application/json',
        });
    }
    /**
     * Get analysis results
     * @param analysisId
     * @returns Analysis Analysis results
     * @throws ApiError
     */
    public static getAnalysis(
        analysisId: string,
    ): CancelablePromise<Analysis> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/analysis/{analysisId}',
            path: {
                'analysisId': analysisId,
            },
        });
    }
}
