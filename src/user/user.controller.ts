import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto';
import type { UserFilter } from './user.filter.interface';
import { Authorization } from 'src/auth/decorators/authorization.decorator';

@Authorization()
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('add-user')
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.userService.create(createUserDto);
  }

  @Get('get-users')
  async findAll(@Query() query: UserFilter) {
    return await this.userService.findAll(query);
  }

  @Get('get-user/:id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(id);
  }
}
