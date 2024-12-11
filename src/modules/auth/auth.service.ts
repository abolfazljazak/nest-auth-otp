import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { Repository } from "typeorm";
import { OtpEntity } from "../user/entities/otp.entity";
import { CheckOtpDto, SendOtpDto } from "./dto/otp.dto";
import { randomInt } from "crypto";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { TokensPayload } from "./types/payload";
import { LoginDto, SignupDto } from "./dto/basic.dto";
import { compareSync, genSaltSync, hashSync } from "bcrypt"

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OtpEntity)
    private otpRepository: Repository<OtpEntity>,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async sendOtp(otpDto: SendOtpDto) {
    const { mobile } = otpDto;
    let user = await this.userRepository.findOneBy({ mobile });
    if (!user) {
      user = this.userRepository.create({
        mobile: mobile,
      });
      user = await this.userRepository.save(user);
    }
    await this.createOtpForUser(user);
    return {
      message: "sent code successfully",
    };
  }

  async checkOtp(checkOtpDto: CheckOtpDto) {
    const { mobile, code } = checkOtpDto;
    const now = new Date();
    const user = await this.userRepository.findOne({
      where: { mobile: mobile },
      relations: {
        otp: true,
      },
    });
    if (!user || !user?.otp) throw new UnauthorizedException("User Not Found");

    const otp = user.otp;
    if (otp?.code !== code)
      throw new UnauthorizedException("otp code is incorrect");

    if (otp.expries_in < now)
      throw new UnauthorizedException("otp code is expried");

    if (!user.mobile_verify) {
      await this.userRepository.update(
        {
          id: user.id,
        },
        {
          mobile_verify: true,
        }
      );
    }
    const {accessToken, refreshToken} = await this.makeTokensForUser({id: user.id, mobile: mobile})
    return {
      accessToken,
      refreshToken,
      message: "you logged-in successfully.",
    };
  }

  async signUp(signUpDto: SignupDto) {
    const {first_name, last_name, email, password, confirm_password, mobile} = signUpDto
    const checkEmail = await this.checkEmail(email)
    const checkMobile = await this.checkMobile(mobile)

    if (checkEmail) throw new ConflictException("email is already exist")
    if (checkMobile) throw new ConflictException("mobile is already exist")

    if (password !== confirm_password) {
      throw new BadRequestException(
        "password and confirm password should be equals"
      )
    }
    const salt = genSaltSync(10)
    let hashedPassword = hashSync(password, salt)
    const user = this.userRepository.create({
      first_name,
      last_name,
      mobile,
      email,
      password: hashedPassword
    })
    await this.userRepository.save(user)
    return {
      message: "user signup successfully"
    }
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto
    const user = await this.userRepository.findOneBy({email})
    if (!user)
      throw new UnauthorizedException("username or password is incorrent")
    if (!compareSync(password, user.password))
      throw new UnauthorizedException("username or password is incorrent")
    const { accessToken, refreshToken } = await this.makeTokensForUser({
      mobile: user.mobile,
      id: user.id
    })
    return {
      accessToken,
      refreshToken,
      message: "you logged-in successfully"
    }
  }

  async checkEmail(email: string) {
    const user = this.userRepository.findOneBy({email: email})
    if (user) { return true } else { return false }
  }

  async checkMobile(mobile: string) {
    const user = this.userRepository.findOneBy({mobile: mobile})
    if (user) { return true } else { return false }
  }

  async createOtpForUser(user: UserEntity) {
    const expriesIn = new Date(new Date().getTime() + 1000 * 60 * 2);
    const code = randomInt(10000, 99999).toString();
    let otp = await this.otpRepository.findOneBy({ userId: user.id });
    if (otp) {
      if (otp.expries_in > new Date()) {
        throw new BadRequestException("otp code not expried!");
      }
      (otp.code = code), (otp.expries_in = expriesIn);
    } else {
      otp = this.otpRepository.create({
        code: code,
        expries_in: expriesIn,
        userId: user.id,
      });
    }
    otp = await this.otpRepository.save(otp);
    user.otpId = otp.id;
    await this.userRepository.save(user);
  }

  async makeTokensForUser(payload: TokensPayload) {
    const accessToken = this.jwtService.sign(
      payload,
      { 
        secret: this.configService.get("Jwt.accessTokenSecret"),
        expiresIn: "30d"
      }
    );

    const refreshToken = this.jwtService.sign(
      payload,
      { 
        secret: this.configService.get("Jwt.refreshTokenSecret"),
        expiresIn: "1y"
      }
    );
    return {
      accessToken,
      refreshToken
    }
  }

  async validateAccessToken(token: string) {
    try {
      const payload = this.jwtService.verify<TokensPayload>(token, {
        secret: this.configService.get("Jwt.accessTokenSecret")
      })
      if (typeof payload === "object" && payload?.id) {
        const user = await this.userRepository.findOneBy({id: payload.id})
        if (!user) {
          throw new UnauthorizedException("login on your account")
        }
        return user
      }
      throw new UnauthorizedException("login on your account")
    } catch (error) {
      throw new UnauthorizedException("login on your account")
    }
  }
}
