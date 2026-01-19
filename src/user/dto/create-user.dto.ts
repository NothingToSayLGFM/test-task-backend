import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsDateString,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^(?:\+?38|8)?0[5-9]\d{8,9}$/, {
    message: 'Phone number must be a valid',
  })
  phone: string;

  @IsDateString()
  birthday: string;
}
