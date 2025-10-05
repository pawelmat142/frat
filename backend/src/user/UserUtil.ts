import { UserProvider, UserProviders } from "@shared/interfaces/UserI";
import { DecodedIdToken } from "firebase-admin/auth";

export abstract class UserUtil {

    public static findProvider(decodedToken: DecodedIdToken): UserProvider | null  {
       const string = JSON.stringify(decodedToken.firebase)

       if (string) {
            if (string.toLocaleLowerCase().includes('google')) {
                return UserProviders.GOOGLE
            }
       }
       return null
    }
}