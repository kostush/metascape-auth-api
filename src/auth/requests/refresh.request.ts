import { RefreshRequest as IRefreshRequest } from "../auth.pb";
import {IsString} from "class-validator";

export class RefreshRequest implements IRefreshRequest {
    @IsString()
    readonly  refreshToken: string
    constructor(refreshToken: string) {
        this.refreshToken = refreshToken;
    }
}