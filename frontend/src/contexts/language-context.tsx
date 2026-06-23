"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Lang = "es" | "en" | "ru" | "he";

const LANG_STORAGE_KEY = "leakguard_lang";

function isLang(value: string | null): value is Lang {
  return value === "es" || value === "en" || value === "ru" || value === "he";
}

function readStoredLang(): Lang {
  if (typeof window === "undefined") return "es";
  const stored = localStorage.getItem(LANG_STORAGE_KEY);
  return isLang(stored) ? stored : "es";
}

function applyDocumentLang(l: Lang) {
  if (typeof document === "undefined") return;
  document.documentElement.dir = LANG_META[l].dir;
  document.documentElement.lang = l;
}

export const LANG_META: Record<Lang, { flag: string; label: string; dir: "ltr" | "rtl" }> = {
  es: { flag: "ES", label: "Español", dir: "ltr" },
  en: { flag: "EN", label: "English", dir: "ltr" },
  ru: { flag: "RU", label: "Русский", dir: "ltr" },
  he: { flag: "HE", label: "עברית", dir: "rtl" },
};

export type Translations = {
  // Navigation
  nav_dashboard: string;
  nav_exposure: string;
  nav_admin: string;
  nav_ai_safety: string;
  nav_resources: string;
  nav_logout: string;
  // OSINT Resources Page
  resources_title: string;
  resources_subtitle: string;
  resources_search_placeholder: string;
  category_all: string;
  category_breach_engines: string;
  category_threat_actors: string;
  category_threat_maps: string;
  category_description_breach: string;
  category_description_actors: string;
  category_description_maps: string;
  no_resources_found: string;
  // Landing
  landing_login_btn: string;
  landing_hero_badge: string;
  landing_hero_title: string;
  landing_hero_sub1: string;
  landing_hero_sub2: string;
  landing_access_btn: string;
  landing_demo_btn: string;
  landing_stats_breaches: string;
  landing_stats_countries: string;
  landing_stats_sources: string;
  landing_stats_alerts: string;
  landing_features_title: string;
  feat_exposure_title: string;
  feat_exposure_desc: string;
  feat_creds_title: string;
  feat_creds_desc: string;
  feat_ai_title: string;
  feat_ai_desc: string;
  feat_map_title: string;
  feat_map_desc: string;
  feat_monitor_title: string;
  feat_monitor_desc: string;
  feat_admin_title: string;
  feat_admin_desc: string;
  landing_rec_title: string;
  landing_rec_subtitle: string;
  rec_1_title: string;
  rec_1_desc: string;
  rec_2_title: string;
  rec_2_desc: string;
  rec_3_title: string;
  rec_3_desc: string;
  rec_4_title: string;
  rec_4_desc: string;
  rec_5_title: string;
  rec_5_desc: string;
  landing_sources_title: string;
  landing_sources_subtitle: string;
  landing_cta_title: string;
  landing_cta_subtitle: string;
  landing_footer_platform: string;
  landing_footer_security: string;
  landing_footer_social: string;
  landing_price_free: string;
  landing_footer_copyright: string;
  // Login
  login_title: string;
  login_tab: string;
  register_tab: string;
  name_placeholder: string;
  email_placeholder: string;
  password_placeholder: string;
  login_btn: string;
  register_btn: string;
  demo_btn: string;
  back_home: string;
  auth_error: string;
  // Dashboard
  dashboard_title: string;
  kpi_threats_today: string;
  kpi_critical: string;
  kpi_verified: string;
  kpi_pending: string;
  kpi_actors: string;
  kpi_sectors: string;
  map_title: string;
  feed_title: string;
  col_date: string;
  col_actor: string;
  col_victim: string;
  col_sector: string;
  col_risk: string;
  col_conf: string;
  col_status: string;
  col_verif: string;
  cracked_title: string;
  col_thread: string;
  col_author: string;
  col_published: string;
  col_replies: string;
  col_views: string;
  hackread_title: string;
  col_article: string;
  col_category: string;
  col_country: string;
  consulted_title: string;
  consulted_clear: string;
  darkweb_title: string;
  recent_breaches_title: string;
  no_consulted: string;
  no_index: string;
  loading_threads: string;
  loading_news: string;
  showing: string;
  of: string;
  threads: string;
  articles: string;
  prev_btn: string;
  next_btn: string;
  page_of: string;
  // Filters
  filter_country: string;
  filter_sector: string;
  filter_status: string;
  all_countries: string;
  all_sectors: string;
  all_statuses: string;
  clear_filters: string;
  results_count: string;
  // Charts
  chart_sectors: string;
  chart_verification: string;
  chart_alerts_label: string;
  // Intel Sources
  intel_sources_title: string;
  intel_sources_subtitle: string;
  source_status_live: string;
  source_status_configured: string;
  source_status_public: string;
  // Security Tips
  tips_title: string;
  tips_subtitle: string;
  tip_2fa_title: string;
  tip_2fa_desc: string;
  tip_pwd_title: string;
  tip_pwd_desc: string;
  tip_monitor_title: string;
  tip_monitor_desc: string;
  tip_phishing_title: string;
  tip_phishing_desc: string;
  tip_update_title: string;
  tip_update_desc: string;
  // Exposure
  exposure_title: string;
  exposure_subtitle: string;
  mode_domain: string;
  mode_email: string;
  mode_phone: string;
  ph_domain: string;
  ph_email: string;
  ph_phone: string;
  scan_btn: string;
  scanning_btn: string;
  risk_label: string;
  indexed_logins: string;
  db_hits: string;
  plaintext_pwd: string;
  records_label: string;
  col_source: string;
  col_login: string;
  col_credential: string;
  col_severity: string;
  // AI Safety
  ai_title: string;
  ai_verif_rate: string;
  ai_false_positive: string;
  ai_confidence: string;
  ai_card_title: string;
  ai_desc: string;
  ai_run_btn: string;
  ai_running_btn: string;
  // Admin
  admin_title: string;
  admin_queue_title: string;
  admin_audits_title: string;
  admin_pending: string;
  admin_verified: string;
  admin_rejected: string;
  admin_verify_btn: string;
  admin_reject_btn: string;
  admin_reason_placeholder: string;
  // Map popup
  map_victim: string;
  map_date: string;
  map_risk: string;
  // Darkweb
  darkweb_forum: string;
  darkweb_indicator: string;
  // No results
  no_results_filter: string;
  footer_terms: string;
  login_accept_terms_prefix: string;
  login_accept_terms_link: string;
};

const translations: Record<Lang, Translations> = {
  es: {
    nav_dashboard: "Panel",
    nav_exposure: "Verificar Exposición",
    nav_admin: "Administración",
    nav_ai_safety: "Seguridad IA",
    nav_logout: "Cerrar sesión",
    nav_resources: "Fuentes OSINT",
    resources_title: "Hub de Recursos OSINT",
    resources_subtitle: "Buscadores de filtraciones, mapas de ciberamenazas en vivo y bases de datos de actores de amenazas",
    resources_search_placeholder: "Buscar herramientas o descripciones...",
    category_all: "Todos",
    category_breach_engines: "Buscadores de Filtraciones",
    category_threat_actors: "Actores de Amenazas",
    category_threat_maps: "Mapas de Amenazas",
    category_description_breach: "Herramientas para verificar si tus credenciales o datos personales han sido comprometidos.",
    category_description_actors: "Bases de datos y enciclopedias sobre grupos APT, ciberdelincuentes y sus tácticas.",
    category_description_maps: "Visualización en tiempo real de ciberataques, tráfico malicioso y alertas a nivel global.",
    no_resources_found: "No se encontraron recursos con los criterios de búsqueda.",
    landing_login_btn: "Ingresar",
    landing_hero_badge: "Monitoreo en tiempo real activo",
    landing_hero_title: "Protege tu información antes de que sea demasiado tarde",
    landing_hero_sub1: "Detectamos filtraciones de datos, credenciales expuestas y amenazas cibernéticas que afectan a personas y organizaciones en Latinoamérica.",
    landing_hero_sub2: "Consulta si tu email, dominio o número de teléfono ha sido comprometido.",
    landing_access_btn: "Ver el Panel de Amenazas",
    landing_demo_btn: "Probar sin registro",
    landing_stats_breaches: "registros filtrados detectados",
    landing_stats_countries: "países monitoreados",
    landing_stats_sources: "fuentes de inteligencia",
    landing_stats_alerts: "alertas esta semana",
    landing_features_title: "Todo lo que necesitas para protegerte",
    feat_exposure_title: "Verifica tu Exposición",
    feat_exposure_desc: "Ingresa tu email, dominio o teléfono y descubre si tus datos aparecen en filtraciones conocidas. Usamos proxy seguro para que tu información nunca quede expuesta.",
    feat_creds_title: "Credenciales Censuradas",
    feat_creds_desc: "Las contraseñas encontradas se muestran parcialmente ocultas con un índice de riesgo calculado. Nunca almacenamos ni mostramos contraseñas completas.",
    feat_ai_title: "Análisis con Inteligencia Artificial",
    feat_ai_desc: "Nuestro motor IA analiza incidentes y genera resúmenes comprensibles, recomendaciones de acción y estimaciones de impacto para cada amenaza detectada.",
    feat_map_title: "Mapa de Filtraciones LATAM",
    feat_map_desc: "Visualiza en tiempo real las filtraciones y ciberataques que afectan a Argentina, Chile, Bolivia, Brasil, Colombia, México y más países de la región.",
    feat_monitor_title: "Monitor Dark Web",
    feat_monitor_desc: "Rastreamos foros clandestinos, canales de Telegram y sitios de fuga para detectar menciones tempranas de organizaciones o datos sensibles.",
    feat_admin_title: "Verificación Humana",
    feat_admin_desc: "Cada amenaza pasa por un proceso de validación con revisión humana antes de publicarse, garantizando la precisión y confiabilidad de la información.",
    landing_rec_title: "¿Cómo protegerte?",
    landing_rec_subtitle: "Recomendaciones de seguridad para personas y organizaciones",
    rec_1_title: "Activa la autenticación en dos pasos",
    rec_1_desc: "El 2FA bloquea el 99% de los accesos no autorizados aunque tu contraseña haya sido filtrada. Úsalo en email, banco y redes sociales.",
    rec_2_title: "Usa contraseñas únicas y largas",
    rec_2_desc: "Nunca repitas la misma contraseña en distintos servicios. Usa un gestor de contraseñas como Bitwarden o 1Password (son gratuitos).",
    rec_3_title: "Verifica si tu email fue filtrado",
    rec_3_desc: "Consulta regularmente si tu correo electrónico apareció en alguna filtración. Si es así, cambia esa contraseña inmediatamente.",
    rec_4_title: "Desconfía de links y correos sospechosos",
    rec_4_desc: "El phishing es el vector de ataque más común. Nunca hagas clic en links de correos inesperados, aunque parezcan legítimos.",
    rec_5_title: "Actualiza siempre tus dispositivos",
    rec_5_desc: "Las actualizaciones de seguridad corrigen vulnerabilidades conocidas. Mantén actualizado tu teléfono, computadora y router.",
    landing_sources_title: "Fuentes de inteligencia integradas",
    landing_sources_subtitle: "Consultamos múltiples bases de datos especializadas para darte la información más completa",
    landing_cta_title: "¿Tu información está segura?",
    landing_cta_subtitle: "Descúbrelo ahora. Gratis. Sin registro.",
    landing_footer_platform: "Plataforma",
    landing_footer_security: "Seguridad",
    landing_footer_social: "Redes",
    landing_price_free: "/gratis",
    landing_footer_copyright: "LeakGuard © 2026 — Inteligencia de amenazas y OSINT",
    login_title: "Acceso a LeakGuard",
    login_tab: "Iniciar sesión",
    register_tab: "Registrarse",
    name_placeholder: "Nombre completo",
    email_placeholder: "Correo electrónico",
    password_placeholder: "Contraseña",
    login_btn: "Ingresar",
    register_btn: "Crear cuenta",
    demo_btn: "Acceso demo (sin registro)",
    back_home: "← Volver al inicio",
    auth_error: "Error de autenticación",
    dashboard_title: "Panel de Inteligencia de Amenazas",
    kpi_threats_today: "Amenazas hoy",
    kpi_critical: "Críticas",
    kpi_verified: "Verificadas",
    kpi_pending: "Pendientes",
    kpi_actors: "Actores",
    kpi_sectors: "Sectores",
    map_title: "Mapa de filtraciones — Latinoamérica",
    feed_title: "Feed de amenazas",
    col_date: "Fecha",
    col_actor: "Actor",
    col_victim: "Víctima",
    col_sector: "Sector",
    col_risk: "Riesgo",
    col_conf: "Confianza",
    col_status: "Estado",
    col_verif: "Verificación",
    cracked_title: "Monitor en Vivo: Foro Cracked",
    col_thread: "Título del hilo",
    col_author: "Autor",
    col_published: "Publicado",
    col_replies: "Respuestas",
    col_views: "Vistas",
    hackread_title: "Monitor en Vivo: Hackread News",
    col_article: "Artículo",
    col_category: "Categoría",
    col_country: "País",
    consulted_title: "Consultas realizadas",
    consulted_clear: "Limpiar",
    darkweb_title: "Dark Web / Foros clandestinos",
    recent_breaches_title: "Filtraciones públicas recientes",
    no_consulted: "Aún no realizaste consultas.",
    no_index: "Índice no disponible.",
    loading_threads: "Cargando hilos del foro...",
    loading_news: "Cargando noticias de seguridad...",
    showing: "Mostrando",
    of: "de",
    threads: "hilos",
    articles: "artículos",
    prev_btn: "Anterior",
    next_btn: "Siguiente",
    page_of: "Pág.",
    filter_country: "Filtrar por país",
    filter_sector: "Filtrar por sector",
    filter_status: "Filtrar por estado",
    all_countries: "Todos los países",
    all_sectors: "Todos los sectores",
    all_statuses: "Todos los estados",
    clear_filters: "Limpiar filtros",
    results_count: "resultado(s) encontrado(s)",
    chart_sectors: "Sectores afectados",
    chart_verification: "Estado de verificación",
    chart_alerts_label: "Alertas",
    intel_sources_title: "Fuentes de inteligencia activas",
    intel_sources_subtitle: "Datos consultados en tiempo real desde múltiples proveedores especializados",
    source_status_live: "En vivo",
    source_status_configured: "Configurado",
    source_status_public: "Público",
    tips_title: "Recomendaciones de seguridad",
    tips_subtitle: "Acciones que puedes tomar ahora mismo para protegerte",
    tip_2fa_title: "Activa el 2FA",
    tip_2fa_desc: "Habilita autenticación en dos pasos en todos tus servicios importantes.",
    tip_pwd_title: "Contraseñas únicas",
    tip_pwd_desc: "No reutilices contraseñas. Usa un gestor como Bitwarden (gratis).",
    tip_monitor_title: "Monitorea tu email",
    tip_monitor_desc: "Usa esta herramienta regularmente para detectar si tus datos fueron filtrados.",
    tip_phishing_title: "Cuidado con el phishing",
    tip_phishing_desc: "No hagas clic en links de emails inesperados aunque parezcan legítimos.",
    tip_update_title: "Actualiza todo",
    tip_update_desc: "Mantén tu sistema operativo, apps y router siempre actualizados.",
    exposure_title: "Verificación de Exposición",
    exposure_subtitle: "Consulta segura a través de proxy — tu token OSINT nunca queda expuesto.",
    mode_domain: "Dominio",
    mode_email: "Email",
    mode_phone: "Teléfono",
    ph_domain: "Dominio (ej. policia.bo)",
    ph_email: "Correo (ej. analista@empresa.com)",
    ph_phone: "Teléfono (ej. +59171234567)",
    scan_btn: "Escanear",
    scanning_btn: "Escaneando...",
    risk_label: "Riesgo",
    indexed_logins: "Logins indexados",
    db_hits: "Bases de datos con coincidencias",
    plaintext_pwd: "Contraseñas en texto claro",
    records_label: "Registros encontrados",
    col_source: "Fuente",
    col_login: "Login",
    col_credential: "Credencial",
    col_severity: "Severidad",
    ai_title: "Seguridad IA & Pipeline RAG",
    ai_verif_rate: "Tasa de verificación",
    ai_false_positive: "Falsos positivos",
    ai_confidence: "Confianza promedio",
    ai_card_title: "Análisis con Gemini 2.5 Flash + FAISS",
    ai_desc: "RAG local con FAISS para contexto sin conexión. Sin clave OPENAI_API_KEY funciona en modo offline.",
    ai_run_btn: "Ejecutar análisis de muestra",
    ai_running_btn: "Analizando...",
    admin_title: "Panel de Administración",
    admin_queue_title: "Cola de verificación",
    admin_audits_title: "Registro de auditoría",
    admin_pending: "Pendientes",
    admin_verified: "Verificadas",
    admin_rejected: "Rechazadas",
    admin_verify_btn: "Verificar",
    admin_reject_btn: "Rechazar",
    admin_reason_placeholder: "Motivo de la decisión...",
    map_victim: "Víctima",
    map_date: "Fecha",
    map_risk: "Riesgo",
    darkweb_forum: "Foro",
    darkweb_indicator: "Indicador",
    no_results_filter: "No hay resultados con los filtros aplicados.",
    footer_terms: "Términos y Condiciones",
    login_accept_terms_prefix: "Acepto los ",
    login_accept_terms_link: "términos y condiciones",
  },

  en: {
    nav_dashboard: "Dashboard",
    nav_exposure: "Exposure Check",
    nav_admin: "Admin",
    nav_ai_safety: "AI Safety",
    nav_logout: "Logout",
    nav_resources: "OSINT Sources",
    resources_title: "OSINT Resources Hub",
    resources_subtitle: "Breach search engines, live cyber threat maps, and threat actor databases",
    resources_search_placeholder: "Search tools or descriptions...",
    category_all: "All",
    category_breach_engines: "Breach Search Engines",
    category_threat_actors: "Threat Actor Search",
    category_threat_maps: "Threat Maps",
    category_description_breach: "Tools to check if your credentials or personal data have been compromised.",
    category_description_actors: "Databases and encyclopedias regarding APT groups, cybercriminals, and their tactics.",
    category_description_maps: "Real-time visualization of cyberattacks, malicious traffic, and global alerts.",
    no_resources_found: "No resources found matching the search criteria.",
    landing_login_btn: "Login",
    landing_hero_badge: "Real-time monitoring active",
    landing_hero_title: "Protect your data before it's too late",
    landing_hero_sub1: "We detect data breaches, exposed credentials and cyber threats affecting individuals and organizations across Latin America.",
    landing_hero_sub2: "Check if your email, domain or phone number has been compromised.",
    landing_access_btn: "View Threat Dashboard",
    landing_demo_btn: "Try without registration",
    landing_stats_breaches: "leaked records detected",
    landing_stats_countries: "countries monitored",
    landing_stats_sources: "intelligence sources",
    landing_stats_alerts: "alerts this week",
    landing_features_title: "Everything you need to stay protected",
    feat_exposure_title: "Exposure Check",
    feat_exposure_desc: "Enter your email, domain or phone and discover if your data appears in known breaches. Secure proxy — your data is never exposed.",
    feat_creds_title: "Censored Credentials",
    feat_creds_desc: "Found passwords are partially hidden with a calculated risk index. We never store or show full passwords.",
    feat_ai_title: "AI-Powered Analysis",
    feat_ai_desc: "Our AI engine analyzes incidents and generates understandable summaries, action recommendations and impact estimates for each detected threat.",
    feat_map_title: "LATAM Breach Map",
    feat_map_desc: "Visualize in real time breaches and cyberattacks affecting Argentina, Chile, Bolivia, Brazil, Colombia, Mexico and more.",
    feat_monitor_title: "Dark Web Monitor",
    feat_monitor_desc: "We track underground forums, Telegram channels and leak sites to detect early mentions of organizations or sensitive data.",
    feat_admin_title: "Human Verification",
    feat_admin_desc: "Every threat goes through a human validation process before being published, ensuring accuracy and reliability.",
    landing_rec_title: "How to protect yourself?",
    landing_rec_subtitle: "Security recommendations for individuals and organizations",
    rec_1_title: "Enable two-factor authentication",
    rec_1_desc: "2FA blocks 99% of unauthorized access even if your password was leaked. Use it on email, banking and social media.",
    rec_2_title: "Use unique, strong passwords",
    rec_2_desc: "Never reuse the same password across services. Use a password manager like Bitwarden or 1Password (free options available).",
    rec_3_title: "Check if your email was leaked",
    rec_3_desc: "Regularly check if your email appeared in a data breach. If so, change that password immediately.",
    rec_4_title: "Beware of phishing",
    rec_4_desc: "Phishing is the most common attack vector. Never click links in unexpected emails, even if they look legitimate.",
    rec_5_title: "Always update your devices",
    rec_5_desc: "Security updates fix known vulnerabilities. Keep your phone, computer and router up to date.",
    landing_sources_title: "Integrated intelligence sources",
    landing_sources_subtitle: "We query multiple specialized databases to give you the most complete information",
    landing_cta_title: "Is your information safe?",
    landing_cta_subtitle: "Find out now. Free. No registration.",
    landing_footer_platform: "Platform",
    landing_footer_security: "Security",
    landing_footer_social: "Social",
    landing_price_free: "/free",
    landing_footer_copyright: "LeakGuard © 2026 — Threat Intelligence & OSINT",
    login_title: "LeakGuard Access",
    login_tab: "Login",
    register_tab: "Register",
    name_placeholder: "Full name",
    email_placeholder: "Email address",
    password_placeholder: "Password",
    login_btn: "Sign In",
    register_btn: "Create Account",
    demo_btn: "Demo access (no registration)",
    back_home: "← Back to home",
    auth_error: "Authentication error",
    dashboard_title: "Threat Intelligence Dashboard",
    kpi_threats_today: "Threats today",
    kpi_critical: "Critical",
    kpi_verified: "Verified",
    kpi_pending: "Pending",
    kpi_actors: "Actors",
    kpi_sectors: "Sectors",
    map_title: "Breach Map — Latin America",
    feed_title: "Threat Feed",
    col_date: "Date",
    col_actor: "Actor",
    col_victim: "Victim",
    col_sector: "Sector",
    col_risk: "Risk",
    col_conf: "Confidence",
    col_status: "Status",
    col_verif: "Verification",
    cracked_title: "Live Monitor: Cracked Forum",
    col_thread: "Thread Title",
    col_author: "Author",
    col_published: "Published",
    col_replies: "Replies",
    col_views: "Views",
    hackread_title: "Live Monitor: Hackread News",
    col_article: "Article",
    col_category: "Category",
    col_country: "Country",
    consulted_title: "Queries Made",
    consulted_clear: "Clear",
    darkweb_title: "Dark Web / Underground Forums",
    recent_breaches_title: "Recent Public Breaches",
    no_consulted: "No queries made yet.",
    no_index: "Index unavailable.",
    loading_threads: "Loading forum threads...",
    loading_news: "Loading security news...",
    showing: "Showing",
    of: "of",
    threads: "threads",
    articles: "articles",
    prev_btn: "Previous",
    next_btn: "Next",
    page_of: "Page",
    filter_country: "Filter by country",
    filter_sector: "Filter by sector",
    filter_status: "Filter by status",
    all_countries: "All countries",
    all_sectors: "All sectors",
    all_statuses: "All statuses",
    clear_filters: "Clear filters",
    results_count: "result(s) found",
    chart_sectors: "Affected sectors",
    chart_verification: "Verification status",
    chart_alerts_label: "Alerts",
    intel_sources_title: "Active intelligence sources",
    intel_sources_subtitle: "Data queried in real time from multiple specialized providers",
    source_status_live: "Live",
    source_status_configured: "Configured",
    source_status_public: "Public",
    tips_title: "Security recommendations",
    tips_subtitle: "Actions you can take right now to protect yourself",
    tip_2fa_title: "Enable 2FA",
    tip_2fa_desc: "Enable two-factor authentication on all your important services.",
    tip_pwd_title: "Unique passwords",
    tip_pwd_desc: "Don't reuse passwords. Use a manager like Bitwarden (free).",
    tip_monitor_title: "Monitor your email",
    tip_monitor_desc: "Use this tool regularly to detect if your data was leaked.",
    tip_phishing_title: "Watch out for phishing",
    tip_phishing_desc: "Don't click links in unexpected emails even if they look legitimate.",
    tip_update_title: "Update everything",
    tip_update_desc: "Keep your OS, apps and router always updated.",
    exposure_title: "Exposure Check",
    exposure_subtitle: "Secure proxy query — your OSINT token is never exposed.",
    mode_domain: "Domain",
    mode_email: "Email",
    mode_phone: "Phone",
    ph_domain: "Domain (e.g. police.gov)",
    ph_email: "Email (e.g. analyst@company.com)",
    ph_phone: "Phone (e.g. +59171234567)",
    scan_btn: "Scan",
    scanning_btn: "Scanning...",
    risk_label: "Risk",
    indexed_logins: "Indexed logins",
    db_hits: "Databases with matches",
    plaintext_pwd: "Plaintext passwords",
    records_label: "Records found",
    col_source: "Source",
    col_login: "Login",
    col_credential: "Credential",
    col_severity: "Severity",
    ai_title: "AI Safety & RAG Pipeline",
    ai_verif_rate: "Verification rate",
    ai_false_positive: "False positives",
    ai_confidence: "Average confidence",
    ai_card_title: "Gemini 2.5 Flash + FAISS Analysis",
    ai_desc: "Local RAG with FAISS for offline context. Without OPENAI_API_KEY works in offline mode.",
    ai_run_btn: "Run sample analysis",
    ai_running_btn: "Analyzing...",
    admin_title: "Administration Panel",
    admin_queue_title: "Verification Queue",
    admin_audits_title: "Audit Log",
    admin_pending: "Pending",
    admin_verified: "Verified",
    admin_rejected: "Rejected",
    admin_verify_btn: "Verify",
    admin_reject_btn: "Reject",
    admin_reason_placeholder: "Reason for decision...",
    map_victim: "Victim",
    map_date: "Date",
    map_risk: "Risk",
    darkweb_forum: "Forum",
    darkweb_indicator: "Indicator",
    no_results_filter: "No results with current filters.",
    footer_terms: "Terms & Conditions",
    login_accept_terms_prefix: "I accept the ",
    login_accept_terms_link: "terms and conditions",
  },

  ru: {
    nav_dashboard: "Панель",
    nav_exposure: "Проверка утечек",
    nav_admin: "Администрация",
    nav_ai_safety: "Безопасность ИИ",
    nav_logout: "Выйти",
    nav_resources: "Источники OSINT",
    resources_title: "Центр ресурсов OSINT",
    resources_subtitle: "Поисковые системы утечек, карты киберугроз в реальном времени и базы данных кибергруппировок",
    resources_search_placeholder: "Поиск инструментов или описаний...",
    category_all: "Все",
    category_breach_engines: "Поиск утечек данных",
    category_threat_actors: "Субъекты угроз",
    category_threat_maps: "Карты угроз",
    category_description_breach: "Инструменты для проверки компрометации ваших учётных данных или личных данных.",
    category_description_actors: "Базы данных и энциклопедии о хакерских группировках, киберпреступниках и их тактиках.",
    category_description_maps: "Визуализация кибератак, вредоносного трафика и глобальных предупреждений в реальном времени.",
    no_resources_found: "Инструменты по вашему запросу не найдены.",
    landing_login_btn: "Войти",
    landing_hero_badge: "Мониторинг в реальном времени активен",
    landing_hero_title: "Защитите свои данные, пока не стало слишком поздно",
    landing_hero_sub1: "Мы обнаруживаем утечки данных, скомпрометированные учётные данные и киберугрозы, затрагивающие людей и организации по всей Латинской Америке.",
    landing_hero_sub2: "Проверьте, были ли ваш email, домен или номер телефона скомпрометированы.",
    landing_access_btn: "Открыть панель угроз",
    landing_demo_btn: "Попробовать без регистрации",
    landing_stats_breaches: "обнаруженных утечек записей",
    landing_stats_countries: "стран под мониторингом",
    landing_stats_sources: "источников разведки",
    landing_stats_alerts: "оповещений на этой неделе",
    landing_features_title: "Всё необходимое для вашей защиты",
    feat_exposure_title: "Проверка утечек",
    feat_exposure_desc: "Введите email, домен или телефон и узнайте, есть ли ваши данные в известных утечках. Безопасный прокси — ваши данные никогда не раскрываются.",
    feat_creds_title: "Цензурированные данные",
    feat_creds_desc: "Найденные пароли отображаются частично с расчётным индексом риска. Мы никогда не храним и не показываем полные пароли.",
    feat_ai_title: "Анализ с ИИ",
    feat_ai_desc: "Наш ИИ-движок анализирует инциденты и генерирует понятные сводки, рекомендации по действиям и оценки воздействия.",
    feat_map_title: "Карта утечек LATAM",
    feat_map_desc: "Визуализируйте в реальном времени утечки и кибератаки, затрагивающие Аргентину, Чили, Боливию, Бразилию, Колумбию, Мексику и другие страны.",
    feat_monitor_title: "Мониторинг Тёмной сети",
    feat_monitor_desc: "Мы отслеживаем подпольные форумы, каналы Telegram и сайты утечек для раннего обнаружения упоминаний организаций или конфиденциальных данных.",
    feat_admin_title: "Верификация людьми",
    feat_admin_desc: "Каждая угроза проходит процесс проверки с участием людей перед публикацией, обеспечивая точность и надёжность информации.",
    landing_rec_title: "Как защитить себя?",
    landing_rec_subtitle: "Рекомендации по безопасности для частных лиц и организаций",
    rec_1_title: "Включите двухфакторную аутентификацию",
    rec_1_desc: "2FA блокирует 99% несанкционированных доступов, даже если ваш пароль был скомпрометирован.",
    rec_2_title: "Используйте уникальные пароли",
    rec_2_desc: "Никогда не используйте одинаковые пароли для разных сервисов. Используйте менеджер паролей.",
    rec_3_title: "Проверьте, был ли ваш email скомпрометирован",
    rec_3_desc: "Регулярно проверяйте, появился ли ваш email в утечках. Если да — немедленно смените пароль.",
    rec_4_title: "Берегитесь фишинга",
    rec_4_desc: "Фишинг — самый распространённый вектор атаки. Никогда не нажимайте на ссылки в неожиданных письмах.",
    rec_5_title: "Всегда обновляйте устройства",
    rec_5_desc: "Обновления безопасности устраняют известные уязвимости. Держите телефон, компьютер и роутер обновлёнными.",
    landing_sources_title: "Интегрированные источники разведки",
    landing_sources_subtitle: "Мы запрашиваем несколько специализированных баз данных для наиболее полной информации",
    landing_cta_title: "Ваша информация в безопасности?",
    landing_cta_subtitle: "Узнайте сейчас. Бесплатно. Без регистрации.",
    landing_footer_platform: "Платформа",
    landing_footer_security: "Безопасность",
    landing_footer_social: "Соцсети",
    landing_price_free: "/бесплатно",
    landing_footer_copyright: "LeakGuard © 2026 — Разведка угроз и OSINT",
    login_title: "Доступ к LeakGuard",
    login_tab: "Войти",
    register_tab: "Регистрация",
    name_placeholder: "Полное имя",
    email_placeholder: "Электронная почта",
    password_placeholder: "Пароль",
    login_btn: "Войти",
    register_btn: "Создать аккаунт",
    demo_btn: "Демо-доступ (без регистрации)",
    back_home: "← На главную",
    auth_error: "Ошибка аутентификации",
    dashboard_title: "Панель анализа угроз",
    kpi_threats_today: "Угроз сегодня",
    kpi_critical: "Критические",
    kpi_verified: "Подтверждённые",
    kpi_pending: "Ожидающие",
    kpi_actors: "Актёры",
    kpi_sectors: "Секторы",
    map_title: "Карта утечек — Латинская Америка",
    feed_title: "Лента угроз",
    col_date: "Дата",
    col_actor: "Актёр",
    col_victim: "Жертва",
    col_sector: "Сектор",
    col_risk: "Риск",
    col_conf: "Уверенность",
    col_status: "Статус",
    col_verif: "Верификация",
    cracked_title: "Прямой мониторинг: Cracked Forum",
    col_thread: "Название темы",
    col_author: "Автор",
    col_published: "Опубликовано",
    col_replies: "Ответы",
    col_views: "Просмотры",
    hackread_title: "Прямой мониторинг: Hackread News",
    col_article: "Статья",
    col_category: "Категория",
    col_country: "Страна",
    consulted_title: "Выполненные запросы",
    consulted_clear: "Очистить",
    darkweb_title: "Тёмная сеть / Подпольные форумы",
    recent_breaches_title: "Недавние публичные утечки",
    no_consulted: "Запросов пока нет.",
    no_index: "Индекс недоступен.",
    loading_threads: "Загрузка тем форума...",
    loading_news: "Загрузка новостей о безопасности...",
    showing: "Показано",
    of: "из",
    threads: "тем",
    articles: "статей",
    prev_btn: "Назад",
    next_btn: "Вперёд",
    page_of: "Стр.",
    filter_country: "Фильтр по стране",
    filter_sector: "Фильтр по сектору",
    filter_status: "Фильтр по статусу",
    all_countries: "Все страны",
    all_sectors: "Все секторы",
    all_statuses: "Все статусы",
    clear_filters: "Сбросить фильтры",
    results_count: "результат(ов) найдено",
    chart_sectors: "Затронутые секторы",
    chart_verification: "Статус верификации",
    chart_alerts_label: "Оповещения",
    intel_sources_title: "Активные источники разведки",
    intel_sources_subtitle: "Данные запрашиваются в реальном времени от нескольких специализированных провайдеров",
    source_status_live: "В эфире",
    source_status_configured: "Настроено",
    source_status_public: "Публичный",
    tips_title: "Рекомендации по безопасности",
    tips_subtitle: "Действия, которые вы можете предпринять прямо сейчас",
    tip_2fa_title: "Включите 2FA",
    tip_2fa_desc: "Включите двухфакторную аутентификацию во всех важных сервисах.",
    tip_pwd_title: "Уникальные пароли",
    tip_pwd_desc: "Не используйте одинаковые пароли. Используйте менеджер паролей.",
    tip_monitor_title: "Отслеживайте email",
    tip_monitor_desc: "Регулярно проверяйте, не были ли ваши данные скомпрометированы.",
    tip_phishing_title: "Осторожно с фишингом",
    tip_phishing_desc: "Не нажимайте на ссылки в неожиданных письмах.",
    tip_update_title: "Обновляйте всё",
    tip_update_desc: "Держите ОС, приложения и роутер всегда обновлёнными.",
    exposure_title: "Проверка утечек",
    exposure_subtitle: "Безопасный запрос через прокси — ваш токен OSINT никогда не раскрывается.",
    mode_domain: "Домен",
    mode_email: "Email",
    mode_phone: "Телефон",
    ph_domain: "Домен (напр. policia.bo)",
    ph_email: "Email (напр. analyst@company.com)",
    ph_phone: "Телефон (напр. +59171234567)",
    scan_btn: "Сканировать",
    scanning_btn: "Сканирование...",
    risk_label: "Риск",
    indexed_logins: "Проиндексированных входов",
    db_hits: "Баз данных с совпадениями",
    plaintext_pwd: "Пароли открытым текстом",
    records_label: "Найденных записей",
    col_source: "Источник",
    col_login: "Логин",
    col_credential: "Учётные данные",
    col_severity: "Серьёзность",
    ai_title: "Безопасность ИИ и Pipeline RAG",
    ai_verif_rate: "Уровень верификации",
    ai_false_positive: "Ложные срабатывания",
    ai_confidence: "Средняя уверенность",
    ai_card_title: "Анализ Gemini 2.5 Flash + FAISS",
    ai_desc: "Локальный RAG с FAISS для офлайн-контекста. Без OPENAI_API_KEY работает в офлайн-режиме.",
    ai_run_btn: "Запустить пример анализа",
    ai_running_btn: "Анализируем...",
    admin_title: "Панель администратора",
    admin_queue_title: "Очередь верификации",
    admin_audits_title: "Журнал аудита",
    admin_pending: "Ожидают",
    admin_verified: "Подтверждено",
    admin_rejected: "Отклонено",
    admin_verify_btn: "Подтвердить",
    admin_reject_btn: "Отклонить",
    admin_reason_placeholder: "Причина решения...",
    map_victim: "Жертва",
    map_date: "Дата",
    map_risk: "Риск",
    darkweb_forum: "Форум",
    darkweb_indicator: "Индикатор",
    no_results_filter: "Нет результатов с текущими фильтрами.",
    footer_terms: "Условия использования",
    login_accept_terms_prefix: "Я принимаю ",
    login_accept_terms_link: "условия использования",
  },

  he: {
    nav_dashboard: "לוח בקרה",
    nav_exposure: "בדיקת חשיפה",
    nav_admin: "ניהול",
    nav_ai_safety: "בטיחות בינה מלאכותית",
    nav_logout: "התנתק",
    nav_resources: "מקורות OSINT",
    resources_title: "מרכז משאבי OSINT",
    resources_subtitle: "מנועי חיפוש דליפות מידע, מפות איומי סייבר בזמן אמת ומאגרי מידע על תוקפים",
    resources_search_placeholder: "חפש כלים או תיאורים...",
    category_all: "הכל",
    category_breach_engines: "מנועי חיפוש דליפות",
    category_threat_actors: "חיפוש תוקפי סייבר",
    category_threat_maps: "מפות איומים",
    category_description_breach: "כלים לבדיקה אם אישורי הגישה או המידע האישי שלך נחשפו בדליפות.",
    category_description_actors: "מאגרי מידע ואנציקלופדיות על קבוצות APT, פושעי סייבר והטקטיקות שלהם.",
    category_description_maps: "הצגה בזמן אמת של מתקפות סייבר, תעבורה זדונית והתראות גלובליות.",
    no_resources_found: "לא נמצאו משאבים התואמים את קריטריוני החיפוש.",
    landing_login_btn: "כניסה",
    landing_hero_badge: "ניטור בזמן אמת פעיל",
    landing_hero_title: "הגן על המידע שלך לפני שיהיה מאוחר מדי",
    landing_hero_sub1: "אנו מזהים דליפות מידע, אישורי גישה חשופים ואיומי סייבר המשפיעים על אנשים וארגונים ברחבי אמריקה הלטינית.",
    landing_hero_sub2: "בדוק אם האימייל, הדומיין או מספר הטלפון שלך נפרצו.",
    landing_access_btn: "הצג לוח איומים",
    landing_demo_btn: "נסה ללא הרשמה",
    landing_stats_breaches: "רשומות שדלפו זוהו",
    landing_stats_countries: "מדינות במעקב",
    landing_stats_sources: "מקורות מודיעין",
    landing_stats_alerts: "התראות השבוע",
    landing_features_title: "כל מה שאתה צריך כדי להיות מוגן",
    feat_exposure_title: "בדיקת חשיפה",
    feat_exposure_desc: "הכנס אימייל, דומיין או טלפון וגלה אם המידע שלך מופיע בדליפות ידועות. פרוקסי מאובטח — הנתונים שלך לעולם לא נחשפים.",
    feat_creds_title: "אישורים מצונזרים",
    feat_creds_desc: "סיסמאות שנמצאו מוצגות חלקית עם מדד סיכון מחושב. אנחנו לעולם לא שומרים או מציגים סיסמאות מלאות.",
    feat_ai_title: "ניתוח מבוסס בינה מלאכותית",
    feat_ai_desc: "מנוע הבינה המלאכותית שלנו מנתח אירועים ומייצר סיכומים מובנים, המלצות פעולה ואומדני השפעה.",
    feat_map_title: "מפת דליפות LATAM",
    feat_map_desc: "הצג בזמן אמת דליפות ומתקפות סייבר המשפיעות על ארגנטינה, צ'ילה, בוליביה, ברזיל, קולומביה, מקסיקו ועוד.",
    feat_monitor_title: "ניטור רשת אפלה",
    feat_monitor_desc: "אנו עוקבים אחר פורומים מחתרתיים, ערוצי Telegram ואתרי דליפות לאיתור מוקדם של ציון ארגונים או נתונים רגישים.",
    feat_admin_title: "אימות אנושי",
    feat_admin_desc: "כל איום עובר תהליך אימות אנושי לפני פרסום, המבטיח דיוק ואמינות המידע.",
    landing_rec_title: "איך להגן על עצמך?",
    landing_rec_subtitle: "המלצות אבטחה לאנשים פרטיים וארגונים",
    rec_1_title: "הפעל אימות דו-שלבי",
    rec_1_desc: "2FA חוסם 99% מהגישות הלא מורשות גם אם הסיסמה שלך דלפה. השתמש בו באימייל, בנק ורשתות חברתיות.",
    rec_2_title: "השתמש בסיסמאות ייחודיות",
    rec_2_desc: "לעולם אל תשתמש באותה סיסמה בשירותים שונים. השתמש במנהל סיסמאות כמו Bitwarden (חינמי).",
    rec_3_title: "בדוק אם האימייל שלך דלף",
    rec_3_desc: "בדוק באופן קבוע אם האימייל שלך הופיע בדליפה. אם כן — שנה את הסיסמה מיידית.",
    rec_4_title: "היזהר מדיוג (Phishing)",
    rec_4_desc: "דיוג הוא וקטור התקיפה הנפוץ ביותר. לעולם אל תלחץ על קישורים במיילים לא צפויים.",
    rec_5_title: "תמיד עדכן את המכשירים שלך",
    rec_5_desc: "עדכוני אבטחה מתקנים פגיעויות ידועות. שמור על הטלפון, המחשב והנתב מעודכנים.",
    landing_sources_title: "מקורות מודיעין משולבים",
    landing_sources_subtitle: "אנו מבצעים שאילתות ממספר בסיסי נתונים מיוחדים כדי לספק לך את המידע המלא ביותר",
    landing_cta_title: "המידע שלך בטוח?",
    landing_cta_subtitle: "גלה עכשיו. חינם. ללא הרשמה.",
    landing_footer_platform: "פלטפורמה",
    landing_footer_security: "אבטחה",
    landing_footer_social: "רשתות",
    landing_price_free: "/חינם",
    landing_footer_copyright: "LeakGuard © 2026 — מודיעין איומים ו-OSINT",
    login_title: "גישה ל-LeakGuard",
    login_tab: "כניסה",
    register_tab: "הרשמה",
    name_placeholder: "שם מלא",
    email_placeholder: "דואר אלקטרוני",
    password_placeholder: "סיסמה",
    login_btn: "כניסה",
    register_btn: "צור חשבון",
    demo_btn: "גישת הדגמה (ללא הרשמה)",
    back_home: "← חזרה לדף הבית",
    auth_error: "שגיאת אימות",
    dashboard_title: "לוח בקרה למודיעין איומים",
    kpi_threats_today: "איומים היום",
    kpi_critical: "קריטיים",
    kpi_verified: "מאומתים",
    kpi_pending: "ממתינים",
    kpi_actors: "שחקנים",
    kpi_sectors: "מגזרים",
    map_title: "מפת דליפות — אמריקה הלטינית",
    feed_title: "פיד איומים",
    col_date: "תאריך",
    col_actor: "שחקן",
    col_victim: "קורבן",
    col_sector: "מגזר",
    col_risk: "סיכון",
    col_conf: "ביטחון",
    col_status: "סטטוס",
    col_verif: "אימות",
    cracked_title: "ניטור חי: פורום Cracked",
    col_thread: "כותרת שרשור",
    col_author: "מחבר",
    col_published: "פורסם",
    col_replies: "תגובות",
    col_views: "צפיות",
    hackread_title: "ניטור חי: חדשות Hackread",
    col_article: "מאמר",
    col_category: "קטגוריה",
    col_country: "מדינה",
    consulted_title: "שאילתות שבוצעו",
    consulted_clear: "ניקוי",
    darkweb_title: "רשת אפלה / פורומים מחתרתיים",
    recent_breaches_title: "דליפות ציבוריות אחרונות",
    no_consulted: "עדיין לא בוצעו שאילתות.",
    no_index: "האינדקס אינו זמין.",
    loading_threads: "טוען שרשורי פורום...",
    loading_news: "טוען חדשות אבטחה...",
    showing: "מציג",
    of: "מתוך",
    threads: "שרשורים",
    articles: "מאמרים",
    prev_btn: "הקודם",
    next_btn: "הבא",
    page_of: "עמ'",
    filter_country: "סנן לפי מדינה",
    filter_sector: "סנן לפי מגזר",
    filter_status: "סנן לפי סטטוס",
    all_countries: "כל המדינות",
    all_sectors: "כל המגזרים",
    all_statuses: "כל הסטטוסים",
    clear_filters: "נקה מסננים",
    results_count: "תוצאה/ות נמצאה/ו",
    chart_sectors: "מגזרים מושפעים",
    chart_verification: "סטטוס אימות",
    chart_alerts_label: "התראות",
    intel_sources_title: "מקורות מודיעין פעילים",
    intel_sources_subtitle: "נתונים מתעדכנים בזמן אמת ממספר ספקים מיוחדים",
    source_status_live: "חי",
    source_status_configured: "מוגדר",
    source_status_public: "ציבורי",
    tips_title: "המלצות אבטחה",
    tips_subtitle: "פעולות שאתה יכול לנקוט עכשיו כדי להגן על עצמך",
    tip_2fa_title: "הפעל 2FA",
    tip_2fa_desc: "הפעל אימות דו-שלבי בכל השירותים החשובים שלך.",
    tip_pwd_title: "סיסמאות ייחודיות",
    tip_pwd_desc: "אל תשתמש שוב בסיסמאות. השתמש במנהל סיסמאות כמו Bitwarden (חינמי).",
    tip_monitor_title: "נטר את האימייל שלך",
    tip_monitor_desc: "השתמש בכלי זה באופן קבוע כדי לזהות אם הנתונים שלך דלפו.",
    tip_phishing_title: "היזהר מדיוג",
    tip_phishing_desc: "אל תלחץ על קישורים במיילים לא צפויים גם אם הם נראים לגיטימיים.",
    tip_update_title: "עדכן הכל",
    tip_update_desc: "שמור על מערכת ההפעלה, האפליקציות והנתב מעודכנים תמיד.",
    exposure_title: "בדיקת חשיפה",
    exposure_subtitle: "שאילתת פרוקסי מאובטחת — טוקן ה-OSINT שלך לעולם לא נחשף.",
    mode_domain: "דומיין",
    mode_email: "אימייל",
    mode_phone: "טלפון",
    ph_domain: "דומיין (לדוג' policia.bo)",
    ph_email: "אימייל (לדוג' analyst@company.com)",
    ph_phone: "טלפון (לדוג' +59171234567)",
    scan_btn: "סרוק",
    scanning_btn: "סורק...",
    risk_label: "סיכון",
    indexed_logins: "כניסות מאונדקסות",
    db_hits: "בסיסי נתונים עם התאמות",
    plaintext_pwd: "סיסמאות בטקסט פתוח",
    records_label: "רשומות שנמצאו",
    col_source: "מקור",
    col_login: "כניסה",
    col_credential: "אישור",
    col_severity: "חומרה",
    ai_title: "בטיחות בינה מלאכותית ו-RAG Pipeline",
    ai_verif_rate: "שיעור אימות",
    ai_false_positive: "חיובי שווא",
    ai_confidence: "ביטחון ממוצע",
    ai_card_title: "ניתוח Gemini 2.5 Flash + FAISS",
    ai_desc: "RAG מקומי עם FAISS להקשר לא מקוון. ללא OPENAI_API_KEY, מגיב במצב לא מקוון.",
    ai_run_btn: "הפעל ניתוח לדוגמה",
    ai_running_btn: "מנתח...",
    admin_title: "לוח ניהול",
    admin_queue_title: "תור אימות",
    admin_audits_title: "יומן ביקורת",
    admin_pending: "ממתינים",
    admin_verified: "מאומת",
    admin_rejected: "נדחה",
    admin_verify_btn: "אמת",
    admin_reject_btn: "דחה",
    admin_reason_placeholder: "סיבת ההחלטה...",
    map_victim: "קורבן",
    map_date: "תאריך",
    map_risk: "סיכון",
    darkweb_forum: "פורום",
    darkweb_indicator: "מחוון",
    no_results_filter: "אין תוצאות עם הפילטרים הנוכחיים.",
    footer_terms: "תנאי שימוש",
    login_accept_terms_prefix: "אני מסכים ל",
    login_accept_terms_link: "תנאי השימוש",
  },
};

type LanguageContextType = {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: Translations;
};

const LanguageContext = createContext<LanguageContextType>({
  lang: "es",
  setLang: () => {},
  t: translations.es,
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("es");

  useEffect(() => {
    const stored = readStoredLang();
    setLangState(stored);
    applyDocumentLang(stored);
  }, []);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_STORAGE_KEY, l);
    applyDocumentLang(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t: translations[lang] }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLang() {
  return useContext(LanguageContext);
}
