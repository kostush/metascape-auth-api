/* eslint-disable */
import { GrpcMethod, GrpcStreamMethod } from "@nestjs/microservices";
import { Observable } from "rxjs";

export const protobufPackage = "metascape.auth";

/** RegisterByEmail */
export interface RegisterByEmailRequest {
  businessId: string;
  email: string;
  password: string;
}

export interface RegisterResponseData {
  userId: string;
}

export interface RegisterResponse {
  data: RegisterResponseData | undefined;
}

/** RegisterByWallet */
export interface RegisterByWalletRequest {
  businessId: string;
  address: string;
}

export interface RegisterByWalletResponseData {
  businessId: string;
  id: string;
  address: string;
  nonce: string;
  userId: string;
  createdAt: number;
  updatedAt: number;
  createdBy?: string | undefined;
  updatedBy?: string | undefined;
}

export interface RegisterByWalletResponse {
  data: RegisterByWalletResponseData | undefined;
}

/** LoginByWallet */
export interface LoginByWalletRequest {
  businessId: string;
  address: string;
  signature: string;
}

export interface LoginResponseData {
  authToken: string;
  refreshToken: string;
}

export interface LoginResponse {
  data: LoginResponseData | undefined;
}

/** LoginByEmail */
export interface LoginByEmailRequest {
  businessId: string;
  email: string;
  password: string;
}

/** Validate */
export interface ValidateRequest {
  authToken: string;
}

export interface ValidateResponseData {
  businessId: string;
  id: string;
}

export interface ValidateResponse {
  data: ValidateResponseData | undefined;
}

/** Refresh */
export interface RefreshRequest {
  refreshToken: string;
}

/** CloseSession */
export interface CloseSessionRequest {
  sessionId: string;
}

export interface CloseSessionResponse {
}

/** CloseAllUserSessions */
export interface CloseAllUserSessionsRequest {
  userId: string;
}

export const METASCAPE_AUTH_PACKAGE_NAME = "metascape.auth";

export interface AuthServiceClient {
  registerByWallet(request: RegisterByWalletRequest): Observable<RegisterByWalletResponse>;

  registerByEmail(request: RegisterByEmailRequest): Observable<RegisterResponse>;

  loginByWallet(request: LoginByWalletRequest): Observable<LoginResponse>;

  loginByEmail(request: LoginByEmailRequest): Observable<LoginResponse>;

  validate(request: ValidateRequest): Observable<ValidateResponse>;

  refresh(request: RefreshRequest): Observable<LoginResponse>;

  closeSession(request: CloseSessionRequest): Observable<CloseSessionResponse>;

  closeAllUserSessions(request: CloseAllUserSessionsRequest): Observable<CloseSessionResponse>;
}

export interface AuthServiceController {
  registerByWallet(
    request: RegisterByWalletRequest,
  ): Promise<RegisterByWalletResponse> | Observable<RegisterByWalletResponse> | RegisterByWalletResponse;

  registerByEmail(
    request: RegisterByEmailRequest,
  ): Promise<RegisterResponse> | Observable<RegisterResponse> | RegisterResponse;

  loginByWallet(request: LoginByWalletRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  loginByEmail(request: LoginByEmailRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  validate(request: ValidateRequest): Promise<ValidateResponse> | Observable<ValidateResponse> | ValidateResponse;

  refresh(request: RefreshRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  closeSession(
    request: CloseSessionRequest,
  ): Promise<CloseSessionResponse> | Observable<CloseSessionResponse> | CloseSessionResponse;

  closeAllUserSessions(
    request: CloseAllUserSessionsRequest,
  ): Promise<CloseSessionResponse> | Observable<CloseSessionResponse> | CloseSessionResponse;
}

export function AuthServiceControllerMethods() {
  return function(constructor: Function) {
    const grpcMethods: string[] = [
      "registerByWallet",
      "registerByEmail",
      "loginByWallet",
      "loginByEmail",
      "validate",
      "refresh",
      "closeSession",
      "closeAllUserSessions",
    ];
    for (const method of grpcMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
    const grpcStreamMethods: string[] = [];
    for (const method of grpcStreamMethods) {
      const descriptor: any = Reflect.getOwnPropertyDescriptor(constructor.prototype, method);
      GrpcStreamMethod("AuthService", method)(constructor.prototype[method], method, descriptor);
    }
  };
}

export const AUTH_SERVICE_NAME = "AuthService";
