import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { ApiAdresseService } from './api-adresse.service';

@Module({
  imports: [TypeOrmModule.forFeature([Address])],
  controllers: [AddressesController],
  providers: [AddressesService, ApiAdresseService],
  exports: [AddressesService],
})
export class AddressesModule {} 