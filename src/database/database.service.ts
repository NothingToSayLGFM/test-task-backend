import { Injectable } from '@nestjs/common';
import { faker } from '@faker-js/faker';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from 'src/user/entities/user.entity';
import crypto from 'node:crypto';

/* 
  Важко протестувати тк розмір бази на безплатному тарифі Mongo не вистачає 
  мені вдалось засідити трохи меньше мільону перед тим як монга впала з аутофспейс
  */

@Injectable()
export class DatabaseService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.countDocuments();
    if (count === 0) {
      console.log('Database is empty, seeding 2 million users...');
      await this.seedUsers();
      console.log('Seeding completed.');
    }
  }

  private async seedUsers() {
    const totalUsers = 2000000;
    const batchSize = 10000;
    const batches = Math.ceil(totalUsers / batchSize);

    for (let i = 0; i < batches; i++) {
      try {
        const users = this.generateBatch(batchSize);
        const result = await this.userModel.insertMany(users, {
          rawResult: true,
        });

        console.log(
          `Batch ${i + 1}/${batches} inserted ${result.insertedCount}`,
        );
      } catch (err: any) {
        console.warn(`Batch ${i + 1} error:`, err);
        break;
      }
    }
  }

  private generateBatch(size: number): Partial<User>[] {
    const users: Partial<User>[] = [];
    for (let j = 0; j < size; j++) {
      users.push({
        name: faker.person.fullName(),
        email: faker.internet.email() + crypto.randomUUID(),
        phone: faker.phone.number(),
        birthday: faker.date.birthdate(),
      });
    }
    return users;
  }
}
