/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')

const {
  register,
  refresh,
  me,
  login,
  logout,
} = require('../controllers/authController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()
router.post('/register', register)
router.post('/login', login)
router.get('/refresh', refresh)
router.get('/me', authenticateToken, me)
router.post('/logout', logout)

module.exports = router
