import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart, Flame, Coins, Award, ShoppingBag, RefreshCw, Sparkles,
  ArrowRight, Gift, Trophy, Cloud, Download, Eye, EyeOff, LogOut,
  UserPlus, LogIn, Sprout, ArrowLeft
} from 'lucide-react';

const SUPABASE_URL = 'https://yxpcctelsoqtsvtcczbc.supabase.co';
const SUPABASE_KEY = 'sb_publishable_edcInk7TUTAxp9VjxvU0rg_e4_pCemG';
const STORAGE_KEY = 'natusana_active_session_v1';

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
  // 'P1' = Onboarding, 'P2' = Home/Ruta, 'P3' = Pregunta, 'P5' = Resumen
  const [screen, setScreen] = useState('P1');
  // Subvistas de P1: 'welcome' | 'register' | 'login'
  const [authView, setAuthView] = useState('welcome');
  const [activeTab, setActiveTab] = useState('ruta');

  // Estado de sesión de usuario
  const [userId, setUserId] = useState(null);
  const [isGuest, setIsGuest] = useState(true);
  const [userName, setUserName] = useState('Visitante');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState('consumidor');
  const [storeCode, setStoreCode] = useState('');
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(1);
  const [lives, setLives] = useState(5);

  // Campos de formularios de Registro / Login
  const [formAlias, setFormAlias] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formRole, setFormRole] = useState('consumidor');
  const [formStoreCode, setFormStoreCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [completedSpecs, setCompletedSpecs] = useState({
    citratos: false,
    adaptogenos: false,
    superalimentos: false,
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
  const [selectedCertSpec, setSelectedCertSpec] = useState('citratos');

  // 1. Verificar si hay sesión activa guardada al abrir la app
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
          setStoreCode(parsed.store_code || '');
          setXp(typeof parsed.xp_total === 'number' ? parsed.xp_total : 0);
          setStreak(parsed.streak_days || 1);
          setLives(parsed.lives || 5);
          // Usuario con sesión activa -> Entra directamente al Home (P2)
          setScreen('P2');
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

  // Opción 2: Explorar sin registrarme (Visitante entra directo al Home sin obstáculos)
  const handleExploreAsGuest = () => {
    setIsGuest(true);
    setUserId(null);
    setUserName('Visitante');
    setUserRole('consumidor');
    setStoreCode('');
    setScreen('P2');
    setActiveTab('ruta');
  };

  // Opción 1: Crear mi cuenta (Alias + Correo + Contraseña + Rol)
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

    const cleanAlias = formAlias.trim();
    const cleanEmail = formEmail.trim().toLowerCase();
    const cleanPass = formPassword.trim();
    const cleanStore = formRole === 'tendero' ? (formStoreCode.trim().toUpperCase() || 'TIENDA-ALIADA') : 'FREE';

    if (!cleanAlias || !cleanEmail || !cleanPass) {
      setAuthError('Por favor completa tu alias, correo y contraseña.');
      return;
    }
    if (cleanPass.length < 4) {
      setAuthError('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setAuthLoading(true);
    try {
      // Verificar si el correo ya existe
      const existingEmail = await supabaseRequest(`users?email=eq.${encodeURIComponent(cleanEmail)}&select=*`);
      if (existingEmail && existingEmail.length > 0) {
        setAuthError('Este correo ya está registrado. Usa "¿Ya tienes cuenta? Inicia sesión".');
        setAuthLoading(false);
        return;
      }

      // Conservar XP si el visitante ya había ganado puntos jugando antes de registrarse
      const initialXp = xp > 0 ? xp : 50;

      const inserted = await supabaseRequest('users', {
        method: 'POST',
        headers: { 'Prefer': 'return=representation' },
        body: JSON.stringify({
          alias: cleanAlias,
          email: cleanEmail,
          password: cleanPass,
          role: formRole,
          store_code: cleanStore,
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
        store_code: cleanStore,
        xp_total: initialXp,
        streak_days: 1,
        lives: 5
      };

      setUserId(createdUser.id);
      setIsGuest(false);
      setUserName(createdUser.alias);
      setUserEmail(createdUser.email);
      setUserRole(createdUser.role);
      setStoreCode(createdUser.store_code);
      setXp(createdUser.xp_total);
      setStreak(createdUser.streak_days || 1);
      setLives(createdUser.lives || 5);

      saveLocalSession({
        id: createdUser.id,
        isGuest: false,
        alias: createdUser.alias,
        email: createdUser.email,
        role: createdUser.role,
        store_code: createdUser.store_code,
        xp_total: createdUser.xp_total,
        streak_days: createdUser.streak_days || 1,
        lives: createdUser.lives || 5
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

  // Opción 3: Iniciar sesión (Correo + Contraseña)
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');

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
        setAuthError('Contraseña incorrecta. Verifica e intenta nuevamente.');
        setAuthLoading(false);
        return;
      }

      setUserId(userRecord.id);
      setIsGuest(false);
      setUserName(userRecord.alias);
      setUserEmail(userRecord.email);
      setUserRole(userRecord.role || 'consumidor');
      setStoreCode(userRecord.store_code || 'FREE');
      setXp(userRecord.xp_total || 0);
      setStreak(userRecord.streak_days || 1);
      setLives(userRecord.lives || 5);

      saveLocalSession({
        id: userRecord.id,
        isGuest: false,
        alias: userRecord.alias,
        email: userRecord.email,
        role: userRecord.role || 'consumidor',
        store_code: userRecord.store_code || 'FREE',
        xp_total: userRecord.xp_total || 0,
        streak_days: userRecord.streak_days || 1,
        lives: userRecord.lives || 5
      });

      // Cargar especialidades certificadas del usuario
      if (userRecord.id) {
        const prog = await supabaseRequest(`user_progress?user_id=eq.${userRecord.id}&select=*`);
        if (prog && prog.length > 0) {
          const mapSpecs = { citratos: false, adaptogenos: false, superalimentos: false, digestivo: false, articular: false };
          prog.forEach(p => {
            if (p.certified) mapSpecs[p.specialty_id] = true;
          });
          setCompletedSpecs(mapSpecs);
        }
      }

      setScreen('P2');
      setActiveTab('ruta');
    } catch (err) {
      setAuthError(`Error al iniciar sesión: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  // Cerrar sesión -> Regresa a la pantalla de Bienvenida (P1) con sesión cerrada
  const handleLogout = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {}
    setUserId(null);
    setIsGuest(true);
    setUserName('Visitante');
    setUserEmail('');
    setFormEmail('');
    setFormPassword('');
    setAuthError('');
    setAuthView('welcome');
    setScreen('P1');
  };

  const syncUserToSupabase = async (newXp = xp, specCompleted = null) => {
    if (isGuest) {
      setSyncMessage('💡 Estás en modo visitante. Crea tu cuenta para guardar tu progreso en la nube.');
      setTimeout(() => setSyncMessage(''), 5000);
      return;
    }

    setIsSaving(true);
    setSyncMessage('Sincronizando con Supabase...');
    try {
      let currentUserId = userId;

      if (currentUserId) {
        await supabaseRequest(`users?id=eq.${currentUserId}`, {
          method: 'PATCH',
          body: JSON.stringify({
            xp_total: newXp,
            streak_days: streak,
            lives: lives
          })
        });
      }

      if (currentUserId && specCompleted) {
        const prog = await supabaseRequest(`user_progress?user_id=eq.${currentUserId}&specialty_id=eq.${specCompleted}&select=*`);
        if (!prog || prog.length === 0) {
          await supabaseRequest('user_progress', {
            method: 'POST',
            body: JSON.stringify({
              user_id: currentUserId,
              specialty_id: specCompleted,
              completed_modules: 4,
              certified: true,
              certification_date: new Date().toISOString()
            })
          });
        }
      }

      saveLocalSession({
        id: currentUserId,
        isGuest: false,
        alias: userName,
        email: userEmail,
        role: userRole,
        store_code: storeCode,
        xp_total: newXp,
        streak_days: streak,
        lives: lives
      });

      const updatedUsers = await supabaseRequest('users?select=*&order=xp_total.desc&limit=15');
      if (updatedUsers) setLeaderboard(updatedUsers);

      setSyncMessage(`✅ Progreso guardado en tu cuenta (${newXp} XP)`);
      setTimeout(() => setSyncMessage(''), 4000);
    } catch (e) {
      setSyncMessage(`⚠️ Error al sincronizar: ${e.message}`);
    } finally {
      setIsSaving(false);
    }
  };

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
    setFeedbackState(null);
    setScreen('P3');
  };

  const handleVerifyAnswer = () => {
    if (!selectedOption) return;
    const isRight = selectedOption === currentQ.correct_answer;
    if (isRight) {
      setFeedbackState('correct');
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
    ctx.fillText(userName || 'Estudiante NatuSana', 600, 330);

    ctx.fillStyle = '#059669';
    ctx.font = 'bold 26px sans-serif';
    ctx.fillText(`Local Afiliado: ${storeCode || 'CONSUMIDOR'}  |  Puntaje: ${xp} XP`, 600, 395);

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
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-start py-3 px-2 font-sans select-none">
      {/* Barra superior informativa de estado */}
      <div className="w-full max-w-md mb-2 px-3.5 py-2 rounded-2xl bg-slate-800/95 border border-slate-700 flex items-center justify-between text-xs text-slate-300">
        <div className="flex items-center gap-2">
          <span className={`w-2.5 h-2.5 rounded-full ${dbStatus === 'online' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
          <span className="font-bold text-white">NatuSana</span>
          <span className="text-[11px] text-emerald-300 font-semibold">
            {isGuest ? '• Modo Visitante' : `• ${userName}`}
          </span>
        </div>

        {screen !== 'P1' && (
          isGuest ? (
            <button
              onClick={() => { setAuthView('register'); setScreen('P1'); }}
              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-[11px] font-bold text-white transition flex items-center gap-1"
            >
              <UserPlus className="w-3 h-3" /> Crear cuenta
            </button>
          ) : (
            <button
              onClick={handleLogout}
              className="px-2.5 py-1 rounded-lg bg-slate-700 hover:bg-slate-600 text-[11px] font-bold text-slate-200 transition flex items-center gap-1"
            >
              <LogOut className="w-3 h-3" /> Salir
            </button>
          )
        )}
      </div>

      {/* Contenedor Principal Móvil */}
      <div className="w-full max-w-md bg-[#F9FAFB] rounded-[32px] shadow-2xl border-4 border-slate-800 overflow-hidden flex flex-col">

        {/* ===================================================================== */}
        {/* PANTALLA P1: ONBOARDING DE 3 VISTAS (BIENVENIDA / REGISTRO / LOGIN)    */}
        {/* ===================================================================== */}
        {screen === 'P1' && (
          <div className="p-6 sm:p-8 min-h-[540px] flex flex-col justify-center bg-[#F4F6F4]">
            {authView === 'welcome' && (
              <div className="flex flex-col items-center text-center my-auto">
                {/* Logo NatuSana */}
                <div className="flex flex-col items-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mb-2 shadow-sm">
                    <Sprout className="w-9 h-9 text-[#1E9E49] stroke-[2.2]" />
                  </div>
                  <span className="text-3xl font-extrabold text-[#1C1E21] tracking-tight">
                    NatuSana
                  </span>
                </div>

                {/* Título y Subtítulo de tu Imagen 1 */}
                <h1 className="text-2xl sm:text-[28px] font-extrabold text-[#1C1E21] leading-tight mb-3">
                  ¡Bienvenido a NatuSana!
                </h1>
                <p className="text-sm sm:text-base text-[#606770] max-w-xs leading-relaxed mb-8">
                  Aprende sobre salud natural con lecciones cortas y trivias divertidas.
                </p>

                {/* Botón Primario: Crear mi cuenta */}
                <button
                  onClick={() => { setAuthError(''); setAuthView('register'); }}
                  className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] active:translate-y-0.5 text-white font-bold text-base shadow-sm transition mb-3.5"
                >
                  Crear mi cuenta
                </button>

                {/* Botón Secundario: Explorar sin registrarme */}
                <button
                  onClick={handleExploreAsGuest}
                  className="w-full py-3.5 px-6 rounded-xl bg-white hover:bg-emerald-50/50 text-[#1C1E21] font-bold text-base border border-[#259D4A] transition mb-6"
                >
                  Explorar sin registrarme
                </button>

                {/* Enlace Inferior: ¿Ya tienes cuenta? Inicia sesión */}
                <p className="text-sm text-[#606770]">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => { setAuthError(''); setAuthView('login'); }}
                    className="font-bold text-[#1C1E21] hover:text-[#259D4A] underline-offset-2 hover:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}

            {/* VISTA B: FORMULARIO CREAR MI CUENTA (OPCIÓN CLÁSICA + ALIAS) */}
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
                  Guarda tu racha, descarga tus certificados y acumula puntos XP.
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

                  {/* Selector de Perfil: Consumidor vs Asesor de Tienda */}
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
                      <label className="block text-[11px] font-extrabold text-emerald-900 uppercase mb-1">
                        Código de Tienda Aliada / Equipo Qali Kay
                      </label>
                      <input
                        type="text"
                        placeholder="Ej. QALI-LIMA-04"
                        value={formStoreCode}
                        onChange={e => setFormStoreCode(e.target.value.toUpperCase())}
                        className="w-full px-3 py-2 rounded-lg border border-emerald-300 bg-white text-xs font-mono font-bold text-emerald-900 uppercase"
                      />
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="w-full py-3.5 px-6 rounded-xl bg-[#259D4A] hover:bg-[#1f873f] text-white font-bold text-sm shadow-sm transition mt-2"
                  >
                    {authLoading ? 'Creando cuenta...' : 'Registrarme y entrar al Home'}
                  </button>
                </form>

                <p className="text-xs text-center text-slate-600 mt-4">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => { setAuthError(''); setAuthView('login'); }}
                    className="font-bold text-slate-900 hover:text-[#259D4A] underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>
            )}

            {/* VISTA C: FORMULARIO INICIAR SESIÓN */}
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
                  Ingresa con tu correo y contraseña para recuperar tu progreso.
                </p>

                {authError && (
                  <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-bold text-red-700">
                    {authError}
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
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Contraseña
                    </label>
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
                    onClick={() => { setAuthError(''); setAuthView('register'); }}
                    className="font-bold text-slate-900 hover:text-[#259D4A] underline"
                  >
                    Crear mi cuenta
                  </button>
                </p>
              </div>
            )}
          </div>
        )}

        {/* Barra de Estadísticas y Navegación en el Home (P2 y P5) */}
        {screen !== 'P1' && screen !== 'P3' && (
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
                className={`py-2 px-1 rounded-xl flex flex-col items-center gap-0.5 transition ${
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

        {/* ===================================================================== */}
        {/* PANTALLA P2: HOME (RUTA, DIPLOMAS, PREMIOS B2B, VITRINA)              */}
        {/* ===================================================================== */}
        {screen === 'P2' && (
          <div className="p-4">
            {isGuest && (
              <div className="mb-3 p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-2">
                <p className="text-xs text-amber-900 font-semibold">
                  👋 Estás explorando sin registro. Crea tu cuenta gratis para no perder tus puntos XP.
                </p>
                <button
                  onClick={() => { setAuthView('register'); setScreen('P1'); }}
                  className="px-3 py-1.5 rounded-xl bg-[#259D4A] text-white font-extrabold text-xs shrink-0"
                >
                  Crear cuenta
                </button>
              </div>
            )}

            {activeTab === 'ruta' && (
              <div>
                <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-4 text-white mb-4 shadow-md flex items-center justify-between">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-white/20 px-2 py-0.5 rounded-md">
                      {isGuest ? 'MODO EXPLORACIÓN' : `LOCAL: ${storeCode || 'CONSUMIDOR'}`}
                    </span>
                    <h2 className="text-lg font-extrabold mt-1">¡Hola, {userName}!</h2>
                    <p className="text-xs text-emerald-100">
                      Selecciona una especialidad para comenzar tu trivia.
                    </p>
                  </div>
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

            {activeTab === 'premios' && (
              <div className="space-y-4">
                <div className="bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl p-4 text-white shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full">
                      Programa B2B Qali Kay
                    </span>
                    <span className="text-xs font-extrabold">Tienda: {storeCode || 'CONSUMIDOR'}</span>
                  </div>
                  <h2 className="text-lg font-black mt-1">Premios B2B y Ranking en Vivo</h2>
                  <p className="text-xs text-amber-100 mt-0.5">
                    Tus puntos XP desbloquean beneficios para ti y tu tienda aliada.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border-2 border-slate-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4 text-amber-500" />
                      <h3 className="text-xs font-extrabold uppercase text-slate-700">
                        Ranking Oficial en Vivo
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
                              Local: {u.store_code || 'FREE'}
                            </p>
                          </div>
                        </div>
                        <span className="font-black text-amber-600 text-sm">{u.xp_total} XP</span>
                      </div>
                    ))}
                  </div>
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
                        <span>🌿 Certificación Oficial NatuSana</span>
                      </div>
                      <p className="text-[11px] text-slate-400 uppercase font-bold mt-3">Otorgado a:</p>
                      <h4 className="text-2xl font-black text-slate-800">{userName}</h4>
                      <div className="my-3 p-3 rounded-2xl bg-emerald-50 border border-emerald-200">
                        <p className="text-sm font-black text-slate-800">
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

        {/* ===================================================================== */}
        {/* PANTALLA P3: PREGUNTA ACTIVA                                          */}
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
                    <RefreshCw className="w-3 h-3" /> Barajar opciones
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
                    💡 Tip Comercial Qali Kay
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
        {/* PANTALLA P5: RESUMEN DE MÓDULO                                        */}
        {/* ===================================================================== */}
        {screen === 'P5' && (
          <div className="p-6 flex flex-col justify-between text-center">
            <div>
              <div className="text-4xl mb-2">🌟🌟🌟</div>
              <h2 className="text-2xl font-black text-slate-800">¡Lección Completada!</h2>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                {isGuest
                  ? 'Crea tu cuenta gratis para guardar estos puntos XP en la nube.'
                  : 'Tus puntos XP ya fueron sincronizados en tu cuenta.'}
              </p>
              <div className="grid grid-cols-2 gap-3 my-5">
                <div className="bg-white p-3 rounded-2xl border-2 border-emerald-200">
                  <p className="text-xs font-bold text-slate-400 uppercase">XP Acumulado</p>
                  <p className="text-2xl font-black text-emerald-600">{xp} XP</p>
                </div>
                <div className="bg-white p-3 rounded-2xl border-2 border-amber-200">
                  <p className="text-xs font-bold text-slate-400 uppercase">Perfil</p>
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
                  Seguir explorando sin registro
                </button>
              </div>
            ) : (
              <button
                onClick={() => { setScreen('P2'); setActiveTab('ruta'); }}
                className="w-full py-4 px-6 rounded-2xl bg-emerald-600 border-b-4 border-emerald-800 text-white font-extrabold text-sm uppercase"
              >
                Volver al Home
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
