/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ZodSchemas } from '@zenstackhq/runtime';
import { DbClientContract } from '@zenstackhq/runtime';
import { FastifyPluginCallback, FastifyReply, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import RPCApiHandler from '../api/rpc';
import { logInfo } from '../api/utils';
import { AdapterBaseOptions } from '../types';

/**
 * Fastify plugin options
 */
export interface PluginOptions extends AdapterBaseOptions {
    /**
     * Url prefix, e.g.: /api
     */
    prefix: string;

    /**
     * Callback for getting a PrismaClient for the given request
     */
    getPrisma: (request: FastifyRequest, reply: FastifyReply) => unknown | Promise<unknown>;
}

/**
 * Fastify plugin for handling CRUD requests.
 */
const pluginHandler: FastifyPluginCallback<PluginOptions> = (fastify, options, done) => {
    const prefix = options.prefix ?? '';
    logInfo(options.logger, `ZenStackPlugin installing routes at prefix: ${prefix}`);

    let zodSchemas: ZodSchemas | undefined;
    if (typeof options.zodSchemas === 'object') {
        zodSchemas = options.zodSchemas;
    } else if (options.zodSchemas === true) {
        zodSchemas = require('@zenstackhq/runtime/zod');
        if (!zodSchemas) {
            throw new Error('Unable to load zod schemas from default location');
        }
    }

    const requestHanler = options.handler ?? RPCApiHandler();
    if (options.useSuperJson !== undefined) {
        console.warn(
            'The option "useSuperJson" is deprecated. The server APIs automatically use superjson for serialization.'
        );
    }

    fastify.all(`${prefix}/*`, async (request, reply) => {
        const prisma = (await options.getPrisma(request, reply)) as DbClientContract;
        if (!prisma) {
            reply.status(500).send({ message: 'unable to get prisma from request context' });
            return;
        }

        try {
            const response = await requestHanler({
                method: request.method,
                path: (request.params as any)['*'],
                query: request.query as Record<string, string | string[]>,
                requestBody: request.body,
                prisma,
                modelMeta: options.modelMeta,
                zodSchemas,
                logger: options.logger,
            });
            reply.status(response.status).send(response.body);
        } catch (err) {
            reply.status(500).send({ message: `An unhandled error occurred: ${err}` });
        }
    });

    done();
};

export default fp(pluginHandler);
