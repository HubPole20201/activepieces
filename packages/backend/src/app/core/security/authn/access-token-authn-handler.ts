import { FastifyRequest } from 'fastify'
import { BaseSecurityHandler } from '../security-handler'
import { ActivepiecesError, ErrorCode, isNil } from '@activepieces/shared'
import { accessTokenManager } from '../../../authentication/lib/access-token-manager'

export class AccessTokenAuthnHandler extends BaseSecurityHandler {
    private static readonly HEADER_NAME = 'authorization'
    private static readonly HEADER_PREFIX = 'Bearer '

    protected canHandle(request: FastifyRequest): Promise<boolean> {
        const header = request.headers[AccessTokenAuthnHandler.HEADER_NAME]
        const prefix = AccessTokenAuthnHandler.HEADER_PREFIX
        const routeMatches = header?.startsWith(prefix) ?? false
        return Promise.resolve(routeMatches)
    }

    protected async doHandle(request: FastifyRequest): Promise<void> {
        const accessToken = this.extractAccessTokenOrThrow(request)
        const principal = await accessTokenManager.extractPrincipal(accessToken)
        request.principal = principal
    }

    private extractAccessTokenOrThrow(request: FastifyRequest): string {
        const header = request.headers[AccessTokenAuthnHandler.HEADER_NAME]
        const prefix = AccessTokenAuthnHandler.HEADER_PREFIX
        const accessToken = header?.substring(prefix.length)

        if (isNil(accessToken)) {
            throw new ActivepiecesError({
                code: ErrorCode.AUTHORIZATION,
                params: {
                    message: 'missing api key',
                },
            })
        }

        return accessToken
    }
}
