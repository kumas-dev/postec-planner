export const PERMISSIONS = ['admin', 'common'] as const
export type Permission = (typeof PERMISSIONS)[number]

export const TASK_TYPES = <const>[
  'general',
  'stockIn',
  'rental',
  'order',
  'memo',
  'visit',
  'repair',
  'reject',
  'request',
  'contract',
]

export type TaskType = (typeof TASK_TYPES)[number]

export type StateType =
  | 'pending'
  | 'inProgress'
  | 'completed'
  | 'onHold'
  | 'excluded'
