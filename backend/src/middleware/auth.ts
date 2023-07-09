import jwt, { TokenExpiredError } from "jsonwebtoken";
import "dotenv/config";

const verifyToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer")) {
    return res.status(403).send("A token is required for authentication");
  }
  try {
    jwt.verify(
      authHeader.split(" ")[1],
      process.env.JWT_KEY ?? "jwt_key",
      function (err: any, decoded: any) {
        if (decoded) {
          console.log(decoded);
          req.body.decoded = decoded;
        }
      }
    );
  } catch (err) {
    if (err instanceof TokenExpiredError) {
      return res.status(401).send("jwt expired");
    } else {
      return res.status(401).send("Invalid Token");
    }
  }
  return next();
};

export default verifyToken;
