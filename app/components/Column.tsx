'use client'
import React, { forwardRef, useMemo, useState } from 'react'
import Draggable, { DraggableData, DraggableEvent } from 'react-draggable'
import { Task } from '../types/task'
import { TaskStatus } from '../types/TaskStatus'

type ColumnProps = {
  name: TaskStatus
  tasks: Task[]
  onDropTask: (taskId: string, from: TaskStatus, to: TaskStatus) => void
  findColumnAtPoint: (x: number, y: number) => TaskStatus | null
  onDeleteTask?: (taskId: string) => void
}

// Normalize mouse/touch coordinates for hit-testing
const getClientPoint = (e: DraggableEvent) => {
  if ('changedTouches' in e && e.changedTouches.length) {
    const t = e.changedTouches[0]
    return { x: t.clientX, y: t.clientY }
  }
  if ('touches' in e && e.touches.length) {
    const t = e.touches[0]
    return { x: t.clientX, y: t.clientY }
  }
  if ('clientX' in e && 'clientY' in e) {
    return { x: e.clientX, y: e.clientY }
  }
  return { x: 0, y: 0 }
}

const Column = forwardRef<HTMLDivElement, ColumnProps>(
  ({ name, tasks, onDropTask, findColumnAtPoint, onDeleteTask }, ref) => {
    const [draggingId, setDraggingId] = useState<string | null>(null)

    // Create node refs for each task id (avoids touching ref.current during render)
    const nodeRefs = useMemo(() => {
      const refs: Record<string, React.RefObject<HTMLDivElement | null>> = {}
      tasks.forEach((t) => {
        refs[t.id] = React.createRef<HTMLDivElement>()
      })
      return refs
    }, [tasks])

    return (
      <div ref={ref} className='bg-neutral-900 p-4 rounded w-full min-h-[70vh]'>
        <div className='mb-3 flex items-center justify-between gap-3'>
          <h2 className='font-bold uppercase text-neutral-300'>{name}</h2>
        </div>

        <div className='flex flex-col gap-2 relative'>
          {tasks.map((task) => (
            <Draggable
              key={task.id}
              nodeRef={nodeRefs[task.id]}
              bounds='body'
              onStart={() => setDraggingId(task.id)}
              onStop={(e, data: DraggableData) => {
                setDraggingId(null)
                const { x, y } = getClientPoint(e)
                const dropCol = findColumnAtPoint(x, y)

                // Always reset transform so cards snap back if not moved to another column.
                if (data?.node) {
                  data.node.style.transform = 'translate(0px, 0px)'
                }

                if (dropCol && dropCol !== name) {
                  onDropTask(task.id, name, dropCol)
                }
              }}
            >
              <div
                ref={nodeRefs[task.id]}
                className={`p-3 rounded bg-neutral-800 border border-neutral-700 cursor-move select-none shadow ${
                  draggingId === task.id ? 'opacity-80 ring-2 ring-blue-500' : ''
                }`}
              >
                <div className='flex items-start justify-between gap-3'>
                  <span className='block'>{task.title}</span>
                  <button
                    type='button'
                    aria-label={`Delete task ${task.title}`}
                    onClick={() => onDeleteTask?.(task.id)}
                    className='h-7 w-7 rounded border border-neutral-700 text-neutral-400 hover:text-red-400 hover:border-red-500 transition flex items-center justify-center shrink-0'
                  >
                    x
                  </button>
                </div>
              </div>
            </Draggable>
          ))}
        </div>
      </div>
    )
  }
)

Column.displayName = 'Column'
export default Column
