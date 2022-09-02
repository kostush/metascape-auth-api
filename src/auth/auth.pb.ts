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

/** RegisterByWallet */
export interface RegisterByWalletRequest {
  businessId: string;
  address: string;
}

export interface RegisterResponseData {
  userId: string;
}

export interface RegisterResponse {
  data: RegisterResponseData | undefined;
}

/** LoginByWallet */
export interface LoginByWalletRequest {
  businessId: string;
  address: string;
  signature: string;
}

export interface LoginResponseData {
  authToken: string;
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
  createdAt: number;
  updatedAt: number;
  wallets: string[];
  email?: string | undefined;
  nickname?: string | undefined;
  firstName?: string | undefined;
  lastName?: string | undefined;
  about?: string | undefined;
}

export interface ValidateResponse {
  data: ValidateResponseData | undefined;
}

export const METASCAPE_AUTH_PACKAGE_NAME = "metascape.auth";

export interface AuthServiceClient {
  registerByWallet(request: RegisterByWalletRequest): Observable<RegisterResponse>;

  registerByEmail(request: RegisterByEmailRequest): Observable<RegisterResponse>;

  loginByWallet(request: LoginByWalletRequest): Observable<LoginResponse>;

  loginByEmail(request: LoginByEmailRequest): Observable<LoginResponse>;

  validate(request: ValidateRequest): Observable<ValidateResponse>;
}

export interface AuthServiceController {
  registerByWallet(
    request: RegisterByWalletRequest,
  ): Promise<RegisterResponse> | Observable<RegisterResponse> | RegisterResponse;

  registerByEmail(
    request: RegisterByEmailRequest,
  ): Promise<RegisterResponse> | Observable<RegisterResponse> | RegisterResponse;

  loginByWallet(request: LoginByWalletRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  loginByEmail(request: LoginByEmailRequest): Promise<LoginResponse> | Observable<LoginResponse> | LoginResponse;

  validate(request: ValidateRequest): Promise<ValidateResponse> | Observable<ValidateResponse> | ValidateResponse;
}

export function AuthServiceControllerMethods() {
  return function(constructor: Function) {
    const grpcMethods: string[] = ["registerByWallet", "registerByEmail", "loginByWallet", "loginByEmail", "validate"];
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
