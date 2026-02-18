import type { JobType } from './CharacterRenderer'

/**
 * Employee interface (matching game.ts structure)
 */
export interface Employee {
  id: number | string
  name: string
  abilities?: {
    technical?: number
    sales?: number
    planning?: number
    management?: number
  }
  department?: string
  position?: string
  jobType?: JobType
}

/**
 * Determine job type based on employee skills and department
 * Priority:
 * 1. Use existing jobType if available
 * 2. Use department mapping
 * 3. Use highest skill
 * 4. Default to 'developer'
 */
export function determineJobType(employee: Employee): JobType {
  // If jobType already set, use it
  if (employee.jobType) {
    return employee.jobType
  }

  // Map department to job type
  if (employee.department) {
    const departmentMap: Record<string, JobType> = {
      'development': 'developer',
      'sales': 'sales',
      'marketing': 'marketing',
      'management': 'manager'
    }

    const mapped = departmentMap[employee.department.toLowerCase()]
    if (mapped) {
      return mapped
    }
  }

  // Use highest skill
  if (employee.abilities) {
    const skills = {
      technical: employee.abilities.technical || 0,
      sales: employee.abilities.sales || 0,
      planning: employee.abilities.planning || 0,
      management: employee.abilities.management || 0
    }

    const maxSkill = Math.max(...Object.values(skills))

    if (skills.technical === maxSkill) return 'developer'
    if (skills.sales === maxSkill) return 'sales'
    if (skills.planning === maxSkill) return 'marketing'
    if (skills.management === maxSkill) return 'manager'
  }

  // Default to developer
  return 'developer'
}

/**
 * Get job type color theme
 */
export function getJobTypeColor(jobType: JobType): string {
  const colors: Record<JobType, string> = {
    developer: '#4A90E2',
    sales: '#FF6B6B',
    marketing: '#50E3C2',
    manager: '#34495E'
  }

  return colors[jobType]
}

/**
 * Get job type display name
 */
export function getJobTypeName(jobType: JobType): string {
  const names: Record<JobType, string> = {
    developer: '開発者',
    sales: '営業',
    marketing: 'マーケティング',
    manager: 'マネージャー'
  }

  return names[jobType]
}

/**
 * Get job type emoji/icon
 */
export function getJobTypeIcon(jobType: JobType): string {
  const icons: Record<JobType, string> = {
    developer: '💻',
    sales: '📞',
    marketing: '📊',
    manager: '📋'
  }

  return icons[jobType]
}
