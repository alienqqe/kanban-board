/* eslint-disable @typescript-eslint/no-require-imports */
const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const boardRoutes = require('./routes/boardRoutes')
const tasksRoutes = require('./routes/tasksRoutes')

const app = express()

const corsOptions = {
  origin: ['http://localhost:3000, https://kanban-board-228.vercel.app/'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  credentials: true,
}

app.use(cors(corsOptions))

app.use(express.json())
app.use(cookieParser())

app.use('/api/auth', authRoutes)
app.use('/api/board', boardRoutes)
app.use('/api/tasks', tasksRoutes)

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server is listening on port ${PORT}`))
