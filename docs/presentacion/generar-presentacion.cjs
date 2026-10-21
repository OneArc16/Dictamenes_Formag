/* Genera una presentación editable y una copia PDF a partir del mismo diseño.
 * Dependencia adicional: pptxgenjs (instalar fuera del proyecto o indicar PPTXGENJS_PATH).
 * Usa pdfkit y sharp ya presentes entre las dependencias transitivas del proyecto.
 */
const fs = require('fs');
const path = require('path');
const PptxGenJS = require(process.env.PPTXGENJS_PATH || '/tmp/dictamy-presentation-tools/node_modules/pptxgenjs');
const root = path.resolve(__dirname, '../..');
function pnpmPackage(prefix, name) {
  const folder = fs.readdirSync(path.join(root, 'node_modules/.pnpm')).find(n => n.startsWith(prefix));
  return require(path.join(root, 'node_modules/.pnpm', folder, 'node_modules', name));
}
const PDFDocument = pnpmPackage('@react-pdf+pdfkit@', '@react-pdf/pdfkit').default;
const sharp = pnpmPackage('sharp@', 'sharp');
const OUT = __dirname;
const PREVIEW = path.join(OUT, 'vista-previa');
fs.mkdirSync(PREVIEW, { recursive: true });
const W = 1600, H = 900;
const C = {
  navy: '102A43', dark: '0B2035', blue: '176BCE', teal: '087F80',
  aqua: '6BE4CF', ink: '17324D', muted: '52677D', white: 'FFFFFF',
  bg: 'F5F8FC', pale: 'E9F2FD', mint: 'E7F6F2', line: 'D8E3EF',
  soft: 'B5C8DA', darkCard: '173951', gold: 'FFD18A',
};
const FONT = '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf';
const BOLD = '/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf';
const metrics = new PDFDocument({ autoFirstPage: false });
metrics.registerFont('regular', FONT).registerFont('bold', BOLD);
const slides = [];
let s;
function box(x,y,w,h,fill=C.white,r=18,stroke=null) {
  s.items.push({kind:'box',x,y,w,h,fill,r,stroke});
}
function line(x1,y1,x2,y2,color=C.line,width=2) {
  s.items.push({kind:'line',x1,y1,x2,y2,color,width});
}
function circle(x,y,d,fill,stroke=null) {
  s.items.push({kind:'circle',x,y,w:d,h:d,fill,stroke});
}
function measure(str,size,bold=false) {
  return metrics.font(bold?'bold':'regular').fontSize(size).widthOfString(str);
}
function wrap(str,w,size,bold) {
  const result=[];
  for (const para of str.split('\n')) {
    if (!para) {result.push(''); continue;}
    let current='';
    for (const word of para.split(' ')) {
      const next=current?`${current} ${word}`:word;
      if (current && measure(next,size,bold)>w-6) {result.push(current);current=word;} else current=next;
    }
    result.push(current);
  }
  return result;
}
function text(str,x,y,w,size=30,color=C.ink,bold=false,opt={}) {
  const lh=opt.lh || size*1.26;
  const lines=wrap(str,w,size,bold);
  lines.forEach((t,i)=>{
    if (measure(t,size,bold)>w+1) throw new Error(`Texto excede ancho: ${t}`);
    s.items.push({kind:'text',text:t,x,y:y+i*lh,w,h:lh,size,color,bold,align:opt.align||'left'});
  });
  return lines.length*lh;
}
function tag(str,x,y,w,fill=C.pale,color=C.blue) {
  box(x,y,w,38,fill,19);
  text(str,x+12,y+6,w-24,20,color,true,{align:'center'});
}
function arrow(x,y,len=58,color=C.blue) {
  line(x,y,x+len,y,color,3);
  line(x+len-10,y-8,x+len,y,color,3);
  line(x+len-10,y+8,x+len,y,color,3);
}
function icon(type,x,y,size=48,color=C.blue) {
  const u=size/48;
  const L=(a,b,c,d)=>line(x+a*u,y+b*u,x+c*u,y+d*u,color,2.3);
  const B=(a,b,w,h)=>box(x+a*u,y+b*u,w*u,h*u,null,4*u,color);
  if (type==='calendar') {
    B(5,9,38,34);L(5,19,43,19);L(15,4,15,14);L(33,4,33,14);
    for(const a of [14,24,34]) for(const b of [27,35]) circle(x+(a-2)*u,y+(b-2)*u,4*u,color);
  } else if(type==='document') {
    B(9,3,30,42);L(16,15,32,15);L(16,23,32,23);L(16,31,28,31);
  } else if(type==='user') {
    circle(x+16*u,y+3*u,16*u,null,color);B(7,27,34,18);
  } else if(type==='shield') {
    L(24,3,42,10);L(42,10,39,30);L(39,30,24,45);L(24,45,9,30);L(9,30,6,10);L(6,10,24,3);
    L(16,23,22,29);L(22,29,33,17);
  } else if(type==='grid') {
    B(4,4,16,16);B(28,4,16,16);B(4,28,16,16);B(28,28,16,16);
  } else if(type==='check') {
    circle(x+3*u,y+3*u,42*u,null,color);L(13,24,21,32);L(21,32,35,17);
  } else if(type==='history') {
    circle(x+4*u,y+4*u,40*u,null,color);L(24,12,24,26);L(24,26,34,31);
  } else {
    L(5,12,43,12);L(5,24,43,24);L(5,36,43,36);
    circle(x+13*u,y+7*u,10*u,color);circle(x+29*u,y+19*u,10*u,color);circle(x+10*u,y+31*u,10*u,color);
  }
}
function newSlide(kicker,title,subtitle='',dark=false) {
  s={title,items:[],notes:'',sources:[],dark};
  slides.push(s);
  box(0,0,W,H,dark?C.dark:C.bg,0);
  box(72,62,10,30,dark?C.aqua:C.teal,3);
  text(kicker.toUpperCase(),98,64,1270,21,dark?C.aqua:C.teal,true);
  text(title,72,124,1456,53,dark?C.white:C.navy,true);
  if(subtitle) text(subtitle,74,204,1440,28,dark?C.soft:C.muted);
  line(72,836,1528,836,dark?'315069':C.line,1);
  text('DICTAMY  /  PROYECTO DE MEDICINA LABORAL',74,855,1260,17,dark?C.soft:C.muted,true);
  text(String(slides.length).padStart(2,'0'),1450,849,76,26,dark?C.aqua:C.blue,true,{align:'right'});
  return s;
}
function note(content,sources=[]) {s.notes=content;s.sources=sources;}
function callout(str,y=755,dark=false) {
  box(72,y,1456,58,dark?C.darkCard:C.pale,12);
  text(str,94,y+14,1408,23,dark?C.aqua:C.blue,true);
}
function feature(x,y,w,title,body,type='document',fill=C.white) {
  box(x,y,w,210,fill);
  icon(type,x+26,y+25,42);
  text(title,x+82,y+27,w-108,31,C.navy,true);
  text(body,x+26,y+88,w-52,27,C.muted);
}

// 01 — Portada.
newSlide('Presentación del proyecto','', '',true);
text('Dictamy',74,150,850,110,C.white,true);
text('Medicina laboral\ncon información organizada',78,308,865,55,C.white,true);
text('Gestión de dictámenes, recomendaciones,\nagendas y atención a docentes.',80,478,800,32,C.soft);
tag('CONTEXTO FOMAG',80,620,236,C.darkCard,C.aqua);
box(1070,205,350,422,'204763',22);
box(1024,173,350,422,'315C77',22);
box(978,141,350,422,C.white,22);
icon('document',1014,176,54,C.blue);
text('EXPEDIENTE',1090,191,210,24,C.navy,true);
line(1015,261,1286,261,C.line,2);
for(let i=0;i<3;i++){box(1015,297+i*53,20,20,C.pale,5);line(1053,307+i*53,1270,307+i*53,C.line,7);}
box(1010,487,285,49,C.mint,10);
text('Origen · PCL · Historial',1027,499,250,22,C.teal,true);
circle(1284,512,96,C.aqua);icon('check',1307,535,50,C.dark);
const coverLabels=['Planificar','Atender','Documentar','Dar seguimiento'];
coverLabels.forEach((t,i)=>{text(String(i+1).padStart(2,'0'),80+i*372,744,35,21,C.aqua,true);text(t,125+i*372,740,305,28,C.white);});
note('Apertura sugerida: “Dictamy es una plataforma web para organizar procesos de medicina laboral dirigidos a docentes. Reúne la disponibilidad de los médicos, la recepción del paciente y la elaboración de documentos con seguimiento de sus cambios”. El nombre Dictamy aparece en la interfaz; el contexto FOMAG se toma del proyecto. En esta exposición hablaremos de funciones implementadas en el repositorio y del valor que se espera validar en operación. Duración sugerida: 12–15 minutos para las primeras 17 diapositivas; la 18 es un anexo técnico.', ['src/app/login/page.tsx','src/components/home/HomeHeader.tsx','package.json']);

// 02 — Definición.
newSlide('01 / Propósito','¿Qué hace Dictamy?','Una plataforma web que reúne tareas clínicas y administrativas del proceso.');
text('Organiza la atención\ny la elaboración de\ndocumentos laborales.',76,315,690,60,C.navy,true);
text('Para equipos que atienden y valoran\na docentes en medicina laboral.',80,579,650,31,C.muted);
const verbs=[['Planifica','Horarios y cupos médicos','calendar'],['Gestiona','Pacientes y citas','user'],['Documenta','Origen, PCL y recomendaciones','document'],['Da seguimiento','Estados, cambios y responsables','history']];
verbs.forEach((v,i)=>{
  box(838,283+i*126,690,108,C.white,16);
  icon(v[2],864,311+i*126,44,C.blue);
  text(v[0],933,300+i*126,565,30,C.navy,true);
  text(v[1],933,342+i*126,565,25,C.muted);
});
note('La propuesta es reunir procesos que suelen requerir coordinación entre varios equipos. El usuario ingresa desde el navegador y ve los módulos que su perfil tiene autorizados. PCL significa pérdida de capacidad laboral. El sistema organiza la información y apoya el cálculo y la documentación; la valoración y la sustentación corresponden al profesional responsable. No se ha comprobado aquí el uso productivo, el número de usuarios ni el volumen de casos.', ['src/lib/module-navigation.ts','src/app/inicio/page.tsx']);

// 03 — Problemas.
newSlide('02 / Problemática','Problemas que el proyecto busca resolver','Relación entre las dificultades del proceso y las funciones disponibles.');
text('DIFICULTAD',95,282,610,22,C.muted,true);
text('RESPUESTA DEL SISTEMA',832,282,645,22,C.blue,true);
const problems=[
  ['Información dispersa','Datos del docente y formularios en una plataforma.'],
  ['Repetición de tareas manuales','Campos estructurados, cálculos y generación de PDF.'],
  ['Cruces al asignar citas','Disponibilidad y validación del cupo al confirmar.'],
  ['Dificultad para conocer el estado','Consulta de etapas, estados e historial.'],
  ['Cambios difíciles de rastrear','Reapertura con motivo, responsable y registro.'],
];
problems.forEach((p,i)=>{
  const y=330+i*86;box(72,y,1456,73,i%2?C.pale:C.white,12);
  text(p[0],96,y+19,610,29,C.navy,true);
  arrow(731,y+37,46,C.teal);text(p[1],830,y+19,668,27,C.muted);
});
note('Presentar estas dificultades como necesidades a las que responde el diseño, no como resultados de una encuesta institucional. Cada problema tiene una función verificable: formularios y directorio para centralizar; cálculos y PDF para reducir digitación; control de cupos para coordinar citas; estados para seguimiento; historial y permisos para controlar cambios. Evitar porcentajes de ahorro o reducción de errores: no se encontraron mediciones que permitan afirmarlos.', ['src/lib/module-navigation.ts','src/features/reception/application/reception-service.ts','src/lib/admin/auditoria.ts','src/components/dictamen/DictamenRightPanel.tsx']);

// 04 — Usuarios.
newSlide('03 / Usuarios','¿Quiénes lo utilizan?','Las funciones visibles dependen de los permisos del perfil.');
const users=[
  ['Equipo médico','Registra la valoración, sustenta el caso y elabora dictámenes y recomendaciones.','document'],
  ['Admisiones','Consulta pacientes, gestiona citas y apoya la consulta e impresión de documentos.','user'],
  ['Gestión de agenda','Configura horarios, genera cupos y revisa disponibilidad por médico y sede.','calendar'],
  ['Administración','Gestiona empleados, perfiles, permisos, políticas y auditoría.','shield'],
];
users.forEach((u,i)=>{
  const x=72+i*370;
  box(x,300,346,390,C.white,20);icon(u[2],x+28,331,56);
  text(u[0],x+28,417,290,33,C.navy,true);
  text(u[1],x+28,513,290,28,C.muted);
});
callout('Beneficiario del proceso: el docente, a través de una atención y documentación mejor coordinadas.');
note('Aquí se describen responsabilidades operativas. Gestión de agenda no implica que exista un rol técnico adicional con ese nombre: su acceso depende de permisos. Los roles base identificados son administración, médico y admisiones, con perfiles configurables. El docente es beneficiario y titular de la información; no se encontró un portal de autoservicio del paciente que deba presentarse como función implementada.', ['src/lib/module-navigation.ts','src/lib/auth/authorization.ts','src/app/admin/perfiles/[id]/permisos/page.tsx']);

// 05 — Módulos.
newSlide('04 / Alcance funcional','Cuatro módulos, un entorno de trabajo','La navegación agrupa las capacidades según la tarea del usuario.',true);
const modules=[
  ['Medicina Laboral','Determinación de origen, dictámenes PCL\ny recomendaciones laborales.','document'],
  ['Admisiones','Consulta de dictámenes, recepción\nde pacientes y gestión de citas.','user'],
  ['Agenda Médica','Horarios laborales, generación,\nconsulta y control de cupos.','calendar'],
  ['Administración','Empleados, perfiles, motivos,\nnotificadores PCL y auditoría.','settings'],
];
modules.forEach((m,i)=>{
  const x=72+(i%2)*744,y=292+Math.floor(i/2)*245;
  box(x,y,712,216,C.darkCard,20);icon(m[2],x+30,y+34,50,C.aqua);
  text(m[0],x+104,y+35,574,34,C.white,true);
  text(m[1],x+32,y+111,645,29,C.soft);
});
note('El mapa se toma de la definición de navegación del sistema. La determinación de origen está dentro del flujo de dictámenes en Medicina Laboral. Admisiones incluye tanto la consulta operativa de dictámenes como la recepción de pacientes. Agenda administra oferta de atención. Administración organiza el acceso y la configuración. La cantidad de cuatro corresponde a módulos visibles definidos en código, no a una estimación.', ['src/lib/module-navigation.ts']);

// 06 — Flujo.
newSlide('05 / Flujo de trabajo','De la planificación al documento','Vista conceptual de las actividades que la plataforma permite gestionar.');
text('OPERACIÓN',74,300,225,23,C.blue,true);
text('MEDICINA LABORAL',74,552,225,23,C.teal,true);
const flow=[
  [330,285,'1','Preparar agenda','Sede, médicos y cupos'],
  [742,285,'2','Asignar cita','Paciente y disponibilidad'],
  [1154,285,'3','Gestionar la cita','Activar o hacer cambios'],
  [330,533,'4','Registrar el caso','Origen y valoración'],
  [742,533,'5','Elaborar documento','PCL o recomendación'],
  [1154,533,'6','Cerrar y consultar','PDF, estados e historial'],
];
flow.forEach(([x,y,n,t,b],i)=>{
  box(x,y,374,178,C.white,18);tag(n,x+22,y+20,50,i<3?C.pale:C.mint,i<3?C.blue:C.teal);
  text(t,x+22,y+73,334,29,C.navy,true);text(b,x+22,y+119,334,24,C.muted);
});
arrow(710,372,24);arrow(1122,372,24);arrow(710,620,24,C.teal);arrow(1122,620,24,C.teal);
callout('Cada área conserva sus controles y responsables durante el proceso.');
note('Este diagrama es conceptual: ilustra una secuencia de trabajo y no promete que al agendar se cree automáticamente un dictamen. Agenda y recepción comparten cupos; los casos clínicos se administran mediante sus propios flujos. La atención clínica confirmada requiere una integración autorizada. En el flujo nuevo de dictámenes se finaliza el formulario de origen antes de iniciar la PCL; existen excepciones de compatibilidad para registros previos. Una recomendación laboral también dispone de su propio ciclo documental.', ['src/features/reception/application/reception-service.ts','src/features/formulario-origen/application/registrar-caso-dictamen.ts','src/features/formulario-origen/domain/policies.ts']);

// 07 — Agenda.
newSlide('06 / Agenda médica','Planificar la disponibilidad con control','Configuración por sede, médico, período y duración de la consulta.');
const agendaItems=[
  ['Horarios de trabajo','Usa horarios de sede o particulares del médico.'],
  ['Fechas y excepciones','Permite exclusiones, festivos y ajustes temporales.'],
  ['Vista previa','Separa cupos nuevos, omitidos y conflictos.'],
  ['Confirmación validada','Vuelve a verificar disponibilidad antes de generar.'],
];
agendaItems.forEach((a,i)=>{
  circle(77,300+i*113,40,C.pale);text(String(i+1),77,307+i*113,40,24,C.blue,true,{align:'center'});
  text(a[0],140,296+i*113,590,31,C.navy,true);text(a[1],140,340+i*113,570,26,C.muted);
});
box(825,286,703,447,C.white,20);
text('CONFIGURAR → REVISAR → CONFIRMAR',855,316,642,22,C.blue,true);
const days=['L','M','M','J','V','S','D'];
days.forEach((d,i)=>text(d,864+i*90,379,64,23,C.muted,true,{align:'center'}));
for(let row=0;row<3;row++) for(let col=0;col<7;col++){
  const disabled=col>4 || (row===1&&col===0);
  box(866+col*90,425+row*69,62,52,disabled?C.bg:C.pale,10);
  text(disabled?'—':'✓',866+col*90,435+row*69,62,26,disabled?C.muted:C.blue,true,{align:'center'});
}
tag('Nuevos',859,660,165,C.mint,C.teal);tag('Omitidos',1044,660,187,C.pale,C.blue);tag('Conflictos',1251,660,231,'FFF3DF','80561F');
text('Esquema ilustrativo de calendario y vista previa.',850,751,670,23,C.muted);
note('Explicar un ejemplo: el responsable elige sede y médicos, define el período y los minutos de consulta, y revisa el resultado antes de confirmar. Se admiten horarios temporales y duración individual sin reemplazar la configuración permanente. Los festivos de Colombia y las exclusiones forman parte del manejo de fechas. El calendario mostrado es una ilustración, no una captura ni una agenda real. La lógica implementa controles de conflictos y repetición segura de una confirmación.', ['src/features/agenda/application/agenda-service.ts','src/features/agenda/application/schedule-service.ts','docs/history/agenda-medica-2026-07.md']);

// 08 — Recepción.
newSlide('07 / Admisiones y recepción','Gestionar la cita desde una misma vista','Identificación del paciente, disponibilidad real e historial de movimientos.');
const reception=[
  ['01','Encontrar al paciente','Búsqueda por documento.\nConsulta y actualización de su perfil.','user'],
  ['02','Elegir la atención','Especialidad, fecha, médico,\nhora y modalidad.','calendar'],
  ['03','Administrar la cita','Asignación, activación,\ncancelación y reprogramación.','history'],
];
reception.forEach((r,i)=>{
  const x=72+i*495;box(x,300,466,329,C.white,20);tag(r[0],x+26,326,60);
  icon(r[3],x+375,328,48);text(r[1],x+26,415,414,32,C.navy,true);
  text(r[2],x+26,478,409,28,C.muted);
});
text('Documentos y seguimiento',76,672,520,29,C.navy,true);
text('Recordatorio de cita en PDF e historial con estados y cambios.',76,718,1420,30,C.muted);
note('En recepción se busca un paciente del directorio institucional y se puede actualizar su perfil. La disponibilidad guía la selección de especialidad, fecha, médico y hora. Al cancelar, el historial conserva la cita y el cupo se libera; al reprogramar, se relaciona la cita original con la nueva. Activar no equivale a marcar como atendida: el estado ATENDIDA proviene de una integración clínica autorizada. El recordatorio es un PDF para abrir o imprimir, no un servicio de envío automático por WhatsApp, correo o SMS. Los medios de solicitud son datos de registro.', ['src/features/reception/presentation/PatientReceptionPage.tsx','src/features/reception/application/reception-service.ts','src/features/reception/application/reminder-document-service.ts']);

// 09 — Origen.
newSlide('08 / Medicina laboral','Determinar el origen con información estructurada','El formulario reúne los elementos que sustentan el concepto del profesional.');
const origin=[
  ['Descripción','Evento y contexto del caso.'],
  ['Historial laboral','Trayectoria y antecedentes de trabajo.'],
  ['Información y fundamentos','Registro de soportes y evidencias.'],
  ['Diagnósticos','Diagnósticos y tratamiento.'],
  ['Sustentación','Concepto y origen del evento.'],
];
origin.forEach((a,i)=>{
  const y=289+i*90;circle(82,y+10,46,C.mint);text(String(i+1),82,y+19,46,25,C.teal,true,{align:'center'});
  text(a[0],151,y+10,610,31,C.navy,true);text(a[1],151,y+51,650,25,C.muted);
});
box(922,300,606,401,C.navy,22);
text('Un paso previo\nal dictamen PCL',958,344,530,48,C.white,true);
text('En el flujo nuevo, finalizar el origen habilita la etapa PCL.',960,489,516,31,C.soft);
tag('Versiones y reapertura controlada',956,624,533,C.darkCard,C.aqua);
note('Las cinco secciones corresponden a pestañas implementadas. La plataforma ayuda a ordenar fundamentos y a registrar el concepto; no determina el origen de forma autónoma. En los casos que usan el flujo ORIGEN_PREVIO, se exige finalizar esta etapa antes de iniciar PCL. Al reabrir el origen, la PCL queda bloqueada durante la corrección. Existen condiciones de compatibilidad para casos LEGACY y borradores con PCL ya iniciada; por eso la regla se presenta como propia del flujo nuevo. Las versiones conservan la referencia empleada por la PCL.', ['src/features/formulario-origen/presentation/FormularioOrigenCenterPanel.tsx','src/features/formulario-origen/domain/policies.ts','src/lib/dictamen/pcl-access.ts']);

// 10 — PCL.
newSlide('09 / Dictámenes','Apoyar la valoración de pérdida de capacidad laboral','PCL: registro estructurado, cálculo de resultados y documento final.');
feature(72,292,710,'Información clínica','Antecedentes, diagnósticos CIE-10,\ntratamiento y sustentación.','document');
feature(818,292,710,'Deficiencias','Selección de deficiencias y variables\npara la valoración del Título I.','settings');
feature(72,526,710,'Limitaciones y ocupación','Actividades diarias, limitación laboral\ny análisis ocupacional, según procedimiento.','user');
feature(818,526,710,'Consolidación del dictamen','Totales de PCL, cierre del registro\ny exportación del documento PDF.','check');
callout('El profesional responsable registra, revisa y sustenta la valoración.');
note('El formulario contempla antecedentes, diagnóstico y tratamiento, deficiencias, actividades de la vida diaria e instrumentales, limitación laboral, análisis ocupacional y sustentación. Las secciones aplicables dependen del procedimiento A o B configurado; no deben presentarse todas como obligatorias para cada caso. La interfaz consolida los totales y permite cerrar el dictamen, que pasa a estar bloqueado para edición hasta una reapertura autorizada. Esta presentación describe el software; no certifica las fórmulas ni realiza una interpretación clínica o normativa. No se incluyen porcentajes de un caso real.', ['src/components/dictamen/DictamenCenterPanel.tsx','src/components/dictamen/DictamenRightPanel.tsx','src/app/api/dictamenes/[id]/cerrar/route.ts','src/lib/react-pdf/DictamenReactPdf.tsx']);

// 11 — Recomendaciones.
newSlide('10 / Recomendaciones laborales','Convertir el concepto médico en un documento','Un flujo específico para registrar recomendaciones, observaciones y restricciones.');
box(72,292,747,428,C.white,20);
text('Contenido del formulario',104,329,673,37,C.navy,true);
const rec=['Exámenes realizados','Motivo del concepto','Recomendaciones y observaciones','Restricciones registradas por el médico'];
rec.forEach((v,i)=>{icon('check',104,409+i*69,31,C.teal);text(v,153,410+i*69,620,28,C.muted);});
text('Ciclo del documento',895,306,570,36,C.navy,true);
const states=[['Borrador','Diligenciar y guardar'],['Cerrado','Conservar el contenido'],['Reabierto','Corregir con motivo e historial']];
states.forEach((st,i)=>{
  box(895,378+i*112,633,92,i===1?C.navy:C.pale,15);
  text(st[0],920,392+i*112,583,29,i===1?C.white:C.blue,true);
  text(st[1],920,432+i*112,583,25,i===1?C.soft:C.muted);
});
callout('Salida disponible: recomendación laboral en PDF para consulta e impresión.');
note('Este módulo dispone de un documento propio, separado del formulario PCL. Permite registrar los exámenes, el motivo y el texto de recomendaciones, observaciones y restricciones. El ciclo principal mostrado es borrador, cierre y reapertura; el modelo también contempla un estado anulada. La reapertura exige permisos y un motivo configurado, y el historial conserva los eventos. No se está afirmando que el sistema supervise automáticamente la aplicación de las recomendaciones en el lugar de trabajo.', ['src/components/recomendaciones/detail/RecomendacionTabFormulario.tsx','src/components/recomendaciones/detail/RecomendacionDetalleRightPanel.tsx','src/lib/recomendaciones/historial.ts']);

// 12 — Controles.
newSlide('11 / Control y trazabilidad','Saber quién puede actuar y qué cambió','Permisos y registros acompañan las operaciones del sistema.',true);
const controls=[
  ['Acceso por perfil','Permisos para consultar, editar,\ncerrar, reabrir o exportar.','shield'],
  ['Alcance de operación','Control de casos asignados\ny de sedes en agenda y recepción.','user'],
  ['Historial del trámite','Registro de cambios, cierres,\nreaperturas y responsables.','history'],
  ['Revisión y auditoría','Consulta de eventos y exportación\nde auditoría en CSV o Excel.','document'],
];
controls.forEach((a,i)=>{
  const x=72+i*370;box(x,300,346,410,C.darkCard,20);
  icon(a[2],x+28,335,54,C.aqua);text(a[0],x+28,427,290,34,C.white,true);
  text(a[1],x+28,538,290,27,C.soft);
});
callout('La trazabilidad permite revisar el proceso y sus modificaciones.',755,true);
note('Los permisos se resuelven desde perfiles y se validan en el servidor. Hay reglas de acceso al caso y controles de sede para agenda y recepción. Dictámenes y recomendaciones registran eventos de edición, cierre y reapertura; recepción tiene historial y auditoría propios. La exportación CSV/Excel mostrada corresponde al módulo de auditoría de dictámenes y recomendaciones, no a todos los datos del sistema. Son controles implementados: no equivalen por sí solos a una certificación de seguridad o cumplimiento normativo.', ['src/lib/auth/authorization.ts','src/lib/auth/case-scope.ts','src/features/agenda/application/agenda-creation-scope.ts','src/lib/admin/auditoria.ts','src/app/api/admin/auditoria/export/route.ts']);

// 13 — Salidas.
newSlide('12 / Resultados del sistema','Información lista para consultar y compartir','Documentos y reportes generados desde la información registrada.');
const docs=[
  ['Origen','Formulario de determinación\nde origen.','PDF'],
  ['Dictamen PCL','Resultado documentado\nde la valoración.','PDF'],
  ['Recomendación','Concepto y recomendaciones\nlaborales.','PDF'],
  ['Cita médica','Recordatorio con datos\nde la atención programada.','PDF'],
];
docs.forEach((d,i)=>{
  const x=72+i*370;box(x,303,346,335,C.white,18);
  icon('document',x+27,334,57,C.blue);tag(d[2],x+238,342,79);
  text(d[0],x+27,439,292,34,C.navy,true);
  text(d[1],x+27,505,292,27,C.muted);
});
box(72,671,1456,117,C.navy,18);icon('grid',100,705,47,C.aqua);
text('Auditoría exportable',175,695,546,32,C.white,true);
text('Eventos y cambios en CSV / Excel.',788,711,680,29,C.soft);
note('Las rutas de generación de PDF están presentes para origen, PCL y recomendaciones. Recepción genera un recordatorio de la cita para abrir o imprimir; el documento requiere la clave institucional correspondiente en el entorno. Auditoría exporta registros filtrados a CSV o XLSX. No se muestran formatos con pacientes reales. Los diagramas de esta presentación son ilustrativos y editables. La generación de documentos no implica envío automático ni firma digital certificada.', ['src/app/api/dictamenes/[id]/origen/pdf/route.ts','src/app/api/dictamenes/[id]/pdf-react/route.ts','src/app/api/recomendaciones/[id]/pdf-react/route.ts','src/features/reception/application/reminder-document-service.ts','src/app/api/admin/auditoria/export/route.ts']);

// 14 — Ejemplo.
newSlide('13 / Caso ilustrativo','Un docente requiere una valoración laboral','Ejemplo hipotético para mostrar cómo se utilizan los módulos.');
const example=[
  ['1','Preparación','Se configuran horarios y cupos\npara los médicos de la sede.'],
  ['2','Recepción','Se consulta al docente y se\nselecciona una cita disponible.'],
  ['3','Gestión de la cita','Se activa o se registra una\nreprogramación si es necesaria.'],
  ['4','Valoración','El profesional diligencia el caso\ny los formularios aplicables.'],
  ['5','Documento','Se revisa, se cierra y se genera\nel PDF correspondiente.'],
  ['6','Seguimiento','Se consulta el estado y el\nhistorial de modificaciones.'],
];
example.forEach((e,i)=>{
  const x=72+i%3*495,y=287+Math.floor(i/3)*242;
  box(x,y,466,215,C.white,18);tag(e[0],x+25,y+23,51,C.mint,C.teal);
  text(e[1],x+94,y+25,344,32,C.navy,true);text(e[2],x+25,y+103,416,28,C.muted);
});
note('Narración sugerida: “Un docente necesita una valoración. Primero debe existir disponibilidad médica; luego admisiones busca al paciente y asigna la cita. Los cambios de fecha quedan registrados. El médico documenta la valoración en el flujo que corresponda y, una vez revisado, cierra y genera el documento. Más adelante un usuario autorizado puede consultar el estado o revisar una modificación”. Es un ejemplo conceptual, sin datos personales ni supuestos resultados médicos. La cita y el dictamen tienen flujos propios; no se ha verificado una creación automática del segundo a partir de la primera.', ['src/features/reception/application/reception-service.ts','src/features/formulario-origen/application/origin-service.ts','src/components/dictamen/DictamenRightPanel.tsx']);

// 15 — Beneficios y medición.
newSlide('14 / Valor esperado','Qué mejora y cómo comprobarlo','Beneficios esperados que deben validarse durante la operación.');
text('BENEFICIO BUSCADO',94,286,650,23,C.teal,true);
text('INDICADOR PROPUESTO',842,286,640,23,C.blue,true);
const benefit=[
  ['Menos trabajo administrativo repetido','Tiempo promedio para asignar una cita.'],
  ['Documentos más consistentes','Casos devueltos por datos incompletos.'],
  ['Mejor uso de la disponibilidad','Cupos asignados sobre cupos disponibles.'],
  ['Mayor visibilidad del trámite','Tiempo entre registro y cierre del caso.'],
  ['Cambios más fáciles de revisar','Reaperturas con motivo e historial completo.'],
];
benefit.forEach((b,i)=>{
  const y=336+i*82;box(72,y,1456,69,i%2?C.pale:C.white,10);
  text(b[0],96,y+18,674,28,C.navy,true);text(b[1],842,y+18,659,27,C.muted);
});
text('Medir una línea base y comparar los resultados del piloto.',78,779,1430,25,C.teal,true);
note('No se encontraron métricas de impacto del proyecto, por lo que los beneficios se expresan como hipótesis a validar. Se propone tomar una línea base antes del piloto y comparar un período equivalente después. Para citas, medir tiempos y ocupación; para documentos, devoluciones y tiempo hasta el cierre; para trazabilidad, verificar la presencia de motivos y eventos. Estos indicadores son una propuesta de evaluación y no se presentan como un tablero analítico ya implementado. No comprometer porcentajes de ahorro sin evidencia.', ['src/lib/module-navigation.ts','prisma/schema.prisma']);

// 16 — Estado.
newSlide('15 / Estado y evolución','Funciones implementadas y próximos pasos','Alcance identificado en el repositorio y en su documentación técnica.');
box(72,294,713,438,C.white,20);tag('PRESENTE EN EL CÓDIGO',102,324,370,C.mint,C.teal);
const implemented=['Cuatro módulos y permisos por perfil.','Origen, PCL y recomendaciones.','Agenda, cupos y gestión de citas.','PDF, historial y auditoría exportable.'];
implemented.forEach((a,i)=>{icon('check',102,405+i*72,29,C.teal);text(a,151,405+i*72,598,27,C.muted);});
box(815,294,713,438,C.navy,20);tag('PARA LA PUESTA EN OPERACIÓN',845,324,575,C.darkCard,C.aqua);
const pending=['Validar catálogos y formatos institucionales.','Configurar entornos, claves y permisos.','Completar la conexión clínica externa.','Realizar pruebas integrales y un piloto.'];
pending.forEach((a,i)=>{text(String(i+1).padStart(2,'0'),845,405+i*72,47,23,C.aqua,true);text(a,905,403+i*72,585,27,C.soft);});
text('Implementación identificada no equivale a despliegue productivo verificado.',78,776,1440,24,C.muted);
note('La revisión confirma archivos de interfaz, rutas, servicios, modelos y pruebas para las funciones descritas, pero no acredita despliegue productivo ni éxito en todos los entornos. El procesador de eventos clínicos existe, pero su comentario técnico indica que no expone endpoint HTTP hasta contar con el verificador institucional. La documentación de recepción lista catálogos, formatos, fuentes de soporte clínico y configuración de secretos pendientes de la institución. Antes de uso real corresponde confirmar el estado de esos insumos, migraciones, permisos y pruebas integrales. Se presenta como próximos pasos de implementación, no como una auditoría de cumplimiento.', ['src/features/reception/application/clinical-inbox-service.ts','docs/history/patient-reception-2026-07.md','package.json']);

// 17 — Cierre.
newSlide('16 / Cierre','', '',true);
text('Una atención coordinada.\nUn trámite trazable.',76,189,1450,79,C.white,true);
text('Dictamy reúne planificación, recepción y documentación\npara apoyar el trabajo de medicina laboral.',80,434,1380,37,C.soft);
const closing=[['Organizar','Datos, agenda y documentos.'],['Agilizar','Registro y preparación de salidas.'],['Dar seguimiento','Estados, cambios y responsables.']];
closing.forEach((a,i)=>{
  const x=80+i*492;line(x,596,x+440,596,C.aqua,3);text(a[0],x,626,439,35,C.white,true);text(a[1],x,680,439,26,C.soft);
});
text('Siguiente paso propuesto: validar el flujo con usuarios y ejecutar un piloto.',80,776,1420,27,C.aqua,true);
note('Cierre sugerido: “El valor de Dictamy está en reunir el trabajo operativo y documental en una plataforma con responsabilidades y seguimiento. La siguiente etapa es validar el flujo con los usuarios, completar la configuración institucional y medir el resultado de un piloto”. Abrir espacio para preguntas sobre funciones o una demostración. Si la audiencia es no técnica, finalizar aquí; la siguiente diapositiva es un anexo para explicar la base tecnológica.', ['src/lib/module-navigation.ts','docs/history/patient-reception-2026-07.md']);

// 18 — Anexo técnico.
newSlide('Anexo / Arquitectura','Base técnica del proyecto','Aplicación web con reglas de negocio y persistencia de datos.');
const tech=[
  [72,'Interfaz web','Next.js · React\nTypeScript · Tailwind','Navegación y formularios\nsegún permisos.'],
  [567,'Servicios y reglas','Rutas API · Validaciones\nServicios de aplicación','Procesos de agenda,\nrecepción y dictámenes.'],
  [1062,'Persistencia','PostgreSQL · Prisma','Datos, relaciones,\nversiones e historial.'],
];
tech.forEach(([x,t,stack,b])=>{
  box(x,313,466,339,C.white,20);text(t,x+27,350,412,34,C.navy,true);text(stack,x+27,420,412,29,C.blue,true);text(b,x+27,546,412,27,C.muted);
});
arrow(547,479,12);arrow(1042,479,12);
box(72,691,1456,98,C.pale,15);text('Elementos transversales',99,716,470,28,C.navy,true);text('Sesión y permisos  ·  Validaciones  ·  PDF  ·  Pruebas',591,718,905,26,C.blue);
note('La arquitectura se describe a partir de package.json, las carpetas del código y el esquema Prisma. Next.js y React construyen la interfaz; TypeScript y validaciones estructuran los contratos; Prisma accede a PostgreSQL. Agenda, recepción y origen cuentan con separación de dominio, aplicación y presentación. La generación de PDF usa librerías incluidas en el proyecto. Hay scripts de pruebas para navegación, origen, agenda y recepción. En esta tarea no se ejecutaron pruebas de toda la aplicación ni se certificó su rendimiento: la verificación realizada corresponde a la presentación. No se infiere escalabilidad, alta disponibilidad o integración FOMAG externa a partir del nombre del proyecto.', ['package.json','prisma/schema.prisma','src/features/agenda','src/features/reception','src/features/formulario-origen']);

const esc = v => String(v).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;').replaceAll('"','&quot;');
function svg(slide) {
  const out=[`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">`];
  for(const a of slide.items){
    if(a.kind==='box') out.push(`<rect x="${a.x}" y="${a.y}" width="${a.w}" height="${a.h}" rx="${a.r}" fill="${a.fill?'#'+a.fill:'none'}" stroke="${a.stroke?'#'+a.stroke:'none'}" stroke-width="2.3"/>`);
    if(a.kind==='circle') out.push(`<ellipse cx="${a.x+a.w/2}" cy="${a.y+a.h/2}" rx="${a.w/2}" ry="${a.h/2}" fill="${a.fill?'#'+a.fill:'none'}" stroke="${a.stroke?'#'+a.stroke:'none'}" stroke-width="2.3"/>`);
    if(a.kind==='line') out.push(`<line x1="${a.x1}" y1="${a.y1}" x2="${a.x2}" y2="${a.y2}" stroke="#${a.color}" stroke-width="${a.width}" stroke-linecap="round"/>`);
    if(a.kind==='text'){
      const x=a.align==='center'?a.x+a.w/2:a.align==='right'?a.x+a.w:a.x;
      const anchor=a.align==='center'?'middle':a.align==='right'?'end':'start';
      out.push(`<text x="${x}" y="${a.y+a.size*.94}" font-family="Liberation Sans, Arial, sans-serif" font-size="${a.size}" font-weight="${a.bold?700:400}" fill="#${a.color}" text-anchor="${anchor}">${esc(a.text)}</text>`);
    }
  }
  return out.join('')+'</svg>';
}
function validate() {
  const problems=[];
  for(const [i,sl] of slides.entries()) {
    for(const a of sl.items) {
      if(a.kind!=='line' && (a.x<0 || a.y<0 || a.x+a.w>W+1 || a.y+a.h>H+1))
        problems.push(`Diapositiva ${i+1}: fuera de lienzo: ${a.text||a.kind}`);
      if(a.kind==='text') {
        // The content band ends above the footer rule.
        if(a.y>265 && a.y<836 && a.y+a.h>833)
          problems.push(`Diapositiva ${i+1}: texto invade pie: ${a.text}`);
      }
    }
    const textBoxes=sl.items.filter(a=>a.kind==='text'&&a.text);
    for(let p=0;p<textBoxes.length;p++) for(let q=p+1;q<textBoxes.length;q++){
      const a=textBoxes[p],b=textBoxes[q];
      const intersectionW=Math.min(a.x+a.w,b.x+b.w)-Math.max(a.x,b.x);
      const intersectionH=Math.min(a.y+a.h,b.y+b.h)-Math.max(a.y,b.y);
      if(intersectionW>2&&intersectionH>2)
        problems.push(`Diapositiva ${i+1}: cajas de texto superpuestas: "${a.text}" / "${b.text}"`);
    }
    if(!sl.notes || !sl.sources.length) problems.push(`Diapositiva ${i+1}: sin notas o fuente`);
  }
  if(problems.length) throw new Error(problems.join('\n'));
}
async function main() {
  validate();
  const pptx=new PptxGenJS();
  pptx.defineLayout({name:'DICTAMY_WIDE',width:W/120,height:H/120});pptx.layout='DICTAMY_WIDE';
  pptx.author='Proyecto Dictamy';pptx.subject='Funciones, problemática, alcance y valor del proyecto';
  pptx.title='Dictamy — Presentación del proyecto';pptx.company='';pptx.lang='es-CO';
  pptx.theme={headFontFace:'Arial',bodyFontFace:'Arial',lang:'es-CO'};
  for(const [i,sl] of slides.entries()){
    const page=pptx.addSlide();
    for(const a of sl.items){
      if(a.kind==='box' || a.kind==='circle'){
        const type=a.kind==='circle'?pptx.ShapeType.ellipse:a.r?pptx.ShapeType.roundRect:pptx.ShapeType.rect;
        page.addShape(type,{x:a.x/120,y:a.y/120,w:a.w/120,h:a.h/120,
          radius:(a.r||0)/120,rectRadius:(a.r||0)/120,
          fill:a.fill?{color:a.fill}:{color:C.white,transparency:100},
          line:a.stroke?{color:a.stroke,width:1.38}:{color:a.fill||C.white,transparency:100}});
      } else if(a.kind==='line'){
        page.addShape(pptx.ShapeType.line,{x:Math.min(a.x1,a.x2)/120,y:Math.min(a.y1,a.y2)/120,w:Math.abs(a.x2-a.x1)/120,h:Math.abs(a.y2-a.y1)/120,
          flipV:(a.x2-a.x1)*(a.y2-a.y1)<0,line:{color:a.color,width:a.width*.6,beginArrowType:'none',endArrowType:'none'}});
      } else {
        page.addText(a.text,{x:a.x/120,y:a.y/120,w:a.w/120,h:a.h/120,
          fontFace:'Arial',fontSize:a.size*.6,color:a.color,bold:a.bold,
          align:a.align,valign:'mid',margin:0,breakLine:false,paraSpaceAfterPt:0,
          transparency:0,lang:'es-CO',isTextBox:true});
      }
    }
    page.addNotes(`${sl.notes}\n\nFuentes del proyecto:\n${sl.sources.map(x=>'- '+x).join('\n')}`);
    const base=path.join(PREVIEW,`diapositiva-${String(i+1).padStart(2,'0')}`);
    await sharp(Buffer.from(svg(sl))).png().toFile(base+'.png');
  }
  await pptx.writeFile({fileName:path.join(OUT,'Dictamy_Presentacion_Proyecto.pptx')});
  const pdf=new PDFDocument({autoFirstPage:false,compress:true,info:{Title:pptx.title,Author:'Proyecto Dictamy',Subject:pptx.subject}});
  pdf.registerFont('regular',FONT).registerFont('bold',BOLD);
  const output=fs.createWriteStream(path.join(OUT,'Dictamy_Presentacion_Proyecto.pdf'));
  pdf.pipe(output);
  for(const sl of slides){
    pdf.addPage({size:[960,540],margin:0});
    pdf.save().scale(.6);
    for(const a of sl.items){
      if(a.kind==='box'||a.kind==='circle'){
        if(a.kind==='circle') pdf.ellipse(a.x+a.w/2,a.y+a.h/2,a.w/2,a.h/2);
        else if(a.r) pdf.roundedRect(a.x,a.y,a.w,a.h,Math.min(a.r,a.h/2,a.w/2));
        else pdf.rect(a.x,a.y,a.w,a.h);
        if(a.fill&&a.stroke) pdf.lineWidth(2.3).fillAndStroke('#'+a.fill,'#'+a.stroke);
        else if(a.fill) pdf.fill('#'+a.fill); else if(a.stroke) pdf.lineWidth(2.3).stroke('#'+a.stroke);
      } else if(a.kind==='line'){
        pdf.moveTo(a.x1,a.y1).lineTo(a.x2,a.y2).lineWidth(a.width).lineCap('round').stroke('#'+a.color);
      } else {
        const tw=measure(a.text,a.size,a.bold);
        const tx=a.align==='center'?a.x+(a.w-tw)/2:a.align==='right'?a.x+a.w-tw:a.x;
        pdf.font(a.bold?'bold':'regular').fontSize(a.size).fillColor('#'+a.color)
          .text(a.text,tx,a.y+3,{lineBreak:false});
      }
    }
    pdf.restore();
  }
  pdf.end();await new Promise(resolve=>output.on('finish',resolve));
  const contact=await Promise.all(slides.map(async(sl,i)=>({
    input:await sharp(path.join(PREVIEW,`diapositiva-${String(i+1).padStart(2,'0')}.png`)).resize(480,270).png().toBuffer(),
    left:20+(i%3)*500,top:20+Math.floor(i/3)*290,
  })));
  await sharp({create:{width:1520,height:1760,channels:3,background:'#D8E3EF'}}).composite(contact).png().toFile(path.join(OUT,'Vista_general.png'));
  const guide=[
    '# Dictamy — Guion para presentar el proyecto','',
    'Presentación en español basada en el código y documentación local. Las primeras 17 diapositivas forman el recorrido principal (12–15 minutos); la 18 es un anexo técnico. Los diagramas son ilustrativos, sin datos de pacientes. Los beneficios son esperados y los indicadores se proponen para un piloto. No se verificó un despliegue productivo.',
    '',
    'El PowerPoint incluye estas explicaciones en sus notas del presentador. La versión PDF conserva el contenido visual. Todos los textos y diagramas del PowerPoint son editables.',
    '',
    ...slides.flatMap((sl,i)=>[`## ${String(i+1).padStart(2,'0')}. ${sl.title|| (i===0?'Dictamy — Portada':'Cierre')}`,'',sl.notes,'','Fuentes revisadas:',...sl.sources.map(x=>`- \`${x}\``),'']),
    '## Demostración sugerida (opcional, 5 minutos)','',
    '1. Ingresar con un usuario de demostración y mostrar sus módulos.',
    '2. En Agenda, configurar una disponibilidad y revisar la vista previa.',
    '3. En Recepción, consultar un paciente ficticio y mostrar cupos e historial.',
    '4. Abrir un caso de demostración y explicar origen, PCL y cierre.',
    '5. Mostrar una salida PDF y un registro de auditoría.',
    '',
    'Utilizar un entorno de demostración y registros ficticios. Si no hay un entorno preparado, los diagramas de esta presentación permiten explicar el recorrido.',
    '',
    '## Preguntas frecuentes','',
    '**¿El sistema toma la decisión médica?** La plataforma organiza datos, aplica cálculos programados y genera documentos; la valoración y su sustentación corresponden al profesional.',
    '',
    '**¿Envía recordatorios por WhatsApp o correo?** La función identificada genera un recordatorio PDF. El medio de solicitud de cita es un dato de registro, no una integración de mensajería.',
    '',
    '**¿Cuenta con historia clínica externa integrada?** Existe un procesador para eventos clínicos verificados. El código documenta que falta conectar el verificador institucional y no expone todavía ese endpoint externo.',
    '',
    '**¿Cuánto tiempo ahorra?** No hay una medición de impacto verificada. Se propone comparar tiempos e indicadores antes y después de un piloto.',
    '',
    '**¿Está listo en producción?** La revisión demuestra implementación en el repositorio. El estado de despliegue, configuración institucional y validación integral debe confirmarse en el entorno objetivo.',
    '',
    '## Reproducir los archivos','',
    'El generador `generar-presentacion.cjs` utiliza PptxGenJS y las dependencias transitivas PDFKit/Sharp del proyecto. Por defecto busca PptxGenJS en `/tmp/dictamy-presentation-tools/node_modules/pptxgenjs`; también acepta `PPTXGENJS_PATH` con otra ubicación.',
    '',
    'Ejecutar desde la raíz: `node docs/presentacion/generar-presentacion.cjs`.',
  ].join('\n');
  fs.writeFileSync(path.join(OUT,'Guion_del_presentador.md'),guide);
  fs.writeFileSync(path.join(OUT,'contenido-presentacion.json'),JSON.stringify(slides.map((sl,i)=>({numero:i+1,titulo:sl.title,textos:sl.items.filter(x=>x.kind==='text').map(x=>x.text),notas:sl.notes,fuentes:sl.sources})),null,2));
  console.log(`Generadas ${slides.length} diapositivas editables, PDF, guion y vistas previas en ${OUT}`);
}
main().catch(err=>{console.error(err);process.exitCode=1;});
