import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CertificateEntity } from "employee/model/CertificateEntity";

@Injectable()
export class CertificatesRepo {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        @InjectRepository(CertificateEntity)
        private certificatesRepository: Repository<CertificateEntity>,
    ) { }

    public async findByUid(uid: string): Promise<CertificateEntity[]> {
        return this.certificatesRepository.find({ where: { uid } });
    }

    public async create(certificate: Partial<CertificateEntity>): Promise<CertificateEntity> {
        const entity = this.certificatesRepository.create(certificate);
        const saved = await this.certificatesRepository.save(entity);
        this.logger.log(`Created certificate: ${saved.certificateId} for uid: ${saved.uid}, code: ${saved.code}`);
        return saved;
    }

    public async createBulk(certificates: Partial<CertificateEntity>[]): Promise<CertificateEntity[]> {
        if (certificates.length === 0) {
            return [];
        }
        
        const entities = this.certificatesRepository.create(certificates);
        const saved = await this.certificatesRepository.save(entities);
        this.logger.log(`Created ${saved.length} certificates in bulk`);
        return saved;
    }

    public async update(certificateId: number, updateData: Partial<CertificateEntity>): Promise<CertificateEntity> {
        await this.certificatesRepository.update(certificateId, updateData);
        const updated = await this.certificatesRepository.findOne({ where: { certificateId } });
        this.logger.log(`Updated certificate: ${certificateId}`);
        return updated!;
    }

    public async deleteByUid(uid: string): Promise<void> {
        const result = await this.certificatesRepository.delete({ uid });
        this.logger.log(`Deleted ${result.affected} certificates for uid: ${uid}`);
    }

    public async deleteByUidAndCode(uid: string, code: string): Promise<void> {
        const result = await this.certificatesRepository.delete({ uid, code });
        this.logger.log(`Deleted certificate with code: ${code} for uid: ${uid}`);
    }

    public async deleteByUidAndCodes(uid: string, codes: string[]): Promise<void> {
        if (codes.length === 0) {
            return;
        }
        
        const result = await this.certificatesRepository
            .createQueryBuilder()
            .delete()
            .where('uid = :uid', { uid })
            .andWhere('code IN (:...codes)', { codes })
            .execute();
        
        this.logger.log(`Deleted ${result.affected} certificates for uid: ${uid} with codes: ${codes.join(', ')}`);
    }

    public async findByUidAndCode(uid: string, code: string): Promise<CertificateEntity | null> {
        return this.certificatesRepository.findOne({ where: { uid, code } });
    }

    public async upsert(uid: string, code: string, validityDate: string): Promise<CertificateEntity> {
        const existing = await this.findByUidAndCode(uid, code);
        
        if (existing) {
            existing.validityDate = validityDate;
            const saved = await this.certificatesRepository.save(existing);
            this.logger.log(`Updated certificate: ${existing.certificateId} with new validity date: ${validityDate}`);
            return saved;
        } else {
            return this.create({ uid, code, validityDate });
        }
    }
}