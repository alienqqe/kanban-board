// eslint-disable-next-line @typescript-eslint/no-require-imports
const jwt = require('jsonwebtoken')

function authMiddleware(req, res, next) {
  const token = req.cookies?.accessToken

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = { id: decoded.userId }
    next()
  } catch (err) {
    return res.status(403).json({ error: 'Invalid or expired token' })
  }
}

module.exports = authMiddleware
