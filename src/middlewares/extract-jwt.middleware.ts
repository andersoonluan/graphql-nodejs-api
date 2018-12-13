import * as jwt from 'jsonwebtoken';
import db from './../models';
import { RequestHandler, Request, Response, NextFunction } from "express";
import { UserIntance } from '../models/UserModel';

export const extractJwtMiddleware = () : RequestHandler => {

    return (req: Request, res: Response, next: NextFunction) : void => {

        let authorization: string = req.get('Authorization'); // Authorization = Bearer Token
        let token: string = authorization ? authorization.split(' ')[1] : undefined;

        req['context'] = {};
        req['context']['authorization'] = authorization;

        if(!token){ return next(); }

        // Verify and Decoded User ID with JWT.
        jwt.verify(token, "JWT_SECRET", (err, decoded: any) => {
            if(err) { return next() };

            db.User.findById(decoded.sub, {
                attributes: ['id', 'email']
            }).then((user: UserIntance) => {

                // Set information User.
                if(user) {
                    req['context']['authUser'] = {
                        id: user.get('id'),
                        email: user.get('email')
                    };
                }
                return next();
            });
        });

    };
};