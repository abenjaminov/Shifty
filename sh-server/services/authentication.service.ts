import jwt from 'jsonwebtoken';

export class AuthenticationResult {
    authorized: boolean;
    message?:string;
}

export class AuthenticationService {
    secret:string = "TOKEN_SECRET_FOR_ASAF";

    getToken(userName:string) {
        let token = jwt.sign(
            {userName: userName},  
            this.secret,
            {expiresIn: '2h'});
        return token;
    }

    authenticate(authorization:string, userName:number) : AuthenticationResult {
        try {
            const token = authorization.split(' ')[1];
            const decodedToken = jwt.verify(token, this.secret);
            const decodedUserName = decodedToken.userName;

            if(userName && decodedUserName !== userName) {
                return {authorized:false, message: "Invalid username"};
            } else {
                return {authorized:true};
            }
        }
        catch 
        {
            return {authorized:false, message: "Invalid request"};
        }
    }

    
}