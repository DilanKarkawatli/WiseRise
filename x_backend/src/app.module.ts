import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module'; // ⭐ add this

@Module({
  imports: [UsersModule], // ⭐ add this
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}