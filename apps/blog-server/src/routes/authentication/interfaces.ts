import { TLoginRequestBody, TRegisterRequestBody } from "@repo/blog-types";
import { Request } from "express";

export interface IRegisterRequest extends Request {
    body : TRegisterRequestBody
}

export interface ILoginRequest extends Request {
    body : TLoginRequestBody
}