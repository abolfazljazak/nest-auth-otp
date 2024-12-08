import { Module } from '@nestjs/common';
import { CustomConfigModule } from './modules/config/config.module';
import { TypeOrmDbConfig } from './config/typeorm.config';
import { TypeOrmModule } from '@nestjs/typeorm';
@Module({
  imports: [
    CustomConfigModule,
    TypeOrmModule.forRootAsync({
      useClass: TypeOrmDbConfig,
      inject: [TypeOrmDbConfig]
    })
  ],
  controllers: [],
  providers: [TypeOrmDbConfig],
})
export class AppModule {}
