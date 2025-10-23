/** Created by Pawel Malek **/


export abstract class AuthUtil {

    public static extractTokenFromHeader(request: any): string | null {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
          return null;
        }
        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : null;
    }
}