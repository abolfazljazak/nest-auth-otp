import { registerAs } from "@nestjs/config";

export enum ConfigKeys {
    App = "App",
    Db = "Db",
    Jwt = "Jwt"
}

const AppConfig = registerAs(ConfigKeys.App, () => ({
    port: 3000,
}))

const JwtConfig = registerAs(ConfigKeys.Jwt, () => ({
    accessTokenSecret: "1a4d6eae8fdfab609ee5e010a96f6ce0c1686618",
    refreshTokenSecret: "ed586725a1fa6e1bc7f7e3c7188ff50aa98f6d7e"
}))

const DbConfig = registerAs(ConfigKeys.Db, () => ({
    port: 5432,
    host: "localhost",
    username: "postgres",
    password: "abolfazljzk",
    database: "auth-otp"
}))


export const configurations = [AppConfig, DbConfig, JwtConfig]