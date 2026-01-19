import { Schema, SchemaFactory } from '@nestjs/mongoose';
import { Prop } from '@nestjs/mongoose';
import { ObjectId } from 'mongodb';

@Schema()
export class User {
  _id: ObjectId;
  @Prop({ required: true })
  name: string;
  @Prop({ required: true, unique: true })
  email: string;
  @Prop({ required: true })
  phone: string;
  @Prop({ required: true })
  birthday: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
