import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { EmployeeProfileForm } from "@shared/def/employee-profile.def";
import { EmployeeProfileI } from "@shared/interfaces/EmployeeProfileI";
import { EmployeeProfileEntity } from "employee/model/EmployeeProfileEntity";
import { Repository } from "typeorm";

@Injectable()
export class EmployeeProfileRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(EmployeeProfileEntity)
        private employeeProfileRepository: Repository<EmployeeProfileEntity>,
    ) { }

    
    public async create(createObject: EmployeeProfileI): Promise<EmployeeProfileEntity> {
        const entity = this.employeeProfileRepository.create(createObject)
        console.log('entity', {entity});
        const saved = await this.employeeProfileRepository.save(entity);
        console.log('saved', {saved});
        this.logger.log(`Created new user: ${saved.employeeProfileId}`);
        return saved;
    }
}