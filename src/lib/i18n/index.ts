type NestedKeyOf<T> = T extends Record<string, unknown> ? {
  [K in keyof T & string]: T[K] extends Record<string, unknown>
    ? `${K}.${NestedKeyOf<T[K]>}`
    : K
}[keyof T & string] : never;

const en = {
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    create: "Create",
    search: "Search",
    loading: "Loading...",
    noResults: "No results found",
    confirm: "Confirm",
    back: "Back",
    next: "Next",
    done: "Done",
  },
  nav: {
    dashboard: "Dashboard",
    orders: "Orders",
    kds: "Kitchen Display",
    tables: "Tables",
    menu: "Menu",
    payments: "Payments",
    inventory: "Inventory",
    employees: "Employees",
    customers: "Customers",
    reports: "Reports",
    reservations: "Reservations",
    settings: "Settings",
  },
  dashboard: {
    title: "Dashboard",
    todayRevenue: "Today's Revenue",
    ordersToday: "Orders Today",
    activeTables: "Active Tables",
    avgPrepTime: "Avg. Prep Time",
    revenueOverview: "Revenue Overview",
    orderStatus: "Order Status",
    peakHours: "Peak Hours",
    topSelling: "Top Selling Items",
    recentOrders: "Recent Orders",
  },
  kds: {
    title: "Kitchen Display",
    new: "New",
    preparing: "Preparing",
    ready: "Ready",
    delayed: "Delayed",
    acceptStart: "Accept & Start",
    markReady: "Mark Ready",
    delay: "Delay",
    resume: "Resume",
    completed: "Completed",
  },
  orders: {
    title: "Orders",
    newOrder: "New Order",
    allOrders: "All Orders",
    active: "Active",
    ready: "Ready",
    completed: "Completed",
  },
  tables: {
    title: "Table Management",
    addTable: "Add Table",
    available: "Available",
    occupied: "Occupied",
    reserved: "Reserved",
    cleaning: "Cleaning",
    waitingBill: "Waiting Bill",
  },
  menu: {
    title: "Menu Management",
    addItem: "Add Item",
    addCategory: "Add Category",
    items: "Menu Items",
    categories: "Categories",
    featured: "Featured",
    unavailable: "Unavailable",
  },
  payments: {
    title: "Payments",
    todayRevenue: "Today's Revenue",
    cardPayments: "Card Payments",
    totalTips: "Total Tips",
    refunds: "Refunds",
    print: "Print",
    email: "Email",
  },
  inventory: {
    title: "Inventory Management",
    addItem: "Add Item",
    totalItems: "Total Items",
    lowStock: "Low Stock",
    totalValue: "Total Value",
    restock: "Restock",
  },
  employees: {
    title: "Employees",
    addEmployee: "Add Employee",
    total: "Total Employees",
    active: "Active Now",
    inactive: "Inactive",
  },
  customers: {
    title: "Customers",
    addCustomer: "Add Customer",
    visits: "Visits",
    total: "Total",
    points: "Points",
  },
  reports: {
    title: "Reports & Analytics",
    financial: "Financial",
    sales: "Sales",
    inventory: "Inventory",
    employees: "Employees",
    exportCSV: "Export CSV",
    exportPDF: "Export PDF",
  },
  reservations: {
    title: "Reservations",
    newReservation: "New Reservation",
    confirmed: "Confirmed",
    pending: "Pending",
    seated: "Seated",
  },
};

const es: typeof en = {
  common: {
    save: "Guardar",
    cancel: "Cancelar",
    delete: "Eliminar",
    edit: "Editar",
    create: "Crear",
    search: "Buscar",
    loading: "Cargando...",
    noResults: "Sin resultados",
    confirm: "Confirmar",
    back: "Volver",
    next: "Siguiente",
    done: "Hecho",
  },
  nav: {
    dashboard: "Panel",
    orders: "Pedidos",
    kds: "Cocina",
    tables: "Mesas",
    menu: "Menú",
    payments: "Pagos",
    inventory: "Inventario",
    employees: "Empleados",
    customers: "Clientes",
    reports: "Reportes",
    reservations: "Reservas",
    settings: "Configuración",
  },
  dashboard: {
    title: "Panel",
    todayRevenue: "Ingresos Hoy",
    ordersToday: "Pedidos Hoy",
    activeTables: "Mesas Activas",
    avgPrepTime: "Tiempo Promedio",
    revenueOverview: "Resumen de Ingresos",
    orderStatus: "Estado de Pedidos",
    peakHours: "Horas Pico",
    topSelling: "Más Vendidos",
    recentOrders: "Pedidos Recientes",
  },
  kds: {
    title: "Pantalla de Cocina",
    new: "Nuevo",
    preparing: "Preparando",
    ready: "Listo",
    delayed: "Retrasado",
    acceptStart: "Aceptar",
    markReady: "Listo",
    delay: "Retrasar",
    resume: "Reanudar",
    completed: "Completado",
  },
  orders: {
    title: "Pedidos",
    newOrder: "Nuevo Pedido",
    allOrders: "Todos",
    active: "Activos",
    ready: "Listos",
    completed: "Completados",
  },
  tables: {
    title: "Gestión de Mesas",
    addTable: "Agregar Mesa",
    available: "Disponible",
    occupied: "Ocupada",
    reserved: "Reservada",
    cleaning: "Limpieza",
    waitingBill: "Esperando Cuenta",
  },
  menu: {
    title: "Gestión de Menú",
    addItem: "Agregar Item",
    addCategory: "Agregar Categoría",
    items: "Items",
    categories: "Categorías",
    featured: "Destacado",
    unavailable: "No Disponible",
  },
  payments: {
    title: "Pagos",
    todayRevenue: "Ingresos Hoy",
    cardPayments: "Pagos Tarjeta",
    totalTips: "Propinas",
    refunds: "Reembolsos",
    print: "Imprimir",
    email: "Correo",
  },
  inventory: {
    title: "Gestión de Inventario",
    addItem: "Agregar Item",
    totalItems: "Total Items",
    lowStock: "Stock Bajo",
    totalValue: "Valor Total",
    restock: "Reabastecer",
  },
  employees: {
    title: "Empleados",
    addEmployee: "Agregar Empleado",
    total: "Total",
    active: "Activos",
    inactive: "Inactivos",
  },
  customers: {
    title: "Clientes",
    addCustomer: "Agregar Cliente",
    visits: "Visitas",
    total: "Total",
    points: "Puntos",
  },
  reports: {
    title: "Reportes",
    financial: "Financiero",
    sales: "Ventas",
    inventory: "Inventario",
    employees: "Empleados",
    exportCSV: "Exportar CSV",
    exportPDF: "Exportar PDF",
  },
  reservations: {
    title: "Reservas",
    newReservation: "Nueva Reserva",
    confirmed: "Confirmada",
    pending: "Pendiente",
    seated: "Sentada",
  },
};

const fr: typeof en = {
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    create: "Créer",
    search: "Rechercher",
    loading: "Chargement...",
    noResults: "Aucun résultat",
    confirm: "Confirmer",
    back: "Retour",
    next: "Suivant",
    done: "Terminé",
  },
  nav: {
    dashboard: "Tableau de bord",
    orders: "Commandes",
    kds: "Cuisine",
    tables: "Tables",
    menu: "Menu",
    payments: "Paiements",
    inventory: "Inventaire",
    employees: "Employés",
    customers: "Clients",
    reports: "Rapports",
    reservations: "Réservations",
    settings: "Paramètres",
  },
  dashboard: {
    title: "Tableau de bord",
    todayRevenue: "Revenus Aujourd'hui",
    ordersToday: "Commandes Aujourd'hui",
    activeTables: "Tables Actives",
    avgPrepTime: "Temps Moyen",
    revenueOverview: "Aperçu des Revenus",
    orderStatus: "Statut des Commandes",
    peakHours: "Heures de Pointe",
    topSelling: "Meilleures Ventes",
    recentOrders: "Commandes Récentes",
  },
  kds: {
    title: "Écran de Cuisine",
    new: "Nouveau",
    preparing: "Préparation",
    ready: "Prêt",
    delayed: "Retardé",
    acceptStart: "Accepter",
    markReady: "Prêt",
    delay: "Retarder",
    resume: "Reprendre",
    completed: "Terminé",
  },
  orders: {
    title: "Commandes",
    newOrder: "Nouvelle Commande",
    allOrders: "Toutes",
    active: "Actives",
    ready: "Prêtes",
    completed: "Terminées",
  },
  tables: {
    title: "Gestion des Tables",
    addTable: "Ajouter Table",
    available: "Disponible",
    occupied: "Occupée",
    reserved: "Réservée",
    cleaning: "Nettoyage",
    waitingBill: "Attente Facture",
  },
  menu: {
    title: "Gestion du Menu",
    addItem: "Ajouter un Article",
    addCategory: "Ajouter une Catégorie",
    items: "Articles",
    categories: "Catégories",
    featured: "En Vedette",
    unavailable: "Indisponible",
  },
  payments: {
    title: "Paiements",
    todayRevenue: "Revenus Aujourd'hui",
    cardPayments: "Paiements par Carte",
    totalTips: "Pourboires",
    refunds: "Remboursements",
    print: "Imprimer",
    email: "E-mail",
  },
  inventory: {
    title: "Gestion des Stocks",
    addItem: "Ajouter un Article",
    totalItems: "Total Articles",
    lowStock: "Stock Faible",
    totalValue: "Valeur Totale",
    restock: "Réapprovisionner",
  },
  employees: {
    title: "Employés",
    addEmployee: "Ajouter Employé",
    total: "Total",
    active: "Actifs",
    inactive: "Inactifs",
  },
  customers: {
    title: "Clients",
    addCustomer: "Ajouter Client",
    visits: "Visites",
    total: "Total",
    points: "Points",
  },
  reports: {
    title: "Rapports",
    financial: "Financier",
    sales: "Ventes",
    inventory: "Inventaire",
    employees: "Employés",
    exportCSV: "Exporter CSV",
    exportPDF: "Exporter PDF",
  },
  reservations: {
    title: "Réservations",
    newReservation: "Nouvelle Réservation",
    confirmed: "Confirmée",
    pending: "En Attente",
    seated: "Installée",
  },
};

const locales = { en, es, fr } as const;

type Locale = keyof typeof locales;
type TranslationKeys = NestedKeyOf<typeof en>;

let currentLocale: Locale = "en";

export function setLocale(locale: Locale) {
  currentLocale = locale;
  if (typeof window !== "undefined") {
    localStorage.setItem("restaurant-locale", locale);
    window.dispatchEvent(new Event("localechange"));
  }
}

export function getLocale(): Locale {
  return currentLocale;
}

export function initLocale(): Locale {
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("restaurant-locale") as Locale | null;
    if (stored && stored in locales) {
      currentLocale = stored;
      return stored;
    }
    const browser = (navigator.language || "en").split("-")[0] as Locale;
    if (browser in locales) {
      currentLocale = browser;
    }
  }
  return currentLocale;
}

export function t(key: TranslationKeys): string {
  const keys = key.split(".");
  let value: Record<string, unknown> | string = locales[currentLocale];
  for (const k of keys) {
    if (typeof value === "object" && value !== null && k in value) {
      value = value[k as keyof typeof value] as Record<string, unknown> | string;
    } else {
      return key;
    }
  }
  return typeof value === "string" ? value : key;
}

export function useTranslation() {
  return { t, setLocale, getLocale, currentLocale, locales: Object.keys(locales) };
}
