import { Response } from 'express';

export abstract class ImportUtil {

    public static prepareExportResponse(res: Response, filenameBase: string): void {
        res.setHeader('Content-Type', 'application/json');
        const now = new Date();
        const pad = (n: number) => n.toString().padStart(2, '0');
        const dateStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}`;
        res.setHeader('Content-Disposition', `attachment; filename="${filenameBase}_${dateStr}.json"`);
        res.setHeader('Access-Control-Expose-Headers', 'Content-Disposition');
    }
}