import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, Flame, Coins, Award, RefreshCw, Sparkles,
  Trophy, Cloud, Download, Eye, EyeOff, LogOut,
  UserPlus, LogIn, Sprout, ArrowLeft, Lock, Gamepad2,
  ExternalLink, KeyRound, Mail, CheckCircle2, UserCog
} from 'lucide-react';

// ============================================================================
// 1. CONFIGURACIÓN RÁPIDA DE SUPABASE, BANNER PUBLICITARIO Y EMAILJS
// ============================================================================
const SUPABASE_URL = 'https://yxpcctelsoqtsvtcczbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_edcInk7TUTAxp9VjxvU0rg_e4_pCemG';
const STORAGE_KEY = 'natusana_active_session_v2';

// ACTUALIZA AQUÍ TU BANNER INFERIOR FIJO (IMAGEN + LINK CLICABLE)
const BANNER_CONFIG = {
  imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=1000&q=80',
  linkUrl: 'https://wa.me/51999999999?text=Hola,%20vengo%20de%20la%20app%20NatuSana%20y%20quiero%20informaci%C3%B3n%20de%20suplementos%20naturales',
  altText: 'Suplementos Naturales Certificados - Descubre dónde comprarlos aquí',
  badgeText: 'ESPACIO PATROCINADO',
  ctaText: 'Ver catálogo >'
};

// CONFIGURACIÓN GRATUITA DE EMAILJS (Opcional: pega tus IDs de emailjs.com)
// Si aún no pegas tus llaves de EmailJS, la app enviará el código en modo asistido
const EMAILJS_CONFIG = {
  serviceId: '',  // Ej: 'service_natusana'
  templateId: '', // Ej: 'template_codigo6'
  publicKey: ''   // Ej: 'user_xxxxxxxxxxxxx'
};

// Configuración del esquema 10 x 10 (10 lecciones de 10 preguntas = 100 por diploma)
const LESSONS_PER_SPECIALTY = 10;
const QUESTIONS_PER_LESSON = 10;

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

// ============================================================================
// 2. POOLS GLOBALES DE 22+ DISTRACTORES POR ESPECIALIDAD
// ============================================================================
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
    'Moringa oleifera en polvo', 'Graviola / Guanábana liofilizada', 'Uña de gato (Uncaria tomentosa)',
    'Chía negra orgánica', 'Quinua negra gelatinizada', 'Cañihua en polvo',
    'Maíz morado (extracto rico en antocianinas)', 'Polvo de yacón (rico en FOS)', 'Polen apícola multifloral',
    'Chuchuhuasi', 'Sangre de Grado (Croton lechleri)', 'Maca tricolor', 'Muña pulverizada'
  ],
  digestivo: [
    'Probióticos multicepa (Lactobacillus + Bifidobacterium)', 'Saccharomyces boulardii',
    'Inulina de agave / achicoria (Prebiótico)', 'Fructooligosacáridos (FOS) de yacón',
    'Psyllium husk (Cáscara de psilio)', 'Gel / Extracto de Aloe Vera liofilizado',
    'Enzimas digestivas (Bromelina + Papaína + Proteasa)', 'Carbón vegetal activado',
    'L-Glutamina pura', 'Arcilla medicinal purificada (Chacko)',
    'Fibra de manzana soluble', 'Aceite esencial de orégano microencapsulado',
    'Clorofila líquida natural', 'Harina de tocosh (fermentado natural)',
    'Menta piperita deshidratada', 'Extracto de regaliz desglicirrizinado (DGL)',
    'Extracto de jengibre (Gingerol)', 'Vinagre de sidra de manzana en polvo',
    'Semillas de lino molidas', 'Semillas de hinojo en polvo',
    'Lactobacillus rhamnosus GG', 'Butirato de sodio microencapsulado'
  ],
  articular: [
    'Colágeno hidrolizado bovino (péptidos bioactivos)', 'Colágeno no desnaturalizado Tipo II (UC-II)',
    'Colágeno marino hidrolizado', 'Sulfato de glucosamina', 'Sulfato de condroitina',
    'Metilsulfonilmetano (MSM)', 'Cúrcuma estandarizada (95% curcumina)',
    'Extracto de pimienta negra (Piperina)', 'Cartílago de tiburón',
    'Ácido hialurónico oral', 'Extracto de Boswellia serrata',
    'Uña de gato micropulverizada', 'Harpagofito (Garra del diablo)',
    'Silicio orgánico (extracto de Cola de Caballo)', 'Vitamina C pura (ácido ascórbico / Camu Camu)',
    'Vitamina D3 vegetal (Colecalciferol)', 'Vitamina K2 (Menaquinona MK-7)',
    'Citrato de magnesio', 'Aceite de krill (fosfolípidos y astaxantina)',
    'Sulfato de manganeso', 'Extracto de jengibre estandarizado',
    'Membrana de cáscara de huevo (NEM)'
  ]
};

// ============================================================================
// 3. LAS 5 ESPECIALIDADES ABIERTAS + CATÁLOGO DE RETOS EXTRA (PESTAÑA 3)
// ============================================================================
const SPECIALTIES = [
  {
    id: 'citratos',
    title: 'Especialista en Citratos y Minerales Quelados',
    certificateTitle: 'Asesor Certificado en Terapia de Minerales y Citratos',
    icon: '⚡',
    subtitle: 'Citrato de magnesio, potasio, zinc quelado y biodisponibilidad'
  },
  {
    id: 'adaptogenos',
    title: 'Especialista en Adaptógenos y Hongos Funcionales',
    certificateTitle: 'Especialista en Adaptógenos y Rendimiento Cognitivo',
    icon: '🍄',
    subtitle: 'Melena de León, Ashwagandha, Cordyceps, Reishi y Macas'
  },
  {
    id: 'superalimentos',
    title: 'Especialista en Superalimentos Nativos y Ancestrales',
    certificateTitle: 'Embajador de Superalimentos y Nutrición Ancestral',
    icon: '🌿',
    subtitle: 'Camu Camu, Tocosh liofilizado, Sacha Inchi Omega 3 y Cacao'
  },
  {
    id: 'digestivo',
    title: 'Especialista en Salud Digestiva y Microbiota',
    certificateTitle: 'Experto en Cuidado Digestivo e Inmunológico',
    icon: '🌱',
    subtitle: 'Aloe vera liofilizado, prebióticos FOS, probióticos y enzimas'
  },
  {
    id: 'articular',
    title: 'Especialista en Movilidad y Salud Articular',
    certificateTitle: 'Especialista en Salud Osteoarticular',
    icon: '🦴',
    subtitle: 'Colágeno Tipo II (UC-II) vs Hidrolizado, Cúrcuma + Piperina'
  }
];

const BONUS_ACTIVITIES = [
  {
    id: 'empareja',
    title: 'Empareja: Síntoma con Solución',
    icon: '🔗',
    xpBonus: '+40 XP',
    description: 'Conecta en dos columnas 5 molestias frecuentes de mostrador con su suplemento natural específico contra el reloj.',
    badge: 'Próximamente'
  },
  {
    id: 'crucigrama',
    title: 'Crucigrama Botánico',
    icon: '🧩',
    xpBonus: '+60 XP',
    description: 'Completa las casillas cruzadas de principios activos, plantas adaptógenas, vitaminas y minerales quelados.',
    badge: 'Próximamente'
  },
  {
    id: 'palabra_oculta',
    title: 'Palabra Oculta (Estilo Wordle)',
    icon: '🔤',
    xpBonus: '+35 XP',
    description: 'Adivina el superalimento o principio activo del día letra por letra a partir de una pista clínica.',
    badge: 'Próximamente'
  },
  {
    id: 'rafaga_60s',
    title: 'Ráfaga Relámpago 60s (Mito o Verdad)',
    icon: '⚡',
    xpBonus: '+50 XP',
    description: '1 minuto en cuenta regresiva para derribar la mayor cantidad de mitos de suplementación sin perder vidas.',
    badge: 'Próximamente'
  },
  {
    id: 'alquimista',
    title: 'Arma la Sinergia (El Alquimista)',
    icon: '🧪',
    xpBonus: '+45 XP',
    description: 'Selecciona el cofactor exacto que multiplica la biodisponibilidad (ej. Cúrcuma + Piperina, Hierro + Camu Camu).',
    badge: 'Próximamente'
  },
  {
    id: 'reloj_biologico',
    title: 'Ordena el Reloj Biológico (Timing)',
    icon: '⏰',
    xpBonus: '+40 XP',
    description: 'Ubica cada suplemento en su horario ideal de absorción: Mañana en ayunas, Almuerzo o Noche antes de dormir.',
    badge: 'Próximamente'
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
    commercial_tip: 'Explica con claridad: "Con el citrato tu cuerpo aprovecha casi todo el mineral; con presentaciones genéricas la mayor parte se elimina".'
  },
  {
    id: 'CIT-003',
    specialty_id: 'citratos',
    dynamic_type: 'D3',
    statement: 'Un deportista consulta por calambres musculares nocturnos y retención de líquidos. Además del magnesio, ¿qué mineral alcalinizante completa la dupla electrolítica?',
    correct_answer: 'Citrato de potasio',
    distractor_pool_category: 'minerales',
    feedback_correct: '¡Muy bien! El citrato de potasio actúa en sinergia con el magnesio dentro de la célula muscular y ayuda a alcalinizar el medio urinario.',
    feedback_error: 'El compañero directo del magnesio para la transmisión neuromuscular y prevención de calambres es el Citrato de potasio.',
    commercial_tip: 'Sugiere combinar Citrato de Magnesio y Citrato de Potasio para hidratación celular completa.'
  },
  {
    id: 'ADP-001',
    specialty_id: 'adaptogenos',
    dynamic_type: 'D3',
    statement: 'Una profesional acude buscando un apoyo natural porque siente "niebla mental", falta de concentración y olvidos frecuentes. ¿Qué hongo funcional recomiendas?',
    correct_answer: 'Melena de León (Hericium erinaceus)',
    distractor_pool_category: 'adaptogenos',
    feedback_correct: '¡Exacto! La Melena de León estimula la síntesis del Factor de Crecimiento Nervioso (NGF), favoreciendo neuroplasticidad y foco.',
    feedback_error: 'Para foco mental el hongo específico es la Melena de León. Reishi es para descanso y Cordyceps para energía física.',
    commercial_tip: 'Recomienda tomarlo por la mañana junto con el desayuno o café matutino.'
  },
  {
    id: 'ADP-002',
    specialty_id: 'adaptogenos',
    dynamic_type: 'D3',
    statement: 'Un cliente con estrés laboral elevado, cortisol alto y dificultad para conciliar el sueño busca un adaptógeno relajante no sedante. ¿Cuál es el más indicado?',
    correct_answer: 'Ashwagandha (Withania somnifera)',
    distractor_pool_category: 'adaptogenos',
    feedback_correct: '¡Excelente! Los witanólidos de la Ashwagandha modulan el eje hipotalámico-pituitario-adrenal, reduciendo los niveles de cortisol sérico.',
    feedback_error: 'Para bajar el cortisol y mejorar la calidad del descanso nocturno, la primera línea adaptogénica es la Ashwagandha.',
    commercial_tip: 'Sugiere tomarla por la tarde-noche después de la cena para favorecer el descanso reparador.'
  },
  {
    id: 'SUP-001',
    specialty_id: 'superalimentos',
    dynamic_type: 'D6',
    statement: 'Un cliente lleva espirulina o hierro vegetal. Para maximizar la absorción intestinal de ese hierro no hemo, ¿con qué superalimento amazónico debes acompañarlo?',
    correct_answer: 'Camu Camu en polvo',
    distractor_pool_category: 'superalimentos',
    feedback_correct: '¡Brillante! La altísima vitamina C natural del Camu Camu reduce el hierro férrico a ferroso, multiplicando su absorción intestinal.',
    feedback_error: 'El hierro vegetal necesita un medio rico en vitamina C natural como el Camu Camu para asimilarse.',
    commercial_tip: 'Recomendación práctica: "Acompaña tu fuente de hierro con media cucharadita de Camu Camu en agua o jugo cítrico".'
  },
  {
    id: 'SUP-002',
    specialty_id: 'superalimentos',
    dynamic_type: 'D3',
    statement: '¿Qué superalimento andino obtenido por fermentación bacteriana tradicional de la papa destaca como gastroprotector natural y regenerador de mucosa?',
    correct_answer: 'Tocosh deshidratado / liofilizado',
    distractor_pool_category: 'superalimentos',
    feedback_correct: '¡Correcto! El proceso de fermentación del Tocosh genera metabolitos naturales que protegen la mucosa gástrica y fortalecen la inmunidad.',
    feedback_error: 'El fermentado ancestral reconocido por su acción protectora sobre el estómago es el Tocosh.',
    commercial_tip: 'Ofrece la presentación en cápsulas liofilizadas para quienes desean todos los beneficios sin el olor característico.'
  },
  {
    id: 'DIG-001',
    specialty_id: 'digestivo',
    dynamic_type: 'D3',
    statement: 'Un cliente consulta por ardor estomacal frecuente y busca una alternativa natural que recubra y calme la mucosa gástrica de inmediato. ¿Qué recomiendas?',
    correct_answer: 'Gel / Extracto de Aloe Vera liofilizado',
    distractor_pool_category: 'digestivo',
    feedback_correct: '¡Correcto! El aloe vera contiene mucílagos y acemanano que actúan como bálsamo protector sobre las paredes del estómago.',
    feedback_error: 'Para calmar de inmediato la mucosa irritada, el Aloe Vera es el protector botánico ideal.',
    commercial_tip: 'Recomienda tomarlo 20 minutos antes de las comidas principales.'
  },
  {
    id: 'DIG-002',
    specialty_id: 'digestivo',
    dynamic_type: 'D1',
    statement: 'Después de un tratamiento con antibióticos, ¿qué combinación ofrece la recuperación más completa de la microbiota intestinal?',
    correct_answer: 'Probióticos multicepa (Lactobacillus + Bifidobacterium)',
    distractor_pool_category: 'digestivo',
    feedback_correct: '¡Exacto! Repoblar con cepas vivas de Lactobacillus y Bifidobacterium restaura el equilibrio de la barrera intestinal.',
    feedback_error: 'Tras antibióticos es fundamental reponer bacterias benéficas vivas mediante probióticos multicepa.',
    commercial_tip: 'Recuerda indicar que los probióticos se toman separados al menos 2 horas de cualquier antibiótico.'
  },
  {
    id: 'ART-001',
    specialty_id: 'articular',
    dynamic_type: 'D1',
    statement: 'Un cliente pregunta la diferencia entre Colágeno Hidrolizado y Colágeno No Desnaturalizado Tipo II (UC-II). ¿Cuál es la respuesta técnica correcta?',
    correct_answer: 'El hidrolizado aporta aminoácidos estructurales a dosis altas (10g), mientras que el Tipo II modula la respuesta inmune a microdosis (40mg)',
    distractor_pool_category: 'articular',
    feedback_correct: '¡Excelente distinción! El UC-II actúa modulando la inflamación articular por tolerancia oral, mientras el hidrolizado aporta péptidos.',
    feedback_error: 'El colágeno Tipo II actúa a dosis pequeñas (40mg) frenando el desgaste inmunológico del cartílago.',
    commercial_tip: 'Para dolor articular puntual sugiere Colágeno Tipo II en cápsulas; para nutrición integral de piel y tendones, Hidrolizado en polvo.'
  },
  {
    id: 'ART-002',
    specialty_id: 'articular',
    dynamic_type: 'D6',
    statement: 'La curcumina de la cúrcuma tiene baja absorción intestinal por sí sola. ¿Con qué extracto natural debe formularse para incrementar su biodisponibilidad hasta en un 2000%?',
    correct_answer: 'Extracto de pimienta negra (Piperina)',
    distractor_pool_category: 'articular',
    feedback_correct: '¡Brillante! La piperina inhibe la glucuronidación hepática e intestinal de la curcumina, multiplicando su paso a la sangre.',
    feedback_error: 'El cofactor indispensable para que la cúrcuma se absorba de verdad es la Piperina (pimienta negra).',
    commercial_tip: 'Verifica siempre en etiqueta que la Cúrcuma venga activada con Piperina y consúmela junto con alguna grasa saludable.'
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
  // Pantallas: 'P1' = Onboarding, 'P2' = Home (4 Pestañas), 'P3' = Juego 10 preg, 'P5' = Fin de Lección, 'PROFILE' = Editar perfil
  const [screen, setScreen] = useState('P1');
  // Subvistas de P1: 'welcome' | 'register' | 'login' | 'forgot'
  const [authView, setAuthView] = useState('welcome');
  // 4 Pestañas (Opción A): 'ruta' | 'diplomas' | 'retos' | 'ranking'
  const [activeTab, setActiveTab] = useState('ruta');

  // Estado de sesión del usuario
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [userName, setUserName] = useState('Visitante');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('consumidor');
  const [storeName, setStoreName] = useState('');
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(1);
  const [lives, setLives] = useState(5);

  // Progreso 10 lecciones por especialidad (0 a 10)
  const [lessonProgress, setLessonProgress] = useState({
    citratos: 0,
    adaptogenos: 0,
    superalimentos: 0,
    digestivo: 0,
    articular: 0
  });

  // Campos de Registro / Login
  const [formAlias, setFormAlias] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('consumidor');
  const [formStoreName, setFormStoreName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Estado de Recuperación de Contraseña (Código de 6 dígitos al correo)
  const [resetStep, setResetStep] = useState(1); // 1: pedir correo, 2: código + nueva clave
  const [resetEmail, setResetEmail] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');
  const [inputCode, setInputCode] = useState('');
  const [newResetPass, setNewResetPass] = useState('');
  const [resetFallbackNotice, setResetFallbackNotice] = useState('');

  // Estado de Editar Perfil
  const [editAlias, setEditAlias] = useState('');
  const [editRole, setEditRole] = useState('consumidor');
  const [editStoreName, setEditStoreName] = useState('');
  const [editNewPassword, setEditNewPassword] = useState('');

  // Datos en la nube (Supabase)
  const [dbStatus, setDbStatus] = useState('connecting');
  const [dbQuestions, setDbQuestions] = useState(FALLBACK_QUESTIONS);
  const [dbPools, setDbPools] = useState(DISTRACTOR_POOLS);
  const [leaderboard, setLeaderboard] = useState([]);
  const [syncMessage, setSyncMessage] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Estado de partida activa (10 preguntas por lección)
  const [currentSpecId, setCurrentSpecId] = useState('citratos');
  const [currentLessonNum, setCurrentLessonNum] = useState(1);
  const [lessonQuestions, setLessonQuestions] = useState([]);
  const [qIndex, setQIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [optionsOnScreen, setOptionsOnScreen] = useState([]);
  const [feedbackState, setFeedbackState] = useState(null);
  const [correctCountInLesson, setCorrectCountInLesson] = useState(0);
  const [selectedCertSpec, setSelectedCertSpec] = useState('citratos');

  // Cantidad de especialidades completadas al 100% (10/10 lecciones) para el Diploma Máster
  const completedSpecialtiesCount = useMemo(() => {
    return SPECIALTIES.filter(s => (lessonProgress[s.id] || 0) >= LESSONS_PER_SPECIALTY).length;
  }, [lessonProgress]);

  const isMasterUnlocked = completedSpecialtiesCount >= 5;

  // 1. Cargar sesión persistente al abrir la app
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.active) {
          setUserId(parsed.id || null);
          setIsGuest(Boolean(parsed.isGuest));
          setUserName(parsed.alias || 'Visitante');
          setUserEmail(parsed.email || '');
          setUserRole(parsed.role || 'consumidor');
          setStoreName(parsed.store_code || '');
          setXp(typeof parsed.xp_total === 'number' ? parsed.xp_total : 0);
          setStreak(parsed.streak_days || 1);
          setLives(parsed.lives || 5);
          if (parsed.lessonProgress) {
            setLessonProgress(prev => ({ ...prev, ...parsed.lessonProgress }));
          }
          setScreen('P2');
          if (parsed.id) {
            fetchUserProgressFromCloud(parsed.id);
          }
        }
      }
    } catch (e) {
      console.error('Error leyendo sesión local:', e);
    }
    fetchCloudData();
  }, []);

  const saveLocalSession = (sessionData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ active: true, ...sessionData }));
    } catch (e) {
      console.error('No se pudo guardar sesión local', e);
    }
  };

  const fetchUserProgressFromCloud = async (uid) => {
    try {
      const prog = await supabaseRequest(`user_progress?user_id=eq.${uid}&select=*`);
      if (prog && prog.length > 0) {
        const updated = {
          citratos: 0,
          adaptogenos: 0,
          superalimentos: 0,
          digestivo: 0,
          articular: 0
        };
        prog.forEach(p => {
          const mods = Number(p.completed_modules) || 0;
          updated[p.specialty_id] = Math.min(LESSONS_PER_SPECIALTY, mods);
        });
        setLessonProgress(updated);
      }
    } catch (e) {
      console.error('Error cargando progreso:', e);
    }
  };

  const fetchCloudData = async () => {
    try {
      setDbStatus('connecting');
      const [qData, pData, uData] = await Promise.all([
        supabaseRequest('questions?select=*'),
        supabaseRequest('distractor_pools?select=*'),
        supabaseRequest('users?select=*&order=xp_total.desc&limit=25')
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

  // Modo Visitante
  const handleExploreAsGuest = () => {
    setIsGuest(true);
    setUserId(null);
    setUserName('Visitante');
    setUserRole('consumidor');
    setStoreName('');
    setScreen('P2');
    setActiveTab('ruta');
  };

  // Registro de Cuenta (Alias + Correo + Clave + Consumidor o Nombre de Tienda)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const cleanAlias = formAlias.trim();
    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPass = formPassword.trim();
    const cleanStore = formRole === 'tendero' ? (formStoreName.trim() || 'Tienda Natural') : '';

    if (!cleanAlias || !cleanEmail || !cleanPass) {
      setAuthError('Por favor completa tu alias, correo y contraseña.');
      return;
    }
    if (formRole === 'tendero' && !formStoreName.trim()) {
      setAuthError('Por favor escribe el nombre de tu tienda.');
      return;
    }
    if (cleanPass.length < 4) {
      setAuthError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setAuthLoading(true);
    try {
      const existingEmail = await supabaseRequest(`users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`);
      if (existingEmail && existingEmail.length > 0) {
        setAuthError('Este correo ya está registrado. Usa "¿Ya tienes cuenta? Inicia sesión".');
        setAuthLoading(false);
        return;
      }

      const initialXp = xp > 0 ? xp : 50;

      const inserted = await supabaseRequest('users', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          alias: cleanAlias,
          email: cleanEmail,
          password: cleanPass,
          role: formRole,
          store_code: cleanStore || 'CONSUMIDOR',
          xp_total: initialXp,
          streak_days: 1,
          lives: 5
        })
      });

      const createdUser = inserted && inserted[0] ? inserted[0] : {
        id: null,
        alias: cleanAlias,
        email: cleanEmail,
        role: formRole,
        store_code: cleanStore || 'CONSUMIDOR',
        xp_total: initialXp,
        streak_days: 1,
        lives: 5
      };

      setUserId(createdUser.id);
      setIsGuest(false);
      setUserName(createdUser.alias);
      setUserEmail(createdUser.email);
      setUserRole(createdUser.role);
      setStoreName(createdUser.store_code === 'CONSUMIDOR' ? '' : createdUser.store_code);
      setXp(createdUser.xp_total);
      setStreak(createdUser.streak_days || 1);
      setLives(createdUser.lives || 5);

      saveLocalSession({
        id: createdUser.id,
        isGuest: false,
        alias: createdUser.alias,
        email: createdUser.email,
        role: createdUser.role,
        store_code: createdUser.store_code === 'CONSUMIDOR' ? '' : createdUser.store_code,
        xp_total: createdUser.xp_total,
        streak_days: createdUser.streak_days || 1,
        lives: createdUser.lives || 5,
        lessonProgress
      });

      await fetchCloudData();
      setScreen('P2');
      setActiveTab('ruta');
    } catch (err) {
      setAuthError(`No se pudo crear la cuenta: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Inicio de Sesión
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPass = formPassword.trim();

    if (!cleanEmail || !cleanPass) {
      setAuthError('Ingresa tu correo electrónico y tu contraseña.');
      return;
    }

    setAuthLoading(true);
    try {
      const found = await supabaseRequest(
        `users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`
      );

      if (!found || found.length === 0) {
        setAuthError('No encontramos una cuenta con ese correo electrónico.');
        setAuthLoading(false);
        return;
      }

      const userRecord = found[0];
      if (userRecord.password && userRecord.password !== cleanPass) {
        setAuthError('Contraseña incorrecta. Verifica o toca "¿Olvidaste tu contraseña?".');
        setAuthLoading(false);
        return;
      }

      const cleanStore = (userRecord.store_code === 'FREE' || userRecord.store_code === 'CONSUMIDOR')
        ? ''
        : (userRecord.store_code || '');

      setUserId(userRecord.id);
      setIsGuest(false);
      setUserName(userRecord.alias);
      setUserEmail(userRecord.email);
      setUserRole(userRecord.role || 'consumidor');
      setStoreName(cleanStore);
      setXp(userRecord.xp_total || 0);
      setStreak(userRecord.streak_days || 1);
      setLives(userRecord.lives || 5);

      const updatedProgress = {
        citratos: 0,
        adaptogenos: 0,
        superalimentos: 0,
        digestivo: 0,
        articular: 0
      };

      if (userRecord.id) {
        const prog = await supabaseRequest(`user_progress?user_id=eq.${userRecord.id}&select=*`);
        if (prog && prog.length > 0) {
          prog.forEach(p => {
            updatedProgress[p.specialty_id] = Math.min(LESSONS_PER_SPECIALTY, Number(p.completed_modules) || 0);
          });
          setLessonProgress(updatedProgress);
        }
      }

      saveLocalSession({
        id: userRecord.id,
        isGuest: false,
        alias: userRecord.alias,
        email: userRecord.email,
        role: userRecord.role || 'consumidor',
        store_code: cleanStore,
        xp_total: userRecord.xp_total || 0,
        streak_days: userRecord.streak_days || 1,
        lives: userRecord.lives || 5,
        lessonProgress: updatedProgress
      });

      setScreen('P2');
      setActiveTab('ruta');
    } catch (err) {
      setAuthError(`Error al iniciar sesión: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // ==========================================================================
  // RECUPERACIÓN DE CONTRASEÑA CON CÓDIGO DE 6 DÍGITOS AL CORREO (EMAILJS)
  // ==========================================================================
  const handleSendRecoveryCode = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');
    setResetFallbackNotice('');

    const cleanEmail = resetEmail.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Ingresa el correo electrónico de tu cuenta.');
      return;
    }

    setAuthLoading(true);
    try {
      const found = await supabaseRequest(`users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`);
      if (!found || found.length === 0) {
        setAuthError('No existe ninguna cuenta registrada con ese correo electrónico.');
        setAuthLoading(false);
        return;
      }

      const targetUser = found[0];
      const code6 = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedCode(code6);

      // Si las llaves de EmailJS están configuradas, envía el correo real
      if (EMAILJS_CONFIG.serviceId && EMAILJS_CONFIG.templateId && EMAILJS_CONFIG.publicKey) {
        const emailRes = await fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            service_id: EMAILJS_CONFIG.serviceId,
            template_id: EMAILJS_CONFIG.templateId,
            user_id: EMAILJS_CONFIG.publicKey,
            template_params: {
              to_email: cleanEmail,
              to_name: targetUser.alias || 'Estudiante NatuSana',
              recovery_code: code6
            }
          })
        });
        if (!emailRes.ok) {
          throw new Error('No se pudo contactar al servidor de correo EmailJS.');
        }
        setAuthSuccess(`Enviamos un código de 6 dígitos a ${cleanEmail}. Revisa tu bandeja o Spam.`);
      } else {
        // Modo asistido instantáneo mientras terminas de pegar tus llaves de EmailJS
        setAuthSuccess(`Código generado para ${cleanEmail}.`);
        setResetFallbackNotice(`Modo directo activo (pendiente configurar llaves EmailJS): Tu código de verificación es ${code6}`);
      }

      setResetStep(2);
    } catch (err) {
      setAuthError(`Error al procesar la solicitud: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleConfirmRecoveryPassword = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthSuccess('');

    if (inputCode.trim() !== generatedCode) {
      setAuthError('El código de 6 dígitos no coincide. Verifica e intenta nuevamente.');
      return;
    }
    if (newResetPass.trim().length < 4) {
      setAuthError('La nueva contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setAuthLoading(true);
    try {
      const cleanEmail = resetEmail.trim().toLowerCase();
      await supabaseRequest(`users?email=eq.${encodeURIComponent(cleanEmail)}`, {
        method: 'PATCH',
        body: JSON.stringify({ password: newResetPass.trim() })
      });

      setFormEmail(cleanEmail);
      setFormPassword(newResetPass.trim());
      setResetStep(1);
      setInputCode('');
      setNewResetPass('');
      setResetFallbackNotice('');
      setAuthView('login');
      setAuthSuccess('✅ ¡Contraseña actualizada con éxito! Ya puedes entrar a tu cuenta.');
    } catch (err) {
      setAuthError(`No se pudo actualizar la contraseña: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Abrir pantalla de Editar Perfil
  const openProfileEditor = () => {
    setEditAlias(userName);
    setEditRole(userRole || 'consumidor');
    setEditStoreName(storeName || '');
    setEditNewPassword('');
    setAuthError('');
    setAuthSuccess('');
    setScreen('PROFILE');
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setAuthError('');
    const cleanAlias = editAlias.trim();
    const cleanStore = editRole === 'tendero' ? (editStoreName.trim() || 'Tienda Natural') : '';

    if (!cleanAlias) {
      setAuthError('El alias o nombre no puede quedar vacío.');
      return;
    }
    if (editRole === 'tendero' && !editStoreName.trim()) {
      setAuthError('Por favor ingresa el nombre de tu tienda.');
      return;
    }

    setAuthLoading(true);
    try {
      const patchPayload = {
        alias: cleanAlias,
        role: editRole,
        store_code: editRole === 'tendero' ? cleanStore : 'CONSUMIDOR'
      };
      if (editNewPassword.trim().length >= 4) {
        patchPayload.password = editNewPassword.trim();
      }

      if (userId) {
        await supabaseRequest(`users?id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify(patchPayload)
        });
      }

      setUserName(cleanAlias);
      setUserRole(editRole);
      setStoreName(cleanStore);

      saveLocalSession({
        id: userId,
        isGuest,
        alias: cleanAlias,
        email: userEmail,
        role: editRole,
        store_code: cleanStore,
        xp_total: xp,
        streak_days: streak,
        lives,
        lessonProgress
      });

      await fetchCloudData();
      setScreen('P2');
      setSyncMessage('✅ Perfil actualizado correctamente.');
      setTimeout(() => setSyncMessage(''), 3500);
    } catch (err) {
      setAuthError(`Error al guardar cambios: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setUserId(null);
    setIsGuest(true);
    setUserName('Visitante');
    setUserEmail('');
    setStoreName('');
    setFormEmail('');
    setFormPassword('');
    setAuthError('');
    setAuthSuccess('');
    setAuthView('welcome');
    setScreen('P1');
  };

  // Sincronización de progreso (10 lecciones por especialidad) con Supabase
  const syncUserToSupabase = async (newXp = xp, specIdUpdated = null, newLessonCount = null) => {
    const updatedMap = specIdUpdated
      ? { ...lessonProgress, [specIdUpdated]: newLessonCount }
      : lessonProgress;

    if (isGuest) {
      saveLocalSession({
        id: null,
        isGuest: true,
        alias: 'Visitante',
        email: '',
        role: 'consumidor',
        store_code: '',
        xp_total: newXp,
        streak_days: streak,
        lives,
        lessonProgress: updatedMap
      });
      setSyncMessage('💡 Modo visitante: crea tu cuenta gratis para respaldar tu avance en la nube.');
      setTimeout(() => setSyncMessage(''), 4500);
      return;
    }

    setIsSaving(true);
    setSyncMessage('Sincronizando avance en la nube...');
    try {
      if (userId) {
        await supabaseRequest(`users?id=eq.${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            xp_total: newXp,
            streak_days: streak,
            lives: lives
          })
        });

        if (specIdUpdated && typeof newLessonCount === 'number') {
          const isCert = newLessonCount >= LESSONS_PER_SPECIALTY;
          const existingProg = await supabaseRequest(
            `user_progress?user_id=eq.${userId}&specialty_id=eq.${specIdUpdated}&select=*`
          );

          if (!existingProg || existingProg.length === 0) {
            await supabaseRequest('user_progress', {
              method: 'POST',
              body: JSON.stringify({
                user_id: userId,
                specialty_id: specIdUpdated,
                completed_modules: newLessonCount,
                certified: isCert,
                certification_date: isCert ? new Date().toISOString() : null
              })
            });
          } else {
            const progId = existingProg[0].id;
            await supabaseRequest(`user_progress?id=eq.${progId}`, {
              method: 'PATCH',
              body: JSON.stringify({
                completed_modules: newLessonCount,
                certified: isCert,
                certification_date: isCert ? new Date().toISOString() : existingProg[0].certification_date
              })
            });
          }
        }
      }

      saveLocalSession({
        id: userId,
        isGuest: false,
        alias: userName,
        email: userEmail,
        role: userRole,
        store_code: storeName,
        xp_total: newXp,
        streak_days: streak,
        lives: lives,
        lessonProgress: updatedMap
      });

      const updatedUsers = await supabaseRequest('users?select=*&order=xp_total.desc&limit=25');
      if (updatedUsers) setLeaderboard(updatedUsers);

      setSyncMessage(`✅ Avance sincronizado (${newXp} XP)`);
      setTimeout(() => setSyncMessage(''), 3500);
    } catch (e) {
      setSyncMessage(`⚠️ Error de red al sincronizar: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // ==========================================================================
  // MOTOR DE PARTIDA 10 x 10 (10 LECCIONES DE 10 PREGUNTAS CADA UNA)
  // ==========================================================================
  const startSpecialtyLesson = (specId) => {
    const doneLessons = lessonProgress[specId] || 0;
    const nextLesson = doneLessons < LESSONS_PER_SPECIALTY ? doneLessons + 1 : LESSONS_PER_SPECIALTY;

    // Filtrar preguntas de la especialidad desde Supabase + respaldo semilla
    const poolForSpec = dbQuestions.filter(q => q.specialty_id === specId);
    const baseList = poolForSpec.length > 0 ? poolForSpec : FALLBACK_QUESTIONS.filter(q => q.specialty_id === specId);

    // Si hay preguntas asignadas a module_num === nextLesson las prioriza, y completa hasta 10 preguntas
    // barajando enunciados y generando nuevos distractores aleatorios en cada pregunta
    const moduleSpecific = baseList.filter(q => Number(q.module_num) === nextLesson);
    const sourceQuestions = moduleSpecific.length > 0 ? [...moduleSpecific, ...baseList] : baseList;

    const tenQuestionsBlock = [];
    let safetyCounter = 0;
    while (tenQuestionsBlock.length < QUESTIONS_PER_LESSON && safetyCounter < 50) {
      const shuffledBatch = shuffleArray(sourceQuestions);
      for (const item of shuffledBatch) {
        if (tenQuestionsBlock.length < QUESTIONS_PER_LESSON) {
          tenQuestionsBlock.push({ ...item, instanceKey: `${item.id}-${tenQuestionsBlock.length}-${Math.random()}` });
        }
      }
      safetyCounter++;
    }

    setCurrentSpecId(specId);
    setCurrentLessonNum(nextLesson);
    setLessonQuestions(tenQuestionsBlock);
    setQIndex(0);
    setCorrectCountInLesson(0);
    setFeedbackState(null);
    setScreen('P3');
  };

  const currentQ = lessonQuestions[qIndex] || FALLBACK_QUESTIONS[0];

  // Barajado automático de distractores del pool cada vez que cambia la pregunta
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
  }, [currentQ, dbPools]);

  const handleVerifyAnswer = () => {
    if (!selectedOption) return;
    const isRight = selectedOption === currentQ.correct_answer;
    if (isRight) {
      setFeedbackState('correct');
      setCorrectCountInLesson(c => c + 1);
      setXp(x => x + 15);
    } else {
      setFeedbackState('wrong');
      setLives(l => Math.max(1, l - 1));
    }
  };

  const handleNextQuestion = () => {
    if (qIndex + 1 < lessonQuestions.length) {
      setQIndex(i => i + 1);
    } else {
      // Terminó las 10 preguntas de la lección
      const bonusXp = 40;
      const newTotalXp = xp + bonusXp;
      setXp(newTotalXp);

      const prevDone = lessonProgress[currentSpecId] || 0;
      const updatedLessonNum = Math.min(LESSONS_PER_SPECIALTY, Math.max(prevDone, currentLessonNum));

      setLessonProgress(prev => ({
        ...prev,
        [currentSpecId]: updatedLessonNum
      }));

      setSelectedCertSpec(currentSpecId);
      syncUserToSupabase(newTotalXp, currentSpecId, updatedLessonNum);
      setScreen('P5');
    }
  };

  // ==========================================================================
  // GENERADOR DE DIPLOMAS EN PNG (ESPECIALIDAD Y MÁSTER DORADO - 100% NATUSANA)
  // ==========================================================================
  const downloadCertificatePNG = (specObj, isMaster = false) => {
    const canvas = document.createElement('canvas');
    canvas.width = 1200;
    canvas.height = 820;
    const ctx = canvas.getContext('2d');

    // Fondo según tipo (Dorado para Máster, Verde Botánico para Especialidad)
    ctx.fillStyle = isMaster ? '#FFFBEB' : '#ECFDF5';
    ctx.fillRect(0, 0, 1200, 820);

    ctx.strokeStyle = isMaster ? '#D97706' : '#10B981';
    ctx.lineWidth = 18;
    ctx.strokeRect(40, 40, 1120, 740);

    ctx.fillStyle = isMaster ? '#92400E' : '#065F46';
    ctx.font = 'bold 30px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(
      isMaster
        ? 'CERTIFICACIÓN MÁSTER DE HONOR • NATUSANA EDUCACIÓN EN SALUD NATURAL'
        : 'CERTIFICACIÓN OFICIAL NATUSANA • EDUCACIÓN EN SALUD NATURAL',
      600,
      145
    );

    ctx.fillStyle = '#6B7280';
    ctx.font = '24px sans-serif';
    ctx.fillText('Otorgado a:', 600, 240);

    ctx.fillStyle = '#111827';
    ctx.font = 'bold 56px sans-serif';
    ctx.fillText(userName || 'Estudiante NatuSana', 600, 320);

    const storeLabel = storeName ? `Tienda: ${storeName}` : 'Perfil: Consumidor Natural';
    ctx.fillStyle = isMaster ? '#B45309' : '#059669';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`${storeLabel}  |  Experiencia: ${xp} XP`, 600, 385);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(120, 435, 960, 165);
    ctx.strokeStyle = isMaster ? '#FCD34D' : '#A7F3D0';
    ctx.lineWidth = 4;
    ctx.strokeRect(120, 435, 960, 165);

    ctx.fillStyle = isMaster ? '#B45309' : '#047857';
    ctx.font = 'bold 22px sans-serif';
    ctx.fillText(
      isMaster ? 'MÁXIMA DISTINCIÓN ACREDITADA (5 ESPECIALIDADES COMPLETADAS):' : 'ESPECIALIDAD ACREDITADA (10 LECCIONES COMPLETADAS):',
      600,
      485
    );

    ctx.fillStyle = '#1F2937';
    ctx.font = 'bold 32px sans-serif';
    ctx.fillText(
      isMaster
        ? 'Máster Experto en Suplementación y Bienestar Natural NatuSana'
        : specObj.certificateTitle,
      600,
      545
    );

    ctx.fillStyle = '#6B7280';
    ctx.font = '20px sans-serif';
    ctx.fillText(
      `Verificación Oficial NatuSana • ID: NS-${isMaster ? 'MASTER' : specObj.id.toUpperCase()} • Fecha: ${new Date().toLocaleDateString()}`,
      600,
      695
    );

    const link = document.createElement('a');
    link.download = isMaster
      ? 'Diploma_Master_NatuSana.png'
      : `Diploma_NatuSana_${specObj.id}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start pt-3 pb-24 px-2 font-sans select-none">
      {/* Barra superior de cuenta y estado */}
      <div className="w-full max-w-md mb-2 px-3.5 py-2 rounded-2xl bg-slate-800/95 border border-slate-700 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2 min-w-0">
          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${dbStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-bold text-white shrink-0">NatuSana</span>
          {isGuest ? (
            <span className="text-[11px] text-emerald-300 font-semibold truncate">
              • Modo Visitante
            </span>
          ) : (
            <button
              onClick={openProfileEditor}
              className="text-[11px] text-emerald-300 hover:text-white font-semibold truncate flex items-center gap-1 underline-offset-2 hover:underline"
              title="Editar mi perfil"
            >
              • {userName} <UserCog className="w-3 h-3 inline shrink-0" />
            </button>
          )}
        </div>

        {screen !== 'P1' && (
          isGuest ? (
            <button
              onClick={() => { setAuthView('register'); setScreen('P1'); }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white transition flex items-center gap-1 shrink-0"
            >
              <UserPlus className="w-3 h-3" /> Crear cuenta
            </button>
          ) : (
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={openProfileEditor}
                className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-slate-200 transition"
              >
                Perfil
              </button>
              <button
                onClick={handleLogout}
                className="px-2 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-slate-200 transition flex items-center gap-1"
              >
                <LogOut className="w-3 h-3" /> Salir
              </button>
            </div>
          )
        )}
      </div>

      {/* Contenedor Principal Móvil con margen inferior para que el scroll pase por detrás del banner */}
      <div className="w-full max-w-md bg-[#F9FAFB] rounded-[32px] shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col mb-4">

        {/* ===================================================================== */}
        {/* PANTALLA P1: ONBOARDING (BIENVENIDA / REGISTRO / LOGIN / OLVIDÉ CLAVE)*/}
        {/* ===================================================================== */}
        {screen === 'P1' && (
          <div className="p-6 sm:p-8 min-h-[540px] flex flex-col justify-center bg-[#F4F6F4]">
            {authView === 'welcome' && (
              <div className="flex flex-col items-center text-center my-auto">
                <div className="flex flex-col items-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2 shadow-sm">
                    <Sprout className="w-9 h-9 text-[#1E9E49] stroke-[2.2]" />
                  </div>
                  <span className="text-3xl font-extrabold text-[#1C1E21] tracking-tight">
                    NatuSana
                  </span>
                </div>

                <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#1C1E21] leading-tight mb-3">
                  ¡Bienvenido a NatuSana!
                </h1>
                <p className="text-sm sm:text-base text-[#606770] max-w-xs leading-relaxed mb-8">
                  Aprende sobre salud natural con lecciones cortas, obtén tus diplomas y compite en el ranking.
                </p>

                <button
                  onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthView('register'); }}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] active:translate-y-0.5 text-white font-bold text-base shadow-sm transition mb-3.5"
                >
                  Crear mi cuenta
                </button>

                <button
                  onClick={handleExploreAsGuest}
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-emerald-50/50 text-[#1C1E21] font-bold text-base border border-[#259D4A] transition mb-6"
                >
                  Explorar sin registrarme
                </button>

                <p className="text-sm text-[#606770]">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthView('login'); }}
                    className="font-bold text-[#1C1E21] hover:text-[#259D4A] underline-offset-2 hover:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}

            {/* VISTA REGISTRO: CASILLA "NOMBRE DE LA TIENDA" AL ELEGIR ASESOR/TIENDA */}
            {authView === 'register' && (
              <div className="my-auto">
                <button
                  onClick={() => setAuthView('welcome')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a bienvenida
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <Sprout className="w-6 h-6 text-[#259D4A]" />
                  <h2 className="text-2xl font-extrabold text-slate-900">Crear mi cuenta</h2>
                </div>
                <p className="text-xs text-slate-600 mb-5">
                  Guarda tu avance en las 10 lecciones de cada diploma y suma puntos en el Ranking.
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {authError}
                  </div>
                )}

                <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Alias o Nombre (para tu Diploma y Ranking)
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. María Gómez o Carlos_Bio"
                      value={formAlias}
                      onChange={e => setFormAlias(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#259D4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tucorreo@ejemplo.com"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#259D4A]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 4 caracteres"
                        value={formPassword}
                        onChange={e => setFormPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 pr-10 focus:outline-none focus:border-[#259D4A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      ¿Cómo usarás NatuSana?
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormRole('consumidor')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                          formRole === 'consumidor'
                            ? 'bg-emerald-50 border-[#259D4A] text-[#1f873f]'
                            : 'bg-white border-slate-300 text-slate-600'
                        }`}
                      >
                        🌱 Consumidor
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormRole('tendero')}
                        className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                          formRole === 'tendero'
                            ? 'bg-emerald-50 border-[#259D4A] text-[#1f873f]'
                            : 'bg-white border-slate-300 text-slate-600'
                        }`}
                      >
                        🏪 Asesor / Tienda
                      </button>
                    </div>
                  </div>

                  {formRole === 'tendero' && (
                    <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                      <label className="block text-xs font-extrabold text-emerald-900 mb-1">
                        Nombre de la tienda
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="Ej. Vida Natural Miraflores"
                        value={formStoreName}
                        onChange={e => setFormStoreName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-slate-800"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] text-white font-bold text-sm shadow-sm transition mt-2"
                  >
                    {authLoading ? 'Creando cuenta...' : 'Registrarme y entrar a NatuSana'}
                  </button>
                </form>

                <p className="text-xs text-center text-slate-600 mt-4">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthView('login'); }}
                    className="font-bold text-slate-900 hover:text-[#259D4A] underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}

            {/* VISTA INICIAR SESIÓN + BOTÓN "¿OLVIDASTE TU CONTRASEÑA?" */}
            {authView === 'login' && (
              <div className="my-auto">
                <button
                  onClick={() => setAuthView('welcome')}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a bienvenida
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <LogIn className="w-6 h-6 text-[#259D4A]" />
                  <h2 className="text-2xl font-extrabold text-slate-900">Inicia sesión</h2>
                </div>
                <p className="text-xs text-slate-600 mb-5">
                  Ingresa con tu correo y contraseña para recuperar tu avance.
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    {authSuccess}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="tucorreo@ejemplo.com"
                      value={formEmail}
                      onChange={e => setFormEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#259D4A]"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-bold text-slate-700">
                        Contraseña
                      </label>
                      <button
                        type="button"
                        onClick={() => {
                          setAuthError('');
                          setAuthSuccess('');
                          setResetEmail(formEmail);
                          setResetStep(1);
                          setAuthView('forgot');
                        }}
                        className="text-xs font-bold text-[#259D4A] hover:underline"
                      >
                        ¿Olvidaste tu contraseña?
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Tu contraseña"
                        value={formPassword}
                        onChange={e => setFormPassword(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 pr-10 focus:outline-none focus:border-[#259D4A]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] text-white font-bold text-sm shadow-sm transition"
                  >
                    {authLoading ? 'Verificando...' : 'Entrar a mi cuenta'}
                  </button>
                </form>

                <p className="text-xs text-center text-slate-600 mt-5">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthView('register'); }}
                    className="font-bold text-slate-900 hover:text-[#259D4A] underline"
                  >
                    Crear mi cuenta
                  </button>
                </p>
              </div>
            )}

            {/* VISTA RECUPERAR CONTRASEÑA CON CÓDIGO DE 6 DÍGITOS AL CORREO */}
            {authView === 'forgot' && (
              <div className="my-auto">
                <button
                  onClick={() => { setAuthError(''); setAuthSuccess(''); setAuthView('login'); }}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-4"
                >
                  <ArrowLeft className="w-4 h-4" /> Volver a iniciar sesión
                </button>

                <div className="flex items-center gap-2 mb-1">
                  <KeyRound className="w-6 h-6 text-[#259D4A]" />
                  <h2 className="text-xl font-extrabold text-slate-900">Recuperar contraseña</h2>
                </div>
                <p className="text-xs text-slate-600 mb-5">
                  {resetStep === 1
                    ? 'Ingresa tu correo electrónico y te enviaremos un código de 6 dígitos.'
                    : 'Ingresa el código de 6 dígitos recibido y escribe tu nueva contraseña.'}
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {authError}
                  </div>
                )}

                {authSuccess && (
                  <div className="mb-3 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800">
                    {authSuccess}
                  </div>
                )}

                {resetFallbackNotice && (
                  <div className="mb-4 p-3 rounded-xl bg-amber-50 border border-amber-300 text-xs font-bold text-amber-900">
                    🔑 {resetFallbackNotice}
                  </div>
                )}

                {resetStep === 1 ? (
                  <form onSubmit={handleSendRecoveryCode} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Tu correo electrónico registrado
                      </label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          placeholder="tucorreo@ejemplo.com"
                          value={resetEmail}
                          onChange={e => setResetEmail(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#259D4A]"
                        />
                        <Mail className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] text-white font-bold text-sm shadow-sm transition"
                    >
                      {authLoading ? 'Enviando código...' : 'Enviar código de 6 dígitos'}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleConfirmRecoveryPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Código de 6 dígitos
                      </label>
                      <input
                        type="text"
                        required
                        maxLength={6}
                        placeholder="Ej. 482910"
                        value={inputCode}
                        onChange={e => setInputCode(e.target.value.replace(/\D/g, ''))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-center tracking-widest text-lg font-black text-emerald-800 focus:outline-none focus:border-[#259D4A]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Nueva contraseña
                      </label>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="Mínimo 4 caracteres"
                        value={newResetPass}
                        onChange={e => setNewResetPass(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#259D4A]"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={authLoading}
                      className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] text-white font-bold text-sm shadow-sm transition"
                    >
                      {authLoading ? 'Actualizando...' : 'Guardar nueva contraseña'}
                    </button>

                    <button
                      type="button"
                      onClick={() => setResetStep(1)}
                      className="w-full py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                    >
                      Reenviar código o cambiar correo
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* PANTALLA EDITAR PERFIL                                                */}
        {/* ===================================================================== */}
        {screen === 'PROFILE' && (
          <div className="p-6 bg-[#F4F6F4]">
            <button
              onClick={() => setScreen('P2')}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 mb-3"
            >
              <ArrowLeft className="w-4 h-4" /> Volver al Home
            </button>

            <h2 className="text-xl font-extrabold text-slate-900 mb-1">Editar mi perfil</h2>
            <p className="text-xs text-slate-600 mb-4">
              Actualiza cómo aparece tu nombre en los diplomas y el nombre de tu tienda.
            </p>

            <div className="grid grid-cols-2 gap-2.5 mb-4">
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Puntaje:</span>
                <span className="text-xs font-black text-amber-600">{xp} XP</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">Racha:</span>
                <span className="text-xs font-black text-amber-600">🔥 {streak}d</span>
              </div>
            </div>

            {authError && (
              <div className="mb-3 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                {authError}
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Alias o Nombre (para tu Diploma y Ranking)
                </label>
                <input
                  type="text"
                  required
                  value={editAlias}
                  onChange={e => setEditAlias(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-sm font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 mb-1">
                  Correo electrónico (identificador de cuenta)
                </label>
                <input
                  type="email"
                  disabled
                  value={userEmail}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-xs font-semibold text-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Perfil en NatuSana
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditRole('consumidor')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                      editRole === 'consumidor'
                        ? 'bg-emerald-50 border-[#259D4A] text-[#1f873f]'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    🌱 Consumidor
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditRole('tendero')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border transition ${
                      editRole === 'tendero'
                        ? 'bg-emerald-50 border-[#259D4A] text-[#1f873f]'
                        : 'bg-white border-slate-300 text-slate-600'
                    }`}
                  >
                    🏪 Asesor / Tienda
                  </button>
                </div>
              </div>

              {editRole === 'tendero' && (
                <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200">
                  <label className="block text-xs font-extrabold text-emerald-900 mb-1">
                    Nombre de la tienda
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Vida Natural Miraflores"
                    value={editStoreName}
                    onChange={e => setEditStoreName(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs font-semibold text-slate-800"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nueva contraseña (opcional)
                </label>
                <input
                  type="password"
                  placeholder="Déjalo en blanco para mantener la actual"
                  value={editNewPassword}
                  onChange={e => setEditNewPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white text-xs font-semibold text-slate-800"
                />
              </div>

              <div className="pt-2 space-y-2">
                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] text-white font-bold text-sm shadow-sm transition"
                >
                  {authLoading ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button
                  type="button"
                  onClick={() => setScreen('P2')}
                  className="w-full py-2.5 px-6 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* ===================================================================== */}
        {/* BARRA SUPERIOR Y LAS 4 PESTAÑAS (OPCIÓN A: RUTA | DIPLOMAS | RETOS | RANKING) */}
        {/* ===================================================================== */}
        {screen !== 'P1' && screen !== 'P3' && screen !== 'PROFILE' && (
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
              {isGuest ? (
                <button
                  onClick={() => { setAuthView('register'); setScreen('P1'); }}
                  className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-[#259D4A] text-white hover:bg-[#1f873f] shadow-sm"
                >
                  Guardar cuenta
                </button>
              ) : (
                <button
                  onClick={() => syncUserToSupabase(xp)}
                  disabled={isSaving}
                  className="text-[11px] font-extrabold px-2.5 py-1 rounded-xl bg-emerald-600 text-white hover:bg-emerald-500 shadow-sm flex items-center gap-1"
                >
                  <Cloud className="w-3.5 h-3.5" />
                  {isSaving ? '...' : 'Sincronizar'}
                </button>
              )}
            </div>

            {/* 4 PESTAÑAS ACORDADAS (OPCIÓN A) */}
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
                onClick={() => { setScreen('P2'); setActiveTab('retos'); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                  screen === 'P2' && activeTab === 'retos'
                    ? 'bg-emerald-600 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Gamepad2 className="w-4 h-4" />
                <span className="text-[11px] font-extrabold">3. Retos</span>
              </button>

              <button
                onClick={() => { setScreen('P2'); setActiveTab('ranking'); }}
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
                  screen === 'P2' && activeTab === 'ranking'
                    ? 'bg-amber-500 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-200/70'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="text-[11px] font-extrabold">4. Ranking</span>
              </button>
            </div>

            {syncMessage && (
              <div className="bg-emerald-900 text-emerald-100 text-[11px] font-bold px-3 py-1.5 text-center">
                {syncMessage}
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* PANTALLA P2: CONTENIDO DE LAS 4 PESTAÑAS                              */}
        {/* ===================================================================== */}
        {screen === 'P2' && (
          <div className="p-4">
            {isGuest && (
              <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                <p className="text-xs text-amber-900 font-semibold">
                  👋 Estás explorando sin registro. Crea tu cuenta gratis para guardar tus lecciones.
                </p>
                <button
                  onClick={() => { setAuthView('register'); setScreen('P1'); }}
                  className="px-3 py-1.5 rounded-xl bg-[#259D4A] text-white font-extrabold text-xs shrink-0"
                >
                  Crear cuenta
                </button>
              </div>
            )}

            {/* PESTAÑA 1: RUTA (5 ESPECIALIDADES ABIERTAS DE 10 LECCIONES x 10 PREGUNTAS) */}
            {activeTab === 'ruta' && (
              <div>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white mb-4 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                      {isGuest
                        ? 'MODO EXPLORACIÓN'
                        : storeName
                        ? `TIENDA: ${storeName}`
                        : 'PERFIL: CONSUMIDOR'}
                    </span>
                    <h2 className="text-lg font-extrabold mt-1">¡Hola, {userName}!</h2>
                    <p className="text-xs text-emerald-100">
                      Las 5 especialidades están abiertas. Completa las 10 lecciones (10 preguntas c/u) para certificar cada una.
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  {SPECIALTIES.map((spec, idx) => {
                    const completedCount = lessonProgress[spec.id] || 0;
                    const isCertified = completedCount >= LESSONS_PER_SPECIALTY;
                    const progressPct = Math.min(100, Math.round((completedCount / LESSONS_PER_SPECIALTY) * 100));
                    const nextLessonToPlay = isCertified ? LESSONS_PER_SPECIALTY : completedCount + 1;

                    return (
                      <div
                        key={spec.id}
                        onClick={() => startSpecialtyLesson(spec.id)}
                        className={`w-full p-4 rounded-2xl border-2 transition cursor-pointer bg-white shadow-sm hover:shadow-md ${
                          isCertified ? 'border-emerald-500' : 'border-slate-200 hover:border-emerald-400'
                        }`}
                      >
                        <div className="flex items-start gap-3.5">
                          <div
                            className={`w-13 h-13 p-3 rounded-2xl flex items-center justify-center text-2xl shrink-0 border-b-4 shadow ${
                              isCertified
                                ? 'bg-emerald-500 border-emerald-700 text-white'
                                : 'bg-amber-400 border-amber-600 text-white'
                            }`}
                          >
                            {spec.icon}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                Especialidad {idx + 1}
                              </span>
                              {isCertified ? (
                                <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                  ✅ Diploma Desbloqueado
                                </span>
                              ) : (
                                <span className="text-[11px] font-extrabold text-emerald-700">
                                  Lección {nextLessonToPlay} de {LESSONS_PER_SPECIALTY}
                                </span>
                              )}
                            </div>

                            <h3 className="font-extrabold text-slate-800 text-sm mt-1">
                              {spec.title}
                            </h3>
                            <p className="text-xs text-slate-500 mt-0.5">{spec.subtitle}</p>

                            {/* Barra de progreso 10x10 */}
                            <div className="mt-3">
                              <div className="flex items-center justify-between text-[11px] font-bold text-slate-600 mb-1">
                                <span>
                                  Avance: {completedCount}/{LESSONS_PER_SPECIALTY} lecciones (10 preg. por lección)
                                </span>
                                <span className="text-emerald-700 font-extrabold">{progressPct}%</span>
                              </div>
                              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                                <div
                                  className="h-full bg-emerald-500 transition-all duration-300 rounded-full"
                                  style={{ width: `${progressPct}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PESTAÑA 2: DIPLOMAS (MÁSTER DORADO AUTOMÁTICO + 5 ESPECIALIDADES) */}
            {activeTab === 'diplomas' && (
              <div className="space-y-4">
                {/* TARJETA SUPERIOR: DIPLOMA MÁSTER DORADO (SE DESBLOQUEA AL CUMPLIR LAS 5 ESPECIALIDADES) */}
                <div
                  className={`rounded-3xl border-2 p-5 shadow-md text-center ${
                    isMasterUnlocked
                      ? 'bg-gradient-to-b from-amber-50 to-white border-amber-400'
                      : 'bg-white border-amber-300'
                  }`}
                >
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-black text-[11px] uppercase">
                    👑 Reconocimiento Mayor NatuSana
                  </div>
                  <h3 className="text-base font-black text-slate-900 mt-2">
                    Máster Experto en Suplementación y Bienestar Natural
                  </h3>
                  <p className="text-xs text-slate-600 mt-1">
                    Se desbloquea automáticamente al completar tus primeras 5 especialidades (sin examen adicional).
                  </p>

                  <div className="my-3">
                    <div className="flex items-center justify-between text-xs font-extrabold text-amber-900 mb-1">
                      <span>Especialidades completadas</span>
                      <span>{completedSpecialtiesCount} de 5</span>
                    </div>
                    <div className="w-full h-3 bg-amber-100 rounded-full overflow-hidden border border-amber-300">
                      <div
                        className="h-full bg-amber-500 transition-all duration-300"
                        style={{ width: `${(completedSpecialtiesCount / 5) * 100}%` }}
                      />
                    </div>
                  </div>

                  {isMasterUnlocked ? (
                    <button
                      onClick={() => downloadCertificatePNG(SPECIALTIES[0], true)}
                      className="w-full py-3 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow"
                    >
                      <Download className="w-4 h-4" /> Descargar Diploma Máster Dorado (.PNG)
                    </button>
                  ) : (
                    <div className="py-2.5 px-3 rounded-xl bg-slate-100 text-slate-500 font-bold text-xs flex items-center justify-center gap-1.5">
                      <Lock className="w-3.5 h-3.5" /> Completa las 5 especialidades para desbloquearlo
                    </div>
                  )}
                </div>

                {/* LISTA DE LOS 5 DIPLOMAS DE ESPECIALIDAD */}
                <h4 className="text-xs font-extrabold uppercase text-slate-500 px-1">
                  Diplomas por Especialidad (10 lecciones c/u)
                </h4>

                <div className="space-y-3">
                  {SPECIALTIES.map(spec => {
                    const done = lessonProgress[spec.id] || 0;
                    const unlocked = done >= LESSONS_PER_SPECIALTY;
                    return (
                      <div
                        key={spec.id}
                        className={`bg-white rounded-2xl border-2 p-4 shadow-sm ${
                          unlocked ? 'border-emerald-500' : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-black text-emerald-800 flex items-center gap-1.5">
                            <span>{spec.icon}</span> {spec.title}
                          </span>
                          <span className="text-[11px] font-extrabold text-slate-500">
                            {done}/{LESSONS_PER_SPECIALTY} lecciones
                          </span>
                        </div>
                        <p className="text-xs font-bold text-slate-700 mb-3">
                          Título: {spec.certificateTitle}
                        </p>

                        {unlocked ? (
                          <button
                            onClick={() => downloadCertificatePNG(spec, false)}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs uppercase flex items-center justify-center gap-2 shadow-sm"
                          >
                            <Download className="w-4 h-4" /> Descargar Diploma en PNG
                          </button>
                        ) : (
                          <button
                            onClick={() => startSpecialtyLesson(spec.id)}
                            className="w-full py-2.5 px-4 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold text-xs flex items-center justify-center gap-1.5"
                          >
                            🔒 Faltan {LESSONS_PER_SPECIALTY - done} lecciones • Ir a jugar &gt;
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* PESTAÑA 3: RETOS (NUEVAS ACTIVIDADES POR PUNTOS EXTRA - PRÓXIMAMENTE) */}
            {activeTab === 'retos' && (
              <div className="space-y-3.5">
                <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-2xl p-4 text-white shadow-md">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                    Gimnasio Mental NatuSana
                  </span>
                  <h2 className="text-lg font-black mt-1">Actividades por Puntos Extra</h2>
                  <p className="text-xs text-emerald-100 mt-0.5">
                    Nuevas dinámicas interactivas que iremos desbloqueando para que sumes más puntos XP en el Ranking.
                  </p>
                </div>

                <div className="space-y-2.5">
                  {BONUS_ACTIVITIES.map(act => (
                    <div
                      key={act.id}
                      className="bg-white rounded-2xl border-2 border-slate-200 p-3.5 flex items-start gap-3.5 opacity-95"
                    >
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl shrink-0">
                        {act.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-800">
                            {act.xpBonus}
                          </span>
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                            <Lock className="w-3 h-3" /> {act.badge}
                          </span>
                        </div>
                        <h3 className="font-extrabold text-slate-800 text-sm mt-1">
                          {act.title}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                          {act.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PESTAÑA 4: RANKING EN VIVO */}
            {activeTab === 'ranking' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                      Comunidad NatuSana
                    </span>
                    <span className="text-xs font-extrabold">
                      {storeName ? `Tienda: ${storeName}` : 'Perfil: Consumidor'}
                    </span>
                  </div>
                  <h2 className="text-lg font-black mt-1">Ranking Oficial en Vivo</h2>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Completa lecciones y actividades para escalar posiciones.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-extrabold uppercase text-slate-700">
                        Tabla de Posiciones
                      </h3>
                    </div>
                    <button
                      onClick={fetchCloudData}
                      className="text-xs text-emerald-600 font-bold flex items-center gap-1 hover:underline"
                    >
                      <RefreshCw className="w-3.5 h-3.5" /> Actualizar
                    </button>
                  </div>

                  <div className="space-y-2">
                    {leaderboard.map((u, idx) => {
                      const isConsumidor = !u.store_code || u.store_code === 'FREE' || u.store_code === 'CONSUMIDOR';
                      return (
                        <div
                          key={u.id || idx}
                          className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className={`w-6 h-6 rounded-full font-black flex items-center justify-center text-[11px] shrink-0 ${
                                idx === 0
                                  ? 'bg-amber-400 text-amber-950'
                                  : idx === 1
                                  ? 'bg-slate-300 text-slate-800'
                                  : idx === 2
                                  ? 'bg-amber-700 text-white'
                                  : 'bg-emerald-600 text-white'
                              }`}
                            >
                              {idx + 1}
                            </span>
                            <div className="truncate">
                              <p className="font-extrabold text-slate-800 truncate">{u.alias}</p>
                              <p className="text-[10px] text-slate-500 truncate">
                                {isConsumidor ? '🌱 Consumidor' : `🏪 Tienda: ${u.store_code}`}
                              </p>
                            </div>
                          </div>
                          <span className="font-black text-amber-600 text-sm shrink-0 ml-2">
                            {u.xp_total} XP
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ===================================================================== */}
        {/* PANTALLA P3: PREGUNTA ACTIVA (SIN BOTÓN BARAJAR + TIP NATUSANA)       */}
        {/* ===================================================================== */}
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
                    style={{ width: `${((qIndex + 1) / lessonQuestions.length) * 100}%` }}
                  />
                </div>
                <div className="flex items-center gap-1 text-red-500 font-extrabold text-sm">
                  <Heart className="w-4 h-4 fill-red-500" /> {lives}
                </div>
              </div>

              {/* Encabezado limpio SIN el botón de Barajar opciones */}
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800">
                  Lección {currentLessonNum}/{LESSONS_PER_SPECIALTY} • Pregunta {qIndex + 1} de {lessonQuestions.length}
                </span>
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

            {/* LÁMINA INFERIOR DE FEEDBACK CON "💡 Tip NatuSana" */}
            {feedbackState && (
              <div
                className={`absolute inset-x-0 bottom-0 p-5 rounded-t-3xl border-t-4 shadow-2xl z-30 ${
                  feedbackState === 'correct'
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-red-50 border-red-500'
                }`}
              >
                <h4 className="font-extrabold text-base text-slate-900 mb-1">
                  {feedbackState === 'correct' ? '✅ ¡Excelente respuesta!' : '❌ Respuesta incorrecta'}
                </h4>
                <p className="text-xs text-slate-700 mb-3">
                  {feedbackState === 'correct' ? currentQ.feedback_correct : currentQ.feedback_error}
                </p>
                <div className="p-2.5 rounded-xl bg-white/90 border border-slate-200/80 mb-3">
                  <p className="text-[10px] font-extrabold uppercase text-emerald-700">
                    💡 Tip NatuSana
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

        {/* ===================================================================== */}
        {/* PANTALLA P5: RESUMEN DE LECCIÓN (AVANCE DE 1 A 10 LECCIONES)          */}
        {/* ===================================================================== */}
        {screen === 'P5' && (
          <div className="p-6 flex flex-col justify-between text-center">
            <div>
              <div className="text-4xl mb-2">🌟🌟🌟</div>
              <h2 className="text-2xl font-black text-slate-800">
                ¡Lección {currentLessonNum} de {LESSONS_PER_SPECIALTY} Completada!
              </h2>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                Acertaste {correctCountInLesson} de {lessonQuestions.length} preguntas en esta sesión.
              </p>

              <div className="my-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
                <p className="text-xs font-extrabold text-emerald-900 mb-1">
                  Avance hacia el Diploma de la Especialidad:
                </p>
                <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-emerald-300 my-2">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-300"
                    style={{
                      width: `${Math.min(100, ((lessonProgress[currentSpecId] || 0) / LESSONS_PER_SPECIALTY) * 100)}%`
                    }}
                  />
                </div>
                <p className="text-xs font-black text-emerald-700">
                  {lessonProgress[currentSpecId] || 0} de {LESSONS_PER_SPECIALTY} lecciones aprobadas
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 my-4">
                <div className="bg-white p-3 rounded-2xl border-2 border-emerald-200">
                  <p className="text-xs font-bold text-slate-400 uppercase">XP Total</p>
                  <p className="text-2xl font-black text-emerald-600">{xp} XP</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border-2 border-amber-200">
                  <p className="text-xs font-bold text-slate-400 uppercase">Jugador</p>
                  <p className="text-base font-black text-amber-600 truncate">{userName}</p>
                </div>
              </div>
            </div>

            {isGuest ? (
              <div className="space-y-2.5">
                <button
                  onClick={() => { setAuthView('register'); setScreen('P1'); }}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] text-white font-extrabold text-sm uppercase"
                >
                  Crear mi cuenta y guardar mis {xp} XP
                </button>
                <button
                  onClick={() => { setScreen('P2'); setActiveTab('ruta'); }}
                  className="w-full py-3 px-6 rounded-xl bg-white border border-slate-300 text-slate-700 font-bold text-xs uppercase"
                >
                  Volver a la Ruta
                </button>
              </div>
            ) : (
              <div className="space-y-2.5">
                {(lessonProgress[currentSpecId] || 0) >= LESSONS_PER_SPECIALTY && (
                  <button
                    onClick={() => { setScreen('P2'); setActiveTab('diplomas'); }}
                    className="w-full py-3.5 px-6 rounded-2xl bg-amber-500 border-b-4 border-amber-700 text-white font-extrabold text-sm uppercase flex items-center justify-center gap-2"
                  >
                    <Award className="w-4 h-4" /> ¡Ir a descargar mi Diploma!
                  </button>
                )}
                <button
                  onClick={() => { setScreen('P2'); setActiveTab('ruta'); }}
                  className="w-full py-3.5 px-6 rounded-2xl bg-emerald-600 border-b-4 border-emerald-800 text-white font-extrabold text-sm uppercase"
                >
                  Continuar en la Ruta
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ======================================================================= */}
      {/* BANNER PUBLICITARIO INFERIOR FIJO (EL SCROLL PASA POR DETRÁS DEL BANNER)*/}
      {/* ======================================================================= */}
      <div className="fixed bottom-0 inset-x-0 z-50 flex justify-center pointer-events-none px-2 pb-1.5">
        <a
          href={BANNER_CONFIG.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="pointer-events-auto w-full max-w-md h-14 sm:h-16 rounded-2xl overflow-hidden shadow-2xl border-2 border-emerald-500/90 bg-slate-900 relative flex items-center justify-between px-3.5 group"
        >
          <img
            src={BANNER_CONFIG.imageUrl}
            alt={BANNER_CONFIG.altText}
            className="absolute inset-0 w-full h-full object-cover opacity-55 group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/65 to-emerald-950/80" />

          <div className="relative z-10 flex flex-col justify-center min-w-0 pr-2">
            <span className="text-[9px] font-black uppercase tracking-wider text-emerald-300">
              {BANNER_CONFIG.badgeText}
            </span>
            <p className="text-xs sm:text-sm font-extrabold text-white truncate">
              {BANNER_CONFIG.altText}
            </p>
          </div>

          <span className="relative z-10 shrink-0 px-3 py-1.5 rounded-xl bg-emerald-500 group-hover:bg-emerald-400 text-slate-950 font-black text-[11px] flex items-center gap-1 shadow-md transition">
            {BANNER_CONFIG.ctaText} <ExternalLink className="w-3 h-3" />
          </span>
        </a>
      </div>
    </div>
  );
}
