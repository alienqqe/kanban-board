/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')

const { addBoard, getBoards } = require('../controllers/boardController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()
router.post('/add', authenticateToken, addBoard)
router.get('/', authenticateToken, getBoards)

module.exports = router
