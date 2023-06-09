import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Events, User } from '../../../entities';
import { Repository, MoreThan, LessThanOrEqual, DataSource } from 'typeorm';
import { UserStatus } from 'src/enum';

@Injectable()
export class DashboardService {
  constructor(
    private readonly dataSource: DataSource,
    @InjectRepository(Events)
    private readonly eventsRepository: Repository<Events>,
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  //Run in non-concurrent since the current database only handles up to three connections
  public async getDashboard(
    timeZone: string,
    status: UserStatus,
    isCollege?: boolean,
  ) {
    const college =
      isCollege !== undefined
        ? `AND ${
            isCollege
              ? '"user".college_graduate IS NOT NULL'
              : '"user".shs_graduate IS NOT NULL'
          }`
        : '';

    const upcomingEvents = await this.eventsRepository.find({
      where: [
        {
          endDate: MoreThan(new Date()),
          startDate: LessThanOrEqual(new Date()),
        },
      ],
      take: 5,
      order: {
        startDate: 'ASC',
      },
    });

    const graphValues = await this.userRepository.query(
      `SELECT TO_CHAR(timezone($1, "user".created),'YYYY') AS "x", count(TO_CHAR(timezone($1, "user".created), 'YYYY')) AS "y" FROM "user"
            LEFT JOIN user_role ON user_role.user_id = "user".id 
            LEFT JOIN role "role" ON user_role.role_id = "role".id  
            LEFT JOIN scholar "scholar" ON  scholar.user_id = "user".id
              WHERE "user".status = $2
              AND "role".name = 'user' ${college}
          GROUP BY TO_CHAR(timezone($1, "user".created),'YYYY')`,
      [timeZone, status],
    );

    const userCounts = await this.userRepository.query(`
		 SELECT 
          CASE 
            WHEN role_name = 'super' OR role_name LIKE 'admin%' 
            THEN 'employee'
            ELSE role_name 
            END as "name", 
          COUNT(
            CASE 
              WHEN role_name  = 'super' OR role_name  LIKE 'admin%' 
              THEN 'employee'
              ELSE role_name 
            END
            ) as "count" 
        FROM (	
          SELECT "role".name as "role_name", ROW_NUMBER() over 
                (partition by "user".id,
            CASE 
                WHEN "role".name = 'super' OR "role".name LIKE 'admin%' 
                THEN 'employee'
                ELSE "role".name
              END order by CASE 
                WHEN "role".name = 'super' OR "role".name LIKE 'admin%' 
                THEN 'employee'
                ELSE "role".name
            END ASC) as rank 
          FROM "user" 
            LEFT JOIN user_role ON user_role.user_id = "user".id 
            LEFT JOIN role "role" ON user_role.role_id = "role".id  
          WHERE (("role".name LIKE 'admin%' OR "role".name = 'super') AND "user".status = 'active')
        ) as "grouped_user"
        WHERE rank = 1 
        GROUP BY
          CASE	 
            WHEN role_name = 'super' OR role_name LIKE 'admin%' 
            THEN 'employee'
            ELSE role_name
          END
		UNION
        SELECT DISTINCT REPLACE(REPLACE("scholar".status, 'ended', 'scholar'), 'started', 'scholar') as "name", COUNT("scholar".status) as "count" FROM "user"
          LEFT JOIN user_role ON user_role.user_id = "user".id 
          LEFT JOIN role "role" ON user_role.role_id = "role".id  
          LEFT JOIN scholar "scholar" ON  scholar.user_id = "user".id 
            WHERE "user".status = 'active' AND "role".name = 'user' AND ("scholar".status='started' OR "scholar".status='ended')
        GROUP BY "scholar".status
    UNION
        SELECT 'applicant' as "name", COUNT("user".id) as "count" FROM "user"           
          LEFT JOIN user_role ON user_role.user_id = "user".id 
          LEFT JOIN role "role" ON user_role.role_id = "role".id   
          WHERE "user".status = 'verified' AND "role".name = 'user'
    UNION 
        SELECT 'shsGraduate' as "name", COUNT("user".id) as "count" FROM "user" WHERE "user".shs_graduate IS NOT NULL
    UNION 
        SELECT 'collegeGraduate' as "name", COUNT("user".id) as "count" FROM "user" WHERE "user".college_graduate IS NOT NULL
    UNION
        SELECT 'expelled' as "name", COUNT("user".id) as "count" FROM "user" WHERE "user".status='expelled'
      `);

    return {
      upcomingEvents,
      graphValues,
      userCounts,
    };
  }
}
