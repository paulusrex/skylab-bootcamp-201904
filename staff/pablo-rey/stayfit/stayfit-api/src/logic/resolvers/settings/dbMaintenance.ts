import { ONLY_SUPERADMIN } from './../../middleware/authChecker';
import { Authorized, Mutation, Resolver } from 'type-graphql';
import { populateDb, cleanDb } from '../../../data/db-maintenance'

@Resolver()
export class DbMaintenanceResolvers {
  @Authorized(ONLY_SUPERADMIN)
  @Mutation(returns => Boolean)
  async cleanDb() {
    await cleanDb();
    return true;
  }

  @Authorized(ONLY_SUPERADMIN)
  @Mutation(returns => Boolean)
  async populateDb() {
    await cleanDb();
    await populateDb();
    return true;
  }

}
