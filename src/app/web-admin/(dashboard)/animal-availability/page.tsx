import { createClient } from '@/utils/supabase/server';
import { MapPin, Package, CheckCircle, XCircle, Clock, BarChart3, List } from 'lucide-react';

// Mapeamento de cidades de MG para suas mesorregiões
const MG_REGIONS: Record<string, string> = {
    // Metropolitana de BH
    'Belo Horizonte': 'Metropolitana de BH',
    'Contagem': 'Metropolitana de BH',
    'Betim': 'Metropolitana de BH',
    'Esmeraldas': 'Metropolitana de BH',
    'Ribeirão das Neves': 'Metropolitana de BH',
    'Santa Luzia': 'Metropolitana de BH',
    'Sabará': 'Metropolitana de BH',
    'Vespasiano': 'Metropolitana de BH',
    'Ibirité': 'Metropolitana de BH',
    'Lagoa Santa': 'Metropolitana de BH',
    'Pedro Leopoldo': 'Metropolitana de BH',
    'Matozinhos': 'Metropolitana de BH',
    'Sete Lagoas': 'Metropolitana de BH',
    'Paraopeba': 'Metropolitana de BH',
    'Nova Lima': 'Metropolitana de BH',
    'Brumadinho': 'Metropolitana de BH',

    // Triângulo Mineiro / Alto Paranaíba
    'Uberaba': 'Triângulo Mineiro',
    'Uberlândia': 'Triângulo Mineiro',
    'Patos de Minas': 'Triângulo Mineiro',
    'Patrocínio': 'Triângulo Mineiro',
    'Araguari': 'Triângulo Mineiro',
    'Ituiutaba': 'Triângulo Mineiro',
    'Frutal': 'Triângulo Mineiro',
    'Araxá': 'Triângulo Mineiro',
    'Sacramento': 'Triângulo Mineiro',
    'Abadia dos Dourados': 'Triângulo Mineiro',
    'Monte Carmelo': 'Triângulo Mineiro',
    'Tupaciguara': 'Triângulo Mineiro',
    'Planura': 'Triângulo Mineiro',
    'Delta': 'Triângulo Mineiro',
    'Iturama': 'Triângulo Mineiro',
    'Campina Verde': 'Triângulo Mineiro',
    'Capinópolis': 'Triângulo Mineiro',
    'Prata': 'Triângulo Mineiro',

    // Noroeste de Minas
    'João Pinheiro': 'Noroeste de Minas',
    'Unaí': 'Noroeste de Minas',
    'Paracatu': 'Noroeste de Minas',
    'Brasilândia de Minas': 'Noroeste de Minas',
    'Bonfinópolis de Minas': 'Noroeste de Minas',
    'Guarda-Mor': 'Noroeste de Minas',
    'Vazante': 'Noroeste de Minas',
    'Lagoa Grande': 'Noroeste de Minas',
    'Cabeceira Grande': 'Noroeste de Minas',
    'Dom Bosco': 'Noroeste de Minas',
    'Arinos': 'Noroeste de Minas',
    'Natalândia': 'Noroeste de Minas',

    // Norte de Minas
    'Montes Claros': 'Norte de Minas',
    'Itacarambi': 'Norte de Minas',
    'Januária': 'Norte de Minas',
    'Bocaiúva': 'Norte de Minas',
    'Janaúba': 'Norte de Minas',
    'Manga': 'Norte de Minas',
    'São Francisco': 'Norte de Minas',
    'Pirapora': 'Norte de Minas',
    'Várzea da Palma': 'Norte de Minas',
    'Coração de Jesus': 'Norte de Minas',
    'Mirabela': 'Norte de Minas',
    'Capitão Enéas': 'Norte de Minas',
    'Brasília de Minas': 'Norte de Minas',
    'Buritizeiro': 'Norte de Minas',
    'Lontra': 'Norte de Minas',
    'Catuti': 'Norte de Minas',
    'Verdelândia': 'Norte de Minas',
    'Varzelândia': 'Norte de Minas',
    'Claro dos Poções': 'Norte de Minas',
    'Monte Azul': 'Norte de Minas',
    'Porteirinha': 'Norte de Minas',
    'Riacho dos Machados': 'Norte de Minas',
    'Rio Pardo de Minas': 'Norte de Minas',
    'Salinas': 'Norte de Minas',
    'Taiobeiras': 'Norte de Minas',
    'Francisco Sá': 'Norte de Minas',
    'Espinosa': 'Norte de Minas',
    'Pai Pedro': 'Norte de Minas',

    // Jequitinhonha
    'Diamantina': 'Jequitinhonha',
    'Araçuaí': 'Jequitinhonha',
    'Teófilo Otoni': 'Jequitinhonha',
    'Almenara': 'Jequitinhonha',
    'Medina': 'Jequitinhonha',
    'Pedra Azul': 'Jequitinhonha',
    'Capelinha': 'Jequitinhonha',
    'Berilo': 'Jequitinhonha',
    'Virgem da Lapa': 'Jequitinhonha',
    'Joaíma': 'Jequitinhonha',
    'Ponto dos Volantes': 'Jequitinhonha',

    // Vale do Mucuri
    'Nanuque': 'Vale do Mucuri',
    'Novo Cruzeiro': 'Vale do Mucuri',
    'Caraí': 'Vale do Mucuri',
    'Setubinha': 'Vale do Mucuri',
    'Carlos Chagas': 'Vale do Mucuri',
    'Pavão': 'Vale do Mucuri',
    'Ataléia': 'Vale do Mucuri',
    'Frei Gaspar': 'Vale do Mucuri',

    // Zona da Mata
    'Juiz de Fora': 'Zona da Mata',
    'Viçosa': 'Zona da Mata',
    'Muriaé': 'Zona da Mata',
    'Cataguases': 'Zona da Mata',
    'Leopoldina': 'Zona da Mata',
    'Ubá': 'Zona da Mata',
    'Manhuaçu': 'Zona da Mata',
    'Carangola': 'Zona da Mata',
    'Ponte Nova': 'Zona da Mata',
    'Santos Dumont': 'Zona da Mata',
    'Além Paraíba': 'Zona da Mata',
    'Muriaé': 'Zona da Mata',
    'Tombos': 'Zona da Mata',

    // Sul de Minas
    'Varginha': 'Sul de Minas',
    'Pouso Alegre': 'Sul de Minas',
    'Lavras': 'Sul de Minas',
    'Poços de Caldas': 'Sul de Minas',
    'Passos': 'Sul de Minas',
    'São Sebastião do Paraíso': 'Sul de Minas',
    'Três Corações': 'Sul de Minas',
    'Guaxupé': 'Sul de Minas',
    'Alfenas': 'Sul de Minas',
    'Machado': 'Sul de Minas',
    'São Lourenço': 'Sul de Minas',
    'Cambuquira': 'Sul de Minas',
    'Itajubá': 'Sul de Minas',
    'Caxambu': 'Sul de Minas',
    'Muzambinho': 'Sul de Minas',
    'Boa Esperança': 'Sul de Minas',
    'Campo Belo': 'Sul de Minas',
    'Nepomuceno': 'Sul de Minas',
    'Três Pontas': 'Sul de Minas',

    // Centro-Oeste de Minas
    'Divinópolis': 'Centro-Oeste de Minas',
    'Formiga': 'Centro-Oeste de Minas',
    'Pará de Minas': 'Centro-Oeste de Minas',
    'Itaúna': 'Centro-Oeste de Minas',
    'Oliveira': 'Centro-Oeste de Minas',
    'Bom Despacho': 'Centro-Oeste de Minas',
    'Curvelo': 'Centro-Oeste de Minas',
    'Três Marias': 'Centro-Oeste de Minas',
    'Pompéu': 'Centro-Oeste de Minas',
    'Pitangui': 'Centro-Oeste de Minas',
    'Abaeté': 'Centro-Oeste de Minas',
    'Santo Antônio do Monte': 'Centro-Oeste de Minas',

    // Vale do Aço / Rio Doce
    'Ipatinga': 'Vale do Aço / Rio Doce',
    'Coronel Fabriciano': 'Vale do Aço / Rio Doce',
    'Timóteo': 'Vale do Aço / Rio Doce',
    'Caratinga': 'Vale do Aço / Rio Doce',
    'Governador Valadares': 'Vale do Aço / Rio Doce',
    'Mantena': 'Vale do Aço / Rio Doce',
    'Resplendor': 'Vale do Aço / Rio Doce',
    'Aimorés': 'Vale do Aço / Rio Doce',
    'Guanhães': 'Vale do Aço / Rio Doce',
};

const STATUS_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
    'Disponível': { bg: 'bg-green-500/10', text: 'text-green-600 dark:text-green-400', dot: 'bg-green-500' },
    'Vendido': { bg: 'bg-red-500/10', text: 'text-red-600 dark:text-red-400', dot: 'bg-red-500' },
    'Reservado': { bg: 'bg-yellow-500/10', text: 'text-yellow-700 dark:text-yellow-400', dot: 'bg-yellow-500' },
};

const REGION_COLORS = [
    '#B8860B', '#3B82F6', '#10B981', '#8B5CF6', '#EF4444',
    '#F59E0B', '#06B6D4', '#EC4899', '#84CC16', '#F97316',
];

function parseLocation(location: string | null): { city: string; state: string } {
    if (!location) return { city: 'Não informado', state: 'Desconhecido' };
    const parts = location.split('-');
    if (parts.length >= 2) {
        return {
            city: parts.slice(0, parts.length - 1).join('-').trim(),
            state: parts[parts.length - 1].trim().toUpperCase(),
        };
    }
    return { city: location.trim(), state: location.trim().toUpperCase() };
}

function getAnimalStatus(product: Record<string, unknown>): string {
    const details = product.details as Record<string, string> | null;
    if (details?.status) return details.status;
    if (product.sold) return 'Vendido';
    if (!product.active) return 'Inativo';
    return 'Disponível';
}

export default async function AnimalAvailabilityPage() {
    const supabase = await createClient();
    const { data: products } = await supabase
        .from('products')
        .select('id, name, category, location, details, active, sold, price')
        .order('created_at', { ascending: false });

    const allProducts = products || [];

    // ── Aggregations ──────────────────────────────────────────────────────────
    let totalAvailable = 0;
    let totalSold = 0;
    let totalReserved = 0;
    let totalMG = 0;
    let totalOtherStates = 0;

    const stateStats: Record<string, { total: number; available: number; sold: number; reserved: number }> = {};
    const mgCityStats: Record<string, { total: number; available: number; sold: number; reserved: number }> = {};
    const mgRegionStats: Record<string, { total: number; available: number; sold: number; reserved: number }> = {};
    const categoryStats: Record<string, { total: number; available: number; sold: number; reserved: number }> = {};

    for (const p of allProducts) {
        const { city, state } = parseLocation(p.location as string | null);
        const status = getAnimalStatus(p as Record<string, unknown>);
        const category = (p.category as string) || 'Outros';

        // Global counters
        if (status === 'Disponível') totalAvailable++;
        else if (status === 'Vendido') totalSold++;
        else if (status === 'Reservado') totalReserved++;

        // By state
        if (!stateStats[state]) stateStats[state] = { total: 0, available: 0, sold: 0, reserved: 0 };
        stateStats[state].total++;
        if (status === 'Disponível') stateStats[state].available++;
        else if (status === 'Vendido') stateStats[state].sold++;
        else if (status === 'Reservado') stateStats[state].reserved++;

        if (state === 'MG') {
            totalMG++;
            // By city
            if (!mgCityStats[city]) mgCityStats[city] = { total: 0, available: 0, sold: 0, reserved: 0 };
            mgCityStats[city].total++;
            if (status === 'Disponível') mgCityStats[city].available++;
            else if (status === 'Vendido') mgCityStats[city].sold++;
            else if (status === 'Reservado') mgCityStats[city].reserved++;

            // By MG region
            const region = MG_REGIONS[city] ?? 'Outras Regiões de MG';
            if (!mgRegionStats[region]) mgRegionStats[region] = { total: 0, available: 0, sold: 0, reserved: 0 };
            mgRegionStats[region].total++;
            if (status === 'Disponível') mgRegionStats[region].available++;
            else if (status === 'Vendido') mgRegionStats[region].sold++;
            else if (status === 'Reservado') mgRegionStats[region].reserved++;
        } else {
            totalOtherStates++;
        }

        // By category
        if (!categoryStats[category]) categoryStats[category] = { total: 0, available: 0, sold: 0, reserved: 0 };
        categoryStats[category].total++;
        if (status === 'Disponível') categoryStats[category].available++;
        else if (status === 'Vendido') categoryStats[category].sold++;
        else if (status === 'Reservado') categoryStats[category].reserved++;
    }

    const total = allProducts.length;
    const availabilityRate = total > 0 ? ((totalAvailable / total) * 100).toFixed(1) : '0.0';

    const sortedStates = Object.entries(stateStats).sort(([, a], [, b]) => b.total - a.total);
    const sortedMGRegions = Object.entries(mgRegionStats).sort(([, a], [, b]) => b.total - a.total);
    const sortedMGCities = Object.entries(mgCityStats).sort(([, a], [, b]) => b.total - a.total);
    const sortedCategories = Object.entries(categoryStats).sort(([, a], [, b]) => b.total - a.total);

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="border-b border-gray-200 dark:border-[#222222] pb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-[#B8860B]" />
                        Disponibilidade de Animais
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        Análise detalhada da disponibilidade por região, estado e categoria.
                    </p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500 bg-gray-100 dark:bg-[#1A1A1A] px-3 py-1 rounded-full border border-gray-200 dark:border-[#222222] shrink-0">
                    {new Date().toLocaleDateString('pt-BR')}
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                {/* Total */}
                <div className="col-span-2 lg:col-span-1 bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222]">
                            <Package className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total</span>
                    </div>
                    <p className="text-3xl font-bold text-gray-900 dark:text-white">{total}</p>
                    <p className="text-xs text-gray-500 mt-1">animais cadastrados</p>
                </div>

                {/* Disponíveis */}
                <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-green-500/10 rounded-xl">
                            <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider leading-tight">Disponíveis</span>
                    </div>
                    <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalAvailable}</p>
                    <p className="text-xs text-gray-500 mt-1">{availabilityRate}% do total</p>
                </div>

                {/* Vendidos */}
                <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-red-500/10 rounded-xl">
                            <XCircle className="w-5 h-5 text-red-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Vendidos</span>
                    </div>
                    <p className="text-3xl font-bold text-red-600 dark:text-red-400">{totalSold}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {total > 0 ? ((totalSold / total) * 100).toFixed(1) : '0.0'}% do total
                    </p>
                </div>

                {/* Reservados */}
                <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-yellow-500/10 rounded-xl">
                            <Clock className="w-5 h-5 text-yellow-500" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Reservados</span>
                    </div>
                    <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400">{totalReserved}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {total > 0 ? ((totalReserved / total) * 100).toFixed(1) : '0.0'}% do total
                    </p>
                </div>

                {/* MG */}
                <div className="bg-white dark:bg-[#111111] p-5 rounded-2xl border border-[#B8860B]/30 shadow-xl">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-[#B8860B]/10 rounded-xl">
                            <MapPin className="w-5 h-5 text-[#B8860B]" />
                        </div>
                        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Em MG</span>
                    </div>
                    <p className="text-3xl font-bold text-[#B8860B]">{totalMG}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {total > 0 ? ((totalMG / total) * 100).toFixed(1) : '0.0'}% do total
                    </p>
                </div>
            </div>

            {/* Main content grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">

                {/* Distribuição por Estado */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-[#222222] pb-4 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-[#B8860B]" />
                        Distribuição por Estado
                    </h2>
                    <div className="space-y-3">
                        {sortedStates.map(([state, stats], i) => {
                            const percent = ((stats.total / total) * 100).toFixed(1);
                            const color = REGION_COLORS[i % REGION_COLORS.length];
                            return (
                                <div key={state}>
                                    <div className="flex justify-between items-center text-sm mb-1">
                                        <span className="text-gray-700 dark:text-gray-300 font-semibold">{state}</span>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            <span className="text-green-500">{stats.available} disp.</span>
                                            {stats.reserved > 0 && <span className="text-yellow-500">{stats.reserved} res.</span>}
                                            {stats.sold > 0 && <span className="text-red-400">{stats.sold} vend.</span>}
                                            <span className="font-medium text-gray-700 dark:text-gray-300">{stats.total} ({percent}%)</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-gray-100 dark:bg-[#222222] rounded-full h-2.5 overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-700"
                                            style={{ width: `${percent}%`, backgroundColor: color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                        {sortedStates.length === 0 && (
                            <p className="text-gray-500 italic text-sm">Nenhum dado disponível.</p>
                        )}
                    </div>
                </div>

                {/* Regiões de Minas Gerais */}
                <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-[#B8860B]/20 shadow-xl">
                    <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-[#222222] pb-4 flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-[#B8860B]" />
                        Regiões de Minas Gerais
                        <span className="ml-auto text-xs font-normal text-gray-500 bg-gray-100 dark:bg-[#1A1A1A] px-2 py-1 rounded-full">
                            {totalMG} animais
                        </span>
                    </h2>
                    {totalMG === 0 ? (
                        <p className="text-gray-500 italic text-sm">Nenhum animal cadastrado em MG.</p>
                    ) : (
                        <div className="space-y-3">
                            {sortedMGRegions.map(([region, stats], i) => {
                                const percentOfMG = ((stats.total / totalMG) * 100).toFixed(1);
                                const color = REGION_COLORS[i % REGION_COLORS.length];
                                return (
                                    <div key={region}>
                                        <div className="flex justify-between items-center text-sm mb-1">
                                            <span className="text-gray-700 dark:text-gray-300 font-semibold truncate max-w-[180px]" title={region}>
                                                {region}
                                            </span>
                                            <div className="flex items-center gap-3 text-xs text-gray-500 shrink-0">
                                                <span className="text-green-500">{stats.available} disp.</span>
                                                {stats.reserved > 0 && <span className="text-yellow-500">{stats.reserved} res.</span>}
                                                {stats.sold > 0 && <span className="text-red-400">{stats.sold} vend.</span>}
                                                <span className="font-medium text-gray-700 dark:text-gray-300">{stats.total} ({percentOfMG}%)</span>
                                            </div>
                                        </div>
                                        <div className="w-full bg-gray-100 dark:bg-[#222222] rounded-full h-2.5 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700"
                                                style={{ width: `${percentOfMG}%`, backgroundColor: color }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Disponibilidade por Categoria */}
            <div className="bg-white dark:bg-[#111111] p-6 rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6 border-b border-gray-200 dark:border-[#222222] pb-4 flex items-center gap-2">
                    <List className="w-5 h-5 text-purple-500" />
                    Disponibilidade por Categoria
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {sortedCategories.map(([cat, stats]) => {
                        const availPct = stats.total > 0 ? ((stats.available / stats.total) * 100).toFixed(0) : '0';
                        return (
                            <div key={cat} className="bg-gray-50 dark:bg-[#1A1A1A] rounded-xl border border-gray-200 dark:border-[#222222] p-4">
                                <div className="flex items-start justify-between gap-2 mb-3">
                                    <span className="text-sm font-bold text-gray-900 dark:text-white leading-tight">{cat}</span>
                                    <span className="text-xs font-bold text-gray-500 shrink-0">{stats.total}</span>
                                </div>
                                <div className="space-y-1.5">
                                    {stats.available > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                                <span className="text-gray-600 dark:text-gray-400">Disponível</span>
                                            </div>
                                            <span className="font-semibold text-green-600 dark:text-green-400">{stats.available}</span>
                                        </div>
                                    )}
                                    {stats.reserved > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                                                <span className="text-gray-600 dark:text-gray-400">Reservado</span>
                                            </div>
                                            <span className="font-semibold text-yellow-600 dark:text-yellow-400">{stats.reserved}</span>
                                        </div>
                                    )}
                                    {stats.sold > 0 && (
                                        <div className="flex justify-between items-center text-xs">
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-2 h-2 rounded-full bg-red-500" />
                                                <span className="text-gray-600 dark:text-gray-400">Vendido</span>
                                            </div>
                                            <span className="font-semibold text-red-600 dark:text-red-400">{stats.sold}</span>
                                        </div>
                                    )}
                                </div>
                                {/* Mini progress bar showing availability rate */}
                                <div className="mt-3">
                                    <div className="w-full bg-gray-200 dark:bg-[#222222] rounded-full h-1.5 overflow-hidden">
                                        <div
                                            className="bg-green-500 h-full rounded-full"
                                            style={{ width: `${availPct}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-gray-400 mt-1 text-right">{availPct}% disponível</p>
                                </div>
                            </div>
                        );
                    })}
                    {sortedCategories.length === 0 && (
                        <p className="text-gray-500 italic text-sm col-span-full">Nenhum dado disponível.</p>
                    )}
                </div>
            </div>

            {/* Tabela: Cidades de MG */}
            {sortedMGCities.length > 0 && (
                <div className="bg-white dark:bg-[#111111] rounded-2xl border border-gray-200 dark:border-[#222222] shadow-xl overflow-hidden">
                    <div className="p-6 border-b border-gray-200 dark:border-[#222222] flex items-center gap-2">
                        <List className="w-5 h-5 text-[#B8860B]" />
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                            Detalhamento por Cidade — Minas Gerais
                        </h2>
                        <span className="ml-auto text-xs text-gray-500 bg-gray-100 dark:bg-[#1A1A1A] px-2 py-1 rounded-full">
                            {sortedMGCities.length} cidades
                        </span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 dark:bg-[#0A0A0A] text-gray-500 dark:text-gray-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-3 text-left font-medium">Cidade</th>
                                    <th className="px-6 py-3 text-left font-medium">Região</th>
                                    <th className="px-4 py-3 text-center font-medium">Total</th>
                                    <th className="px-4 py-3 text-center font-medium">Disponível</th>
                                    <th className="px-4 py-3 text-center font-medium">Reservado</th>
                                    <th className="px-4 py-3 text-center font-medium">Vendido</th>
                                    <th className="px-6 py-3 text-left font-medium">Disponibilidade</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-[#222222]">
                                {sortedMGCities.map(([city, stats]) => {
                                    const region = MG_REGIONS[city] ?? 'Outras Regiões de MG';
                                    const availPct = stats.total > 0 ? (stats.available / stats.total) * 100 : 0;
                                    return (
                                        <tr key={city} className="hover:bg-gray-50 dark:hover:bg-[#1A1A1A]/50 transition-colors">
                                            <td className="px-6 py-3 font-medium text-gray-900 dark:text-white">{city}</td>
                                            <td className="px-6 py-3">
                                                <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-[#1A1A1A] px-2 py-0.5 rounded-full">
                                                    {region}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center font-bold text-gray-900 dark:text-white">{stats.total}</td>
                                            <td className="px-4 py-3 text-center">
                                                {stats.available > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-green-500/10 text-green-600 dark:text-green-400">
                                                        {stats.available}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {stats.reserved > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">
                                                        {stats.reserved}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                {stats.sold > 0 ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-600 dark:text-red-400">
                                                        {stats.sold}
                                                    </span>
                                                ) : (
                                                    <span className="text-gray-400">—</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-3">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex-1 bg-gray-100 dark:bg-[#222222] rounded-full h-1.5 overflow-hidden max-w-[80px]">
                                                        <div
                                                            className="h-full rounded-full bg-green-500 transition-all"
                                                            style={{ width: `${availPct.toFixed(0)}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs text-gray-500 w-8 text-right">{availPct.toFixed(0)}%</span>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
}
