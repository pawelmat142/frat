import { Position } from '../interfaces/MapsInterfaces';
import { TranslationData, TranslationDataWithPaths } from '../interfaces/TranslationI';

export abstract class ObjUtil {

    public static getPathsFromNestedJsonKeys(obj: any, prefix = ''): string[] {
        return Object.keys(obj).flatMap(key => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                return ObjUtil.getPathsFromNestedJsonKeys(value, newKey);
            }
            return newKey;
        });
    }

    public static getValueFromNestedJsonByPath(obj: any, path: string): any {
        return path.split('.').reduce((o, k) => (o || {})[k], obj);
    }

    public static deleteValueInNestedJsonByPath(obj: any, path: string): void {
        const keys = path.split('.');
        let current = obj;
        keys.forEach((k, i) => {
            if (i === keys.length - 1) {
                delete current[k];
            } else {
                current = current[k];
            }
        });
    }

    public static deleteValueFromNestedJsonByPath(obj: any, path: string): void {
        const keys = path.split('.');
        let current = obj;
        keys.forEach((k, i) => {
            if (i === keys.length - 1) {
                delete current[k];
            } else {
                current = current[k];
            }
        });
    }

    public static setValueInNestedJsonByPath(obj: any, path: string, value: string): void {
        if (path.includes('.')) {
            const keys = path.split('.');
            let current = obj;
            keys.forEach((k, i) => {
                // If not last key, ensure current[k] is an object
                if (i < keys.length - 1) {
                    if (typeof current[k] !== 'object' || current[k] === null) {
                        current[k] = {};
                    }
                    current = current[k];
                } else {
                    current[k] = value;
                }
            });
        } else {
            obj[path] = value;
        }
    }

    public static transformNestedJsonToFlatPaths(obj: TranslationData, prefix = ''): TranslationDataWithPaths {
        return Object.keys(obj).reduce((acc, key) => {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                Object.assign(acc, ObjUtil.transformNestedJsonToFlatPaths(value, newKey));
            } else {
                acc[newKey] = value;
            }
            return acc;
        }, {} as { [key: string]: any });
    }

    public static numberArrayChanged(arrOne: number[], arrTwo: number[]): boolean {
        if (arrOne.length !== arrTwo.length) {
            return true;
        }
        for (let i = 0; i < arrOne.length; i++) {
            if (arrOne[i] !== arrTwo[i]) {
                return true;
            }
        }
        return false;
    }

    public static arrayChanged(arrOne?: string[], arrTwo?: string[]): boolean {
        if (!arrOne && !arrTwo) return false;
        if (!arrOne || !arrTwo) return true;
        if (arrOne.length !== arrTwo.length) {
            return true;
        }
        for (let i = 0; i < arrOne.length; i++) {
            if (arrOne[i] !== arrTwo[i]) {
                return true;
            }
        }
        return false;
    }

    public static positionChanged(positionOne?: Position | null, positionTwo?: Position | null): boolean {
        if (!positionOne && !positionTwo) return false;
        if (!positionOne || !positionTwo) return true;
        return positionOne.lat !== positionTwo.lat || positionOne.lng !== positionTwo.lng;
    }
}