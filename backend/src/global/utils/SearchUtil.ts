export abstract class SearchUtil {

    public static parseArray = (val: any): string[] | undefined => {
        if (Array.isArray(val)) return val;
        if (typeof val === 'string' && val.length > 0) return val.split(',');
        return undefined;
    };
        
}