export interface CRMStage {
    id: string;
    name: string;
    color: string;
    probability?: number; // 0-100, default win probability for this stage
}

export interface CRMCustomField {
    id: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'date' | 'select';
    options?: string[];
    required?: boolean;
}

export interface CRMFunnel {
    id: string;
    name: string;
    color?: string;
    stages: CRMStage[];
    custom_fields: CRMCustomField[];
}

export interface CRMResponsavel {
    id: string;
    name: string;
    email?: string;
    color?: string;
}

export interface CRMConfig {
    stages: CRMStage[];
    custom_fields: CRMCustomField[];
    funnels: CRMFunnel[];
    responsaveis: CRMResponsavel[];
}

export const DEFAULT_STAGES: CRMStage[] = [
    { id: 'Lead', name: 'Lead', color: 'pink', probability: 10 },
    { id: 'Qualificado', name: 'Qualificado', color: 'orange', probability: 25 },
    { id: 'Proposta', name: 'Proposta', color: 'blue', probability: 50 },
    { id: 'Negociação', name: 'Negociação', color: 'purple', probability: 75 },
    { id: 'Fechado', name: 'Fechado', color: 'green', probability: 100 },
    { id: 'Perdido', name: 'Perdido', color: 'red', probability: 0 },
    { id: 'Sem Status', name: 'Sem Status', color: 'gray', probability: 0 },
];

export const DEFAULT_FUNNEL: CRMFunnel = {
    id: 'default',
    name: 'Pipeline Principal',
    color: 'yellow',
    stages: DEFAULT_STAGES,
    custom_fields: [],
};

export const DEFAULT_CRM_CONFIG: CRMConfig = {
    stages: DEFAULT_STAGES,
    custom_fields: [],
    funnels: [DEFAULT_FUNNEL],
    responsaveis: [],
};

export const STAGE_COLOR_HEX: Record<string, string> = {
    pink: '#ec4899',
    orange: '#f97316',
    blue: '#3b82f6',
    purple: '#a855f7',
    green: '#22c55e',
    red: '#ef4444',
    gray: '#6b7280',
    yellow: '#eab308',
    cyan: '#06b6d4',
    indigo: '#6366f1',
};

export function getStageColorHex(color?: string): string {
    if (!color) return STAGE_COLOR_HEX.gray;
    return STAGE_COLOR_HEX[color] || color;
}
