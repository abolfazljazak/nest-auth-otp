import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { isJWT } from "class-validator";
import { AuthService } from "../auth.service";
import { Request } from "express";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService) {}
  async canActivate(context: ExecutionContext) {
    const httpContext = context.switchToHttp();
    const request: Request = httpContext.getRequest<Request>();
    const token = await this.extractToken(request);
    request.user = await this.authService.validateAccessToken(token);
    return true
  }
  protected extractToken(request: Request) {
    const { authorization } = request.headers;
    if (!authorization || authorization?.trim() == "") {
      throw new UnauthorizedException("login on your account");
    }
    const [bearer, token] = authorization?.split(" ");
    if (bearer?.toLowerCase() || !token || isJWT(token))
      throw new UnauthorizedException("login on your account");
    return token;
  }
}
