export interface CRMStage {
    id: string;
    name: string;
    color: string;
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
    { id: 'Lead', name: 'Lead', color: 'pink' },
    { id: 'Qualificado', name: 'Qualificado', color: 'orange' },
    { id: 'Proposta', name: 'Proposta', color: 'blue' },
    { id: 'Negociação', name: 'Negociação', color: 'purple' },
    { id: 'Fechado', name: 'Fechado', color: 'green' },
    { id: 'Perdido', name: 'Perdido', color: 'red' },
    { id: 'Sem Status', name: 'Sem Status', color: 'gray' },
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
