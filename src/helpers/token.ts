import { sign } from "jsonwebtoken";

export function generateJwt(user) {
  const payload = { id: user.id, email: user.email };
  return sign(payload, process.env.SECRET);
}

module.exports = { generateJwt };