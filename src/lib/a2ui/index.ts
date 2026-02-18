/**
 * A2UI for Business Empire
 * Main entry point for A2UI components
 */

// Re-export all components
export * from './components'
export * from './game-components'
export { A2UIManager, getA2UIManager } from './manager'
export type { AdvisorMessage, NewsItem, EventNotificationData, FinanceData, EmployeeData } from './manager'

// Import components to ensure they are registered
import './components'
import './game-components'
