import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../user/entities/user.entity";
import { DataTypeNotSupportedError, Repository } from "typeorm";
import { OtpEntity } from "../user/entities/otp.entity";
import { CheckOtpDto, SendOtpDto } from "./auth.dto";
import { randomInt } from "crypto";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
    @InjectRepository(OtpEntity) private otpRepository: Repository<OtpEntity>
  ) {}

  async sendOtp(otpDto: SendOtpDto) {
    const { mobile } = otpDto;
    let user = await this.userRepository.findOneBy({ mobile });
    const expriesIn = new Date(new Date().getTime() + 1000 * 60 * 2);
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
    return {
        message: "you logged-in successfully."
    }
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
}
