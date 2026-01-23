export const PRODUCTS = [
    {
        id: 1,
        name: "REM ARMADOR x QUARK COL",
        category: "Touro Nelore",
        classificacao: "reprodutor",
        modalidade: "venda_direta",
        logistica: "frete_gratis",
        forma_pagamento: "parcelado_30x",
        location: "Uberaba - MG",
        image: "/cattle/boi_nelore_elite.jpg",
        gallery: [
            "/cattle/boi_nelore_elite.jpg",
            "/cattle/boi_01.jpg",
            "/cattle/boi_02.jpg",
            "/cattle/boi_03.jpg"
        ],
        price: "1.200,00",
        installments: "36.000,00",
        tag: "DESTAQUE",
        details: {
            registro: "PO 123456",
            raca: "Nelore Mocho",
            nascimento: "15/05/2021 (32 Meses)",
            pai: "REM ARMADOR",
            mae: "VACA QUARK COL",
            peso: "850 kg",
            comentario: "Touro de extrema avaliação genética, filho direto do consagrado REM Armador. Animal que se destaca pela sua carcaça volumosa."
        }
    },
    {
        id: 2,
        name: "LANDROVER DA XARAES",
        category: "Reprodutor",
        classificacao: "reprodutor",
        modalidade: "leilao",
        logistica: "frete_compartilhado",
        forma_pagamento: "parcelado_24x",
        location: "Goiânia - GO",
        image: "/cattle/boi_reprodutor.jpg",
        gallery: [
            "/cattle/boi_reprodutor.jpg",
            "/cattle/boi_05.jpg",
            "/cattle/boi_06.jpg",
            "/cattle/boi_07.jpg"
        ],
        price: "950,00",
        installments: "28.500,00",
        tag: "LOTE 02",
        details: {
            registro: "PO 789012",
            raca: "Nelore Padrão",
            nascimento: "20/08/2021 (29 Meses)",
            pai: "LANDROVER",
            mae: "DA XARAES",
            peso: "910 kg",
            comentario: "Reprodutor de carcaça moderna e muito comprimento. Opção certa para quem busca peso e precocidade."
        }
    },
    {
        id: 3,
        name: "MATRIZ ELITE 5019",
        category: "Matriz PO",
        classificacao: "matriz",
        modalidade: "venda_permanente",
        logistica: "retira_fazenda",
        forma_pagamento: "parcelado_12x",
        location: "Campo Grande - MS",
        image: "/cattle/boi_nelore_detalhe.jpg",
        gallery: [
            "/cattle/boi_nelore_detalhe.jpg",
            "/cattle/boi_09.jpeg",
            "/cattle/boi_10.jpg",
            "/cattle/boi_11.jpg"
        ],
        price: "3.500,00",
        installments: "105.000,00",
        tag: "PREMIUM",
        details: {
            registro: "PO 345678",
            raca: "Nelore",
            nascimento: "10/01/2020 (48 Meses)",
            pai: "BITELO DA SS",
            mae: "MATRIZ 5000",
            peso: "720 kg",
            comentario: "Matriz de exceção! Doadora comprovada, segue parida de fêmea e prenhe do Kayak TE Mafra."
        }
    },
    // Removed Brahman product
    // Removed Tabapuã product (replaced with Nelore options)
    {
        id: 6,
        name: "BIG BEN DA SANTA NICE",
        category: "Touro PO",
        classificacao: "reprodutor",
        modalidade: "shopping",
        logistica: "frete_gratis",
        forma_pagamento: "a_vista",
        location: "Uberlândia - MG",
        image: "/cattle/boi_corte_qualidade.jpg",
        gallery: [
            "/cattle/boi_corte_qualidade.jpg",
            "/cattle/boi_21.jpg",
            "/cattle/boi_23.jpg",
            "/cattle/boi_24.jpg"
        ],
        price: "1.800,00",
        installments: "54.000,00",
        tag: "LOTE 06",
        details: {
            registro: "PO 112233",
            raca: "Nelore",
            nascimento: "30/06/2019 (54 Meses)",
            pai: "BIG BEN",
            mae: "SANTA NICE",
            peso: "1100 kg",
            comentario: "Touro provado! Produz bezerros pesados e com excelente rendimento de carcaça. Oportunidade rara."
        }
    },
    {
        id: 7,
        name: "Novilha Nelore SGN - 2724",
        category: "Novilha PO",
        classificacao: "reposicao",
        modalidade: "venda_direta",
        logistica: "frete_compartilhado",
        forma_pagamento: "parcelado_24x",
        location: "Itapetininga - SP",
        image: "/cattle/boi_nelore_elite.jpg",
        gallery: ["/cattle/boi_nelore_elite.jpg"],
        price: "850,00",
        installments: "25.500,00",
        tag: "DECA 1",
        details: {
            raca: "Nelore",
            registro: "PO 998877",
            nascimento: "10/10/2022",
            pai: "GANDHI PO",
            mae: "MATRIZ 200",
            peso: "450 kg",
            comentario: "Novilha pronta para serviço."
        }
    }
];
