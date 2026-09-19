import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parse } from 'yaml';
import { JsonObject } from 'swagger-ui-express';

const OPENAPI_FILE_PATH = resolve(__dirname, 'openapi.yaml');

function loadOpenapiDocument(): JsonObject {
    const fileContent = readFileSync(OPENAPI_FILE_PATH, 'utf-8');

    const parsedDocument: unknown = parse(fileContent);

    if (typeof parsedDocument !== 'object' || parsedDocument === null) {
        throw new Error('Especificação OpenAPI inválida: o arquivo não descreve um objeto');
    }

    return parsedDocument as JsonObject;
}

export const openapiDocument = loadOpenapiDocument();
