/* eslint-disable @typescript-eslint/no-require-imports */
const supabase = require('../utils/supabaseClient')

exports.addBoard = async (req, res) => {
  const userId = req.user?.id
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })
  const { name } = req.body

  try {
    const { data: existingBoards } = await supabase
      .from('boards')
      .select('name')
      .eq('name', name)
      .single()

    if (existingBoards) {
      return res.status(400).json('Board already exists')
    }

    const { data, error } = await supabase
      .from('boards')
      .insert([{ name, user_id: userId }])
      .select()

    if (error) return res.status(400).json({ error: error.message })

    return res.status(200).json(`Board ${name} is successfully created!`)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

exports.getBoards = async (req, res) => {
  const userId = req.user?.id
  if (!userId) return res.status(401).json({ error: 'Not authenticated' })

  try {
    const { data, error } = await supabase
      .from('boards')
      .select('id, name, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) return res.status(400).json({ error: error.message })

    return res.status(200).json({ boards: data || [] })
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}
