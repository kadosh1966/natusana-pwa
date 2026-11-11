import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, Flame, Coins, CheckCircle2, XCircle, Award, ShoppingBag,
  MapPin, Share2, RefreshCw, ChevronRight, Lock, Unlock, UserCheck,
  Sparkles, BookOpen, ShieldCheck, ArrowRight, RotateCcw, Copy, Check,
  Gift, Trophy, Cloud, Download, Users
} from 'lucide-react';

const SUPABASE_URL = 'https://yxpcctelsoqtsvtcczbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_edcInk7TUTAxp9VjxvU0rg_e4_pCemG';

const supabaseRequest = async (endpoint, options = {}) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${endpoint}`, {
    ...options,
    headers: {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(errText || res.statusText);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const DISTRACTOR_POOLS = {
  minerales: [
    'Citrato de magnesio', 'Bisglicinato de magnesio', 'Treonato de magnesio',
    'Cloruro de magnesio', 'Óxido de magnesio', 'Malato de magnesio',
    'Citrato de potasio', 'Gluconato de potasio', 'Cloruro de potasio',
    'Zinc bisglicinato (quelado)', 'Picolinato de zinc', 'Sulfato de zinc',
    'Citrato de calcio', 'Carbonato de calcio', 'Calcio de coral',
    'Hierro bisglicinato (quelado)', 'Sulfato ferroso', 'Levadura de selenio',
    'Picolinato de cromo', 'Sulfato de cobre', 'Gluconato de manganeso',
    'Metilsulfonilmetano (MSM)', 'Boro quelado'
  ],
  adaptogenos: [
    'Ashwagandha (Withania somnifera)', 'Maca negra', 'Maca roja',
    'Maca amarilla', 'Melena de León (Hericium erinaceus)', 'Reishi (Ganoderma lucidum)',
    'Cordyceps sinensis', 'Chaga (Inonotus obliquus)', 'Ginseng Panax coreano',
    'Ginseng siberiano (Eleuterococo)', 'Rhodiola rosea', 'Schisandra chinensis',
    'Holy Basil (Tulsi)', 'Astrágalo (Astragalus membranaceus)', 'Cola de Pavo (Trametes versicolor)',
    'Maitake (Grifola frondosa)', 'Shiitake (Lentinula edodes)', 'Bacopa monnieri',
    'Gotu Kola (Centella asiática)', 'Shatavari (Asparagus racemosus)', 'Maca gelatinizada',
    'Ginkgo biloba'
  ],
  superalimentos: [
    'Camu Camu en polvo', 'Tocosh deshidratado / liofilizado', 'Cacao criollo puro',
    'Harina de algarrobo', 'Aceite de Sacha Inchi microencapsulado', 'Espirulina ecológica',
    'Chlorella en polvo', 'Harina de lúcuma', 'Aguaymanto deshidratado',
    'Moringa oleifera en polvo', 'Graviola / Guanábana en polvo', 'Uña de gato (Uncaria tomentosa)',
    'Chía negra orgánica', 'Quinua negra gelatinizada', 'Cañihua en polvo',
    'Maíz morado (extracto rico en antocianinas)', 'Polvo de yacón (rico en FOS)', 'Polen apícola multifloral',
    'Chuchuhuasi', 'Sangre de Grado (Croton lechleri)', 'Maca tricolor', 'Muña pulverizada'
  ],
  digestivo: [
    'Probióticos multicepa (Lactobacillus + Bifidobacterium)', 'Saccharomyces boulardii',
    'Inulina de agave / achicoria (Prebiótico)', 'Fructooligosacáridos (FOS) de yacón',
    'Psyllium husk (Cáscara de psilio)', 'Gel / Extracto de Aloe Vera liofilizado',
    'Enzimas digestivas (Bromelina + Papaína + Proteasa)', 'Carbón vegetal activado',
    'L-Glutamina pura', 'Arcilla chacko / medicinal purificada',
    'Fibra de manzana soluble', 'Aceite esencial de orégano microencapsulado',
    'Clorofila líquida natural', 'Harina de tocosh (penicilina natural)',
    'Menta piperita deshidratada', 'Extracto de regaliz desglicirrizinado (DGL)',
    'Extracto de jengibre (Gingerol)', 'Vinagre de sidra de manzana en polvo (con la madre)',
    'Semillas de lino molidas', 'Semillas de hinojo en polvo',
    'Lactobacillus rhamnosus GG', 'Butirato de sodio microencapsulado'
  ],
  articular: [
    'Colágeno hidrolizado bovino (péptidos bioactivos)', 'Colágeno no desnaturalizado Tipo II (UC-II)',
    'Colágeno marino hidrolizado', 'Sulfato de glucosamina', 'Sulfato de condroitina',
    'Metilsulfonilmetano (MSM)', 'Cúrcuma estandarizada (95% curcumina)',
    'Extracto de pimienta negra (Piperina)', 'Harina de cartílago de tiburón',
    'Ácido hialurónico oral', 'Extracto de Boswellia serrata',
    'Uña de gato micropulverizada', 'Harpagofito (Garra del diablo)',
    'Silicio orgánico (extracto de Cola de Caballo)', 'Vitamina C pura (ácido ascórbico / camu camu)',
    'Vitamina D3 vegetal (Colecalciferol)', 'Vitamina K2 (Menaquinona MK-7)',
    'Citrato de magnesio', 'Aceite de krill (rico en fosfolípidos y astaxantina)',
    'Sulfato de manganeso', 'Extracto de jengibre estandarizado',
    'Membrana de cáscara de huevo (NEM)'
  ]
};

const SPECIALTIES = [
  {
    id: 'citratos',
    title: 'Citratos y Minerales Quelados',
    certificateTitle: 'Asesor Certificado en Terapia de Minerales y Citratos',
    icon: '⚡',
    subtitle: 'Citrato de magnesio, potasio, zinc quelado y biodisponibilidad',
    productStar: {
      name: 'Citrato de Magnesio & Potasio Puro Qali Kay',
      presentation: 'Pote 250g / Frasco 90 cápsulas veganas',
      benefit: 'Alta biodisponibilidad sin acidez gástrica, equilibrio electrolítico y descanso profundo.',
      sku: 'QK-CIT-MAG-250'
    }
  },
  {
    id: 'adaptogenos',
    title: 'Adaptógenos y Hongos Funcionales',
    certificateTitle: 'Especialista en Adaptógenos y Rendimiento Cognitivo',
    icon: '🍄',
    subtitle: 'Melena de León, Ashwagandha, Cordyceps, Reishi y Macas',
    productStar: {
      name: 'Extracto Estandarizado Melena de León + Ashwagandha Qali Kay',
      presentation: 'Frasco 60 cápsulas vegetales (500mg)',
      benefit: 'Neuroplasticidad, foco mental matutino y modulación del cortisol por estrés.',
      sku: 'QK-ADP-MEL-60'
    }
  },
  {
    id: 'superalimentos',
    title: 'Superalimentos Nativos y Ancestrales',
    certificateTitle: 'Embajador de Superalimentos y Nutrición Ancestral',
    icon: '🌿',
    subtitle: 'Camu Camu, Tocosh liofilizado, Sacha Inchi Omega 3 y Cacao',
    productStar: {
      name: 'Dúo Camu Camu Liofilizado + Tocosh en Cápsulas Qali Kay',
      presentation: 'Doypack 150g + Frasco 90 cápsulas sin olor',
      benefit: 'Vitamina C biodisponible y protección natural de la mucosa gástrica.',
      sku: 'QK-SUP-TOCO-90'
    }
  },
  {
    id: 'digestivo',
    title: 'Salud Digestiva y Microbiota',
    certificateTitle: 'Experto en Cuidado Digestivo e Inmunológico',
    icon: '🌱',
    subtitle: 'Aloe vera liofilizado, prebióticos FOS, probióticos y enzimas',
    productStar: {
      name: 'Simbiótico Multicepa + Aloe Vera & Yacón Qali Kay',
      presentation: 'Frasco 60 cápsulas gastrorresistentes',
      benefit: 'Bálsamo de mucosa gástrica y regeneración de flora intestinal benéfica.',
      sku: 'QK-DIG-SIMB-60'
    }
  },
  {
    id: 'articular',
    title: 'Movilidad y Salud Articular',
    certificateTitle: 'Especialista en Salud Osteoarticular',
    icon: '🦴',
    subtitle: 'Colágeno Tipo II (UC-II) vs Hidrolizado, Cúrcuma + Piperina',
    productStar: {
      name: 'Colágeno UC-II + Cúrcuma al 95% con Piperina Qali Kay',
      presentation: 'Frasco 60 cápsulas + Pote Colágeno Péptidos',
      benefit: 'Modulación inmune articular y absorción multiplicada en un 2000%.',
      sku: 'QK-ART-UC2-60'
    }
  }
];

const FALLBACK_QUESTIONS = [
  {
    id: 'CIT-001',
    specialty_id: 'citratos',
    dynamic_type: 'D3',
    statement: 'Un cliente entra a la tienda pidiendo "magnesio para el estreñimiento crónico y pesadez estomacal". ¿Qué presentación de magnesio debes recomendarle como primera opción?',
    correct_answer: 'Citrato de magnesio',
    distractor_pool_category: 'minerales',
    feedback_correct: '¡Correcto! El ácido cítrico unido al magnesio genera un efecto osmótico natural que atrae agua al lumen intestinal, ablandando las heces sin irritar.',
    feedback_error: 'Para el tránsito lento, el Citrato es la opción indicada por su efecto osmótico. Formas como el bisglicinato se absorben antes de llegar al colon.',
    commercial_tip: 'Recomienda tomarlo por la noche disuelto en agua tibia (1/2 cucharadita o 2 cápsulas).'
  },
  {
    id: 'CIT-002',
    specialty_id: 'citratos',
    dynamic_type: 'D1',
    statement: '¿Cuál es la principal ventaja terapéutica de un mineral "quelado" o en forma de "citrato" frente a formas inorgánicas tradicionales como el óxido o carbonato?',
    correct_answer: 'Mucho mayor biodisponibilidad y menor irritación gástrica',
    distractor_pool_category: 'minerales',
    feedback_correct: '¡Exacto! Los minerales unidos a moléculas orgánicas no dependen de acidez extrema y superan el 30-40% de absorción frente al 4% del óxido.',
    feedback_error: 'Las formas inorgánicas apenas se absorben (~4%) y suelen provocar acidez. Los citratos garantizan alta absorción.',
    commercial_tip: 'Justifica el precio al cliente: "Con el citrato tu cuerpo aprovecha casi todo el mineral; con presentaciones genéricas la mayor parte se elimina".'
  },
  {
    id: 'CIT-003',
    specialty_id: 'citratos',
    dynamic_type: 'D6',
    statement: 'Un cliente deportista sufre de calambres frecuentes tras entrenar. Para un equilibrio electrolítico intracelular completo, ¿con qué otro mineral se recomienda combinar el Citrato de Magnesio?',
    correct_answer: 'Citrato de potasio',
    distractor_pool_category: 'minerales',
    feedback_correct: '¡Gran recomendación! La bomba sodio-potasio celular depende críticamente del magnesio para funcionar. Forman el dúo perfecto contra calambres.',
    feedback_error: 'El potasio trabaja en sinergia directa con el magnesio dentro de la célula muscular.',
    commercial_tip: 'Si un cliente lleva magnesio por calambres intensos, ofrécele el dúo con Citrato de Potasio.'
  },
  {
    id: 'ADP-001',
    specialty_id: 'adaptogenos',
    dynamic_type: 'D3',
    statement: 'Una profesional acude a la tienda buscando un apoyo natural porque siente "niebla mental", falta de concentración y olvidos. ¿Qué hongo funcional recomiendas?',
    correct_answer: 'Melena de León (Hericium erinaceus)',
    distractor_pool_category: 'adaptogenos',
    feedback_correct: '¡Exacto! La Melena de León estimula la síntesis del Factor de Crecimiento Nervioso (NGF), favoreciendo neuroplasticidad y foco.',
    feedback_error: 'Para foco mental el hongo específico es la Melena de León. Reishi es para descanso y Cordyceps para energía.',
    commercial_tip: 'Recomienda tomarlo por la mañana con el café o desayuno.'
  },
  {
    id: 'SUP-001',
    specialty_id: 'superalimentos',
    dynamic_type: 'D6',
    statement: 'Un cliente compra espirulina o hierro para la anemia. Para maximizar la absorción intestinal del hierro vegetal, ¿con qué superalimento peruano debes recomendar acompañarlo?',
    correct_answer: 'Camu Camu en polvo',
    distractor_pool_category: 'superalimentos',
    feedback_correct: '¡Brillante! La altísima vitamina C natural del Camu Camu reduce el hierro férrico a ferroso, multiplicando su absorción.',
    feedback_error: 'El hierro vegetal necesita un medio ácido rico en vitamina C para asimilarse.',
    commercial_tip: 'Venta cruzada: "Lleva tu fuente de hierro con una cucharadita de Camu Camu en ayunas".'
  },
  {
    id: 'DIG-001',
    specialty_id: 'digestivo',
    dynamic_type: 'D3',
    statement: 'Un cliente entra con ardor estomacal frecuente y busca una alternativa natural que recubra y calme la mucosa gástrica de inmediato. ¿Qué producto recomiendas?',
    correct_answer: 'Gel / Extracto de Aloe Vera liofilizado',
    distractor_pool_category: 'digestivo',
    feedback_correct: '¡Correcto! El aloe vera contiene mucílagos y acemanano que actúan como bálsamo protector sobre las paredes del estómago.',
    feedback_error: 'Para calmar de inmediato la mucosa irritada, el Aloe Vera es el protector botánico ideal.',
    commercial_tip: 'Recomienda tomar 1 vasito o cápsula 20 minutos antes de las comidas principales.'
  },
  {
    id: 'ART-001',
    specialty_id: 'articular',
    dynamic_type: 'D1',
    statement: 'Un cliente pregunta la diferencia entre Colágeno Hidrolizado y Colágeno No Desnaturalizado Tipo II (UC-II). ¿Cuál es la respuesta técnica correcta?',
    correct_answer: 'El hidrolizado aporta aminoácidos estructurales a dosis altas (10g), mientras que el Tipo II modula la respuesta inmune a microdosis (40mg)',
    distractor_pool_category: 'articular',
    feedback_correct: '¡Excelente distinción! El UC-II actúa modulando la inflamación autoinmune en la articulación, mientras el hidrolizado nutre con péptidos.',
    feedback_error: 'El colágeno Tipo II no actúa por volumen (solo 40mg), sino frenando el ataque inmunológico al cartílago.',
    commercial_tip: 'Para desgaste avanzado recomienda Colágeno Tipo II en cápsulas; para prevención, Colágeno Hidrolizado en polvo.'
  }
];

function shuffleArray(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export default function App() {
  const [screen, setScreen] = useState('P2');
  const [activeTab, setActiveTab] = useState('ruta');

  const [userName, setUserName] = useState('Juan Jimenez');
  const [userRole, setUserRole] = useState('tendero');
  const [storeCode, setStoreCode] = useState('QALI-LIMA-04');
  const [xp, setXp] = useState(470);
  const [streak, setStreak] = useState(4);
  const [lives, setLives] = useState(5);

  const [completedSpecs, setCompletedSpecs] = useState({
    citratos: true,
    adaptogenos: false,
    superalimentos: true,
    digestivo: false,
    articular: false
  });

  const [dbStatus, setDbStatus] = useState('connecting');
  const [dbQuestions, setDbQuestions] = useState(FALLBACK_QUESTIONS);
  const [dbPools, setDbPools] = useState(DISTRACTOR_POOLS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [currentSpecId, setCurrentSpecId] = useState('citratos');
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [optionsOnScreen, setOptionsOnScreen] = useState([]);
  const [shuffleCounter, setShuffleCounter] = useState(0);
  const [feedbackState, setFeedbackState] = useState(null);
  const [correctCountInLesson, setCorrectCountInLesson] = useState(0);
  const [copiedTip, setCopiedTip] = useState(false);
  const [selectedCertSpec, setSelectedCertSpec] = useState('superalimentos');

  const fetchCloudData = async () => {
    try {
      setDbStatus('connecting');
      const [qData, pData, uData] = await Promise.all([
        supabaseRequest('questions?select=*'),
        supabaseRequest('distractor_pools?select=*'),
        supabaseRequest('users?select=*&order=xp_total.desc&limit=15')
      ]);

      if (qData && qData.length > 0) setDbQuestions(qData);
      if (pData && pData.length > 0) {
        const grouped = {};
        pData.forEach(item => {
          if (!grouped[item.category_id]) grouped[item.category_id] = [];
          grouped[item.category_id].push(item.item_name);
        });
        setDbPools(prev => ({ ...prev, ...grouped }));
      }
      if (uData) setLeaderboard(uData);
      setDbStatus('online');
    } catch (err) {
      setDbStatus('offline');
    }
  };

  useEffect(() => {
    fetchCloudData();
  }, []);

  const syncUserToSupabase = async (newXp = xp, specCompleted = null) => {
    setIsSaving(true);
    setSyncMessage('Guardando en Supabase...');
    try {
      const cleanAlias = (userName || 'Asesor NatuSana').trim();
      const existing = await supabaseRequest(`users?alias=eq.${encodeURIComponent(cleanAlias)}&select=*`);

      let currentUserId = null;

      if (existing && existing.length > 0) {
        currentUserId = existing[0].id;
        await supabaseRequest(`users?id=eq.${currentUserId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            xp_total: newXp,
            streak_days: streak,
            lives: lives,
            role: userRole,
            store_code: storeCode || 'FREE'
          })
        });
      } else {
        const inserted = await supabaseRequest('users', {
          method: 'POST',
          headers: { 'Prefer': 'return=representation' },
          body: JSON.stringify({
            alias: cleanAlias,
            role: userRole,
            store_code: storeCode || 'FREE',
            xp_total: newXp,
            streak_days: streak,
            lives: lives
          })
        });
        if (inserted && inserted[0]) currentUserId = inserted[0].id;
      }

      if (currentUserId) {
        const specsToSave = specCompleted
          ? [specCompleted]
          : Object.keys(completedSpecs).filter(k => completedSpecs[k]);

        for (const sId of specsToSave) {
          const prog = await supabaseRequest(`user_progress?user_id=eq.${currentUserId}&specialty_id=eq.${sId}&select=*`);
          if (!prog || prog.length === 0) {
            await supabaseRequest('user_progress', {
              method: 'POST',
              body: JSON.stringify({
                user_id: currentUserId,
                specialty_id: sId,
                completed_modules: 4,
                certified: true,
                certification_date: new Date().toISOString()
              })
            });
          }
        }
      }

      const updatedUsers = await supabaseRequest('users?select=*&order=xp_total.desc&limit=15');
      if (updatedUsers) setLeaderboard(updatedUsers);

      setSyncMessage(`✅ Guardado en Supabase: "${cleanAlias}" (${newXp} XP)`);
      setTimeout(() => setSyncMessage(''), 6000);
    } catch (e) {
      setSyncMessage(`⚠️ Error al guardar: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  const currentSpec = useMemo(
    () => SPECIALTIES.find(s => s.id === currentSpecId) || SPECIALTIES[0],
    [currentSpecId]
  );

  const specQuestions = useMemo(
    () => dbQuestions.filter(q => q.specialty_id === currentSpecId),
    [dbQuestions, currentSpecId]
  );

  const currentQ = specQuestions[qIndex] || specQuestions[0] || FALLBACK_QUESTIONS[0];

  useEffect(() => {
    if (!currentQ) return;
    setSelectedOption(null);
    setFeedbackState(null);

    if (currentQ.dynamic_type === 'D4') {
      setOptionsOnScreen(['Verdad', 'Mito']);
      return;
    }

    const poolCategory = currentQ.distractor_pool_category || 'minerales';
    const rawPool = dbPools[poolCategory] || DISTRACTOR_POOLS[poolCategory] || DISTRACTOR_POOLS.minerales;
    const filteredPool = rawPool.filter(
      item => item.toLowerCase().trim() !== (currentQ.correct_answer || '').toLowerCase().trim()
    );
    const chosenDistractors = shuffleArray(filteredPool).slice(0, 2);
    setOptionsOnScreen(shuffleArray([currentQ.correct_answer, ...chosenDistractors]));
  }, [currentQ, shuffleCounter, dbPools]);

  const startSpecialtyLesson = (specId) => {
    setCurrentSpecId(specId);
    setQIndex(0);
    setCorrectCountInLesson(0);
    setFeedbackState(null);
    setScreen('P3');
  };

  const handleVerifyAnswer = () => {
    if (!selectedOption) return;
    const isRight = selectedOption === currentQ.correct_answer;
    if (isRight) {
      setFeedbackState('correct');
      setCorrectCountInLesson(c => c + 1);
      setXp(x => x + 25);
    } else {
      setFeedbackState('wrong');
      setLives(l => Math.max(1, l - 1));
    }
  };

  const handleNextQuestion = () => {
    if (qIndex + 1 < specQuestions.length) {
      setQIndex(i => i + 1);
    } else {
      const earnedXp = xp + 50;
      setXp(earnedXp);
      setCompletedSpecs(prev => ({ ...prev, [currentSpecId]: true }));
      setSelectedCertSpec(currentSpecId);
      syncUserToSupabase(earnedXp, currentSpecId);
      setScreen('P5');
    }
  };

  const downloadCertificatePNG = (specObj) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 820;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#ECFDF5';
    ctx.fillRect(0, 0, 1200, 820);

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 18;
    ctx.strokeRect(40, 40, 1120, 740);

    ctx.fillStyle = '#065F46';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICACIÓN OFICIAL NATUSANA • RESPALDADO POR QALI KAY', 600, 145);

    ctx.fillStyle = '#6B7280';
    ctx.font = '24px sans-serif';
    ctx.fillText('Otorgado a:', 600, 250);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 58px sans-serif';
    ctx.fillText(userName || 'Juan Jimenez', 600, 330);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Local Afiliado: ${storeCode || 'FREE'}  |  Puntaje Acumulado: ${xp} XP`, 600, 395);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(140, 445, 920, 150);
    ctx.strokeStyle = '#A7F3D0';
    ctx.lineWidth = 4;
    ctx.strokeRect(140, 445, 920, 150);

    ctx.fillStyle = '#047857';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText('TÍTULO ACREDITADO:', 600, 495);

    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 34px sans-serif';
    ctx.fillText(specObj.certificateTitle, 600, 550);

    ctx.fillStyle = '#6B7280';
    ctx.font = '20px sans-serif';
    ctx.fillText(`Verificado ID: NS-2026-QK • Fecha: ${new Date().toLocaleDateString()}`, 600, 690);

    const link = document.createElement('a');
    link.download = `Certificado_NatuSana_${specObj.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start py-2 px-2 font-sans select-none">
      <div className="w-full max-w-md mb-2 px-3 py-2 rounded-2xl bg-slate-800/95 border border-slate-700 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-bold text-white">NatuSana PWA</span>
          <span className="text-[11px] text-emerald-300 font-semibold">
            {dbStatus === 'online' ? '• Supabase Conectado' : '• Modo Local'}
          </span>
        </div>
        <button
          onClick={() => setScreen('P1')}
          className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-emerald-300 transition"
        >
          👤 {userName} ({storeCode || 'FREE'})
        </button>
      </div>

      <div className="w-full max-w-md bg-[#F9FAFB] rounded-[32px] shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col">
        {screen !== 'P3' && (
          <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
            <div className="px-3 py-2.5 flex items-center justify-between border-b border-slate-100">
              <div className="flex items-center gap-1.5 bg-red-50 px-2.5 py-1 rounded-xl border border-red-100">
                <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                <span className="font-extrabold text-red-600 text-xs">{lives}</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
                <span className="font-extrabold text-amber-600 text-xs">{streak}d</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50 px-2.5 py-1 rounded-xl border border-amber-100">
                <Coins className="w-4 h-4 text-amber-500" />
                <span className="font-extrabold text-amber-700 text-xs">{xp} XP</span>
              </div>
              <button
                onClick={() => syncUserToSupabase(xp)}
                disabled={isSaving}
                className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm flex items-center gap-1"
              >
                <Cloud className="w-3.5 h-3.5" />
                {isSaving ? '...' : 'Guardar DB'}
              </button>
            </div>

            <div className="grid grid-cols-4 gap-1 px-2 py-1.5 bg-slate-50">
              <button
                onClick={() => { setScreen('P2'); setActiveTab('ruta'); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                  screen === 'P2' && activeTab === 'ruta'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Sparkles className="w-4 h-4" />
                <span className="text-[11px] font-extrabold">1. Ruta</span>
              </button>

              <button
                onClick={() => { setScreen('P2'); setActiveTab('diplomas'); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                  screen === 'P2' && activeTab === 'diplomas'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Award className="w-4 h-4" />
                <span className="text-[11px] font-extrabold">2. Diplomas</span>
              </button>

              <button
                onClick={() => { setScreen('P2'); setActiveTab('premios'); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition relative ${
                  screen === 'P2' && activeTab === 'premios'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'bg-amber-50/80 text-amber-800 border border-amber-200 hover:bg-amber-100'
                }`}
              >
                <Gift className="w-4 h-4" />
                <span className="text-[11px] font-extrabold">3. Premios B2B</span>
              </button>

              <button
                onClick={() => { setScreen('P2'); setActiveTab('vitrina'); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                  screen === 'P2' && activeTab === 'vitrina'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="text-[11px] font-extrabold">4. Vitrina</span>
              </button>
            </div>

            {syncMessage && (
              <div className="bg-emerald-900 text-emerald-100 text-[11px] font-bold px-3 py-1.5 text-center">
                {syncMessage}
              </div>
            )}
          </div>
        )}

        {screen === 'P1' && (
          <div className="p-5 flex flex-col justify-between bg-gradient-to-b from-emerald-50/70 to-white">
            <div>
              <div className="text-center mb-4">
                <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Perfil y Tienda Aliada
                </span>
                <h1 className="text-2xl font-black text-slate-800 mt-2">
                  Natu<span className="text-emerald-600">Sana</span>
                </h1>
              </div>

              <div className="p-4 rounded-2xl border-2 border-emerald-500 bg-white shadow-sm mb-4">
                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Nombre para tus Certificados y Ranking
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={e => setUserName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 mb-3"
                />

                <label className="block text-[11px] font-bold text-slate-600 uppercase mb-1">
                  Código de Tienda Aliada o Equipo Qali Kay
                </label>
                <input
                  type="text"
                  value={storeCode}
                  onChange={e => setStoreCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono font-bold text-emerald-800 uppercase mb-3"
                />

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setUserRole('tendero')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      userRole === 'tendero'
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🏪 Rol: Tendero B2B
                  </button>
                  <button
                    onClick={() => setUserRole('consumidor')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      userRole === 'consumidor'
                        ? 'bg-amber-500 text-white border-amber-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    🌱 Rol: Consumidor
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                syncUserToSupabase(xp);
                setScreen('P2');
                setActiveTab('ruta');
              }}
              className="w-full py-3.5 px-6 rounded-2xl bg-emerald-500 border-b-4 border-emerald-700 text-white font-extrabold text-sm tracking-wide uppercase flex items-center justify-center gap-2"
            >
              Guardar en Supabase y Volver <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {screen === 'P2' && (
          <div className="p-4">
            {activeTab === 'premios' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                      Programa B2B Qali Kay
                    </span>
                    <span className="text-xs font-extrabold">Tienda: {storeCode || 'FREE'}</span>
                  </div>
                  <h2 className="text-lg font-black mt-1">Premios B2B y Ranking en Vivo</h2>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Tus puntos XP desbloquean beneficios reales para ti y tu tienda aliada.
                  </p>
                  <div className="mt-3 pt-2.5 border-t border-white/20 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] uppercase font-bold text-amber-100">Tu saldo actual</p>
                      <p className="text-2xl font-black">{xp} XP</p>
                    </div>
                    <button
                      onClick={() => syncUserToSupabase(xp)}
                      disabled={isSaving}
                      className="px-3 py-2 rounded-xl bg-white text-amber-700 font-extrabold text-xs shadow hover:bg-amber-50 transition flex items-center gap-1.5"
                    >
                      <Cloud className="w-4 h-4" />
                      {isSaving ? 'Sincronizando...' : `Guardar a ${userName} en Supabase`}
                    </button>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <h3 className="text-xs font-extrabold uppercase text-slate-500 tracking-wider">
                    Catálogo de Recompensas para Tiendas
                  </h3>

                  {[
                    {
                      xpReq: 300,
                      title: 'Pack de Muestras Gratis Qali Kay',
                      desc: 'Sachets de Citrato de Magnesio y Camu Camu para degustación del dependiente.',
                      icon: '🎁'
                    },
                    {
                      xpReq: 500,
                      title: 'Bono 5% de Descuento en Reposición B2B',
                      desc: 'Aplicable a la siguiente factura de la tienda aliada en las líneas certificadas.',
                      icon: '📦'
                    },
                    {
                      xpReq: 800,
                      title: 'Placa Física "Punto de Venta Certificado"',
                      desc: 'Exhibidor acrílico oficial + prioridad en el directorio web de tiendas.',
                      icon: '🏆'
                    }
                  ].map((reward, i) => {
                    const unlocked = xp >= reward.xpReq;
                    return (
                      <div
                        key={i}
                        className={`p-3.5 rounded-2xl border-2 bg-white flex items-start gap-3 ${
                          unlocked ? 'border-emerald-400' : 'border-slate-200 opacity-80'
                        }`}
                      >
                        <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl shrink-0">
                          {reward.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[11px] font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-md">
                              Meta: {reward.xpReq} XP
                            </span>
                            {unlocked ? (
                              <span className="text-[11px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                ✅ Desbloqueado
                              </span>
                            ) : (
                              <span className="text-[11px] font-bold text-slate-400">
                                Faltan {reward.xpReq - xp} XP
                              </span>
                            )}
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm mt-1">{reward.title}</h4>
                          <p className="text-xs text-slate-600 mt-0.5">{reward.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-extrabold uppercase text-slate-700">
                        Tabla `users` en tu Supabase (En Vivo)
                      </h3>
                    </div>
                    <button
                      onClick={fetchCloudData}
                      className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                    </button>
                  </div>

                  {leaderboard.length === 0 ? (
                    <div className="text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-300 p-3">
                      <p className="text-xs text-slate-600 font-bold mb-2">
                        Tu tabla `users` en Supabase aún está vacía.
                      </p>
                      <button
                        onClick={() => syncUserToSupabase(xp)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-extrabold shadow hover:bg-emerald-500"
                      >
                        ⚡ Insertar a {userName} ({xp} XP) en Supabase Ahora
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {leaderboard.map((u, idx) => (
                        <div
                          key={u.id || idx}
                          className="flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white font-black flex items-center justify-center text-[11px]">
                              {idx + 1}
                            </span>
                            <div>
                              <p className="font-extrabold text-slate-800">{u.alias}</p>
                              <p className="text-[10px] text-slate-500 font-mono">
                                Tienda: {u.store_code || 'FREE'} • Rol: {u.role}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-amber-600 text-sm">{u.xp_total} XP</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'ruta' && (
              <div>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white mb-4 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                      TIENDA: {storeCode || 'INDEPENDIENTE'}
                    </span>
                    <h2 className="text-lg font-extrabold mt-1">¡Hola, {userName}!</h2>
                    <p className="text-xs text-emerald-100">
                      Toca cualquier especialidad para jugar o ve a "3. Premios B2B".
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('premios')}
                    className="px-3 py-2 rounded-xl bg-amber-400 text-slate-900 font-black text-xs shadow hover:bg-amber-300 shrink-0"
                  >
                    🎁 Ver Premios
                  </button>
                </div>

                <div className="relative flex flex-col items-center space-y-3">
                  {SPECIALTIES.map((spec, idx) => {
                    const isDone = completedSpecs[spec.id];
                    return (
                      <div key={spec.id} className="w-full flex flex-col items-center">
                        <div
                          onClick={() => startSpecialtyLesson(spec.id)}
                          className={`w-full p-3.5 rounded-2xl border-2 transition cursor-pointer bg-white shadow-sm hover:shadow-md flex items-center gap-3.5 ${
                            isDone ? 'border-emerald-400' : 'border-slate-200 hover:border-emerald-400'
                          }`}
                        >
                          <div
                            className={`w-14 h-14 rounded-full flex items-center justify-center text-2xl shrink-0 border-b-4 shadow ${
                              isDone
                                ? 'bg-emerald-500 border-emerald-700 text-white'
                                : 'bg-amber-400 border-amber-600 text-white'
                            }`}
                          >
                            {spec.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                Especialidad {idx + 1}
                              </span>
                              {isDone && (
                                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                                  ✅ Certificada
                                </span>
                              )}
                            </div>
                            <h3 className="font-extrabold text-slate-800 text-sm mt-1 truncate">
                              {spec.title}
                            </h3>
                            <p className="text-xs text-slate-500 truncate">{spec.subtitle}</p>
                          </div>
                          <span className="text-xs font-extrabold text-emerald-600 shrink-0">
                            Jugar &gt;
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'diplomas' && (
              <div className="space-y-4">
                {(() => {
                  const specObj = SPECIALTIES.find(s => s.id === selectedCertSpec) || SPECIALTIES[0];
                  return (
                    <div className="bg-white rounded-3xl border-2 border-emerald-500 p-5 shadow-md text-center">
                      <div className="flex items-center justify-center gap-2 text-emerald-700 font-black text-xs uppercase">
                        <span>🌿 Certificación Oficial NatuSana • Respaldado por Qali Kay</span>
                      </div>
                      <p className="text-[11px] text-slate-400 uppercase font-bold mt-3">Otorgado a:</p>
                      <h4 className="text-2xl font-black text-slate-800">{userName}</h4>
                      <span className="inline-block mt-1 text-[11px] font-bold px-3 py-0.5 rounded-full bg-slate-100 text-slate-700">
                        Local Afiliado: {storeCode || 'FREE'}
                      </span>
                      <div className="my-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <p className="text-[10px] uppercase font-extrabold text-emerald-700">
                          Título Acreditado:
                        </p>
                        <p className="text-sm font-black text-slate-800 mt-0.5">
                          {specObj.certificateTitle}
                        </p>
                      </div>
                      <button
                        onClick={() => downloadCertificatePNG(specObj)}
                        className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow"
                      >
                        <Download className="w-4 h-4" /> Descargar Diploma en PNG
                      </button>
                    </div>
                  );
                })()}

                <div className="space-y-2">
                  {SPECIALTIES.map(spec => (
                    <div
                      key={spec.id}
                      onClick={() => setSelectedCertSpec(spec.id)}
                      className={`p-3 rounded-2xl border-2 flex items-center gap-3 cursor-pointer transition ${
                        selectedCertSpec === spec.id
                          ? 'bg-emerald-50 border-emerald-500'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className="text-xl">{spec.icon}</span>
                      <div className="flex-1">
                        <p className="text-xs font-extrabold text-slate-800">{spec.certificateTitle}</p>
                        <p className="text-[11px] text-emerald-700 font-semibold">
                          Toca para previsualizar y descargar arriba
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'vitrina' && (
              <div className="space-y-3">
                <h2 className="text-base font-extrabold text-slate-800">
                  Catálogo Estrella Qali Kay
                </h2>
                {SPECIALTIES.map(spec => (
                  <div key={spec.id} className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 shadow-sm">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-emerald-50 text-emerald-700">
                      {spec.title}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-sm mt-1">
                      {spec.productStar.name}
                    </h3>
                    <p className="text-xs text-slate-600 mt-1">{spec.productStar.benefit}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {screen === 'P3' && currentQ && (
          <div className="flex flex-col justify-between p-4 bg-[#F9FAFB] relative min-h-[540px]">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => setScreen('P2')}
                  className="w-8 h-8 rounded-xl bg-slate-200/80 flex items-center justify-center text-slate-600 font-bold text-sm"
                >
                  ✕
                </button>
                <div className="flex-1 h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${((qIndex + 1) / specQuestions.length) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 text-red-500 font-extrabold text-sm">
                  <Heart className="w-4 h-4 fill-red-500" /> {lives}
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  Pregunta {qIndex + 1} de {specQuestions.length}
                </span>
                {currentQ.dynamic_type !== 'D4' && (
                  <button
                    onClick={() => setShuffleCounter(c => c + 1)}
                    className="text-[11px] font-bold text-slate-600 hover:text-emerald-700 flex items-center gap-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200 shadow-sm"
                  >
                    <RefreshCw className="w-3 h-3" /> Barajar Pool (22+)
                  </button>
                )}
              </div>

              <div className="bg-white p-4 rounded-2xl border-2 border-slate-200 shadow-sm mb-4">
                <p className="text-slate-800 font-bold text-sm leading-snug">
                  "{currentQ.statement}"
                </p>
              </div>

              <div className="space-y-2.5">
                {optionsOnScreen.map((opt, idx) => {
                  const letters = ['A', 'B', 'C', 'D'];
                  const isSelected = selectedOption === opt;
                  return (
                    <button
                      key={idx}
                      disabled={Boolean(feedbackState)}
                      onClick={() => setSelectedOption(opt)}
                      className={`w-full p-3.5 rounded-2xl border-2 text-left flex items-center gap-3.5 transition-all ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-50/90 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-emerald-300'
                      }`}
                    >
                      <span
                        className={`w-8 h-8 rounded-xl border flex items-center justify-center font-extrabold text-xs shrink-0 ${
                          isSelected
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-slate-50 text-slate-600 border-slate-300'
                        }`}
                      >
                        {letters[idx]}
                      </span>
                      <span className="font-bold text-sm text-slate-800">{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-4">
              <button
                disabled={!selectedOption || Boolean(feedbackState)}
                onClick={handleVerifyAnswer}
                className={`w-full py-3.5 px-6 rounded-2xl font-extrabold text-sm tracking-wide uppercase transition-all ${
                  selectedOption
                    ? 'bg-emerald-500 border-b-4 border-emerald-700 text-white'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                Comprobar Respuesta
              </button>
            </div>

            {feedbackState && (
              <div
                className={`absolute inset-x-0 bottom-0 p-5 rounded-t-3xl border-t-4 shadow-2xl z-30 ${
                  feedbackState === 'correct'
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <h4 className="font-extrabold text-base text-slate-900 mb-1">
                  {feedbackState === 'correct' ? '✅ ¡Excelente recomendación!' : '❌ Respuesta incorrecta'}
                </h4>
                <p className="text-xs text-slate-700 mb-3">
                  {feedbackState === 'correct' ? currentQ.feedback_correct : currentQ.feedback_error}
                </p>
                <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 mb-3">
                  <p className="text-[10px] font-extrabold uppercase text-emerald-700">
                    💡 Tip Comercial de Mostrador Qali Kay
                  </p>
                  <p className="text-xs font-medium text-slate-800">{currentQ.commercial_tip}</p>
                </div>
                <button
                  onClick={handleNextQuestion}
                  className="w-full py-3.5 rounded-2xl font-extrabold text-white text-sm uppercase bg-emerald-600 border-b-4 border-emerald-800"
                >
                  Continuar
                </button>
              </div>
            )}
          </div>
        )}

        {screen === 'P5' && (
          <div className="p-6 flex flex-col justify-between text-center">
            <div>
              <div className="text-4xl mb-2">🌟🌟🌟</div>
              <h2 className="text-2xl font-black text-slate-800">¡Módulo Completado!</h2>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                Tu progreso y puntos XP ya fueron guardados en Supabase.
              </p>
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-white p-3 rounded-2xl border-2 border-emerald-200">
                  <p className="text-xs font-bold text-slate-400 uppercase">XP Total</p>
                  <p className="text-2xl font-black text-emerald-600">{xp} XP</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border-2 border-amber-200">
                  <p className="text-xs font-bold text-slate-400 uppercase">Tienda</p>
                  <p className="text-lg font-black text-amber-600">{storeCode || 'FREE'}</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => { setScreen('P2'); setActiveTab('premios'); }}
              className="w-full py-4 px-6 rounded-2xl bg-amber-500 border-b-4 border-amber-700 text-white font-extrabold text-sm uppercase"
            >
              Ver Mi Ranking y Premios B2B
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
