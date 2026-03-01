import { Injectable, Logger } from '@nestjs/common';
import { CertificatesRepo } from './CertificatesRepo';
import { CertificateEntity } from 'employee/model/CertificateEntity';
import { WorkerFormDto } from '@shared/interfaces/WorkerProfileI';

@Injectable()
export class CertificatesWorkerService {

    private readonly logger = new Logger(this.constructor.name);

    constructor(
        private readonly certificatesRepo: CertificatesRepo,
    ) { }

    /**
     * Synchronize certificates for a worker profile
     * @param uid Worker's UID
     * @param certificates Array of certificate codes currently in worker profile
     * @param certificateDates Map of certificate codes to validity dates
     */
    public async syncCertificates(
        uid: string,
        certificates: string[],
        certificateDates: Record<string, string>
    ): Promise<CertificateEntity[]> {
        this.logger.log(`Syncing certificates for uid: ${uid}, certificates: ${certificates.join(', ')}`);

        // Get existing certificates for this worker
        const existingCertificates = await this.certificatesRepo.findByUid(uid);
        const existingCertCodes = existingCertificates.map(cert => cert.code);

        // Determine which certificates to add, update, and remove
        const certsToAdd = certificates.filter(code => !existingCertCodes.includes(code));
        const certsToUpdate = certificates.filter(code => 
            existingCertCodes.includes(code) && 
            certificateDates[code] &&
            existingCertificates.find(cert => cert.code === code)?.validityDate !== certificateDates[code]
        );
        const certsToRemove = existingCertCodes.filter(code => !certificates.includes(code));

        // Remove certificates that are no longer in the worker's profile
        if (certsToRemove.length > 0) {
            await this.certificatesRepo.deleteByUidAndCodes(uid, certsToRemove);
            this.logger.log(`Removed certificates: ${certsToRemove.join(', ')} for uid: ${uid}`);
        }

        // Add new certificates with validity dates (if provided)
        for (const code of certsToAdd) {
            const validityDate = certificateDates[code];
            if (validityDate) {
                await this.certificatesRepo.create({
                    uid,
                    code,
                    validityDate
                });
                this.logger.log(`Added certificate: ${code} with validity date: ${validityDate} for uid: ${uid}`);
            }
        }

        // Update certificates with changed validity dates
        for (const code of certsToUpdate) {
            const validityDate = certificateDates[code];
            if (validityDate) {
                await this.certificatesRepo.upsert(uid, code, validityDate);
                this.logger.log(`Updated certificate: ${code} with validity date: ${validityDate} for uid: ${uid}`);
            }
        }

        // Return updated list of certificates
        return this.certificatesRepo.findByUid(uid);
    }

    /**
     * Create certificates based on initial worker profile data
     * @param uid Worker's UID
     * @param form Worker form data containing certificates and their validity dates
     */
    public async createCertificates(
        uid: string,
        form: WorkerFormDto
    ): Promise<CertificateEntity[]> {
        const { certificates = [], certificateDates = {} } = form;
        this.logger.log(`Creating certificates for uid: ${uid}, certificates: ${certificates.join(', ')}`);

        const certificatesToCreate: Partial<CertificateEntity>[] = [];

        for (const code of certificates) {
            const validityDate = certificateDates[code];
            if (validityDate) {
                certificatesToCreate.push({
                    uid,
                    code,
                    validityDate
                });
            }
        }

        if (certificatesToCreate.length === 0) {
            this.logger.log(`No certificates with validity dates to create for uid: ${uid}`);
            return [];
        }

        return this.certificatesRepo.createBulk(certificatesToCreate);
    }

    /**
     * Get certificates for a worker
     * @param uid Worker's UID
     */
    public async getCertificates(uid: string): Promise<CertificateEntity[]> {
        return this.certificatesRepo.findByUid(uid);
    }

    /**
     * Delete all certificates for a worker (used when deleting worker profile)
     * @param uid Worker's UID
     */
    public async deleteAllCertificatesForWorker(uid: string): Promise<void> {
        await this.certificatesRepo.deleteByUid(uid);
        this.logger.log(`Deleted all certificates for uid: ${uid}`);
    }
}