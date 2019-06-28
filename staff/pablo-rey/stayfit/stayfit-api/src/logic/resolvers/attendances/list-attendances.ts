import * as moment from 'moment';
import { Arg, Authorized, Ctx, Query, Resolver } from 'type-graphql';
import { ONLY_IF_MY_CUSTOMER } from '../../../logic/middleware/authChecker';
import { MyContext } from '../../middleware/MyContext';
import { SessionsWithMyAttendance } from '../sessions/list-sessions/list-sessions-users';
import { AttendanceModel, Attendance } from './../../../data/models/attendance';
import { ALWAYS_OWN_USER } from './../../middleware/authChecker';

@Resolver(Attendance)
export class ListAttendancesResolvers {

  /**
   * List next attendances(any state) of authenticated user 
   * 
   * @param endDate Date
   * @param ctx graphql context with authenticated user
   * 
   * @returns Session and attendance(or null) 
   */
  @Query(returns => [SessionsWithMyAttendance])
  async listMyNextAttendances(@Arg('end', { nullable: true }) endDate: Date, @Ctx() ctx: MyContext) {
    const userId = ctx.userId;
    const start = moment()
      .startOf('day')
      .toDate();
    const end =
      endDate ||
      moment()
        .add(10, 'days')
        .endOf('day')
        .toDate();

    let attendances = await AttendanceModel.find({ user: userId }).populate({
      path: 'session',
      match: { startTime: { $gte: start, $lte: end } },
      populate: { path: 'coaches type provider attendances' },
    });
    attendances = await attendances.filter((att: any) => att.session);
    return attendances.map(att => ({ myAttendance: att, session: att.session }));
  }

  /**
   * List all attendances of a given user in provider
   * 
   * @param userId 
   * @param providerId 
   */
  @Authorized([ALWAYS_OWN_USER, ONLY_IF_MY_CUSTOMER])
  @Query(returns => [SessionsWithMyAttendance])
  async listAttendances(@Arg('userId') userId: string, @Arg('providerId', {nullable: true}) providerId: string) {
    let attendances = await AttendanceModel.find({ user: userId }).populate({
      path: 'session',
      populate: { path: 'coaches type provider attendances' },
    });
    return attendances.map(att => ({ myAttendance: att, session: att.session }));
  }
}
