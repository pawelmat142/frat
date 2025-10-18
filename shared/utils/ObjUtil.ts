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

    public static setValueInNestedJsonByPath(obj: any, path: string, value: string): void {
        if (path.includes('.')) {
            const keys = path.split('.');
            let current = obj;
            keys.forEach((k, i) => {
                if (!current[k]) {
                    current[k] = {};
                }
                if (i === keys.length - 1) {
                    current[k] = value;
                }
                current = current[k];
            });
        } else {
            obj[path] = value;
        }
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

    
    public static arrayChanged(arrOne: string[], arrTwo: string[]): boolean {
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
}