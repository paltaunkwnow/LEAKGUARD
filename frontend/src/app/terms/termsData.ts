import { FileText, ShieldAlert, EyeOff, Lock, Globe, Scale, Ban, LucideIcon } from "lucide-react";
import { Lang } from "@/contexts/language-context";

export const termsData: Record<Lang, {
  title: string;
  subtitle: string;
  lastUpdated: string;
  intro: string;
  sections: { title: string; icon: LucideIcon; content: string[] }[];
  footerNote: string;
}> = {
  es: {
    title: "Términos de Servicio y Aviso Legal",
    subtitle: "Marco regulatorio y condiciones de uso para LeakGuard",
    lastUpdated: "Última actualización: 23 de junio de 2026",
    intro: "Bienvenido a LeakGuard. Antes de utilizar nuestra plataforma OSINT y de inteligencia de amenazas, le solicitamos que lea detenidamente este aviso legal. El acceso y uso del sitio implica la aceptación plena de estas condiciones.",
    sections: [
      {
        title: "1. Autorización y uso lícito (cumplimiento CFAA)",
        icon: ShieldAlert,
        content: [
          "Usted declara y garantiza que es el titular autorizado, o que cuenta con el consentimiento escrito explícito y verificable del titular, de todos los dominios, direcciones de correo electrónico, números de teléfono u otros activos digitales que consulte a través de la plataforma LeakGuard. La consulta no autorizada de activos de terceros está estrictamente prohibida y puede constituir una violación de la Computer Fraud and Abuse Act (18 U.S.C. § 1030) y otras leyes locales, estatales y federales aplicables. LeakGuard se reserva el derecho de suspender o cancelar su cuenta de inmediato ante sospecha de uso no autorizado y de reportar dicha actividad a las autoridades competentes."
        ]
      },
      {
        title: "2. Uso estrictamente defensivo y conducta prohibida",
        icon: Ban,
        content: [
          "LeakGuard se proporciona exclusivamente como herramienta defensiva de inteligencia de amenazas. Usted acepta expresamente que NO utilizará la plataforma, sus datos ni su API para: (a) credential stuffing, password spraying o intentos de acceso no autorizado a cualquier sistema, red o cuenta; (b) doxing, acoso, acecho, extorsión o espionaje corporativo; (c) cualquier acción que viole las leyes locales, estatales, nacionales o internacionales aplicables."
        ]
      },
      {
        title: "3. Exención de garantías (datos «tal cual»)",
        icon: FileText,
        content: [
          "EL SERVICIO, INCLUIDOS TODOS LOS DATOS OSINT Y DE INTELIGENCIA DE AMENAZAS, SE PROPORCIONA «TAL CUAL» Y «SEGÚN DISPONIBILIDAD». Dado que LeakGuard agrega metadatos de filtraciones de terceros, foros comprometidos e índices de la dark web, no podemos ni garantizamos la exactitud, integridad, legalidad o fiabilidad de la información proporcionada. EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY, LEAKGUARD RENUNCIA EXPRESAMENTE A TODAS LAS GARANTÍAS, YA SEAN EXPRESAS, IMPLÍCITAS, LEGALES O DE OTRO TIPO, INCLUIDAS, ENTRE OTRAS, LAS GARANTÍAS DE COMERCIABILIDAD O IDONEIDAD PARA UN FIN PARTICULAR."
        ]
      },
      {
        title: "4. Indemnización",
        icon: Scale,
        content: [
          "Usted acepta defender, indemnizar y mantener indemne a LeakGuard, sus fundadores, afiliados, empleados y agentes frente a cualquier reclamación, responsabilidad, daño, sentencia, indemnización, pérdida, coste, gasto u honorario (incluidos honorarios razonables de abogados) que surja de o esté relacionado con su violación de estos Términos de Servicio, su acceso no autorizado a activos de terceros o su uso indebido de los datos de inteligencia de amenazas proporcionados por la plataforma."
        ]
      },
      {
        title: "5. Naturaleza del servicio y alojamiento de datos",
        icon: EyeOff,
        content: [
          "LeakGuard opera únicamente como motor de búsqueda e índice analítico de metadatos relacionados con incidentes de seguridad. LeakGuard no aloja, almacena ni distribuye los volcados de datos comprometidos originales ni materiales de hacking en bruto. Para proteger la privacidad, todas las consultas están sujetas a censura en el servidor y protocolos de K-Anonymity. Los campos de credenciales e identidad se censuran en el servidor antes de enviar cualquier respuesta API al cliente; las contraseñas en texto plano nunca se transmiten. Usted reconoce que la visualización de metadatos expuestos no le otorga propiedad ni derechos para explotar dichos datos."
        ]
      },
      {
        title: "6. Limitación de responsabilidad",
        icon: FileText,
        content: [
          "EN LA MÁXIMA MEDIDA PERMITIDA POR LA LEY APLICABLE, EN NINGÚN CASO LEAKGUARD, SUS DIRECTORES, EMPLEADOS O AGENTES SERÁN RESPONSABLES DE DAÑOS INDIRECTOS, PUNITIVOS, INCIDENTALES, ESPECIALES, CONSECUENCIALES O EJEMPLARES. BAJO NINGUNA CIRCUNSTANCIA LA RESPONSABILIDAD TOTAL DE LEAKGUARD EXCEDERÁ EL IMPORTE QUE USTED HAYA PAGADO A LA EMPRESA EN LOS ÚLTIMOS DOCE (12) MESES, O CIEN DÓLARES ESTADOUNIDENSES (100,00 USD), LO QUE SEA MAYOR."
        ]
      },
      {
        title: "7. Ley aplicable y arbitraje",
        icon: Globe,
        content: [
          "Estos Términos se regirán por las leyes del Estado de Delaware, sin tener en cuenta sus principios de conflicto de leyes. Cualquier disputa derivada de estos Términos se resolverá exclusivamente mediante arbitraje vinculante individual, y usted renuncia expresamente a cualquier derecho a participar en una demanda colectiva o arbitraje colectivo."
        ]
      },
      {
        title: "8. Cumplimiento de exportación y sanciones",
        icon: Globe,
        content: [
          "Usted declara y garantiza que no se encuentra en un país sujeto a embargo del Gobierno de los Estados Unidos, ni figura en ninguna lista gubernamental estadounidense de partes prohibidas o restringidas (como la lista OFAC de Nacionales Especialmente Designados). Usted acepta no utilizar LeakGuard para prestar servicios a entidades restringidas de ese tipo."
        ]
      },
      {
        title: "9. Privacidad y registro de auditoría",
        icon: Lock,
        content: [
          "Al utilizar LeakGuard, usted reconoce y acepta que sus acciones en la plataforma, incluidos los metadatos de sus consultas, están sujetas a registro con fines de seguridad, auditoría y cumplimiento normativo, según se describe en nuestra Política de Privacidad. Utilizamos K-Anonymity y hash parcial para proteger la confidencialidad de los términos de búsqueda específicos; el texto legible de la consulta no se almacena en el servidor. Los datos personales de registro (nombre y correo electrónico) se utilizan estrictamente para configurar el perfil y enviar alertas; no vendemos ni comercializamos la información personal de nuestros usuarios."
        ]
      },
      {
        title: "10. Uso ético y cero retención de muestras",
        icon: FileText,
        content: [
          "LeakGuard está firmemente comprometido con la aplicación ética de la inteligencia de amenazas. Nuestra plataforma existe estrictamente con fines informativos y defensivos, capacitando a las organizaciones para identificar y mitigar la exposición digital. LeakGuard NO almacena, aloja, replica ni retiene muestras de datos en bruto, contraseñas ni materiales originales procedentes de filtraciones, hacks o leaks de terceros. Nuestros sistemas procesan metadatos efímeros únicamente para calcular el riesgo. Al utilizar este servicio, usted se obliga legalmente a utilizar esta información exclusivamente de manera ética, defensiva y conforme a la ley, sin causar daño ni explotar las vulnerabilidades de terceros."
        ]
      }
    ],
    footerNote: "El uso y la responsabilidad sobre los datos consultados recaen en cada usuario. Si no está de acuerdo con estos términos, le solicitamos que se abstenga de utilizar este servicio."
  },
  en: {
    title: "Terms of Service & Legal Notice",
    subtitle: "Regulatory framework and conditions of use for LeakGuard",
    lastUpdated: "Last updated: June 23, 2026",
    intro: "Welcome to LeakGuard. Before using our OSINT and threat intelligence platform, we ask that you carefully read this legal notice. Accessing and using this site implies full acceptance of these terms.",
    sections: [
      {
        title: "1. Authorization and Lawful Use (CFAA Compliance)",
        icon: ShieldAlert,
        content: [
          "You represent and warrant that you are the authorized owner, or have explicit, verifiable written consent from the owner, of all domains, email addresses, phone numbers, or other digital assets you query through the LeakGuard platform. Unauthorized querying of third-party assets is strictly prohibited and may constitute a violation of the Computer Fraud and Abuse Act (18 U.S.C. § 1030) and other applicable local, state, and federal laws. LeakGuard reserves the right to suspend or terminate your account immediately upon suspicion of unauthorized use and to report such activity to law enforcement."
        ]
      },
      {
        title: "2. Strictly Defensive Use and Prohibited Conduct",
        icon: Ban,
        content: [
          "LeakGuard is provided exclusively as a defensive threat intelligence tool. You expressly agree that you will NOT use the platform, its data, or its API for: (a) Credential stuffing, password spraying, or attempting unauthorized access to any system, network, or account. (b) Doxing, harassment, stalking, extortion, or corporate espionage. (c) Any action that violates applicable local, state, national, or international law."
        ]
      },
      {
        title: "3. Disclaimer of Warranties (Data \"AS IS\")",
        icon: FileText,
        content: [
          "THE SERVICE, INCLUDING ALL OSINT AND THREAT INTELLIGENCE DATA, IS PROVIDED ON AN \"AS IS\" AND \"AS AVAILABLE\" BASIS. Because LeakGuard aggregates metadata from third-party breaches, compromised forums, and dark web indices, we cannot and do not warrant the accuracy, completeness, legality, or reliability of any information provided. TO THE FULLEST EXTENT PERMITTED BY LAW, LEAKGUARD EXPRESSLY DISCLAIMS ALL WARRANTIES, WHETHER EXPRESS, IMPLIED, STATUTORY, OR OTHERWISE, INCLUDING BUT NOT LIMITED TO WARRANTIES OF MERCHANTABILITY OR FITNESS FOR A PARTICULAR PURPOSE."
        ]
      },
      {
        title: "4. Indemnification",
        icon: Scale,
        content: [
          "You agree to defend, indemnify, and hold harmless LeakGuard, its founders, affiliates, employees, and agents from and against any claims, liabilities, damages, judgments, awards, losses, costs, expenses, or fees (including reasonable attorneys' fees) arising out of or relating to your violation of these Terms of Service, your unauthorized access to third-party assets, or your misuse of the threat intelligence data provided by the platform."
        ]
      },
      {
        title: "5. Nature of Services and Data Hosting",
        icon: EyeOff,
        content: [
          "LeakGuard operates solely as a search engine and analytical index for metadata related to security incidents. LeakGuard does not host, store, or distribute the original compromised data dumps or raw hacking materials. To protect privacy, all queries are subjected to server-side censorship and K-Anonymity protocols. Credential and identity fields are censored on the server before any API response is sent to the client; plaintext passwords are never transmitted. You acknowledge that viewing exposed metadata does not grant you ownership or rights to exploit said data."
        ]
      },
      {
        title: "6. Limitation of Liability",
        icon: FileText,
        content: [
          "TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, IN NO EVENT SHALL LEAKGUARD, ITS DIRECTORS, EMPLOYEES, OR AGENTS BE LIABLE FOR ANY INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR EXEMPLARY DAMAGES. UNDER NO CIRCUMSTANCES WILL LEAKGUARD'S TOTAL LIABILITY EXCEED THE AMOUNT YOU PAID TO THE COMPANY IN THE PAST TWELVE (12) MONTHS, OR ONE HUNDRED U.S. DOLLARS ($100.00), WHICHEVER IS GREATER."
        ]
      },
      {
        title: "7. Governing Law and Arbitration",
        icon: Globe,
        content: [
          "These Terms shall be governed by the laws of the State of Delaware, without respect to its conflict of laws principles. Any dispute arising from these Terms shall be resolved exclusively through binding, individual arbitration, and you explicitly waive any right to participate in a class action lawsuit or class-wide arbitration."
        ]
      },
      {
        title: "8. Export Compliance and Sanctions",
        icon: Globe,
        content: [
          "You represent and warrant that you are not located in a country subject to a U.S. Government embargo, nor are you listed on any U.S. Government list of prohibited or restricted parties (such as the OFAC Specially Designated Nationals list). You agree not to use LeakGuard to provide services to any such restricted entities."
        ]
      },
      {
        title: "9. Privacy and Audit Logging",
        icon: Lock,
        content: [
          "By using LeakGuard, you acknowledge and agree that your actions on the platform, including metadata of your queries, are subject to logging for security, auditing, and compliance purposes as outlined in our Privacy Policy. We utilize K-Anonymity and partial hashing to protect the confidentiality of specific search terms; plaintext query strings are not stored on the server. Registration data (name and email) is used strictly to set up your profile and deliver alerts; we do not sell or trade our users' personal information."
        ]
      },
      {
        title: "10. Ethical Use and Zero-Retention of Samples",
        icon: FileText,
        content: [
          "LeakGuard is firmly committed to the ethical application of Threat Intelligence. Our platform exists strictly for informational and defensive purposes, empowering organizations to identify and mitigate digital exposure. LeakGuard DOES NOT store, host, mirror, or retain any raw data samples, passwords, or original materials originating from third-party breaches, hacks, or leaks. Our systems process ephemeral metadata solely to calculate risk. By using this service, you legally bind yourself to utilize this information exclusively in an ethical, defensive, and compliant manner, without causing harm or exploiting the vulnerabilities of others."
        ]
      }
    ],
    footerNote: "The use and liability of the queried data lie entirely with each user. If you do not agree to these terms, please refrain from using this service."
  },
  ru: {
    title: "Условия использования и правовое уведомление",
    subtitle: "Правовая база и правила использования платформы LeakGuard",
    lastUpdated: "Последнее обновление: 23 июня 2026 г.",
    intro: "Добро пожаловать в LeakGuard. Перед использованием нашей OSINT-платформы анализа угроз безопасности просим вас внимательно ознакомиться с этим юридическим уведомлением. Использование сайта означает полное согласие с данными условиями.",
    sections: [
      {
        title: "1. Авторизация и законное использование (соответствие CFAA)",
        icon: ShieldAlert,
        content: [
          "Вы заявляете и гарантируете, что являетесь уполномоченным владельцем либо имеете явное, проверяемое письменное согласие владельца на все домены, адреса электронной почты, номера телефонов или иные цифровые активы, которые вы запрашиваете через платформу LeakGuard. Несанкционированный запрос активов третьих лиц строго запрещён и может нарушать Computer Fraud and Abuse Act (18 U.S.C. § 1030) и иные применимые местные, региональные и федеральные законы. LeakGuard оставляет за собой право немедленно приостановить или удалить вашу учётную запись при подозрении в несанкционированном использовании и сообщить о такой деятельности правоохранительным органам."
        ]
      },
      {
        title: "2. Строго оборонительное использование и запрещённое поведение",
        icon: Ban,
        content: [
          "LeakGuard предоставляется исключительно как оборонительный инструмент threat intelligence. Вы прямо соглашаетесь НЕ использовать платформу, её данные или API для: (a) credential stuffing, password spraying или попыток несанкционированного доступа к любой системе, сети или учётной записи; (b) доксинга, преследования, шантажа или корпоративного шпионажа; (c) любых действий, нарушающих применимое местное, региональное, национальное или международное законодательство."
        ]
      },
      {
        title: "3. Отказ от гарантий (данные «как есть»)",
        icon: FileText,
        content: [
          "СЕРВИС, ВКЛЮЧАЯ ВСЕ ДАННЫЕ OSINT И THREAT INTELLIGENCE, ПРЕДОСТАВЛЯЕТСЯ НА УСЛОВИЯХ «КАК ЕСТЬ» И «ПО МЕРЕ ДОСТУПНОСТИ». Поскольку LeakGuard агрегирует метаданные из сторонних утечек, скомпрометированных форумов и индексов dark web, мы не можем и не гарантируем точность, полноту, законность или надёжность предоставляемой информации. В МАКСИМАЛЬНО ДОПУСТИМОЙ ЗАКОНОМ СТЕПЕНИ LEAKGUARD ПРЯМО ОТКАЗЫВАЕТСЯ ОТ ВСЕХ ГАРАНТИЙ, ЯВНЫХ, ПОДРАЗУМЕВАЕМЫХ, УСТАНОВЛЕННЫХ ЗАКОНОМ ИЛИ ИНЫХ, ВКЛЮЧАЯ, ПОМИМО ПРОЧЕГО, ГАРАНТИИ ТОВАРНОЙ ПРИГОДНОСТИ ИЛИ ПРИГОДНОСТИ ДЛЯ ОПРЕДЕЛЁННОЙ ЦЕЛИ."
        ]
      },
      {
        title: "4. Возмещение убытков",
        icon: Scale,
        content: [
          "Вы соглашаетесь защищать, возмещать убытки и ограждать LeakGuard, её основателей, аффилированных лиц, сотрудников и представителей от любых претензий, обязательств, ущерба, судебных решений, компенсаций, потерь, расходов или гонораров (включая разумные гонорары адвокатов), возникающих в связи с нарушением вами настоящих Условий, несанкционированным доступом к активам третьих лиц или неправомерным использованием данных threat intelligence, предоставляемых платформой."
        ]
      },
      {
        title: "5. Характер услуг и хранение данных",
        icon: EyeOff,
        content: [
          "LeakGuard действует исключительно как поисковая система и аналитический индекс метаданных, связанных с инцидентами безопасности. LeakGuard не размещает, не хранит и не распространяет оригинальные скомпрометированные дампы данных или сырые материалы взлома. Для защиты конфиденциальности все запросы подвергаются серверной цензуре и протоколам K-Anonymity. Вы признаёте, что просмотр раскрытых метаданных не предоставляет вам права собственности или права эксплуатировать эти данные."
        ]
      },
      {
        title: "6. Ограничение ответственности",
        icon: FileText,
        content: [
          "В МАКСИМАЛЬНО ДОПУСТИМОЙ ПРИМЕНИМЫМ ЗАКОНОМ СТЕПЕНИ LEAKGUARD, ЕЁ ДИРЕКТОРЫ, СОТРУДНИКИ ИЛИ ПРЕДСТАВИТЕЛИ НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ НЕ НЕСУТ ОТВЕТСТВЕННОСТИ ЗА КОСВЕННЫЙ, ШТРАФНОЙ, СЛУЧАЙНЫЙ, СПЕЦИАЛЬНЫЙ, ПОСЛЕДУЮЩИЙ ИЛИ ПРИМЕРНЫЙ УЩЕРБ. НИ ПРИ КАКИХ ОБСТОЯТЕЛЬСТВАХ СОВОКУПНАЯ ОТВЕТСТВЕННОСТЬ LEAKGUARD НЕ ПРЕВЫСИТ СУММУ, УПЛАЧЕННУЮ ВАМИ КОМПАНИИ ЗА ПОСЛЕДНИЕ ДВЕНАДЦАТЬ (12) МЕСЯЦЕВ, ИЛИ СТО ДОЛЛАРОВ США ($100.00) — В ЗАВИСИМОСТИ ОТ ТОГО, ЧТО БОЛЬШЕ."
        ]
      },
      {
        title: "7. Применимое право и арбитраж",
        icon: Globe,
        content: [
          "Настоящие Условия регулируются законодательством штата Делавэр без учёта норм коллизионного права. Любой спор, возникающий из настоящих Условий, подлежит исключительному разрешению в обязательном индивидуальном арбитраже, и вы прямо отказываетесь от права участвовать в коллективном иске или коллективном арбитраже."
        ]
      },
      {
        title: "8. Экспортный контроль и санкции",
        icon: Globe,
        content: [
          "Вы заявляете и гарантируете, что не находитесь в стране, на которую распространяется эмбарго правительства США, и не включены ни в один государственный список запрещённых или ограниченных лиц (например, список OFAC Specially Designated Nationals). Вы соглашаетесь не использовать LeakGuard для оказания услуг таким ограниченным лицам."
        ]
      },
      {
        title: "9. Конфиденциальность и журналирование аудита",
        icon: Lock,
        content: [
          "Используя LeakGuard, вы признаёте и соглашаетесь, что ваши действия на платформе, включая метаданные запросов, подлежат журналированию в целях безопасности, аудита и соответствия требованиям, как описано в нашей Политике конфиденциальности. Мы используем K-Anonymity и частичное хеширование для защиты конфиденциальности конкретных поисковых запросов. Регистрационные данные (имя и email) используются строго для настройки профиля и отправки оповещений; мы не продаём и не передаём личную информацию пользователей в коммерческих целях."
        ]
      },
      {
        title: "10. Этичное использование и нулевое хранение образцов",
        icon: FileText,
        content: [
          "LeakGuard твёрдо привержен этичному применению threat intelligence. Наша платформа существует исключительно в информационных и оборонительных целях, помогая организациям выявлять и снижать цифровую экспозицию. LeakGuard НЕ хранит, не размещает, не зеркалирует и не удерживает сырые образцы данных, пароли или оригинальные материалы из сторонних утечек, взломов или leaks. Наши системы обрабатывают эфемерные метаданные исключительно для расчёта риска. Используя сервис, вы юридически обязуетесь применять эту информацию исключительно этично, оборонительно и в соответствии с законом, не причиняя вреда и не эксплуатируя уязвимости других."
        ]
      }
    ],
    footerNote: "Использование и ответственность за полученные данные лежат исключительно на каждом пользователе. Если вы не согласны с этими условиями, пожалуйста, воздержитесь от использования этого сервиса."
  },
  he: {
    title: "תנאי שימוש והצהרה משפטית",
    subtitle: "מסגרת רגולטורית ותנאי שימוש עבור LeakGuard",
    lastUpdated: "עדכון אחרון: 23 ביוני 2026",
    intro: "ברוכים הבאים ל-LeakGuard. לפני השימוש בפלטפורמת ה-OSINT ומודיעין האיומים שלנו, אנו מבקשים ממך לקרוא בעיון הצהרה משפטית זו. הגישה והשימוש באתר מהווים הסכמה מלאה לתנאים אלו.",
    sections: [
      {
        title: "1. הרשאה ושימוש חוקי (עמידה ב-CFAA)",
        icon: ShieldAlert,
        content: [
          "אתה מצהיר ומתחייב כי אתה הבעלים המורשה, או שיש לך הסכמה כתובה מפורשת וניתנת לאימות מהבעלים, לכל הדומיינים, כתובות הדוא\"ל, מספרי הטלפון או נכסים דיגיטליים אחרים שאתה שולח לבדיקה בפלטפורמת LeakGuard. שליחת שאילתות לא מורשות על נכסי צד שלישי אסורה בהחלט ועלולה להוות הפרה של חוק Computer Fraud and Abuse Act (18 U.S.C. § 1030) וחוקים מקומיים, מדינתיים ופדרליים אחרים. LeakGuard שומרת לעצמה את הזכות להשעות או לסגור את חשבונך מיידית בחשד לשימוש לא מורשה ולדווח על כך לרשויות האכיפה."
        ]
      },
      {
        title: "2. שימוש הגנתי בלבד והתנהגות אסורה",
        icon: Ban,
        content: [
          "LeakGuard מסופקת אך ורק ככלי מודיעין איומים הגנתי. אתה מסכים במפורש שלא תשתמש בפלטפורמה, בנתוניה או ב-API שלה עבור: (א) credential stuffing, password spraying או ניסיונות גישה לא מורשית לכל מערכת, רשת או חשבון; (ב) doxing, הטרדה, מעקב, סחיטה או ריגול תאגידי; (ג) כל פעולה המפרה חוק מקומי, מדינתי, לאומי או בינלאומי חל."
        ]
      },
      {
        title: "3. כתב ויתור על אחריות (נתונים \"כפי שהם\")",
        icon: FileText,
        content: [
          "השירות, לרבות כל נתוני ה-OSINT ומודיעין האיומים, מסופק על בסיס \"כפי שהם\" ו\"כפי זמינות\". מכיוון ש-LeakGuard מצטברת מטא-נתונים מדליפות צד שלישי, פורומים שנפרצו ואינדקסים של dark web, איננו יכולים ואיננו מתחייבים לדיוק, שלמות, חוקיות או אמינות של המידע שמסופק. במידה המרבית המותרת בחוק, LEAKGUARD מוותרת במפורש על כל האחריות, בין אם מפורשת, משתמעת, חוקית או אחרת, לרבות אך לא רק אחריות לסחירות או להתאמה למטרה מסוימת."
        ]
      },
      {
        title: "4. פיצוי והגנה",
        icon: Scale,
        content: [
          "אתה מסכים להגן, לפצות ולשמור על LeakGuard, מייסדיה, חברותיה, עובדיה וסוכניה מפני כל תביעה, אחריות, נזק, פסק דין, פיצוי, הפסד, עלות, הוצאה או שכר טרחה (לרבות שכר טרחה סביר של עורכי דין) הנובעים מהפרת תנאי שימוש אלה, גישה לא מורשית לנכסי צד שלישי או שימוש לרעה בנתוני מודיעין האיומים שמספקת הפלטפורמה."
        ]
      },
      {
        title: "5. אופי השירות ואחסון נתונים",
        icon: EyeOff,
        content: [
          "LeakGuard פועלת אך ורק כמנוע חיפוש ואינדקס אנליטי למטא-נתונים הקשורים לאירועי אבטחה. LeakGuard אינה מארחת, מאחסנת או מפיצה את דמפי הנתונים המקוריים שנפרצו או חומרי פריצה גולמיים. להגנת הפרטיות, כל השאילתות עוברות צנזורה בצד השרת ופרוטוקולי K-Anonymity. אתה מכיר בכך שצפייה במטא-נתונים חשופים אינה מעניקה לך בעלות או זכויות לנצל נתונים אלה."
        ]
      },
      {
        title: "6. הגבלת אחריות",
        icon: FileText,
        content: [
          "במידה המרבית המותרת בחוק החל, בשום מקרה לא תישא LeakGuard, מנהליה, עובדיה או סוכניה באחריות לנזקים עקיפים, עונשיים, מקריים, מיוחדים, תוצאתיים או לדוגמה. בשום נסיבות לא תעלה האחריות הכוללת של LeakGuard על הסכום ששילמת לחברה בשנים עשר (12) החודשים האחרונים, או מאה דולר אמריקאי ($100.00) — לפי הגבוה מביניהם."
        ]
      },
      {
        title: "7. דין חל וארביטראז'",
        icon: Globe,
        content: [
          "תנאים אלה יוסדרו על פי חוקי מדינת דלאוור, ללא התחשבות בעקרונות ברירת הדין. כל מחלוקת הנובעת מתנאים אלה תיפתר אך ורק באמצעות ארביטראז' מחייב אישי, ואתה מוותר במפורש על כל זכות להשתתף בתביעה ייצוגית או ארביטראז' קבוצתי."
        ]
      },
      {
        title: "8. ציות לייצוא וסנקציות",
        icon: Globe,
        content: [
          "אתה מצהיר ומתחייב שאינך נמצא במדינה הכפופה לאמברגו של ממשלת ארה\"ב, ואינך רשום ברשימת ממשלת ארה\"ב של גורמים אסורים או מוגבלים (כגון רשימת OFAC Specially Designated Nationals). אתה מסכים שלא להשתמש ב-LeakGuard כדי לספק שירותים לגורמים מוגבלים כאלה."
        ]
      },
      {
        title: "9. פרטיות ורישום ביקורת",
        icon: Lock,
        content: [
          "בשימוש ב-LeakGuard, אתה מכיר ומסכים שפעולותיך בפלטפורמה, לרבות מטא-נתונים של השאילתות שלך, כפופות לרישום למטרות אבטחה, ביקורת וציות, כמתואר במדיניות הפרטיות שלנו. אנו משתמשים ב-K-Anonymity ובגיבוב חלקי כדי להגן על סודיות מונחי החיפוש הספציפיים. נתוני הרשמה (שם ודוא\"ל) משמשים אך ורק להגדרת הפרופיל ושליחת התראות; איננו מוכרים או סוחרים במידע האישי של המשתמשים שלנו."
        ]
      },
      {
        title: "10. שימוש אתי ואפס שמירת דגימות",
        icon: FileText,
        content: [
          "LeakGuard מחויבת באופן עמוק ליישום אתי של מודיעין איומים. הפלטפורמה שלנו קיימת אך ורק למטרות מידע והגנה, ומאפשרת לארגונים לזהות ולהפחית חשיפה דיגיטלית. LeakGuard אינה מאחסנת, מארחת, משכפלת או שומרת דגימות נתונים גולמיות, סיסמאות או חומרים מקוריים מדליפות, פריצות או leaks של צד שלישי. המערכות שלנו מעבדות מטא-נתונים זמניים אך ורק לחישוב סיכון. בשימוש בשירות זה, אתה מתחייב משפטית להשתמש במידע זה אך ורק באופן אתי, הגנתי ותואם חוק, מבלי לגרום נזק או לנצל פגיעויות של אחרים."
        ]
      }
    ],
    footerNote: "השימוש והאחריות על המידע המבוקש חלים על כל משתמש באופן בלעדי. אם אינך מסכים לתנאים אלו, אנא הימנע משימוש בשירות זה."
  }
};
