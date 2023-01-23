import {BadRequestException, Inject, Injectable} from "@nestjs/common";
import {RefreshRequest} from "../requests/refresh.request";
import {JwtPayloadDataDto, SuccessResponse} from "metascape-common-api";
import {LoginResponse} from "../auth.pb";
import {ConfigService} from "@nestjs/config";
import {JwtService} from "@nestjs/jwt";
import PARAMETERS from "../../params/params.constants";
import {SessionFactoryInterface} from "../factory/session-factory.interface";
import {SessionRepositoryInterface} from "../repositories/session-repository.interface";
import {TokenFactoryInterface} from "../factory/token-factory.interface";
import {LoginResponseDataDto} from "../responses/login-response-data.dto";
import {JwtPayloadFactoryInterface} from "../factory/jwt-payload-factory.interface";

@Injectable()
export class RefreshUseCase {
    constructor(
        @Inject(SessionFactoryInterface)
        private readonly sessionFactory: SessionFactoryInterface,
        @Inject(SessionRepositoryInterface)
        private readonly sessionRepository: SessionRepositoryInterface,
        @Inject(TokenFactoryInterface)
        private readonly tokenFactory: TokenFactoryInterface,
        private readonly configService: ConfigService,
        @Inject(JwtPayloadFactoryInterface)
        private readonly jwtPayloadFactory: JwtPayloadFactoryInterface,
        private readonly jwtService: JwtService,
    ){}
    async execute(
        request: RefreshRequest
    ):Promise<SuccessResponse<LoginResponseDataDto>>{
        let jwtPayload: JwtPayloadDataDto;
        try {
            jwtPayload = this.jwtService.verify<JwtPayloadDataDto>(request.refreshToken, {
                publicKey: this.configService.get(PARAMETERS.JWT_REFRESH_PUBLIC_KEY),
            });
        } catch (e) {
            throw new BadRequestException('Refresh token is not valid or expired');
        }

        const session =  await this.sessionRepository.getOneByTokenId(jwtPayload.tokenId);
        const token = session.tokens!.find(token => token.id === jwtPayload.tokenId);
        if (! session
            || session.isClosed
            || token!.isClosed
        ){
            throw new BadRequestException('Token is closed or not exist')
        }
        session.tokens!.map((token) => {
                token.isClosed = true;
            return token;
        });


        const newToken = this.tokenFactory.createToken(session.id);


        session.tokens!.push(newToken);
        await this.sessionRepository.update(session);


        const payload = this.jwtPayloadFactory.createJwtPayload(
            {
                id: jwtPayload.id,
                businessId: jwtPayload.businessId,
                createdAt: 123,
                updatedAt: 123},
            session.id,
            token!.id,
        );
        const authJwt = this.jwtService.sign(payload, {
            privateKey: this.configService.get(PARAMETERS.JWT_AUTH_PRIVATE_KEY),
            expiresIn: this.configService.get(PARAMETERS.JWT_AUTH_EXPIRES_IN),
        });
        const refreshJwt = this.jwtService.sign(payload, {
            privateKey: this.configService.get(PARAMETERS.JWT_REFRESH_PRIVATE_KEY),
            expiresIn: this.configService.get(PARAMETERS.JWT_REFRESH_EXPIRES_IN),
        });
        return new SuccessResponse(new LoginResponseDataDto(authJwt, refreshJwt));
    }
}