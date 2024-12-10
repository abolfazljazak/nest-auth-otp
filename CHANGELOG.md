## 0.4.0 (2024-12-10)

### Feat

- **auth**: implement JWT token generation and update OTP validation flow
- **jwt**: add JWT configuration and integrate JwtModule

## 0.3.0 (2024-12-09)

### Feat

- **auth**: add checkOtp method and controller for OTP verification
- **auth**: implement sendOtp controller and OTP expiration validation
- **user**: update UserEntity to make first_name, last_name, and otpId nullable
- **main**: add global validation pipe to main application bootstrap

## 0.2.0 (2024-12-09)

### Feat

- **auth**: add Auth module with OTP service and validation setup
- **user-otp**: add OTP entity and establish relation with User entity
- **user-module**: add User module with entities and basic structure

### Refactor

- **auth**: integrate TypeOrmModule with User and OTP entities

## 0.1.0 (2024-12-08)

### Feat

- **project-setup**: initialize project with database configuration
