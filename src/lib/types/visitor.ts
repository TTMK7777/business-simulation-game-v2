// 社長モード: 訪問イベントの型定義

export type VisitorType =
  | 'consultation' | 'report' | 'proposal'
  | 'negotiation' | 'complaint' | 'crisis'

export type VisitorMood = 'calm' | 'anxious' | 'angry' | 'excited' | 'desperate'

export interface VisitorResponse {
  id: string
  text: string
  tone: 'supportive' | 'neutral' | 'harsh' | 'diplomatic'
  effects: {
    visitorMoraleChange: number
    ceoApprovalChange: number
    companyCultureChange?: number
    moneyChange?: number
    specialEffect?: string
  }
}

export interface VisitorEvent {
  id: string
  type: VisitorType
  visitor: {
    employeeId: number | null
    name: string
    position: string
    department: string
    mood: VisitorMood
    personalityKey?: string
  }
  title: string
  description: string
  dialogLines: string[]
  responses: VisitorResponse[]
  resolved: boolean
  chosenResponseId?: string
  // 決裁連動
  relatedDocumentId?: string
  documentClueToAdd?: { field: string; observation: string }
}

// 訪問テンプレート（config用）
export interface VisitorTemplate {
  type: VisitorType
  titleTemplate: string
  descriptionTemplate: string
  dialogTemplates: string[]
  responsesTemplate: Omit<VisitorResponse, 'id'>[]
  triggerCondition?: (state: any) => boolean
  weight: number
  moods: VisitorMood[]
}
