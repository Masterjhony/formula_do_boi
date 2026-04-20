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

export const LEILOES: Leilao[] = [
    { dia: 9,  mes: "Abril",    mesNum: 4,  diaSemana: "Quinta",  horario: "13:00", criador: "Toka Jakaré / 3 Nascentes",   categoria: "Fêmeas P.O.",      quantidade: 80,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "RuralPlay"    },
    { dia: 11, mes: "Abril",    mesNum: 4,  diaSemana: "Sábado",  horario: "13:00", criador: "Nelore IPB",                   categoria: "Fêmeas P.O.",      quantidade: 30,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "AgroBrasil"   },
    { dia: 14, mes: "Abril",    mesNum: 4,  diaSemana: "Terça",   horario: "19:30", criador: "Cachoeirão",                   categoria: "Fêmeas P.O.",      quantidade: 30,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "RuralPlay"    },
    { dia: 13, mes: "Maio",     mesNum: 5,  diaSemana: "Quarta",  horario: "19:00", criador: "Grupo Ribalta",                categoria: "Touros P.O.",      quantidade: 70,  modelo: "Presencial", leiloeira: "LeiloBoI",   transmissao: "Canal do Boi" },
    { dia: 21, mes: "Maio",     mesNum: 5,  diaSemana: "Quinta",  horario: "19:00", criador: "Nelore Tresmar",               categoria: "Touros P.O.",      quantidade: 60,  modelo: "Virtual",    leiloeira: "Bula",       transmissao: "Canal do Boi" },
    { dia: 24, mes: "Maio",     mesNum: 5,  diaSemana: "Domingo", horario: "09:30", criador: "Nelore MEAB & Modelo",         categoria: "Fêmeas P.O.",      quantidade: 45,  modelo: "Virtual",    leiloeira: "Bula",       transmissao: "ERural/RP"    },
    { dia: 3,  mes: "Junho",    mesNum: 6,  diaSemana: "Quarta",  horario: "19:00", criador: "Nelore Cachoeirão",            categoria: "Touros P.O.",      quantidade: 45,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "Canal do Boi" },
    { dia: 4,  mes: "Junho",    mesNum: 6,  diaSemana: "Quinta",  horario: "12:00", criador: "Nelore MNO",                   categoria: "Touros P.O.",      quantidade: 50,  modelo: "Presencial", leiloeira: "Capitaliza", transmissao: "RuralPlay"    },
    { dia: 11, mes: "Junho",    mesNum: 6,  diaSemana: "Quinta",  horario: "19:00", criador: "Nelore Tresmar",               categoria: "Fêmeas P.O.",      quantidade: 35,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "Canal do Boi" },
    { dia: 16, mes: "Junho",    mesNum: 6,  diaSemana: "Terça",   horario: "19:30", criador: "Nelore Kriz",                  categoria: "Fêmeas P.O.",      quantidade: 50,  modelo: "Virtual",    leiloeira: "Bula",       transmissao: "Canal do Boi" },
    { dia: 20, mes: "Junho",    mesNum: 6,  diaSemana: "Sábado",  horario: "12:00", criador: "Rio Bonito",                   categoria: "Touros P.O.",      quantidade: 80,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "RuralPlay"    },
    { dia: 28, mes: "Junho",    mesNum: 6,  diaSemana: "Domingo", horario: "12:00", criador: "Nelore IPB",                   categoria: "Touros IPB",       quantidade: 70,  modelo: "Presencial", leiloeira: "Capitaliza", transmissao: "AgroBrasil"   },
    { dia: 7,  mes: "Julho",    mesNum: 7,  diaSemana: "Terça",   horario: "19:30", criador: "Nelore Kriz",                  categoria: "Touros P.O.",      quantidade: 60,  modelo: "Virtual",    leiloeira: "Bula",       transmissao: "Canal do Boi" },
    { dia: 25, mes: "Julho",    mesNum: 7,  diaSemana: "Sábado",  horario: "12:00", criador: "Neloraço P.O.",                categoria: "Touros P.O.",      quantidade: 50,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "RuralPlay"    },
    { dia: 30, mes: "Julho",    mesNum: 7,  diaSemana: "Quinta",  horario: "19:00", criador: "Fazenda São Geraldo",          categoria: "Fêmeas P.O.",      quantidade: 30,  modelo: "Virtual",    leiloeira: "Bula",       transmissao: "RuralPlay"    },
    { dia: 1,  mes: "Agosto",   mesNum: 8,  diaSemana: "Sábado",  horario: "12:00", criador: "Fazenda São Geraldo",          categoria: "Touros P.O.",      quantidade: 120, modelo: "Presencial", leiloeira: "Bula",       transmissao: "RuralPlay"    },
    { dia: 29, mes: "Agosto",   mesNum: 8,  diaSemana: "Sábado",  horario: "12:00", criador: "Melhoradores",                 categoria: "Touros P.O.",      quantidade: 50,  modelo: "Presencial", leiloeira: "Bula",       transmissao: "RuralPlay"    },
    { dia: 21, mes: "Novembro", mesNum: 11, diaSemana: "Sábado",  horario: "—",     criador: "Fazendas C+4 / Camparino",     categoria: "Touros & Fêmeas",  quantidade: 100, modelo: "Presencial", leiloeira: "Bula",       transmissao: "Canal Leilões"},
];
