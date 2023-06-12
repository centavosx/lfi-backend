import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Events, User } from '../../../entities';
import { Repository, MoreThan } from 'typeorm';
import { UserStatus } from 'src/enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  public async getDashboard(timeZone: string, status: UserStatus) {
    const [upcomingEvents, graphValues, userCounts] = await Promise.all([
      this.eventsRepository.find({
        where: {
          startDate: MoreThan(new Date()),
        },
        take: 10,
        order: {
          startDate: 'ASC',
        },
      }),

      this.userRepository.query(
        `SELECT TO_CHAR(timezone($1, "user".created),'YYYY') AS "x", count(TO_CHAR(timezone($1, "user".created), 'YYYY')) AS "y" FROM "user"
            LEFT JOIN user_role ON user_role.user_id = "user".id 
            LEFT JOIN role "role" ON user_role.role_id = "role".id  
              WHERE "user".status = $2
              AND "role".name = 'user' 
          GROUP BY TO_CHAR(timezone($1, "user".created),'YYYY')`,
        [timeZone, status],
      ),

      this.userRepository.query(`
      SELECT DISTINCT 
              CASE 
                WHEN "role".name = 'super' OR "role".name LIKE 'admin%' 
                THEN 'employee'
                ELSE "role".name
              END as "name", 
            COUNT(
              CASE 
                WHEN "role".name = 'super' OR "role".name LIKE 'admin%' 
                THEN 'employee'
                ELSE "role".name
              END) as "count" 
        FROM "user"
          LEFT JOIN user_role ON user_role.user_id = "user".id 
          LEFT JOIN role "role" ON user_role.role_id = "role".id  
            WHERE 
              ("role".name = 'user' AND 
                ("user".accepted IS NOT NULL AND "user".status = 'active'))
              OR (("role".name LIKE 'admin%' OR "role".name = 'super') AND "user".status = 'active')
        GROUP BY 
                CASE 
                  WHEN "role".name = 'super' OR "role".name LIKE 'admin%' 
                  THEN 'employee'
                  ELSE "role".name
                END
        UNION
        SELECT DISTINCT REPLACE("user".status, 'verified', 'applicant') as "name", COUNT("user".status) as "count" FROM "user"
          LEFT JOIN user_role ON user_role.user_id = "user".id 
          LEFT JOIN role "role" ON user_role.role_id = "role".id  
            WHERE "role".name = 'user' AND "user".status = 'verified'
        GROUP BY "user".status
      `),
    ]);

    return {
      upcomingEvents,
      graphValues,
      userCounts,
    };
  }
}
