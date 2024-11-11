import jwt from 'jsonwebtoken'

const generateToken = (payload) => {
    return jwt.sign(
        payload,
        process.env.JWT_SECRET_KEY,
        {
          expiresIn: "7 days",
        }
      );
}

const validateToken = (token) => {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
}

export { generateToken, validateToken}