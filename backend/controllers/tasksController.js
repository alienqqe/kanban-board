/* eslint-disable @typescript-eslint/no-require-imports */
const supabase = require('../utils/supabaseClient')

exports.getTasks = async (req, res) => {
  const { id } = req.params

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', id)
    .order('position')

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ tasks: tasks })
}

exports.addTask = async (req, res) => {
  const { boardId, title, status, position } = req.body

  try {
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ title, status, position, board_id: boardId }])
      .select()

    if (error) return res.status(400).json({ error: error.message })

    return res
      .status(200)
      .json(`Task ${title} is successfully created in column ${status}!`)
  } catch (err) {
    return res.status(500).json({ error: err.message })
  }
}

exports.getTasksByStatus = async (req, res) => {
  const { id } = req.params
  const { status } = req.body

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('board_id', id)
    .eq('status', status)
    .order('position')

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ tasks: tasks })
}

exports.updateTask = async (req, res) => {
  const { id } = req.params
  const { status, position } = req.body

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: status, position: position })
    .eq('id', id)
    .select()

  if (error) {
    return res.status(400).json({ error: error.message })
  }

  res.json({ message: `Task ${id} is successfully updated` })
}

exports.deleteTask = async (req, res) => {
  const { id } = req.params

  const { data, deleteError } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .select()

  if (deleteError) {
    return res.status(400).json({ error: deleteError.message })
  }

  res.json({ message: `Successfully deleted task`, task: data })
}
