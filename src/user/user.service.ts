import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './entities/user.entity';
import type { UserFilter } from './user.filter.interface';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    return await this.userModel.create(createUserDto);
  }

  async findAll(filter: UserFilter) {
    const query: Record<string, string | { $regex: string; $options: string }> =
      {};

    if (filter.email) {
      query.email = filter.email;
    }

    if (filter.phone) {
      query.phone = filter.phone;
    }
    if (filter.name) {
      query.name = { $regex: filter.name, $options: 'i' };
    }

    const limit = filter.limit || 20;
    const page = filter.page || 1;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).exec(),
      this.userModel.countDocuments(query).exec(),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        total,
        totalPages,
        page,
        limit,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string) {
    return await this.userModel.findById(id).exec();
  }
}
