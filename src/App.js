import React, { useState, useEffect, useCallback } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";
import {
  CalendarDays,
  Settings,
  Menu,
  X,
  Headset,
  Users,
  Truck,
  LayoutDashboard,
  Warehouse,
  Plus,
  Edit,
  Trash2,
  FileCode,
  Mail,
  MailCheck,
  Phone,
  Package,
  PackagePlus,
  FileText,
  FilePlus,
  CircleDollarSign,
  Archive,
  Clock,
  Paperclip,
  Car,
  Palette,
  CalendarX2,
  Download,
  TestTube2,
  ChevronDown,
  ChevronUp,
  ClipboardList,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LabelList,
} from "recharts";

// =========================================================================================
//  PASSO 1: CONFIGURAÇÃO DO FIREBASE
//  Cole aqui as credenciais do seu projeto Firebase que você copiou no painel do Firebase.
// =========================================================================================
const firebaseConfig = {
  apiKey: "AIzaSyA9ocgyxqnbl9nKQ1dM0mbqwlEupvyh2SY",
  authDomain: "giro-app-logistica.firebaseapp.com",
  projectId: "giro-app-logistica",
  storageBucket: "giro-app-logistica.firebasestorage.app",
  messagingSenderId: "407043187432",
  appId: "1:407043187432:web:3f26a52687bb15893a5f5d",
};
// =========================================================================================

const appId = "default-app-id"; 

// --- Main App Component ---
function App() {
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [currentPage, setCurrentPage] = useState("scheduling");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isSchedulingMenuOpen, setIsSchedulingMenuOpen] = useState(true);
  const [isActivitiesMenuOpen, setIsActivitiesMenuOpen] = useState(false);
  const [isSettingsMenuOpen, setIsSettingsMenuOpen] = useState(false);
  const [closeTimeoutId, setCloseTimeoutId] = useState(null);
  const [sidebarBg, setSidebarBg] = useState("rgba(19, 43, 64, 0.95)");

  // Estado para o modal personalizado
  const [showModal, setShowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);
  const [modalType, setModalType] = useState("");
  const [modalOnConfirm, setModalOnConfirm] = useState(null);

  // Função para exibir o modal personalizado
  const showCustomModal = (title, content, type, onConfirm = null) => {
    setModalTitle(title);
    setModalContent(content);
    setModalType(type);
    setModalOnConfirm(() => onConfirm);
    setShowModal(true);
  };

  // Função para fechar o modal personalizado
  const closeCustomModal = () => {
    setShowModal(false);
  };

  const hexToRgba = (hex, alpha = 1) => {
    if (!/^#([A-Fa-f0-9]{3}){1,2}$/.test(hex)) {
      return `rgba(19, 43, 64, ${alpha})`; // Retorna cor padrão se o hex for inválido
    }
    let c = hex.substring(1).split("");
    if (c.length === 3) {
      c = [c[0], c[0], c[1], c[1], c[2], c[2]];
    }
    c = "0x" + c.join("");
    return `rgba(${[(c >> 16) & 255, (c >> 8) & 255, c & 255].join(
      ","
    )},${alpha})`;
  };

  // Define o tema padrão ao carregar
  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", "#FF7F32");
    document.documentElement.style.setProperty("--secondary-color", "#132B40");
  }, []);

  // Inicializa o Firebase e autenticação
  useEffect(() => {
    let unsubscribeAuth = () => {};
    const initializeFirebase = async () => {
      if (
        !firebaseConfig.projectId ||
        firebaseConfig.apiKey === "COLE_SUA_API_KEY_AQUI"
      ) {
        console.error(
          "Configuração do Firebase ausente. Atualize o objeto firebaseConfig em App.js."
        );
        setIsAuthReady(true);
        return;
      }

      try {
        const app = initializeApp(firebaseConfig);
        const firestoreDb = getFirestore(app);
        const firebaseAuth = getAuth(app);
        setDb(firestoreDb);
        setAuth(firebaseAuth);

        await signInAnonymously(firebaseAuth);

        unsubscribeAuth = onAuthStateChanged(firebaseAuth, (user) => {
          setIsAuthReady(true);
        });
      } catch (error) {
        console.error("Falha ao inicializar o Firebase:", error);
        setIsAuthReady(true);
      }
    };
    initializeFirebase();
    return () => unsubscribeAuth();
  }, []);

  // Busca e aplica o tema de cores após a autenticação
  useEffect(() => {
    if (!db) return;
    const settingsDocRef = doc(
      db,
      `artifacts/${appId}/public/data/adminSettings/config`
    );
    const unsubscribeTheme = onSnapshot(settingsDocRef, (docSnap) => {
      const primary =
        docSnap.exists() && docSnap.data().primaryColor
          ? docSnap.data().primaryColor
          : "#FF7F32";
      const secondary =
        docSnap.exists() && docSnap.data().secondaryColor
          ? docSnap.data().secondaryColor
          : "#132B40";

      document.documentElement.style.setProperty("--primary-color", primary);
      document.documentElement.style.setProperty(
        "--secondary-color",
        secondary
      );
      setSidebarBg(hexToRgba(secondary, 0.95));
    });

    return () => unsubscribeTheme();
  }, [db]);

  // Handlers da barra lateral
  const handleMouseEnterSidebar = () => {
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    setIsSidebarOpen(true);
  };
  const handleMouseLeaveSidebar = () => {
    const id = setTimeout(() => setIsSidebarOpen(false), 200);
    setCloseTimeoutId(id);
  };
  const handleToggleClick = () => {
    if (closeTimeoutId) clearTimeout(closeTimeoutId);
    setIsSidebarOpen(!isSidebarOpen);
  };

  if (!isAuthReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#F2F2F2]">
        <p className="text-xl text-gray-800">Carregando sistema...</p>
      </div>
    );
  }

  const schedulingMenuItems = [
    { page: "scheduling", label: "Agendamento", icon: CalendarDays },
    { page: "clients", label: "Clientes", icon: Users },
    { page: "suppliers", label: "Fornecedores", icon: Truck },
    {
      page: "appointments-dashboard",
      label: "Dashboard",
      icon: LayoutDashboard,
    },
    { page: "scheduling-settings", label: "Config. Agenda", icon: Settings },
  ];

  const settingsMenuItems = [
    { page: "general-settings", label: "Config. Gerais", icon: Settings },
  ];

  const activitiesMenuItems = [
    { page: "activities", label: "G. Atividades", icon: ClipboardList },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-[#F2F2F2] font-sans text-gray-800">
      <style>
        {`
                    @keyframes marquee {
                        0%   { transform: translateX(100%); }
                        100% { transform: translateX(-100%); }
                    }
                    .marquee-container .marquee-text {
                        display: inline-block;
                        white-space: nowrap;
                    }
                     .group:hover .marquee-text {
                        animation: marquee 5s linear infinite;
                    }
                `}
      </style>
      {/* Cabeçalho */}
      <header className="fixed top-0 left-0 w-full bg-[var(--primary-color)] text-white p-4 shadow-md z-30 h-20">
        <div className="container mx-auto flex justify-between items-center h-full">
          <img
            src={`https://placehold.co/150x40/${getComputedStyle(
              document.documentElement
            )
              .getPropertyValue("--primary-color")
              .substring(1)}/FFFFFF?text=Giro+App`}
            alt="Logotipo do Giro App"
            className="h-10 w-auto"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://placehold.co/150x40/FF7F32/FFFFFF?text=Giro+App";
            }}
          />
        </div>
      </header>

      <div className="flex flex-1 pt-20">
        {/* Barra Lateral */}
        <aside
          style={{ backgroundColor: sidebarBg }}
          className={`fixed top-20 left-0 text-white shadow-lg transition-all duration-300 ease-in-out z-40 h-[calc(100vh-5rem)]
                    flex flex-col items-center p-4 ${
                      isSidebarOpen ? "w-64" : "w-20"
                    }`}
          onMouseEnter={handleMouseEnterSidebar}
          onMouseLeave={handleMouseLeaveSidebar}
        >
          <div className="flex flex-col h-full w-full">
            <div
              className={`flex items-center w-full mb-4 pb-4 border-b border-white/10 ${
                isSidebarOpen ? "justify-between" : "justify-center"
              }`}
            >
              {isSidebarOpen && <h2 className="text-xl font-bold">Menu</h2>}
              <button
                className="p-2 rounded-md hover:bg-[var(--primary-color)] hover:bg-opacity-80 transition-colors"
                onClick={handleToggleClick}
              >
                {isSidebarOpen ? (
                  <X className="w-6 h-6" />
                ) : (
                  <Menu className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              <nav
                className={`flex flex-col space-y-2 ${
                  isSidebarOpen ? "w-full" : ""
                }`}
              >
                <button
                  onClick={() => setIsSchedulingMenuOpen(!isSchedulingMenuOpen)}
                  className={`flex items-center h-10 px-3.5 rounded-md text-left transition-colors duration-200 hover:bg-[var(--primary-color)]/80 ${
                    isSidebarOpen ? "w-full" : "w-12 justify-center"
                  }`}
                >
                  <CalendarDays className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={`flex-1 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isSidebarOpen
                        ? "opacity-100 max-w-full ml-3"
                        : "opacity-0 max-w-0"
                    }`}
                  >
                    Agendamento
                  </span>
                  {isSidebarOpen &&
                    (isSchedulingMenuOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    (isSidebarOpen && isSchedulingMenuOpen) ||
                    (!isSidebarOpen && isSchedulingMenuOpen)
                      ? "max-h-96"
                      : "max-h-0"
                  }`}
                >
                  <div className="pl-4 pt-2 space-y-2">
                    {schedulingMenuItems.map(({ page, label, icon: Icon }) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                        }}
                        className={`group flex items-center h-10 px-3.5 rounded-md text-left transition-colors duration-200 ${
                          currentPage === page
                            ? "bg-[var(--primary-color)]"
                            : "hover:bg-[var(--primary-color)] hover:bg-opacity-80"
                        } ${isSidebarOpen ? "w-full" : "w-12 justify-center"}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div
                          className={`relative overflow-hidden transition-all duration-300 ${
                            isSidebarOpen
                              ? "opacity-100 max-w-full ml-3"
                              : "opacity-0 max-w-0"
                          }`}
                        >
                          <span
                            className={`${
                              !isSidebarOpen ? "marquee-text" : ""
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsActivitiesMenuOpen(!isActivitiesMenuOpen)}
                  className={`flex items-center h-10 px-3.5 rounded-md text-left transition-colors duration-200 hover:bg-[var(--primary-color)]/80 ${
                    isSidebarOpen ? "w-full" : "w-12 justify-center"
                  }`}
                >
                  <ClipboardList className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={`flex-1 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isSidebarOpen
                        ? "opacity-100 max-w-full ml-3"
                        : "opacity-0 max-w-0"
                    }`}
                  >
                    G. Atividades
                  </span>
                  {isSidebarOpen &&
                    (isActivitiesMenuOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    (isSidebarOpen && isActivitiesMenuOpen) ||
                    (!isSidebarOpen && isActivitiesMenuOpen)
                      ? "max-h-96"
                      : "max-h-0"
                  }`}
                >
                  <div className="pl-4 pt-2 space-y-2">
                    {activitiesMenuItems.map(({ page, label, icon: Icon }) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                        }}
                        className={`group flex items-center h-10 px-3.5 rounded-md text-left transition-colors duration-200 ${
                          currentPage === page
                            ? "bg-[var(--primary-color)]"
                            : "hover:bg-[var(--primary-color)] hover:bg-opacity-80"
                        } ${isSidebarOpen ? "w-full" : "w-12 justify-center"}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div
                          className={`relative overflow-hidden transition-all duration-300 ${
                            isSidebarOpen
                              ? "opacity-100 max-w-full ml-3"
                              : "opacity-0 max-w-0"
                          }`}
                        >
                          <span
                            className={`${
                              !isSidebarOpen ? "marquee-text" : ""
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsSettingsMenuOpen(!isSettingsMenuOpen)}
                  className={`flex items-center h-10 px-3.5 rounded-md text-left transition-colors duration-200 hover:bg-[var(--primary-color)]/80 ${
                    isSidebarOpen ? "w-full" : "w-12 justify-center"
                  }`}
                >
                  <Settings className="w-5 h-5 flex-shrink-0" />
                  <span
                    className={`flex-1 whitespace-nowrap overflow-hidden transition-all duration-300 ${
                      isSidebarOpen
                        ? "opacity-100 max-w-full ml-3"
                        : "opacity-0 max-w-0"
                    }`}
                  >
                    Configurações
                  </span>
                  {isSidebarOpen &&
                    (isSettingsMenuOpen ? (
                      <ChevronUp size={16} />
                    ) : (
                      <ChevronDown size={16} />
                    ))}
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out overflow-hidden ${
                    (isSidebarOpen && isSettingsMenuOpen) ||
                    (!isSidebarOpen && isSettingsMenuOpen)
                      ? "max-h-96"
                      : "max-h-0"
                  }`}
                >
                  <div className="pl-4 pt-2 space-y-2">
                    {settingsMenuItems.map(({ page, label, icon: Icon }) => (
                      <button
                        key={page}
                        onClick={() => {
                          setCurrentPage(page);
                        }}
                        className={`group flex items-center h-10 px-3.5 rounded-md text-left transition-colors duration-200 ${
                          currentPage === page
                            ? "bg-[var(--primary-color)]"
                            : "hover:bg-[var(--primary-color)] hover:bg-opacity-80"
                        } ${isSidebarOpen ? "w-full" : "w-12 justify-center"}`}
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <div
                          className={`relative overflow-hidden transition-all duration-300 ${
                            isSidebarOpen
                              ? "opacity-100 max-w-full ml-3"
                              : "opacity-0 max-w-0"
                          }`}
                        >
                          <span
                            className={`${
                              !isSidebarOpen ? "marquee-text" : ""
                            }`}
                          >
                            {label}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </nav>
            </div>
            <div className="pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  showCustomModal(
                    "Contato do Suporte",
                    "Email: w.freitasjr01@gmail.com\nTelefone: 35 99704-5689",
                    "info"
                  );
                  setIsSidebarOpen(false);
                }}
                className={`group flex items-center h-10 px-3.5 rounded-md text-left transition-colors duration-200 w-full hover:bg-[var(--primary-color)]/80 ${
                  isSidebarOpen ? "w-full" : "w-12 justify-center"
                }`}
              >
                <Headset className="w-5 h-5 flex-shrink-0" />
                <div
                  className={`relative overflow-hidden transition-all duration-300 ${
                    isSidebarOpen
                      ? "opacity-100 max-w-full ml-3"
                      : "opacity-0 max-w-0"
                  }`}
                >
                  <span className={`${!isSidebarOpen ? "marquee-text" : ""}`}>
                    Suporte
                  </span>
                </div>
              </button>
            </div>
          </div>
        </aside>

        {/* Conteúdo Principal */}
        <div
          className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ml-20`}
        >
          {isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black bg-opacity-50 z-35 md:hidden"
              onClick={() => setIsSidebarOpen(false)}
            ></div>
          )}
          <main className="flex-1 container mx-auto p-6">
            {currentPage === "scheduling" && db && (
              <SchedulingPage
                db={db}
                appId={appId}
                showCustomModal={showCustomModal}
              />
            )}
            {currentPage === "clients" && db && (
              <ClientsPage
                db={db}
                appId={appId}
                showCustomModal={showCustomModal}
              />
            )}
            {currentPage === "suppliers" && db && (
              <SuppliersPage
                db={db}
                appId={appId}
                showCustomModal={showCustomModal}
              />
            )}
            {currentPage === "appointments-dashboard" && db && (
              <AppointmentsDashboardPage
                db={db}
                appId={appId}
                showCustomModal={showCustomModal}
              />
            )}
            {currentPage === "scheduling-settings" && db && (
              <SchedulingSettingsPage
                db={db}
                appId={appId}
                showCustomModal={showCustomModal}
              />
            )}
            {currentPage === "general-settings" && db && auth && (
              <GeneralSettingsPage
                db={db}
                auth={auth}
                appId={appId}
                showCustomModal={showCustomModal}
              />
            )}
            {currentPage === "activities" && <ActivitiesPage />}
          </main>
          <footer className="bg-transparent text-[#404E59] p-4 text-center text-sm mt-auto border-t border-[#BDBEBF]">
            <p>
              &copy; {new Date().getFullYear()} Giro App. Desenvolvido por WILL.
            </p>
            <p>Data e Hora Atual: {new Date().toLocaleString("pt-BR")}</p>
          </footer>
        </div>
      </div>

      {/* Modal Personalizado */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg shadow-xl max-w-sm w-full">
            <h3
              className={`text-xl font-bold mb-4 ${
                modalType === "error"
                  ? "text-[#FF3A33]"
                  : modalType === "success"
                  ? "text-[#03A678]"
                  : "text-gray-800"
              }`}
            >
              {modalTitle}
            </h3>
            <div className="text-[#404E59] mb-6">
              {typeof modalContent === "string" ? (
                <p className="whitespace-pre-wrap">{modalContent}</p>
              ) : (
                modalContent
              )}
            </div>
            <div className="flex justify-end space-x-4">
              {modalType === "confirm" && (
                <button
                  onClick={() => {
                    if (modalOnConfirm) modalOnConfirm(false);
                    closeCustomModal();
                  }}
                  className="px-4 py-2 bg-[#BDBEBF] text-[#132B40] rounded-md hover:bg-[#84878C] transition-colors"
                >
                  Cancelar
                </button>
              )}
              <button
                onClick={() => {
                  if (modalOnConfirm) modalOnConfirm(true);
                  closeCustomModal();
                }}
                className={`px-4 py-2 rounded-md text-white transition-colors ${
                  modalType === "error"
                    ? "bg-[#FF3A33]"
                    : modalType === "success"
                    ? "bg-[#03A678]"
                    : "bg-[var(--primary-color)]"
                } hover:bg-opacity-90`}
              >
                {modalType === "confirm" ? "Confirmar" : "OK"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Componente Calendário ---
function CustomCalendar({
  selectedDate,
  onDateSelect,
  unavailableDates = [],
  unavailableWeekdays = [],
}) {
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth());
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear());
  const months = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];
  const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  const getDaysInMonth = (year, month) => {
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return [
      ...Array(firstDayIndex).fill(null),
      ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
    ];
  };

  const handleDateClick = (day) => {
    if (!day) return;
    const clickedDate = new Date(currentYear, currentMonth, day);
    if (clickedDate < new Date(new Date().setHours(0, 0, 0, 0))) return;

    const dayOfWeek = clickedDate.getDay();
    const dateStringISO = clickedDate.toISOString().split("T")[0];
    const isUnavailable =
      (unavailableDates || []).includes(dateStringISO) ||
      (unavailableWeekdays || []).includes(dayOfWeek);
    if (isUnavailable) return;

    onDateSelect(dateStringISO);
  };

  const changeMonth = (offset) => {
    const newDate = new Date(currentYear, currentMonth + offset);
    setCurrentMonth(newDate.getMonth());
    setCurrentYear(newDate.getFullYear());
  };

  const formattedSelectedDate = selectedDate
    ? new Date(selectedDate + "T00:00:00").toISOString().split("T")[0]
    : "";

  return (
    <div className="bg-white rounded-lg shadow-md p-3 border border-[#BDBEBF] w-full">
      <div className="flex justify-between items-center mb-2">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="p-1.5 rounded-full hover:bg-[#F2F2F2] transition-colors"
        >
          &lt;
        </button>
        <h4 className="font-semibold text-base text-gray-800">
          {months[currentMonth]} {currentYear}
        </h4>
        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="p-1.5 rounded-full hover:bg-[#F2F2F2] transition-colors"
        >
          &gt;
        </button>
      </div>
      <div className="grid grid-cols-7 text-center text-xs font-medium text-[#84878C] mb-1">
        {weekdays.map((day) => (
          <div key={day}>{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {getDaysInMonth(currentYear, currentMonth).map((day, index) => {
          if (!day) return <div key={`empty-${index}`}></div>;

          const dayDate = new Date(currentYear, currentMonth, day);
          const dateString = dayDate.toISOString().split("T")[0];
          const dayOfWeek = dayDate.getDay();

          const isSelected = formattedSelectedDate === dateString;
          const isToday = new Date().toDateString() === dayDate.toDateString();
          const isPast = dayDate < new Date(new Date().setHours(0, 0, 0, 0));
          const isUnavailable =
            (unavailableDates || []).includes(dateString) ||
            (unavailableWeekdays || []).includes(dayOfWeek);

          const dayClasses = `flex items-center justify-center text-sm p-1.5 rounded-md text-center
                        ${
                          isPast || isUnavailable
                            ? "bg-gray-200 text-gray-400 cursor-not-allowed line-through"
                            : "cursor-pointer hover:bg-[#F2F2F2]"
                        }
                        ${
                          isSelected
                            ? "bg-[var(--primary-color)] text-white font-bold shadow-md"
                            : ""
                        }
                        ${
                          isToday && !isSelected && !isUnavailable && !isPast
                            ? "border border-[var(--primary-color)] text-[var(--primary-color)] font-bold"
                            : ""
                        }
                    `;

          return (
            <div
              key={index}
              className={dayClasses}
              onClick={() => handleDateClick(day)}
            >
              {day}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// --- Página de Agendamento ---
function SchedulingPage({ db, appId, showCustomModal }) {
  const [formData, setFormData] = useState({
    clientCode: "",
    email: "",
    confirmEmail: "",
    phoneNumber: "",
    supplier: "",
    vehicleType: "",
    isPalletized: "Não",
    palletQuantity: "",
    noteQuantity: 1,
    notes: [""],
    totalNFsValue: "",
    totalVolumes: "",
    selectedDate: "",
    selectedTime: "",
  });
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [clients, setClients] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [adminSettings, setAdminSettings] = useState(null);
  const [hasShownNoSlotsWarning, setHasShownNoSlotsWarning] = useState(false);

  useEffect(() => {
    setHasShownNoSlotsWarning(false);
  }, [formData.selectedDate]);

  useEffect(() => {
    if (!db) return;
    const unsub = (path, setter) =>
      onSnapshot(
        collection(db, `artifacts/${appId}/public/data/${path}`),
        (snap) => setter(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
      );
    const unsubs = [
      unsub("clients", setClients),
      unsub("suppliers", setSuppliers),
      unsub("vehicleTypes", setVehicleTypes),
    ];
    const unsubSettings = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/adminSettings/config`),
      (docSnap) => {
        setAdminSettings(
          docSnap.exists()
            ? docSnap.data()
            : {
                startTime: "09:00",
                endTime: "16:00",
                slotDuration: 180,
                maxAppointmentsPerDay: 1,
                maxNoteQuantity: 5,
                minLeadTimeMinutes: 0,
              }
        );
      }
    );
    unsubs.push(unsubSettings);
    return () => unsubs.forEach((u) => u());
  }, [db, appId]);

  useEffect(() => {
    if (adminSettings) {
      const max = adminSettings.maxNoteQuantity || 10;
      const qty = parseInt(formData.noteQuantity, 10) || 1;
      const current = Math.min(qty, max);
      if (qty > max) {
        showCustomModal(
          "Aviso",
          `A quantidade máxima de notas é ${max}.`,
          "warning"
        );
      }
      setFormData((prev) => ({
        ...prev,
        noteQuantity: current,
        notes: Array.from({ length: current }, (_, i) => prev.notes[i] || ""),
      }));
    }
  }, [formData.noteQuantity, adminSettings, showCustomModal]);

  const handleInputChange = (e) =>
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleNoteChange = (index, value) => {
    const newNotes = [...formData.notes];
    newNotes[index] = value.replace(/\D/g, "");
    setFormData((prev) => ({ ...prev, notes: newNotes }));
  };

  const formatCurrency = (v) => {
    let value = v.replace(/\D/g, "");
    if (!value) return "";
    value = (parseInt(value, 10) / 100).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
    return value;
  };
  const formatInteger = (v) =>
    v.replace(/\D/g, "").replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  const formatPhone = (v) =>
    v
      .replace(/\D/g, "")
      .replace(/^(\d{2})(\d)/g, "($1) $2")
      .replace(/(\d{5})(\d{4})$/, "$1-$2")
      .slice(0, 15);

  const generateTimeSlots = useCallback(async () => {
    if (!formData.selectedDate || !adminSettings)
      return setAvailableTimeSlots([]);
    const {
      startTime,
      endTime,
      slotDuration,
      maxAppointmentsPerDay,
      minLeadTimeMinutes,
      unavailableDates = [],
      unavailableWeekdays = [],
    } = adminSettings;

    const selectedDateObj = new Date(formData.selectedDate + "T00:00:00");
    const dayOfWeek = selectedDateObj.getDay();
    if (
      unavailableDates.includes(formData.selectedDate) ||
      unavailableWeekdays.includes(dayOfWeek)
    ) {
      setAvailableTimeSlots([]);
      return;
    }

    if (!startTime || !endTime || !slotDuration)
      return setAvailableTimeSlots([]);

    const leadTime = new Date(
      new Date().getTime() + (minLeadTimeMinutes || 0) * 60000
    );
    const q = query(
      collection(db, `artifacts/${appId}/public/data/appointments`),
      where("selectedDate", "==", formData.selectedDate)
    );
    const snap = await getDocs(q);
    const bookedCounts = snap.docs.reduce((acc, doc) => {
      acc[doc.data().selectedTime] = (acc[doc.data().selectedTime] || 0) + 1;
      return acc;
    }, {});

    const slots = [];
    let current = new Date(`${formData.selectedDate}T${startTime}`);
    const end = new Date(`${formData.selectedDate}T${endTime}`);
    while (current <= end) {
      const timeStr = current.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      slots.push({
        time: timeStr,
        isBooked:
          current < leadTime ||
          (bookedCounts[timeStr] || 0) >= maxAppointmentsPerDay,
      });
      current.setMinutes(current.getMinutes() + slotDuration);
    }
    setAvailableTimeSlots(slots);
    if (
      slots.length > 0 &&
      slots.every((s) => s.isBooked) &&
      !hasShownNoSlotsWarning
    ) {
      showCustomModal(
        "Aviso",
        "Não há horários disponíveis para a data selecionada.",
        "info"
      );
      setHasShownNoSlotsWarning(true);
    }
  }, [
    formData.selectedDate,
    adminSettings,
    db,
    appId,
    showCustomModal,
    hasShownNoSlotsWarning,
  ]);

  useEffect(() => {
    generateTimeSlots();
  }, [formData.selectedDate, adminSettings, generateTimeSlots]);

  const resetForm = () => {
    setFormData({
      clientCode: "",
      email: "",
      confirmEmail: "",
      phoneNumber: "",
      supplier: "",
      vehicleType: "",
      isPalletized: "Não",
      palletQuantity: "",
      noteQuantity: 1,
      notes: [""],
      totalNFsValue: "",
      totalVolumes: "",
      selectedDate: "",
      selectedTime: "",
    });
    setAttachmentFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.email !== formData.confirmEmail)
      return showCustomModal("Erro", "Os e-mails não coincidem.", "error");
    if (!formData.selectedDate || !formData.selectedTime)
      return showCustomModal("Erro", "Selecione data e hora.", "error");

    const appointmentData = {
      ...formData,
      attachmentFileName: attachmentFile ? attachmentFile.name : null,
      timestamp: new Date(),
      status: "A Caminho",
    };
    try {
      await addDoc(
        collection(db, `artifacts/${appId}/public/data/appointments`),
        appointmentData
      );
      showCustomModal(
        "Sucesso!",
        "Agendamento realizado com sucesso!",
        "success"
      );
      resetForm();
    } catch (err) {
      showCustomModal("Erro", "Falha ao agendar.", "error");
    }
  };

  const LabelWithIcon = ({ icon, text }) => (
    <label className="flex items-center text-sm font-medium text-[#404E59] mb-1">
      {icon}
      <span className="ml-2">{text}:</span>
    </label>
  );

  const renderSelect = (name, label, IconComponent, options, helpText) => (
    <div>
      <LabelWithIcon
        icon={<IconComponent size={16} className="text-[#404E59]" />}
        text={label}
      />
      <div className="relative">
        <select
          name={name}
          value={formData[name]}
          onChange={handleInputChange}
          required
          className="w-full p-2 border border-[#BDBEBF] rounded-md bg-white appearance-none focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
        >
          <option value="">Selecione...</option>
          {options.map((opt) => (
            <option key={opt.id} value={opt.name}>
              {opt.name}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#404E59]">
          <svg
            className="fill-current h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
          >
            <path
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {helpText && <p className="text-xs text-[#84878C] mt-1">{helpText}</p>}
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-xl mx-auto">
      <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
        AGENDAMENTO LOGVALE
      </h2>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
        <div className="border border-[#BDBEBF] rounded-lg p-4 bg-[#F2F2F2] space-y-4">
          <h3 className="text-xl font-semibold text-center text-gray-800">
            👤 Informações do Cliente
          </h3>
          {renderSelect(
            "clientCode",
            "Código do Cliente",
            FileCode,
            clients,
            "Selecione o cliente para este agendamento."
          )}
          <div>
            <LabelWithIcon
              icon={<Mail size={16} className="text-[#404E59]" />}
              text="E-mail"
            />
            <input
              type="email"
              placeholder="exemplo@email.com"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <p className="text-xs text-[#84878C] mt-1">
              E-mail para contato e recebimento de notificações.
            </p>
          </div>
          <div>
            <LabelWithIcon
              icon={<MailCheck size={16} className="text-[#404E59]" />}
              text="Confirmar E-mail"
            />
            <input
              type="email"
              placeholder="Repita o e-mail"
              name="confirmEmail"
              value={formData.confirmEmail}
              onChange={handleInputChange}
              required
              className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <p className="text-xs text-[#84878C] mt-1">
              Repita o e-mail para garantir a precisão.
            </p>
          </div>
          <div>
            <LabelWithIcon
              icon={<Phone size={16} className="text-[#404E59]" />}
              text="Telefone"
            />
            <input
              type="tel"
              placeholder="(99) 99999-9999"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  phoneNumber: formatPhone(e.target.value),
                }))
              }
              required
              className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <p className="text-xs text-[#84878C] mt-1">
              Telefone com DDD para contato rápido.
            </p>
          </div>
        </div>

        <div className="border border-[#BDBEBF] rounded-lg p-4 bg-[#F2F2F2] space-y-4">
          <h3 className="text-xl font-semibold text-center text-gray-800">
            📦 Informações da Carga
          </h3>
          {renderSelect(
            "supplier",
            "Fornecedor",
            Truck,
            suppliers,
            "Selecione o fornecedor da mercadoria."
          )}
          {renderSelect(
            "vehicleType",
            "Tipo do Veículo",
            Car,
            vehicleTypes,
            "Escolha o tipo de veículo que fará a entrega."
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
            <div>
              <LabelWithIcon
                icon={<Package size={16} className="text-[#404E59]" />}
                text="Carga Paletizada?"
              />
              <div className="flex items-center space-x-4 mt-2">
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isPalletized"
                    value="Sim"
                    checked={formData.isPalletized === "Sim"}
                    onChange={handleInputChange}
                    className="form-radio text-[var(--primary-color)]"
                  />{" "}
                  <span className="ml-2">Sim</span>
                </label>
                <label className="inline-flex items-center">
                  <input
                    type="radio"
                    name="isPalletized"
                    value="Não"
                    checked={formData.isPalletized === "Não"}
                    onChange={handleInputChange}
                    className="form-radio text-[var(--primary-color)]"
                  />{" "}
                  <span className="ml-2">Não</span>
                </label>
              </div>
            </div>
            <div
              className={`transition-opacity duration-300 ${
                formData.isPalletized === "Sim" ? "opacity-100" : "opacity-0"
              }`}
            >
              <LabelWithIcon
                icon={<PackagePlus size={16} className="text-[#404E59]" />}
                text="Quantidade de Paletes:"
              />
              <input
                type="text"
                placeholder="Ex: 10"
                name="palletQuantity"
                value={formData.palletQuantity}
                onChange={(e) =>
                  setFormData((p) => ({
                    ...p,
                    palletQuantity: formatInteger(e.target.value),
                  }))
                }
                required={formData.isPalletized === "Sim"}
                className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                disabled={formData.isPalletized !== "Sim"}
              />
            </div>
          </div>
          <div>
            <LabelWithIcon
              icon={<FileText size={16} className="text-[#404E59]" />}
              text="Quantidade de Notas"
            />
            <input
              type="number"
              name="noteQuantity"
              placeholder="1"
              value={formData.noteQuantity}
              onChange={handleInputChange}
              min="1"
              required
              className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <p className="text-xs text-[#84878C] mt-1">
              Informe o total de notas fiscais da carga.
            </p>
          </div>
          <div>
            <LabelWithIcon
              icon={<FilePlus size={16} className="text-[#404E59]" />}
              text="Insira as Notas"
            />
            <p className="text-xs text-[#84878C] mb-2">
              Digite apenas os números de cada nota fiscal.
            </p>
            <div className="space-y-2">
              {formData.notes.map((note, index) => (
                <input
                  key={index}
                  type="text"
                  placeholder={`Nota Fiscal ${index + 1}`}
                  value={note}
                  onChange={(e) => handleNoteChange(index, e.target.value)}
                  required
                  className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
                />
              ))}
            </div>
          </div>
          <div>
            <LabelWithIcon
              icon={<CircleDollarSign size={16} className="text-[#404E59]" />}
              text="Valor Total das NF's"
            />
            <input
              type="text"
              name="totalNFsValue"
              placeholder="R$ 0,00"
              value={formData.totalNFsValue}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  totalNFsValue: formatCurrency(e.target.value),
                }))
              }
              required
              className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <p className="text-xs text-[#84878C] mt-1">
              ⚠️ Somatória das notas inseridas nesse formulário.
            </p>
          </div>
          <div>
            <LabelWithIcon
              icon={<Archive size={16} className="text-[#404E59]" />}
              text="Total de Volumes"
            />
            <input
              type="text"
              name="totalVolumes"
              placeholder="Ex: 150"
              value={formData.totalVolumes}
              onChange={(e) =>
                setFormData((p) => ({
                  ...p,
                  totalVolumes: formatInteger(e.target.value),
                }))
              }
              required
              className="w-full p-2 border border-[#BDBEBF] rounded-md focus:ring-[var(--primary-color)] focus:border-[var(--primary-color)]"
            />
            <p className="text-xs text-[#84878C] mt-1">
              ⚠️ Somatória das notas inseridas nesse formulário.
            </p>
          </div>
        </div>

        <div className="border border-[#BDBEBF] rounded-lg p-4 bg-[#F2F2F2]">
          <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">
            📅 Agendamento
          </h3>
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-1">
              <LabelWithIcon
                icon={<CalendarDays size={16} className="text-[#404E59]" />}
                text="Data"
              />
              <CustomCalendar
                selectedDate={formData.selectedDate}
                onDateSelect={(date) =>
                  setFormData((p) => ({
                    ...p,
                    selectedDate: date,
                    selectedTime: "",
                  }))
                }
                unavailableDates={adminSettings?.unavailableDates}
                unavailableWeekdays={adminSettings?.unavailableWeekdays}
              />
            </div>
            <div className="flex-1">
              <LabelWithIcon
                icon={<Clock size={16} className="text-[#404E59]" />}
                text="Horários"
              />
              <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 border border-[#BDBEBF] rounded-md bg-white">
                {availableTimeSlots.length > 0 ? (
                  availableTimeSlots.map(({ time, isBooked }) => (
                    <div
                      key={time}
                      onClick={() =>
                        !isBooked &&
                        setFormData((p) => ({ ...p, selectedTime: time }))
                      }
                      className={`p-2 rounded-md text-center text-sm font-medium transition-all cursor-pointer ${
                        isBooked
                          ? "bg-[#BDBEBF] text-[#84878C] line-through cursor-not-allowed"
                          : formData.selectedTime === time
                          ? "bg-[var(--primary-color)] text-white"
                          : "bg-white hover:bg-[#F2F2F2]"
                      }`}
                    >
                      {time}
                    </div>
                  ))
                ) : (
                  <div className="col-span-3 text-center text-[#84878C]">
                    Selecione uma data
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="mt-4">
            <LabelWithIcon
              icon={<Paperclip size={16} className="text-[#404E59]" />}
              text="Anexar Arquivos (.rar, .zip)"
            />
            <input
              type="file"
              onChange={(e) => setAttachmentFile(e.target.files[0])}
              accept=".rar,.zip"
              className="w-full text-sm text-[#404E59] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[var(--secondary-color)] file:text-white hover:file:bg-opacity-90"
            />
            <p className="text-xs text-[#84878C] mt-1">
              Anexe um arquivo .zip ou .rar contendo as notas fiscais.
            </p>
          </div>
        </div>

        <div className="flex justify-center space-x-4 mt-6">
          <button
            type="button"
            onClick={() =>
              showCustomModal(
                "Confirmação",
                "Limpar o formulário?",
                "confirm",
                (ok) => ok && resetForm()
              )
            }
            className="bg-[#84878C] text-white px-8 py-3 rounded-full font-semibold text-lg shadow-md hover:bg-[#404E59] transition-transform hover:scale-105"
          >
            Limpar
          </button>
          <button
            type="submit"
            className="bg-[var(--primary-color)] text-white px-8 py-3 rounded-full font-semibold text-lg shadow-md hover:bg-opacity-90 transition-transform hover:scale-105"
          >
            Agendar
          </button>
        </div>
      </form>
    </div>
  );
}

// --- Página de Clientes ---
function ClientsPage({ db, appId, showCustomModal }) {
  const [clients, setClients] = useState([]);
  const [warehouses, setWarehouses] = useState([]);
  const [showClientModal, setShowClientModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

  useEffect(() => {
    if (!db) return;
    const unsubClients = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/clients`),
      (snap) => setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    const unsubWarehouses = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/warehouses`),
      (snap) => setWarehouses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => {
      unsubClients();
      unsubWarehouses();
    };
  }, [db, appId]);

  const handleSaveClient = async (clientData) => {
    try {
      const { id, ...data } = clientData;

      if (!id) {
        const q = query(
          collection(db, `artifacts/${appId}/public/data/clients`),
          where("cnpj", "==", data.cnpj)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          showCustomModal(
            "Erro",
            `O CNPJ ${data.cnpj} já está cadastrado.`,
            "error"
          );
          return;
        }
      }

      if (id) {
        await setDoc(
          doc(db, `artifacts/${appId}/public/data/clients`, id),
          data
        );
        showCustomModal("Sucesso", "Cliente atualizado.", "success");
      } else {
        await addDoc(collection(db, `artifacts/${appId}/public/data/clients`), {
          ...data,
          timestamp: new Date(),
        });
        showCustomModal("Sucesso", "Cliente adicionado.", "success");
      }
      setShowClientModal(false);
    } catch (e) {
      console.error("Error saving client:", e);
      showCustomModal("Erro", "Não foi possível salvar o cliente.", "error");
    }
  };

  const handleDeleteClient = (id, name) => {
    showCustomModal(
      "Confirmação",
      `Deseja excluir "${name}"?`,
      "confirm",
      async (ok) => {
        if (ok)
          try {
            await deleteDoc(
              doc(db, `artifacts/${appId}/public/data/clients`, id)
            );
          } catch (e) {
            showCustomModal("Erro", "Falha ao excluir.", "error");
          }
      }
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">Gerenciar Clientes</h2>
        <button
          onClick={() => {
            setEditingClient(null);
            setShowClientModal(true);
          }}
          className="bg-[#03A678] text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-opacity-90"
        >
          <Plus size={16} /> Novo Cliente
        </button>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-[var(--secondary-color)] text-white sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">Código</th>
              <th className="py-3 px-4 text-left">CNPJ</th>
              <th className="py-3 px-4 text-left">Armazém</th>
              <th className="py-3 px-4 text-left">Razão Social</th>
              <th className="py-3 px-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr
                key={client.id}
                className="border-b border-[#F2F2F2] hover:bg-[#F2F2F2]"
              >
                <td className="py-2 px-4 text-[#404E59]">{client.name}</td>
                <td className="py-2 px-4 text-[#404E59]">{client.cnpj}</td>
                <td className="py-2 px-4 text-[#404E59]">{client.warehouse}</td>
                <td className="py-2 px-4 text-[#404E59] truncate max-w-[150px]">
                  {client.razaoSocial}
                </td>
                <td className="py-2 px-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingClient(client);
                      setShowClientModal(true);
                    }}
                    className="text-[#338FFF] hover:opacity-80"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteClient(client.id, client.name)}
                    className="text-[#FF3A33] hover:opacity-80"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showClientModal && (
        <ClientFormModal
          db={db}
          appId={appId}
          client={editingClient}
          warehouses={warehouses}
          onSave={handleSaveClient}
          onClose={() => setShowClientModal(false)}
          showCustomModal={showCustomModal}
        />
      )}
    </div>
  );
}

function ClientFormModal({
  db,
  appId,
  client,
  warehouses,
  onSave,
  onClose,
  showCustomModal,
}) {
  const [formData, setFormData] = useState({
    id: client?.id || null,
    name: client?.name || "",
    cnpj: client?.cnpj || "",
    warehouse: client?.warehouse || "",
    razaoSocial: client?.razaoSocial || "",
    nomeAbreviado: client?.nomeAbreviado || "",
  });
  const [isCodeGenerated, setIsCodeGenerated] = useState(!!client);

  const formatCnpj = (v) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);

  const handleGenerateCode = () => {
    if (!formData.nomeAbreviado.trim() || !formData.cnpj.trim())
      return showCustomModal(
        "Aviso",
        "Preencha CNPJ e Nome Abreviado.",
        "warning"
      );
    const name = formData.nomeAbreviado.trim().toUpperCase().replace(/\s/g, "");
    const code = `${name.charAt(0)}${name.charAt(
      Math.floor(Math.random() * name.length)
    )}${name.charAt(Math.floor(Math.random() * name.length))}-${formData.cnpj
      .replace(/\D/g, "")
      .slice(-3)}`;
    setFormData((p) => ({ ...p, name: code }));
    setIsCodeGenerated(true);
    showCustomModal("Sucesso", `Código gerado: ${code}`, "success");
  };

  const handleSave = () => {
    if (
      !formData.name.trim() ||
      !formData.cnpj.trim() ||
      !formData.warehouse.trim() ||
      !formData.razaoSocial.trim() ||
      !formData.nomeAbreviado.trim()
    )
      return showCustomModal("Erro", "Preencha todos os campos.", "error");
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {client ? "Editar Cliente" : "Adicionar Cliente"}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="CNPJ"
            value={formData.cnpj}
            onChange={(e) =>
              setFormData((p) => ({ ...p, cnpj: formatCnpj(e.target.value) }))
            }
            readOnly={!!client}
            className={`w-full p-2 border border-[#BDBEBF] rounded-md ${
              client ? "bg-[#F2F2F2]" : "bg-white"
            }`}
          />
          <input
            type="text"
            placeholder="Nome Abreviado (max 12)"
            maxLength="12"
            value={formData.nomeAbreviado}
            onChange={(e) =>
              setFormData((p) => ({ ...p, nomeAbreviado: e.target.value }))
            }
            readOnly={!!client}
            className={`w-full p-2 border border-[#BDBEBF] rounded-md ${
              client ? "bg-[#F2F2F2]" : "bg-white"
            }`}
          />
          {!client && (
            <button
              onClick={handleGenerateCode}
              disabled={!formData.cnpj || !formData.nomeAbreviado}
              className="w-full p-2 bg-[#338FFF] text-white rounded-md disabled:bg-opacity-50"
            >
              Gerar Código
            </button>
          )}
          <input
            type="text"
            placeholder="Código do Cliente"
            value={formData.name}
            readOnly
            className="w-full p-2 border border-[#BDBEBF] rounded-md bg-[#F2F2F2]"
          />
          <select
            value={formData.warehouse}
            onChange={(e) =>
              setFormData((p) => ({ ...p, warehouse: e.target.value }))
            }
            className="w-full p-2 border border-[#BDBEBF] rounded-md bg-white"
          >
            <option value="">Selecione o Armazém</option>
            {warehouses.map((w) => (
              <option key={w.id} value={w.name}>
                {w.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Razão Social (max 30)"
            maxLength="30"
            value={formData.razaoSocial}
            onChange={(e) =>
              setFormData((p) => ({ ...p, razaoSocial: e.target.value }))
            }
            className="w-full p-2 border border-[#BDBEBF] rounded-md bg-white"
          />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#BDBEBF] text-[#132B40] rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={!client && !isCodeGenerated}
            className="px-4 py-2 bg-[#03A678] text-white rounded-md disabled:bg-opacity-50"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Página de Fornecedores ---
function SuppliersPage({ db, appId, showCustomModal }) {
  const [suppliers, setSuppliers] = useState([]);
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  useEffect(() => {
    if (!db) return;
    const unsub = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/suppliers`),
      (snap) => setSuppliers(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );
    return () => unsub();
  }, [db, appId]);

  const handleSaveSupplier = async (supplierData) => {
    try {
      const { id, ...data } = supplierData;
      if (!id) {
        const q = query(
          collection(db, `artifacts/${appId}/public/data/suppliers`),
          where("cnpj", "==", data.cnpj)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          showCustomModal(
            "Erro",
            `O CNPJ ${data.cnpj} já está cadastrado para outro fornecedor.`,
            "error"
          );
          return;
        }
      }
      if (id) {
        await setDoc(
          doc(db, `artifacts/${appId}/public/data/suppliers`, id),
          data,
          { merge: true }
        );
        showCustomModal("Sucesso", "Fornecedor atualizado.", "success");
      } else {
        await addDoc(
          collection(db, `artifacts/${appId}/public/data/suppliers`),
          { ...data, timestamp: new Date() }
        );
        showCustomModal("Sucesso", "Fornecedor adicionado.", "success");
      }
      setShowSupplierModal(false);
    } catch (e) {
      console.error("Error saving supplier:", e);
      showCustomModal("Erro", "Não foi possível salvar o fornecedor.", "error");
    }
  };

  const handleDeleteSupplier = (id, name) => {
    showCustomModal(
      "Confirmação",
      `Excluir "${name}"?`,
      "confirm",
      async (ok) => {
        if (ok)
          try {
            await deleteDoc(
              doc(db, `artifacts/${appId}/public/data/suppliers`, id)
            );
          } catch (e) {
            showCustomModal("Erro", "Falha ao excluir.", "error");
          }
      }
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-bold text-gray-800">
          Gerenciar Fornecedores
        </h2>
        <button
          onClick={() => {
            setEditingSupplier(null);
            setShowSupplierModal(true);
          }}
          className="bg-[#03A678] text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-opacity-90"
        >
          <Plus size={16} /> Novo Fornecedor
        </button>
      </div>
      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-[var(--secondary-color)] text-white sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">Nome</th>
              <th className="py-3 px-4 text-left">CNPJ</th>
              <th className="py-3 px-4 text-left">Nome Abreviado</th>
              <th className="py-3 px-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr
                key={s.id}
                className="border-b border-[#F2F2F2] hover:bg-[#F2F2F2]"
              >
                <td className="py-2 px-4 text-[#404E59]">{s.name}</td>
                <td className="py-2 px-4 text-[#404E59]">{s.cnpj}</td>
                <td className="py-2 px-4 text-[#404E59]">{s.nomeAbreviado}</td>
                <td className="py-2 px-4 flex space-x-2">
                  <button
                    onClick={() => {
                      setEditingSupplier(s);
                      setShowSupplierModal(true);
                    }}
                    className="text-[#338FFF] hover:opacity-80"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteSupplier(s.id, s.name)}
                    className="text-[#FF3A33] hover:opacity-80"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {showSupplierModal && (
        <SupplierFormModal
          db={db}
          appId={appId}
          supplier={editingSupplier}
          onSave={handleSaveSupplier}
          onClose={() => setShowSupplierModal(false)}
          showCustomModal={showCustomModal}
        />
      )}
    </div>
  );
}

function SupplierFormModal({
  db,
  appId,
  supplier,
  onSave,
  onClose,
  showCustomModal,
}) {
  const [formData, setFormData] = useState({
    id: supplier?.id || null,
    name: supplier?.name || "",
    cnpj: supplier?.cnpj || "",
    nomeAbreviado: supplier?.nomeAbreviado || "",
  });

  const formatCnpj = (v) =>
    v
      .replace(/\D/g, "")
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2")
      .slice(0, 18);

  const handleSave = () => {
    if (
      !formData.name.trim() ||
      !formData.cnpj.trim() ||
      !formData.nomeAbreviado.trim()
    ) {
      return showCustomModal("Erro", "Preencha todos os campos.", "error");
    }
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full">
        <h3 className="text-2xl font-bold mb-6 text-gray-800 text-center">
          {supplier ? "Editar Fornecedor" : "Adicionar Fornecedor"}
        </h3>
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Nome do Fornecedor"
            value={formData.name}
            onChange={(e) =>
              setFormData((p) => ({ ...p, name: e.target.value }))
            }
            className="w-full p-2 border border-[#BDBEBF] rounded-md"
          />
          <input
            type="text"
            placeholder="CNPJ"
            value={formData.cnpj}
            onChange={(e) =>
              setFormData((p) => ({ ...p, cnpj: formatCnpj(e.target.value) }))
            }
            readOnly={!!supplier}
            className={`w-full p-2 border border-[#BDBEBF] rounded-md ${
              !!supplier ? "bg-gray-100" : "bg-white"
            }`}
          />
          <input
            type="text"
            placeholder="Nome Abreviado (max 12)"
            maxLength="12"
            value={formData.nomeAbreviado}
            onChange={(e) =>
              setFormData((p) => ({ ...p, nomeAbreviado: e.target.value }))
            }
            className="w-full p-2 border border-[#BDBEBF] rounded-md"
          />
        </div>
        <div className="flex justify-end space-x-4 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#BDBEBF] text-[#132B40] rounded-md"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#03A678] text-white rounded-md"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Página de Dashboard ---
function AppointmentsDashboardPage({ db, appId, showCustomModal }) {
  const [appointments, setAppointments] = useState([]);
  const [suppliers, setSuppliers] = useState({});
  const [clients, setClients] = useState({});
  const [showCharts, setShowCharts] = useState(false);

  useEffect(() => {
    if (!db) return;

    const unsubAppointments = onSnapshot(
      query(
        collection(db, `artifacts/${appId}/public/data/appointments`),
        orderBy("selectedDate", "asc"),
        orderBy("selectedTime", "asc")
      ),
      (snap) => {
        setAppointments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      }
    );

    const unsubSuppliers = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/suppliers`),
      (snap) => {
        const supplierMap = snap.docs.reduce((acc, doc) => {
          acc[doc.data().name] = doc.data().nomeAbreviado;
          return acc;
        }, {});
        setSuppliers(supplierMap);
      }
    );

    const unsubClients = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/clients`),
      (snap) => {
        const clientMap = snap.docs.reduce((acc, doc) => {
          acc[doc.data().name] = doc.data().nomeAbreviado;
          return acc;
        }, {});
        setClients(clientMap);
      }
    );

    return () => {
      unsubAppointments();
      unsubSuppliers();
      unsubClients();
    };
  }, [db, appId]);

  const formatDate = (date) => {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d.getTime())) return "";
    const day = String(d.getUTCDate()).padStart(2, "0");
    const month = String(d.getUTCMonth() + 1).padStart(2, "0");
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
  };

  const updateStatus = async (id, status) => {
    const docRef = doc(db, `artifacts/${appId}/public/data/appointments`, id);
    await updateDoc(docRef, { status });
  };

  const handleDownloadAttachment = (fileName) => {
    showCustomModal(
      "Download de Anexo",
      `A funcionalidade para baixar o arquivo "${fileName}" não está implementada neste ambiente.`,
      "info"
    );
  };

  const DetailRow = ({ label, value, Icon }) => (
    <div className="py-2 px-3 flex items-center justify-between border-b last:border-b-0">
      <strong className="text-gray-600 flex items-center gap-2">
        <Icon size={16} />
        {label}:
      </strong>
      <span className="text-right">{value}</span>
    </div>
  );

  const handleViewDetails = (appt) => {
    const content = (
      <div className="text-sm space-y-2">
        <DetailRow
          Icon={FileCode}
          label="Cód. Cliente"
          value={appt.clientCode}
        />
        <DetailRow Icon={Mail} label="E-mail" value={appt.email} />
        <DetailRow Icon={Phone} label="Telefone" value={appt.phoneNumber} />
        <DetailRow Icon={Truck} label="Fornecedor" value={appt.supplier} />
        <DetailRow
          Icon={Truck}
          label="Nome Abreviado"
          value={suppliers[appt.supplier] || "N/A"}
        />
        <DetailRow
          Icon={Car}
          label="Tipo do Veículo"
          value={appt.vehicleType}
        />
        <DetailRow
          Icon={Package}
          label="Paletizado"
          value={appt.isPalletized}
        />
        <DetailRow
          Icon={PackagePlus}
          label="Qtd. Paletes"
          value={appt.isPalletized === "Sim" ? appt.palletQuantity : "0"}
        />
        <DetailRow
          Icon={FileText}
          label="Qtd. Notas"
          value={appt.noteQuantity}
        />
        <DetailRow
          Icon={FilePlus}
          label="Notas"
          value={appt.notes.join(", ")}
        />
        <DetailRow
          Icon={CircleDollarSign}
          label="Valor Total NF's"
          value={appt.totalNFsValue}
        />
        <DetailRow
          Icon={Archive}
          label="Total de Volumes"
          value={appt.totalVolumes}
        />
        <DetailRow
          Icon={CalendarDays}
          label="Data Agendada"
          value={formatDate(appt.selectedDate)}
        />
        <DetailRow
          Icon={Clock}
          label="Hora Agendada"
          value={appt.selectedTime}
        />
      </div>
    );
    showCustomModal("Detalhes do Agendamento", content, "info");
  };

  const dashboardData = React.useMemo(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setUTCDate(today.getUTCDate() - today.getUTCDay());
    startOfWeek.setUTCHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setUTCDate(startOfWeek.getUTCDate() + 6);
    endOfWeek.setUTCHours(23, 59, 59, 999);

    const weekAppointments = appointments.filter((appt) => {
      if (!appt.selectedDate) return false;
      const apptDate = new Date(appt.selectedDate + "T00:00:00Z");
      return apptDate >= startOfWeek && apptDate <= endOfWeek;
    });

    const days = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    const dailyData = days.map((day) => ({
      name: day,
      volumes: 0,
      paletes: 0,
    }));

    const clientVolumesAgg = {};
    const vehicleTypeAgg = {};
    let totalNoteCount = 0;
    let palletizedCount = 0;
    let nonPalletizedCount = 0;
    let totalVolumes = 0;
    let totalPallets = 0;

    weekAppointments.forEach((appt) => {
      const dayIndex = new Date(appt.selectedDate + "T00:00:00Z").getUTCDay();
      const currentVolumes =
        parseInt(String(appt.totalVolumes).replace(/\./g, "")) || 0;
      const currentPallets =
        parseInt(String(appt.palletQuantity).replace(/\./g, "")) || 0;
      const clientName = clients[appt.clientCode] || appt.clientCode;

      dailyData[dayIndex].volumes += currentVolumes;
      dailyData[dayIndex].paletes += currentPallets;

      if (clientName) {
        clientVolumesAgg[clientName] =
          (clientVolumesAgg[clientName] || 0) + currentVolumes;
      }
      if (appt.vehicleType) {
        vehicleTypeAgg[appt.vehicleType] =
          (vehicleTypeAgg[appt.vehicleType] || 0) + 1;
      }
      if (appt.isPalletized === "Sim") {
        palletizedCount++;
      } else {
        nonPalletizedCount++;
      }
      totalNoteCount += Number(appt.noteQuantity) || 0;
      totalVolumes += currentVolumes;
      totalPallets += currentPallets;
    });

    const clientVolumeData = Object.keys(clientVolumesAgg).map((name) => ({
      name,
      value: clientVolumesAgg[name],
    }));
    const vehicleTypeData = Object.keys(vehicleTypeAgg)
      .map((name) => ({ name, value: vehicleTypeAgg[name] }))
      .sort((a, b) => b.value - a.value);
    const cargoTypeData = [
      { name: "Paletizada", value: palletizedCount },
      { name: "Batida", value: nonPalletizedCount },
    ];

    return {
      weekData: dailyData,
      clientVolumeData,
      vehicleTypeData,
      cargoTypeData,
      totalNoteCount,
      totalVolumes,
      totalPallets,
      startOfWeek,
      endOfWeek,
    };
  }, [appointments, clients]);

  const tooltipFormatter = (value) => value.toLocaleString("pt-BR");

  const getRoundedMax = (data, key) => {
    const maxVal = Math.max(...data.map((d) => d[key]));
    if (maxVal === 0) return 10;
    return Math.ceil((maxVal * 1.15) / 10) * 10;
  };

  const PIE_COLORS = [
    "#03A678",
    "#FF7F32",
    "#338FFF",
    "#FFBF33",
    "#A569BD",
    "#17A589",
  ];
  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
  }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
      >
        <tspan x={x} dy="-0.6em" fontSize="1.1em" fontWeight="bold">
          {`${(percent * 100).toFixed(0)}%`}
        </tspan>
        <tspan x={x} dy="1.2em" fontSize="0.8em" fill="#ffffffcc">
          {`(${value.toLocaleString("pt-BR")})`}
        </tspan>
      </text>
    );
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold text-gray-800">
          Dashboard de Agendamentos
        </h2>
        <span className="text-xl font-semibold text-gray-700">
          Semana: {formatDate(dashboardData.startOfWeek.toISOString())} até{" "}
          {formatDate(dashboardData.endOfWeek.toISOString())}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
          <h4 className="font-bold text-lg text-gray-700">
            Total de Notas Fiscais
          </h4>
          <p className="text-4xl font-bold text-[var(--primary-color)] mt-2">
            {dashboardData.totalNoteCount.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
          <h4 className="font-bold text-lg text-gray-700">Total de Volumes</h4>
          <p className="text-4xl font-bold text-[var(--primary-color)] mt-2">
            {dashboardData.totalVolumes.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm text-center">
          <h4 className="font-bold text-lg text-gray-700">Total de Paletes</h4>
          <p className="text-4xl font-bold text-[var(--primary-color)] mt-2">
            {dashboardData.totalPallets.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      <div className="p-4 border border-gray-200 rounded-lg">
        <button
          onClick={() => setShowCharts(!showCharts)}
          className="flex items-center gap-2 text-lg font-semibold text-gray-700 mb-4"
        >
          {showCharts ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          {showCharts ? "Ocultar Gráficos" : "Mostrar Gráficos"}
        </button>
        <div
          className={`transition-all duration-500 ease-in-out ${
            showCharts
              ? "max-h-full opacity-100"
              : "max-h-0 opacity-0 overflow-hidden"
          }`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-96 flex flex-col items-center justify-center">
              <h4 className="font-bold text-lg text-gray-700 text-center mb-2">
                Veículos por Tipo
              </h4>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={dashboardData.vehicleTypeData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" width={80} />
                  <Tooltip formatter={tooltipFormatter} />
                  <Bar
                    dataKey="value"
                    fill="var(--primary-color)"
                    name="Qtd. Veículos"
                  >
                    <LabelList
                      dataKey="value"
                      position="insideRight"
                      style={{ fill: "white", fontWeight: "bold" }}
                    />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-96 flex flex-col items-center justify-center">
              <h4 className="font-bold text-lg text-gray-700 text-center mb-2">
                Volumes por Cliente
              </h4>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dashboardData.clientVolumeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={100}
                    paddingAngle={5}
                    label={renderCustomizedLabel}
                    labelLine={false}
                  >
                    {dashboardData.clientVolumeData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PIE_COLORS[index % PIE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm h-96 flex flex-col items-center justify-center">
              <h4 className="font-bold text-lg text-gray-700 text-center mb-2">
                Tipo de Carga
              </h4>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={dashboardData.cargoTypeData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    labelLine={false}
                    label={renderCustomizedLabel}
                    paddingAngle={5}
                  >
                    <Cell key="cell-0" fill="#FF7F32" />
                    <Cell key="cell-1" fill="#338FFF" />
                  </Pie>
                  <Tooltip
                    formatter={(value) => value.toLocaleString("pt-BR")}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="p-6 mt-6 border border-gray-200 rounded-lg shadow-sm">
            <h3 className="text-xl font-semibold text-gray-800 mb-4 text-center">
              Volumes e Paletes por Dia da Semana
            </h3>
            <div className="w-full h-80">
              <ResponsiveContainer>
                <BarChart data={dashboardData.weekData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis
                    domain={[0, (dataMax) => Math.ceil(dataMax * 1.15)]}
                    tickFormatter={tooltipFormatter}
                  />
                  <Tooltip formatter={tooltipFormatter} />
                  <Legend />
                  <Bar dataKey="volumes" fill="#03A678" name="Volumes" />
                  <Bar
                    dataKey="paletes"
                    fill="var(--primary-color)"
                    name="Paletes"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="min-w-full bg-white">
          <thead className="bg-[var(--secondary-color)] text-white sticky top-0">
            <tr>
              <th className="py-3 px-4 text-left">Cliente (Abrev.)</th>
              <th className="py-3 px-4 text-left">Data</th>
              <th className="py-3 px-4 text-left">Hora</th>
              <th className="py-3 px-4 text-left">Fornecedor (Abrev.)</th>
              <th className="py-3 px-4 text-left">Tipo Veículo</th>
              <th className="py-3 px-4 text-left">Qtd. Paletes</th>
              <th className="py-3 px-4 text-left">Qtd. Volumes</th>
              <th className="py-3 px-4 text-left">Status</th>
              <th className="py-3 px-4 text-left">Anexo</th>
              <th className="py-3 px-4 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map((appt) => (
              <tr
                key={appt.id}
                className="border-b border-[#F2F2F2] hover:bg-[#F2F2F2]"
              >
                <td className="py-2 px-4 text-[#404E59]">
                  {clients[appt.clientCode] || appt.clientCode}
                </td>
                <td className="py-2 px-4 text-[#404E59]">
                  {formatDate(appt.selectedDate)}
                </td>
                <td className="py-2 px-4 text-[#404E59]">
                  {appt.selectedTime}
                </td>
                <td className="py-2 px-4 text-[#404E59]">
                  {suppliers[appt.supplier] || appt.supplier}
                </td>
                <td className="py-2 px-4 text-[#404E59]">{appt.vehicleType}</td>
                <td className="py-2 px-4 text-[#404E59]">
                  {appt.palletQuantity || "0"}
                </td>
                <td className="py-2 px-4 text-[#404E59]">
                  {appt.totalVolumes}
                </td>
                <td className="py-2 px-4">
                  <select
                    value={appt.status || "A Caminho"}
                    onChange={(e) => updateStatus(appt.id, e.target.value)}
                    className="p-1 rounded-md border border-gray-300 text-sm"
                  >
                    <option value="A Caminho">A Caminho</option>
                    <option value="Recebido">Recebido</option>
                    <option value="Não Chegou">Não Chegou</option>
                  </select>
                </td>
                <td className="py-2 px-4">
                  {appt.attachmentFileName && (
                    <button
                      onClick={() =>
                        handleDownloadAttachment(appt.attachmentFileName)
                      }
                      className="text-[#338FFF] hover:underline"
                    >
                      <Download size={16} />
                    </button>
                  )}
                </td>
                <td className="py-2 px-4">
                  <button
                    onClick={() => handleViewDetails(appt)}
                    className="text-[#338FFF] hover:underline"
                  >
                    Ver Detalhes
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// --- Página de Configurações de Agendamento ---
function SchedulingSettingsPage({ db, appId, showCustomModal }) {
  const [settings, setSettings] = useState({
    startTime: "09:00",
    endTime: "15:00",
    slotDuration: 180,
    maxAppointmentsPerDay: 1,
    maxNoteQuantity: 10,
    minLeadTimeMinutes: 1440,
    unavailableDates: [],
    unavailableWeekdays: [],
  });
  const [newUnavailableDate, setNewUnavailableDate] = useState("");
  const [vehicleTypes, setVehicleTypes] = useState([]);
  const [newVehicleTypeName, setNewVehicleTypeName] = useState("");

  const formatWithDots = (value) => {
    const numValue = String(value).replace(/\D/g, "");
    if (!numValue) return "";
    return parseInt(numValue, 10).toLocaleString("pt-BR");
  };

  useEffect(() => {
    if (!db) return;
    const unsubSettings = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/adminSettings/config`),
      (docSnap) => {
        if (docSnap.exists()) {
          setSettings((s) => ({ ...s, ...docSnap.data() }));
        }
      }
    );
    const unsubVehicles = onSnapshot(
      collection(db, `artifacts/${appId}/public/data/vehicleTypes`),
      (snap) =>
        setVehicleTypes(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubSettings();
      unsubVehicles();
    };
  }, [db, appId]);

  const handleSaveSettings = async () => {
    try {
      const settingsToSave = {
        ...settings,
        minLeadTimeMinutes:
          parseInt(
            String(settings.minLeadTimeMinutes).replace(/\D/g, ""),
            10
          ) || 0,
      };
      await setDoc(
        doc(db, `artifacts/${appId}/public/data/adminSettings/config`),
        settingsToSave,
        { merge: true }
      );
      showCustomModal("Sucesso", "Configurações salvas!", "success");
    } catch (e) {
      showCustomModal("Erro", "Falha ao salvar configurações.", "error");
    }
  };

  const handleSettingChange = (e) => {
    const { name, value, type } = e.target;
    let processedValue = value;
    if (name === "minLeadTimeMinutes") {
      processedValue = value.replace(/\D/g, "");
    }
    setSettings((s) => ({
      ...s,
      [name]:
        type === "number" ? parseInt(processedValue) || 0 : processedValue,
    }));
  };

  const handleAddItem = async (
    collectionName,
    itemName,
    setItemName,
    successMessage
  ) => {
    if (!itemName.trim())
      return showCustomModal("Aviso", "O nome não pode ser vazio.", "warning");
    try {
      await addDoc(
        collection(db, `artifacts/${appId}/public/data/${collectionName}`),
        { name: itemName.trim(), timestamp: new Date() }
      );
      setItemName("");
      showCustomModal("Sucesso", successMessage, "success");
    } catch (e) {
      showCustomModal("Erro", `Falha ao adicionar.`, "error");
    }
  };

  const handleDeleteItem = (collectionName, id, name) => {
    showCustomModal(
      "Confirmação",
      `Excluir "${name}"?`,
      "confirm",
      async (ok) => {
        if (ok) {
          try {
            await deleteDoc(
              doc(db, `artifacts/${appId}/public/data/${collectionName}`, id)
            );
          } catch (e) {
            showCustomModal("Erro", `Falha ao excluir.`, "error");
          }
        }
      }
    );
  };

  const handleAddUnavailableDate = () => {
    if (!newUnavailableDate) return;
    setSettings((s) => ({
      ...s,
      unavailableDates: [...(s.unavailableDates || []), newUnavailableDate],
    }));
    setNewUnavailableDate("");
  };

  const handleRemoveUnavailableDate = (dateToRemove) => {
    setSettings((s) => ({
      ...s,
      unavailableDates: s.unavailableDates.filter((d) => d !== dateToRemove),
    }));
  };

  const handleWeekdayToggle = (dayIndex) => {
    const currentDays = settings.unavailableWeekdays || [];
    const newDays = currentDays.includes(dayIndex)
      ? currentDays.filter((d) => d !== dayIndex)
      : [...currentDays, dayIndex];
    setSettings((s) => ({ ...s, unavailableWeekdays: newDays }));
  };

  const weekdays = ["DOM", "SEG", "TER", "QUA", "QUI", "SEX", "SÁB"];

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Configurações de Agendamento
      </h2>

      {/* Configurações de Agendamento */}
      <div className="p-6 border border-[#BDBEBF] rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Parâmetros de Agendamento
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[#404E59]">
              Hora de Início:
            </label>
            <input
              type="time"
              name="startTime"
              value={settings.startTime || ""}
              onChange={handleSettingChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#404E59]">
              Hora de Término:
            </label>
            <input
              type="time"
              name="endTime"
              value={settings.endTime || ""}
              onChange={handleSettingChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#404E59]">
              Duração do Slot (min):
            </label>
            <input
              type="number"
              name="slotDuration"
              value={settings.slotDuration || 0}
              onChange={handleSettingChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#404E59]">
              Máx. Agend. por Horário:
            </label>
            <input
              type="number"
              name="maxAppointmentsPerDay"
              value={settings.maxAppointmentsPerDay || 0}
              onChange={handleSettingChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#404E59]">
              Máx. de Notas:
            </label>
            <input
              type="number"
              name="maxNoteQuantity"
              value={settings.maxNoteQuantity || 0}
              onChange={handleSettingChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#404E59]">
              Antecedência Mínima (min):
            </label>
            <input
              type="text"
              name="minLeadTimeMinutes"
              value={formatWithDots(settings.minLeadTimeMinutes || 0)}
              onChange={handleSettingChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
        </div>
      </div>

      {/* Gerenciar Tipos de Veículo */}
      <div className="p-6 border border-[#BDBEBF] rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Gerenciar Tipos de Veículo
        </h3>
        <div className="flex mb-4">
          <input
            type="text"
            value={newVehicleTypeName}
            onChange={(e) => setNewVehicleTypeName(e.target.value)}
            placeholder="Novo tipo de veículo"
            className="flex-grow p-2 border border-[#BDBEBF] rounded-l-md"
          />
          <button
            onClick={() =>
              handleAddItem(
                "vehicleTypes",
                newVehicleTypeName,
                setNewVehicleTypeName,
                "Tipo de veículo adicionado."
              )
            }
            className="bg-[#03A678] text-white px-4 rounded-r-md font-semibold"
          >
            Adicionar
          </button>
        </div>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {vehicleTypes.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-2 bg-[#F2F2F2] rounded-md"
            >
              <span>{item.name}</span>
              <button
                onClick={() =>
                  handleDeleteItem("vehicleTypes", item.id, item.name)
                }
                className="text-[#FF3A33]"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Configurações de Datas Indisponíveis */}
      <div className="p-6 border border-[#BDBEBF] rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Datas Indisponíveis
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h4 className="font-semibold mb-2">Bloquear Datas Específicas</h4>
            <div className="flex mb-4">
              <input
                type="date"
                value={newUnavailableDate}
                onChange={(e) => setNewUnavailableDate(e.target.value)}
                className="flex-grow p-2 border border-[#BDBEBF] rounded-l-md"
              />
              <button
                onClick={handleAddUnavailableDate}
                className="bg-[#03A678] text-white px-4 rounded-r-md font-semibold"
              >
                Adicionar
              </button>
            </div>
            <ul className="space-y-2 max-h-40 overflow-y-auto">
              {(settings.unavailableDates || []).map((date) => (
                <li
                  key={date}
                  className="flex justify-between items-center p-2 bg-[#F2F2F2] rounded-md"
                >
                  <span>
                    {new Date(date + "T00:00:00").toLocaleDateString("pt-BR")}
                  </span>
                  <button
                    onClick={() => handleRemoveUnavailableDate(date)}
                    className="text-[#FF3A33]"
                  >
                    <Trash2 size={16} />
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-2">Bloquear Dias da Semana</h4>
            <div className="grid grid-cols-3 gap-2">
              {weekdays.map((day, index) => (
                <label
                  key={day}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-[#F2F2F2]"
                >
                  <input
                    type="checkbox"
                    checked={(settings.unavailableWeekdays || []).includes(
                      index
                    )}
                    onChange={() => handleWeekdayToggle(index)}
                    className="form-checkbox text-[var(--primary-color)] rounded focus:ring-[var(--primary-color)]"
                  />
                  <span>{day}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8">
        <button
          onClick={handleSaveSettings}
          className="bg-[#03A678] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md hover:bg-opacity-90 transition-transform hover:scale-105"
        >
          Salvar Todas as Configurações
        </button>
      </div>
    </div>
  );
}

const ActivitiesPage = () => {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold text-gray-800">Gerenciar Atividades</h2>
      <p className="mt-4 text-gray-600">Esta página está em desenvolvimento.</p>
    </div>
  );
};

const ThemeSettingsPage = ({ db, appId, showCustomModal }) => {
  const [themeSettings, setThemeSettings] = useState({
    primaryColor: "#FF7F32",
    secondaryColor: "#132B40",
  });

  useEffect(() => {
    if (!db) return;
    const unsubSettings = onSnapshot(
      doc(db, `artifacts/${appId}/public/data/adminSettings/config`),
      (docSnap) => {
        if (docSnap.exists() && docSnap.data().primaryColor) {
          setThemeSettings((s) => ({
            ...s,
            primaryColor: docSnap.data().primaryColor,
            secondaryColor: docSnap.data().secondaryColor,
          }));
        }
      }
    );
    return () => unsubSettings();
  }, [db, appId]);

  const handleThemeChange = (e) => {
    const { name, value } = e.target;
    setThemeSettings((s) => ({ ...s, [name]: value }));
  };

  const handleSaveTheme = async () => {
    try {
      await setDoc(
        doc(db, `artifacts/${appId}/public/data/adminSettings/config`),
        {
          primaryColor: themeSettings.primaryColor,
          secondaryColor: themeSettings.secondaryColor,
        },
        { merge: true }
      );
      showCustomModal("Sucesso", "Tema salvo com sucesso!", "success");
    } catch (e) {
      showCustomModal("Erro", "Falha ao salvar o tema.", "error");
    }
  };

  return (
    <div className="p-6 border border-[#BDBEBF] rounded-lg shadow-sm">
      <h3 className="text-xl font-semibold text-gray-800 mb-4">
        Aparência do Tema
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div>
          <label
            htmlFor="primaryColor"
            className="block text-sm font-medium text-[#404E59]"
          >
            Cor Primária:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="primaryColor"
              name="primaryColor"
              value={themeSettings.primaryColor}
              onChange={handleThemeChange}
              className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
            />
            <input
              type="text"
              name="primaryColor"
              value={themeSettings.primaryColor}
              onChange={handleThemeChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
        </div>
        <div>
          <label
            htmlFor="secondaryColor"
            className="block text-sm font-medium text-[#404E59]"
          >
            Cor Secundária:
          </label>
          <div className="flex items-center gap-2">
            <input
              type="color"
              id="secondaryColor"
              name="secondaryColor"
              value={themeSettings.secondaryColor}
              onChange={handleThemeChange}
              className="p-1 h-10 w-14 block bg-white border border-gray-200 cursor-pointer rounded-lg disabled:opacity-50 disabled:pointer-events-none"
            />
            <input
              type="text"
              name="secondaryColor"
              value={themeSettings.secondaryColor}
              onChange={handleThemeChange}
              className="w-full p-2 border border-[#BDBEBF] rounded-md"
            />
          </div>
        </div>
      </div>
      <div className="text-center mt-8">
        <button
          onClick={handleSaveTheme}
          className="bg-[#03A678] text-white px-6 py-3 rounded-full font-semibold text-lg shadow-md hover:bg-opacity-90 transition-transform hover:scale-105"
        >
          Salvar Tema
        </button>
      </div>
    </div>
  );
};

function GeneralSettingsPage({ db, auth, appId, showCustomModal }) {
  const [testDataAdded, setTestDataAdded] = useState(false);
  const [warehouses, setWarehouses] = useState([]);
  const [newWarehouseName, setNewWarehouseName] = useState("");

  useEffect(() => {
    if (!db) return;
    const unsubWarehouses = onSnapshot(
      query(
        collection(db, `artifacts/${appId}/public/data/warehouses`),
        orderBy("timestamp", "asc")
      ),
      (snap) => setWarehouses(snap.docs.map((d) => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubWarehouses();
    };
  }, [db, appId]);

  const handleLogout = () => {
    showCustomModal(
      "Confirmação",
      "Deseja realmente sair?",
      "confirm",
      async (ok) => {
        if (ok) await signOut(auth);
      }
    );
  };

  const handleAddItem = async (
    collectionName,
    itemName,
    setItemName,
    successMessage
  ) => {
    if (!itemName.trim())
      return showCustomModal("Aviso", "O nome não pode ser vazio.", "warning");
    try {
      await addDoc(
        collection(db, `artifacts/${appId}/public/data/${collectionName}`),
        { name: itemName.trim(), timestamp: new Date() }
      );
      setItemName("");
      showCustomModal("Sucesso", successMessage, "success");
    } catch (e) {
      showCustomModal("Erro", `Falha ao adicionar.`, "error");
    }
  };

  const handleDeleteItem = (collectionName, id, name) => {
    showCustomModal(
      "Confirmação",
      `Excluir "${name}"?`,
      "confirm",
      async (ok) => {
        if (ok) {
          try {
            await deleteDoc(
              doc(db, `artifacts/${appId}/public/data/${collectionName}`, id)
            );
          } catch (e) {
            showCustomModal("Erro", `Falha ao excluir.`, "error");
          }
        }
      }
    );
  };

  const addTestData = async () => {
    if (!db) return;

    showCustomModal("Aguarde", "Adicionando dados de teste...", "info");

    const mockClients = [
      {
        name: "CLI-001",
        cnpj: "11.111.111/0001-11",
        nomeAbreviado: "Cliente A",
        razaoSocial: "Cliente A Ltda",
        warehouse: "Armazém 1",
      },
      {
        name: "CLI-002",
        cnpj: "22.222.222/0001-22",
        nomeAbreviado: "Cliente B",
        razaoSocial: "Cliente B S/A",
        warehouse: "Armazém 2",
      },
      {
        name: "CLI-003",
        cnpj: "33.333.333/0001-33",
        nomeAbreviado: "Cliente C",
        razaoSocial: "Cliente C e Filhos",
        warehouse: "Armazém 1",
      },
    ];

    const mockSuppliers = [
      {
        name: "Fornecedor X",
        cnpj: "44.444.444/0001-44",
        nomeAbreviado: "Forn X",
      },
      {
        name: "Fornecedor Y",
        cnpj: "55.555.555/0001-55",
        nomeAbreviado: "Forn Y",
      },
      {
        name: "Fornecedor Z",
        cnpj: "66.666.666/0001-66",
        nomeAbreviado: "Forn Z",
      },
    ];

    const today = new Date();
    const startOfWeek = new Date(
      today.setDate(today.getDate() - today.getDay())
    );

    const mockAppointments = Array.from({ length: 10 }, (_, i) => {
      const dayOffset = i % 5; // Dias de Seg a Sex
      const apptDate = new Date(startOfWeek);
      apptDate.setDate(startOfWeek.getDate() + dayOffset + 1);

      return {
        clientCode: mockClients[i % mockClients.length].name,
        email: `teste${i}@teste.com`,
        confirmEmail: `teste${i}@teste.com`,
        phoneNumber: `(11) 98765-432${i}`,
        supplier: mockSuppliers[i % mockSuppliers.length].name,
        vehicleType: "Carreta",
        isPalletized: i % 2 === 0 ? "Sim" : "Não",
        palletQuantity: i % 2 === 0 ? `${(i + 1) * 2}` : "0",
        noteQuantity: (i % 3) + 1,
        notes: [`${1000 + i}`],
        totalNFsValue: `R$ ${(1500 * (i + 1)).toFixed(2)}`,
        totalVolumes: `${100 + i * 10}`,
        selectedDate: apptDate.toISOString().split("T")[0],
        selectedTime: `${9 + (i % 4)}:00`,
        status: "A Caminho",
        timestamp: new Date(),
      };
    });

    try {
      for (const client of mockClients) {
        await addDoc(
          collection(db, `artifacts/${appId}/public/data/clients`),
          client
        );
      }
      for (const supplier of mockSuppliers) {
        await addDoc(
          collection(db, `artifacts/${appId}/public/data/suppliers`),
          supplier
        );
      }
      for (const appointment of mockAppointments) {
        await addDoc(
          collection(db, `artifacts/${appId}/public/data/appointments`),
          appointment
        );
      }
      setTestDataAdded(true);
      showCustomModal("Sucesso", "Dados de teste adicionados!", "success");
    } catch (e) {
      console.error("Erro ao adicionar dados de teste:", e);
      showCustomModal("Erro", "Falha ao adicionar dados de teste.", "error");
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-lg max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-center text-gray-800">
        Configurações Gerais
      </h2>
      <ThemeSettingsPage
        db={db}
        appId={appId}
        showCustomModal={showCustomModal}
      />
      <div className="p-6 border border-[#BDBEBF] rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Gerenciar Armazéns
        </h3>
        <div className="flex mb-4">
          <input
            type="text"
            value={newWarehouseName}
            onChange={(e) => setNewWarehouseName(e.target.value)}
            placeholder="Novo armazém"
            className="flex-grow p-2 border border-[#BDBEBF] rounded-l-md"
          />
          <button
            onClick={() =>
              handleAddItem(
                "warehouses",
                newWarehouseName,
                setNewWarehouseName,
                "Armazém adicionado."
              )
            }
            className="bg-[#03A678] text-white px-4 rounded-r-md font-semibold"
          >
            Adicionar
          </button>
        </div>
        <ul className="space-y-2 max-h-40 overflow-y-auto">
          {warehouses.map((item) => (
            <li
              key={item.id}
              className="flex justify-between items-center p-2 bg-[#F2F2F2] rounded-md"
            >
              <span>{item.name}</span>
              <button
                onClick={() =>
                  handleDeleteItem("warehouses", item.id, item.name)
                }
                className="text-[#FF3A33]"
              >
                <Trash2 size={16} />
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="p-6 border border-dashed border-red-400 rounded-lg shadow-sm">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Ferramentas de Desenvolvedor
        </h3>
        <button
          onClick={addTestData}
          disabled={testDataAdded}
          className="bg-red-500 text-white px-4 py-2 rounded-md font-semibold flex items-center gap-2 hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          <TestTube2 size={16} /> Adicionar Dados de Teste
        </button>
        <p className="text-xs text-gray-500 mt-2">
          Este botão adicionará 10 agendamentos, 3 clientes e 3 fornecedores
          para teste. Use com cuidado. O botão será desativado após o primeiro
          uso para evitar duplicatas.
        </p>
      </div>
      <div className="text-center mt-8 border-t pt-8">
        <button
          onClick={handleLogout}
          className="px-6 py-2 bg-red-600 text-white rounded-md font-semibold hover:bg-red-700"
        >
          Sair do Sistema
        </button>
      </div>
    </div>
  );
}

export default App;
