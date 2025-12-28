/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const supabase = require('../utils/supabaseClient.js')
const dotenv = require('dotenv')
dotenv.config()

const JWT_SECRET = process.env.JWT_SECRET
const REFRESH_SECRET = process.env.REFRESH_SECRET

exports.register = async (req, res) => {
  const { username, password } = req.body

  try {
    const hashed = await bcrypt.hash(password, 10)

    const { data: existingUser } = await supabase
      .from('users')
      .select('username')
      .eq('username', username)
      .single()

    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' })
    }

    const { data, error } = await supabase
      .from('users')
      .insert([
        {
          username,
          password_hash: hashed,
        },
      ])
      .select()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(201).json({ message: 'User registered', user: data[0] })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

exports.login = async (req, res) => {
  const { username, password } = req.body

  const { data: user, error } = await supabase
    .from('users')
    .select('*')
    .eq('username', username)
    .single()

  if (error || !user)
    return res.status(401).json({ message: 'Invalid credentials' })

  const valid = await bcrypt.compare(password, user.password_hash)
  if (!valid) return res.status(401).json({ message: 'Invalid credentials' })

  const accessToken = jwt.sign({ userId: user.id }, JWT_SECRET, {
    expiresIn: '15m',
  })
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_SECRET, {
    expiresIn: '7d',
  })

  await supabase.from('refresh_tokens').insert({
    token: refreshToken,
    user_id: user.id,
    expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  })

  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  })

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })

  return res.json({ message: 'Logged in', accessToken: accessToken })
}

exports.refresh = async (req, res) => {
  const refreshToken = req.cookies.refreshToken
  if (!refreshToken)
    return res.status(401).json({ error: 'Missing refresh token' })

  const { data: tokenRecord } = await supabase
    .from('refresh_tokens')
    .select('user_id, expires_at')
    .eq('token', refreshToken)
    .single()

  if (!tokenRecord) return res.status(403).json({ error: 'Invalid token' })
  if (new Date(tokenRecord.expires_at) < new Date())
    return res.status(403).json({ error: 'Expired token' })

  try {
    jwt.verify(refreshToken, REFRESH_SECRET)
  } catch (err) {
    return res.status(403).json({ error: 'Invalid refresh token' })
  }

  const newAccessToken = jwt.sign({ userId: tokenRecord.user_id }, JWT_SECRET, {
    expiresIn: '15m',
  })

  res.cookie('accessToken', newAccessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60 * 1000,
  })

  return res.json({ accessToken: newAccessToken })
}

exports.logout = async (req, res) => {
  const refreshToken = req.cookies.refreshToken

  if (refreshToken) {
    await supabase.from('refresh_tokens').delete().eq('token', refreshToken)
  }

  res.clearCookie('accessToken')
  res.clearCookie('refreshToken')

  return res.json({ message: 'Logged out' })
}

exports.me = async (req, res) => {
  const userId = req.user?.id || req.user?.userId
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })

  const { data, error } = await supabase
    .from('users')
    .select('id, username')
    .eq('id', userId)
    .single()

  if (error) return res.status(400).json(error)

  return res.json(data)
}
