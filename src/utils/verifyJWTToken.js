import jwt from "jsonwebtoken";

export default (token) => {
console.log('token is ' + token)
  let decoded = jwt.verify(token, 'UpFJfpWK');
  return decoded;
}

//  return new Promise(
//    (
//      resolve,
//      reject
//    ) => {
//      jwt.verify(
//        token,
//        process.env.JWT_SECRET || "UpFJfpWK",
//        (err, decodedData) => {
//         if (err || !decodedData) {
//            return reject(err);
//          }
//          resolve(decodedData);
//        }
//      );
//   }
//  );
//}
