export type Leilao = {
    dia: number;
    mes: string;
    mesNum: number;
    diaSemana: string;
    horario: string;
    criador: string;
    categoria: string;
    quantidade: number;
    modelo: "Presencial" | "Virtual";
    leiloeira: string;
    transmissao: string;
};
