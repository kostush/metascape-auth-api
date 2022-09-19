import { Module } from '@nestjs/common';
import PARAMETERS from './params.constants';
import { ConfigService, ConfigModule } from '@nestjs/config';
import { Provider } from '@nestjs/common/interfaces/modules/provider.interface';

const params: Provider[] = Object.values(PARAMETERS).map((parameter) => ({
  provide: parameter,
  useFactory: (config: ConfigService) => {
    return config.get(parameter);
  },
  inject: [ConfigService],
}));

@Module({
  imports: [ConfigModule],
  providers: params,
  exports: params,
})
export class ParamsModule {}
