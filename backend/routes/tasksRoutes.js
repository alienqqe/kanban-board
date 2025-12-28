/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')

const {
  getTasks,
  addTask,
  getTasksByStatus,
  updateTask,
  deleteTask,
} = require('../controllers/tasksController')
const authenticateToken = require('../middleware/authMiddleware')

const router = express.Router()
router.get('/:id', authenticateToken, getTasks)
router.post('/add', authenticateToken, addTask)
router.post('/getByStatus/:id', authenticateToken, getTasksByStatus)
router.patch('/updateTask/:id', authenticateToken, updateTask)
router.delete('/deleteTask/:id', authenticateToken, deleteTask)

module.exports = router
