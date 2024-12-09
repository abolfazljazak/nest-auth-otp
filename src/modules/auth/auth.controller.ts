import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { SendOtpDto } from "./auth.dto";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("/send_otp")
  sendOtp(@Body() sendOtpDto: SendOtpDto) {
    return this.authService.sendOtp(sendOtpDto)
  }
  
}
