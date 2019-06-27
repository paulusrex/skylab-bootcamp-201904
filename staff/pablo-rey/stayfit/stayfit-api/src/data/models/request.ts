import { Field, ID, ObjectType } from 'type-graphql';
import { prop, Ref, Typegoose } from 'typegoose';
import { REQUESTSTATUS, REQUESTTYPES } from '../enums';
import { Provider } from './provider';
import { Session } from './session';
import { User } from './user';

@ObjectType()
export class RequestCustomer extends Typegoose {
  @Field(() => ID)
  id: number;

  @Field(returns => User)
  @prop({ ref: { name: 'User' }, required: true })
  user: Ref<User>;

  @Field(returns => Provider)
  @prop({ ref: { name: 'Provider' }, required: true })
  provider: Ref<Provider>;

  @Field()
  @prop({ enum: REQUESTTYPES })
  type: string;

  @Field()
  @prop({ enum: REQUESTSTATUS })
  status: string;

  @Field(returns => Date, { nullable: true })
  @prop({ required: false, default: null })
  resolutionDate: Date | null;
}

export const RequestCustomerModel = new RequestCustomer().getModelForClass(RequestCustomer, {
  schemaOptions: { collection: 'requests-customer' },
});
