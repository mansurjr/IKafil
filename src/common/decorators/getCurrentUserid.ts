// import {
//   createParamDecorator,
//   ExecutionContext,
//   ForbiddenException,
// } from "@nestjs/common";
// import { JWT_Payoad } from "../../jwt/jwt.service";

// export const GetCurrentUser = createParamDecorator(
//   (data: keyof JWT_Payoad | undefined, context: ExecutionContext) => {
//     const request = context.switchToHttp().getRequest();
//     const user = request.user as JWT_Payoad;

//     if (!user) {
//       throw new ForbiddenException("Foydalanuvchi aniqlanmadi");
//     }

//     return data ? user[data] : user;
//   }
// );
