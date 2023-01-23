import {Controller} from "@nestjs/common";
import {GrpcMethod} from "@nestjs/microservices";
import {AUTH_SERVICE_NAME, LoginResponse} from "../auth.pb";
import {RefreshRequest} from "../requests/refresh.request";
import {SuccessResponse} from "metascape-common-api";
import {RefreshUseCase} from "../use-case/refresh.use.case";
import {LoginResponseDataDto} from "../responses/login-response-data.dto";

@Controller()
export class RefreshController {

    constructor(private readonly useCase: RefreshUseCase){}

    @GrpcMethod (AUTH_SERVICE_NAME, 'Refresh')
    execute (
        request: RefreshRequest
    ):Promise<SuccessResponse<LoginResponseDataDto>>{
        return this.useCase.execute(request)
    }



}