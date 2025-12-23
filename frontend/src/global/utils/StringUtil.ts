import removeAccents from 'remove-accents';

export abstract class StringUtil {

    // requires be in front app bcs of dependecy on remove-accents library
    public static normalize = (str: string) => removeAccents(str).toLowerCase();

    public static capitalizeFirstLetter = (str: string): string => {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}