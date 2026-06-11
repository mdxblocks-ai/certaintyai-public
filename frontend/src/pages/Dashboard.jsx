import { useState, useEffect, useRef } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useForm } from 'react-hook-form'
import api from '../lib/api'
import voiceKnowledgeBase from '../lib/voiceKnowledgeBase.json'
import SurveyWizard from '../components/survey/SurveyWizard'
import AgentBuilder from './AgentBuilder'
import Sidebar from '../components/Sidebar'


const SHOW_AI_READINESS_NAV = false;

// Lucide-like custom inline SVGs for premium look & feel
const Icons = {
  ControlTower: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
    </svg>
  ),
  Integrations: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M9 16h6M12 12v6" />
      <circle cx="12" cy="6" r="4" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  ),
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </svg>
  ),
  Readiness: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M9 11l3 3L22 4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  Insights: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  ),
  Tools: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.1a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  PluginStore: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" y1="22.08" x2="12" y2="12" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Mic: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
      <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
      <line x1="12" y1="19" x2="12" y2="23" />
      <line x1="8" y1="23" x2="16" y2="23" />
    </svg>
  ),
  Volume: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
    </svg>
  ),
  VolumeX: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
      <line x1="23" y1="9" x2="17" y2="15" />
      <line x1="17" y1="9" x2="23" y2="15" />
    </svg>
  ),
  Lightbulb: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 text-cyan-400">
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .6 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <line x1="9" y1="18" x2="15" y2="18" />
      <line x1="10" y1="22" x2="14" y2="22" />
    </svg>
  ),
  Portfolio: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Reports: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-5 h-5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <circle cx="8" cy="9" r="1" />
    </svg>
  ),
}

const copilotModels = [
  'Gemini 2.5 Pro',
  'Gemini 2.5 Flash',
  'GPT-5.5',
  'GPT-5.4',
  'Claude Sonnet',
  'Claude Opus',
  'Grok',
  'DeepSeek',
  'Kimi',
  'Llama'
]

const copilotLanguages = [
  { name: 'English (US)', code: 'en-US' },
  { name: 'English (India)', code: 'en-IN' },
  { name: 'English (UK)', code: 'en-GB' },
  { name: 'English (Australia)', code: 'en-AU' },
  { name: 'English (Canada)', code: 'en-CA' },
  { name: 'English (Africa)', code: 'en-ZA' },
  { name: 'Chinese-accented English', code: 'en-US' },
  { name: 'Arabic-accented English', code: 'en-US' },
  { name: 'Hindi', code: 'hi-IN' },
  { name: 'Urdu', code: 'ur-PK' },
  { name: 'Spanish', code: 'es-ES' },
  { name: 'French', code: 'fr-FR' },
  { name: 'German', code: 'de-DE' },
  { name: 'Portuguese', code: 'pt-PT' },
  { name: 'Arabic', code: 'ar-SA' },
  { name: 'Kannada', code: 'kn-IN' },
  { name: 'Telugu', code: 'te-IN' },
  { name: 'Tamil', code: 'ta-IN' },
  { name: 'Malayalam', code: 'ml-IN' },
  { name: 'Japanese', code: 'ja-JP' },
  { name: 'Korean', code: 'ko-KR' },
  { name: 'Chinese', code: 'zh-CN' }
]

const getTranslatedResponse = (text, lang) => {
  if (lang.startsWith('English') || lang.includes('English')) return text

  let translated = text

  const translations = {
    'Spanish': [
      ['Enterprise AI Readiness Assessment Report', 'Reporte de Evaluación de Preparación para la IA Empresarial'],
      ['Classification: Board Confidential', 'Clasificación: Confidencial de la Junta'],
      ['Executive Summary', 'Resumen Ejecutivo'],
      ['Pillars of Assessment', 'Pilares de la Evaluación'],
      ['Strategic Alignment', 'Alineación Estratégica'],
      ['Data Readiness', 'Preparación de Datos'],
      ['Governance & Risk', 'Gobernanza y Riesgo'],
      ['Tech Stack & Integration', 'Pila Tecnológica e Integración'],
      ['Culture & Skills', 'Cultura y Habilidades'],
      ['Recommended Action Items', 'Acciones Recomendadas'],
      ['Deconstructing Your AI Readiness Score', 'Deconstruyendo su Puntaje de Preparación para la IA'],
      ['Key Gaps Identified', 'Brechas Clave Identificadas'],
      ['Pathway to Level 4', 'Camino al Nivel 4'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', 'Plan de Adopción y Escalamiento de IA Empresarial a 90 Días'],
      ['Establish the Governance Foundation', 'Establecer las Bases de la Gobernanza'],
      ['Knowledge Ingestion & GraphRAG', 'Ingesta de Conocimiento y GraphRAG'],
      ['Operational Scaling & Value Realization', 'Escalamiento Operativo y Realización de Valor'],
      ['Copilot Strategic Analysis', 'Análisis Estratégico del Copiloto'],
      ['Thank you for your inquiry about', 'Gracias por su consulta sobre'],
      ['As your enterprise AI co-pilot, I recommend', 'Como su copiloto de IA empresarial, le recomiendo']
    ],
    'French': [
      ['Enterprise AI Readiness Assessment Report', 'Rapport d\'Évaluation de la Préparation à l\'IA d\'Entreprise'],
      ['Classification: Board Confidential', 'Classification : Confidentiel du Conseil'],
      ['Executive Summary', 'Résumé Exécutif'],
      ['Pillars of Assessment', 'Piliers de l\'Évaluation'],
      ['Strategic Alignment', 'Alignement Stratégique'],
      ['Data Readiness', 'Préparation des Données'],
      ['Governance & Risk', 'Gouvernance et Risques'],
      ['Tech Stack & Integration', 'Pile Technique et Intégration'],
      ['Culture & Skills', 'Culture et Compétences'],
      ['Recommended Action Items', 'Actions Recommandées'],
      ['Deconstructing Your AI Readiness Score', 'Déconstruction de votre Score de Préparation à l\'IA'],
      ['Key Gaps Identified', 'Lacunes Clés Identifiées'],
      ['Pathway to Level 4', 'Chemin vers le Niveau 4'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', 'Feuille de Route d\'Adoption et d\'Évolution de l\'IA à 90 Jours'],
      ['Establish the Governance Foundation', 'Établir les Bases de la Gouvernance'],
      ['Knowledge Ingestion & GraphRAG', 'Ingestion des Connaissances et GraphRAG'],
      ['Operational Scaling & Value Realization', 'Mise à l\'Échelle Opérationnelle et Réalisation de la Valeur'],
      ['Copilot Strategic Analysis', 'Analyse Stratégique du Copilote'],
      ['Thank you for your inquiry about', 'Merci pour votre demande concernant'],
      ['As your enterprise AI co-pilot, I recommend', 'En tant que copilote IA de votre entreprise, je recommande']
    ],
    'German': [
      ['Enterprise AI Readiness Assessment Report', 'Bewertungsbericht zur KI-Bereitschaft von Unternehmen'],
      ['Classification: Board Confidential', 'Klassifizierung: Vertraulich für den Vorstand'],
      ['Executive Summary', 'Management-Zusammenfassung'],
      ['Pillars of Assessment', 'Bewertungssäulen'],
      ['Strategic Alignment', 'Strategische Ausrichtung'],
      ['Data Readiness', 'Datenbereitschaft'],
      ['Governance & Risk', 'Governance & Risiko'],
      ['Tech Stack & Integration', 'Technologiestapel & Integration'],
      ['Culture & Skills', 'Kultur & Fähigkeiten'],
      ['Recommended Action Items', 'Empfohlene Maßnahmen'],
      ['Deconstructing Your AI Readiness Score', 'Analyse Ihres KI-Bereitschaftsscores'],
      ['Key Gaps Identified', 'Identifizierte Hauptlücken'],
      ['Pathway to Level 4', 'Weg zu Stufe 4'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90-Tage-Roadmap für die KI-Adoption und -Skalierung'],
      ['Establish the Governance Foundation', 'Etablierung des Governance-Fundaments'],
      ['Knowledge Ingestion & GraphRAG', 'Wissensaufnahme & GraphRAG'],
      ['Operational Scaling & Value Realization', 'Operative Skalierung & Wertrealisierung'],
      ['Copilot Strategic Analysis', 'Strategische Copilot-Analyse'],
      ['Thank you for your inquiry about', 'Vielen Dank für Ihre Anfrage zu'],
      ['As your enterprise AI co-pilot, I recommend', 'Als Ihr Enterprise AI Co-Pilot empfehle ich']
    ],
    'Portuguese': [
      ['Enterprise AI Readiness Assessment Report', 'Relatório de Avaliação de Prontidão de IA Empresarial'],
      ['Classification: Board Confidential', 'Classificação: Confidencial do Conselho'],
      ['Executive Summary', 'Resumo Executivo'],
      ['Pillars of Assessment', 'Pilares de Avaliação'],
      ['Strategic Alignment', 'Alinhamento Estratégico'],
      ['Data Readiness', 'Prontidão de Dados'],
      ['Governance & Risk', 'Governança e Risco'],
      ['Tech Stack & Integration', 'Pilha de Tecnologia e Integração'],
      ['Culture & Skills', 'Cultura e Habilidades'],
      ['Recommended Action Items', 'Ações Recomendadas'],
      ['Deconstructing Your AI Readiness Score', 'Desconstruindo sua Pontuação de Prontidão para IA'],
      ['Key Gaps Identified', 'Principais Lacunas Identificadas'],
      ['Pathway to Level 4', 'Caminho para o Nível 4'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', 'Roteiro de Adoção e Escalonamento de IA Empresarial de 90 Dias'],
      ['Establish the Governance Foundation', 'Estabelecer a Base de Governança'],
      ['Knowledge Ingestion & GraphRAG', 'Ingestão de Conhecimento e GraphRAG'],
      ['Operational Scaling & Value Realization', 'Escalonamento Operacional e Realização de Valor'],
      ['Copilot Strategic Analysis', 'Análise Estratégica do Copiloto'],
      ['Thank you for your inquiry about', 'Obrigado por sua consulta sobre'],
      ['As your enterprise AI co-pilot, I recommend', 'Como seu co-piloto de IA empresarial, recomendo']
    ],
    'Arabic': [
      ['Enterprise AI Readiness Assessment Report', 'تقرير تقييم جاهزية الذكاء الاصطناعي للمؤسسات'],
      ['Classification: Board Confidential', 'التصنيف: سري للغاية للمجلس'],
      ['Executive Summary', 'الملخص التنفيذي'],
      ['Pillars of Assessment', 'ركائز التقييم'],
      ['Strategic Alignment', 'المحاذاة الإستراتيجية'],
      ['Data Readiness', 'جاهزية البيانات'],
      ['Governance & Risk', 'الحوكمة والمخاطر'],
      ['Tech Stack & Integration', 'البنية التكنولوجية والتكامل'],
      ['Culture & Skills', 'الثقافة والمهارات'],
      ['Recommended Action Items', 'خطوات العمل الموصى بها'],
      ['Deconstructing Your AI Readiness Score', 'تحليل درجة جاهزية الذكاء الاصطناعي الخاصة بك'],
      ['Key Gaps Identified', 'الثغرات الرئيسية المحددة'],
      ['Pathway to Level 4', 'المسار إلى المستوى 4'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', 'خارطة طريق تبني وتوسيع نطاق الذكاء الاصطناعي لمدة 90 يومًا'],
      ['Establish the Governance Foundation', 'تأسيس قاعدة الحوكمة'],
      ['Knowledge Ingestion & GraphRAG', 'استيعاب المعرفة وتقنية GraphRAG'],
      ['Operational Scaling & Value Realization', 'التوسع التشغيلي وتحقيق القيمة'],
      ['Copilot Strategic Analysis', 'التحليل الإستراتيجي للمساعد الذكي'],
      ['Thank you for your inquiry about', 'نشكرك على استفسارك بشأن'],
      ['As your enterprise AI co-pilot, I recommend', 'بصفتي مساعد الذكاء الاصطناعي لمؤسستك، أوصي بـ']
    ],
    'Hindi': [
      ['Enterprise AI Readiness Assessment Report', 'एंटरप्राइज एआई तत्परता मूल्यांकन रिपोर्ट'],
      ['Classification: Board Confidential', 'वर्गीकरण: बोर्ड गोपनीय'],
      ['Executive Summary', 'कार्यकारी सारांश'],
      ['Pillars of Assessment', 'मूल्यांकन के स्तंभ'],
      ['Strategic Alignment', 'रणनीतिक संरेखण'],
      ['Data Readiness', 'डेटा तत्परता'],
      ['Governance & Risk', 'गवर्नेंस और जोखिम'],
      ['Tech Stack & Integration', 'तकनीकी स्टैक और एकीकरण'],
      ['Culture & Skills', 'संस्कृति और कौशल'],
      ['Recommended Action Items', 'अनुशंसित कार्रवाई आइटम'],
      ['Deconstructing Your AI Readiness Score', 'आपके एआई तत्परता स्कोर का विश्लेषण'],
      ['Key Gaps Identified', 'पहचाने गए मुख्य अंतराल'],
      ['Pathway to Level 4', 'स्तर 4 का मार्ग'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90-दिवसीय एंटरप्राइज एआई रोडमैप'],
      ['Establish the Governance Foundation', 'गवर्नेंस फाउंडेशन की स्थापना'],
      ['Knowledge Ingestion & GraphRAG', 'ज्ञान अंतर्ग्रहण और GraphRAG'],
      ['Operational Scaling & Value Realization', 'परिचालन स्केलिंग और मूल्य प्राप्ति'],
      ['Copilot Strategic Analysis', 'रणनीतिक को-पायलट विश्लेषण'],
      ['Thank you for your inquiry about', 'आपके प्रश्न के लिए धन्यवाद'],
      ['As your enterprise AI co-pilot, I recommend', 'आपके एंटरप्राइज एआई को-पायलट के रूप में, मैं सलाह देता हूँ']
    ],
    'Kannada': [
      ['Enterprise AI Readiness Assessment Report', 'ಉದ್ಯಮ AI ಸಿದ್ಧತಾ ಮೌಲ್ಯಮಾಪನ ವರದಿ'],
      ['Classification: Board Confidential', 'ವರ್ಗೀಕರಣ: ಮಂಡಳಿ ಗೌಪ್ಯ'],
      ['Executive Summary', 'ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಾರಾಂಶ'],
      ['Pillars of Assessment', 'ಮೌಲ್ಯಮಾಪನದ ಪ್ರಮುಖ ಸ್ತಂಭಗಳು'],
      ['Strategic Alignment', 'ಕಾರ್ಯತಂತ್ರದ ಹೊಂದಾಣಿಕೆ'],
      ['Data Readiness', 'ಡೇಟಾ ಸಿದ್ಧತೆ'],
      ['Governance & Risk', 'ಆಡಳಿತ ಮತ್ತು ಅಪಾಯ'],
      ['Tech Stack & Integration', 'ತಂತ್ರಜ್ಞಾನ ಮತ್ತು ಏಕೀಕರಣ'],
      ['Culture & Skills', 'ಸಂಸ್ಕೃತಿ ಮತ್ತು ಕೌಶಲ್ಯಗಳು'],
      ['Recommended Action Items', 'ಶಿಫಾರಸು ಮಾಡಲಾದ ಕ್ರಮಗಳು'],
      ['Deconstructing Your AI Readiness Score', 'ನಿಮ್ಮ AI ಸಿದ್ಧತಾ ಸ್ಕೋರ್ ವಿವರಣೆ'],
      ['Key Gaps Identified', 'ಗುರುತಿಸಲಾದ ಪ್ರಮುಖ ಕೊರತೆಗಳು'],
      ['Pathway to Level 4', 'ಹಂತ 4 ಕ್ಕೆ ತಲುಪುವ ಮಾರ್ಗ'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90-ದಿನಗಳ ಉದ್ಯಮ AI ಅಳವಡಿಕೆ ಮತ್ತು ರೋಡ್‌ಮ್ಯಾಪ್'],
      ['Establish the Governance Foundation', 'ಆಡಳಿತದ ಅಡಿಪಾಯ ಸ್ಥಾಪನೆ'],
      ['Knowledge Ingestion & GraphRAG', 'ಜ್ಞಾನ ಗ್ರಹಿಕೆ ಮತ್ತು GraphRAG'],
      ['Operational Scaling & Value Realization', 'ಕಾರ್ಯಾಚರಣೆಯ ಸ್ಕೇಲಿಂಗ್ ಮತ್ತು ಮೌಲ್ಯ ಸಾಕ್ಷಾತ್ಕಾರ'],
      ['Copilot Strategic Analysis', 'ಕಾರ್ಯತಂತ್ರದ ಸಹ-ಪೈಲಟ್ ವಿಶ್ಲೇಷಣೆ'],
      ['Thank you for your inquiry about', 'ಕುರಿತು ನಿಮ್ಮ ವಿಚಾರಣೆಗೆ ಧನ್ಯವಾದಗಳು'],
      ['As your enterprise AI co-pilot, I recommend', 'ನಿಮ್ಮ ಉದ್ಯಮದ AI ಸಹ-ಪೈಲಟ್ ಆಗಿ, ನಾನು ಶಿಫಾರಸು ಮಾಡುತ್ತೇನೆ']
    ],
    'Telugu': [
      ['Enterprise AI Readiness Assessment Report', 'ఎంటర్‌ప్రైజ్ AI సన్నద్ధత అంచనా నివేదిక'],
      ['Classification: Board Confidential', 'ವರ್గీకరణ: బోర్డు రహస్యం'],
      ['Executive Summary', 'కార్యనిర్వాహక సారాంశం'],
      ['Pillars of Assessment', 'అంచనా స్తంభాలు'],
      ['Strategic Alignment', 'వ్యూహాత్మక సమన్వయం'],
      ['Data Readiness', 'డేటా సన్నద్ధత'],
      ['Governance & Risk', 'గవర్నెన్స్ & రిస్క్'],
      ['Tech Stack & Integration', 'టెక్నాలజీ స్టాక్ & ఇంటిగ్రేషన్'],
      ['Culture & Skills', 'సంస్కృతి & నైపుణ్యాలు'],
      ['Recommended Action Items', 'సిఫార్సు చేయబడిన చర్యలు'],
      ['Deconstructing Your AI Readiness Score', 'మీ AI సన్నద్ధత స్కోర్ విశ్లేషణ'],
      ['Key Gaps Identified', 'గుర్తించిన ముఖ్యమైన ఖాళీలు'],
      ['Pathway to Level 4', 'స్థాయి 4 కి మార్గం'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90-రోజుల ఎంటర్‌ప్రైజ్ AI రోడ్‌మ్యాప్'],
      ['Establish the Governance Foundation', 'గవర్నెన్స్ ఫౌండేషన్ స్థాపన'],
      ['Knowledge Ingestion & GraphRAG', 'నాలెడ్జ్ ఇంజెషన్ & GraphRAG'],
      ['Operational Scaling & Value Realization', 'ఆపరేషనల్ స్కేలింగ్ & వాల్యూ సాಕ್ಷాత్కారం'],
      ['Copilot Strategic Analysis', 'వ్యూహాత్మక కో-పైలట్ విశ్ಲೇషణ'],
      ['Thank you for your inquiry about', 'గురించి మీ విచారణకు ధన్యವಾದಗಳು'],
      ['As your enterprise AI co-pilot, I recommend', 'మీ ఎంటర్‌ప్రైజ్ AI కో-పైలట్‌గా, నేను సిఫార్సు చేస్తున్నాను']
    ],
    'Tamil': [
      ['Enterprise AI Readiness Assessment Report', 'நிறுவன AI ஆயத்த மதிப்பீட்டு அறிக்கை'],
      ['Classification: Board Confidential', 'வகைப்பாடு: போர்டு ரகசியம்'],
      ['Executive Summary', 'நிர்வாக சுருக்கம்'],
      ['Pillars of Assessment', 'மதிப்பீட்டின் தூண்கள்'],
      ['Strategic Alignment', 'மூலோபாய சீரமைப்பு'],
      ['Data Readiness', 'தரவு ஆயத்தம்'],
      ['Governance & Risk', 'ஆளுகை மற்றும் ஆபத்து'],
      ['Tech Stack & Integration', 'தொழில்நுட்ப அடுக்கு மற்றும் ஒருங்கிணைப்பு'],
      ['Culture & Skills', 'கலாச்சாரம் மற்றும் திறன்கள்'],
      ['Recommended Action Items', 'பரிந்துரைக்கப்பட்ட நடவடிக்கைகள்'],
      ['Deconstructing Your AI Readiness Score', 'உங்கள் AI ஆயத்த மதிப்பெண்ணின் பகுப்பாய்வு'],
      ['Key Gaps Identified', 'கண்டறியப்பட்ட முக்கிய இடைவெளிகள்'],
      ['Pathway to Level 4', 'நிலை 4 க்கான பாதை'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90-நாள் நிறுவன AI தத்தெடுப்பு மற்றும் அளவிலான வரைபடம்'],
      ['Establish the Governance Foundation', 'ஆளுகை அடித்தளத்தை நிறுவுதல்'],
      ['Knowledge Ingestion & GraphRAG', 'அறிவு உட்கிரகித்தல் மற்றும் GraphRAG'],
      ['Operational Scaling & Value Realization', 'செயல்பாட்டு அளவிடுதல் மற்றும் மதிப்பு प्राप्ति'],
      ['Copilot Strategic Analysis', 'மூலோபாய இணை பைலட் பகுப்பாய்வு'],
      ['Thank you for your inquiry about', 'குறித்த உங்கள் விசாரணைக்கு நன்றி'],
      ['As your enterprise AI co-pilot, I recommend', 'உங்கள் நிறுவன AI இணை பைலட்டாக, நான் பரிந்துரைக்கிறேன்']
    ],
    'Malayalam': [
      ['Enterprise AI Readiness Assessment Report', 'എന്റർപ്രൈസ് AI സന്നദ്ധതാ വിലയിരുത്തൽ റിപ്പോർട്ട്'],
      ['Classification: Board Confidential', 'വർഗ്ഗീകരണം: ബോർഡ് രഹസ്യം'],
      ['Executive Summary', 'എക്സിക്യൂട്ടീവ് സംഗ്രഹം'],
      ['Pillars of Assessment', 'വിലയിരുത്തലിന്റെ തൂണുകൾ'],
      ['Strategic Alignment', 'സ്ട്രാറ്റജിക് അലൈൻമെന്റ്'],
      ['Data Readiness', 'ഡാറ്റാ സന്നദ്ധത'],
      ['Governance & Risk', 'ഭരണവും അപകടസാധ്യതയും'],
      ['Tech Stack & Integration', 'ടെക്നോളജി സ്റ്റാക്കും സംയോജനവും'],
      ['Culture & Skills', 'സംസ്കാരവും നൈപുണ്യവും'],
      ['Recommended Action Items', 'ശുപാർശ ചെയ്യുന്ന പ്രവർത്തനങ്ങൾ'],
      ['Deconstructing Your AI Readiness Score', 'നിങ്ങളുടെ AI സന്നദ്ധത സ്കോറിന്റെ വിശകലനം'],
      ['Key Gaps Identified', 'കണ്ടെത്തിയ പ്രധാന വിടവുകൾ'],
      ['Pathway to Level 4', 'ലെവൽ 4 ലേക്കുള്ള വഴി'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90-ദിവസത്തെ എൻ്റർപ്രൈസ് AI ദത്തെടുക്കലും സ്കെയിലിംഗ് റോഡ്‌മാപ്പും'],
      ['Establish the Governance Foundation', 'ഭരണ അടിത്തറ സ്ഥാപിക്കുക'],
      ['Knowledge Ingestion & GraphRAG', 'നോളജ് ഇൻജസ്റ്റും ഗ്രാഫ്ആർഎജിയും'],
      ['Operational Scaling & Value Realization', 'പ്രവർത്തന സ്കെയിലിംഗും മൂല്യ സാക്ഷാത്കാരവും'],
      ['Copilot Strategic Analysis', 'കോപൈലറ്റ് തന്ത്രപരമായ വിശകലനം'],
      ['Thank you for your inquiry about', 'കുറിച്ചുള്ള നിങ്ങളുടെ അന്വേഷണത്തിന് നന്ദി'],
      ['As your enterprise AI co-pilot, I recommend', 'നിങ്ങളുടെ എൻ്റർപ്രൈസ് AI കോപൈലറ്റ് എന്ന നിലയിൽ, ഞാൻ ശുപാർശ ചെയ്യുന്നു']
    ],
    'Japanese': [
      ['Enterprise AI Readiness Assessment Report', '企業向けAI導入準備状況評価レポート'],
      ['Classification: Board Confidential', '機密性：取締役会極秘'],
      ['Executive Summary', 'エグゼクティブサマリー'],
      ['Pillars of Assessment', '評価の主要な柱'],
      ['Strategic Alignment', '戦略的アライメント'],
      ['Data Readiness', 'データ準備状況'],
      ['Governance & Risk', 'ガバナンスとリスク'],
      ['Tech Stack & Integration', '技術スタックと統合'],
      ['Culture & Skills', '組織文化とスキル'],
      ['Recommended Action Items', '推奨されるアクション項目'],
      ['Deconstructing Your AI Readiness Score', 'AI導入準備スコア（68/100）の詳細説明'],
      ['Key Gaps Identified', '特定された主要なギャップ'],
      ['Pathway to Level 4', 'レベル4（拡張段階）への道筋'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90日間の企業向けAI導入・拡張ロードマップ'],
      ['Establish the Governance Foundation', 'ガバナンス基盤の確立'],
      ['Knowledge Ingestion & GraphRAG', 'ナレッジ取り込みとGraphRAG'],
      ['Operational Scaling & Value Realization', '運用の拡張と価値の実現'],
      ['Copilot Strategic Analysis', 'コパイロット戦略分析'],
      ['Thank you for your inquiry about', 'に関するお問い合わせありがとうございます'],
      ['As your enterprise AI co-pilot, I recommend', 'お客様のエンタープライズAIコパイロットとして、以下を推奨します']
    ],
    'Korean': [
      ['Enterprise AI Readiness Assessment Report', '기업용 AI 준비도 평가 보고서'],
      ['Classification: Board Confidential', '등급: 이사회 대외비'],
      ['Executive Summary', '요약 보고서'],
      ['Pillars of Assessment', '평가 요소'],
      ['Strategic Alignment', '전략적 정렬'],
      ['Data Readiness', '데이터 준비도'],
      ['Governance & Risk', '거버넌스 및 리스크'],
      ['Tech Stack & Integration', '기술 스택 및 통합'],
      ['Culture & Skills', '문화 및 역량'],
      ['Recommended Action Items', '권장 조치 사항'],
      ['Deconstructing Your AI Readiness Score', '귀하의 AI 준비도 점수(68/100) 정밀 분석'],
      ['Key Gaps Identified', '주요 식별된 격차'],
      ['Pathway to Level 4', '레벨 4 달성 경로'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90일 기업용 AI 도입 및 확장 로드맵'],
      ['Establish the Governance Foundation', '거버넌스 기반 구축'],
      ['Knowledge Ingestion & GraphRAG', '지식 수집 및 GraphRAG 구축'],
      ['Operational Scaling & Value Realization', '운영 확장 및 가치 실현'],
      ['Copilot Strategic Analysis', '코파일럿 전략 분석'],
      ['Thank you for your inquiry about', '에 관한 문의에 감사드립니다'],
      ['As your enterprise AI co-pilot, I recommend', '귀하의 기업용 AI 코파일럿으로서 다음을 권장합니다']
    ],
    'Chinese': [
      ['Enterprise AI Readiness Assessment Report', '企业级AI准备度评估报告'],
      ['Classification: Board Confidential', '级别：董事会机密'],
      ['Executive Summary', '执行摘要'],
      ['Pillars of Assessment', '评估支柱'],
      ['Strategic Alignment', '战略协同'],
      ['Data Readiness', '数据准备度'],
      ['Governance & Risk', '治理与风险'],
      ['Tech Stack & Integration', '技术栈与集成'],
      ['Culture & Skills', '文化与技能'],
      ['Recommended Action Items', '建议行动项'],
      ['Deconstructing Your AI Readiness Score', '深入分析您的AI准备度评分 (68/100)'],
      ['Key Gaps Identified', '关键差距分析'],
      ['Pathway to Level 4', '迈向第四阶段（规模化）的路径'],
      ['90-Day Enterprise AI Adoption & Scale Roadmap', '90天企业级AI落地与规模化路线图'],
      ['Establish the Governance Foundation', '确立治理基石'],
      ['Knowledge Ingestion & GraphRAG', '知识摄取与关系图谱RAG'],
      ['Operational Scaling & Value Realization', '业务规模化与价值变现'],
      ['Copilot Strategic Analysis', '智能助手战略分析'],
      ['Thank you for your inquiry about', '感谢您关于以下内容的咨询'],
      ['As your enterprise AI co-pilot, I recommend', '作为您的企业级AI助手，我建议']
    ]
  }

  const list = translations[lang]
  if (list) {
    list.forEach(([original, replacement]) => {
      translated = translated.replaceAll(original, replacement)
    })
  }

  return translated
}

const getExpertResponse = (text, modelName, activeLanguage = 'English (US)', latestReportData = null) => {
  const query = text.toLowerCase()
  
  let detectedLang = activeLanguage
  if (query.includes('hola') || query.includes('reporte') || query.includes('explicar')) detectedLang = 'Spanish'
  else if (query.includes('bonjour') || query.includes('rapport')) detectedLang = 'French'
  else if (query.includes('hallo') || query.includes('bericht')) detectedLang = 'German'
  else if (query.includes('olá') || query.includes('relatório')) detectedLang = 'Portuguese'
  else if (query.includes('مرحبا') || query.includes('تقرير')) detectedLang = 'Arabic'
  else if (query.includes('नमस्ते') || query.includes('विवरण') || query.includes('रिपोर्ट')) detectedLang = 'Hindi'
  else if (query.includes('ನಮಸ್ಕಾರ') || query.includes('ವರದಿ') || query.includes('ಸ್ಕೋರ್')) detectedLang = 'Kannada'
  else if (query.includes('నమస్కారం') || query.includes('నివేదిక')) detectedLang = 'Telugu'
  else if (query.includes('வணக்கம்') || query.includes('அறிக்கை')) detectedLang = 'Tamil'
  else if (query.includes('നമസ്കാരം') || query.includes('റിപ്പോർട്ട്')) detectedLang = 'Malayalam'
  else if (query.includes('こんにちは') || query.includes('レポート') || query.includes('ロードマップ')) detectedLang = 'Japanese'
  else if (query.includes('안녕하세요') || query.includes('보고서')) detectedLang = 'Korean'
  else if (query.includes('你好') || query.includes('评估') || query.includes('报告')) detectedLang = 'Chinese'

  let response = ''
  
  const matchedRule = voiceKnowledgeBase.copilotRules.find(rule => 
    rule.keywords.some(keyword => query.includes(keyword))
  )

  // Retrieve actual scores dynamically from latestReportData state
  const totalScore = latestReportData?.scores?.total_score || 32
  const maturityTier = latestReportData?.scores?.maturity_tier || 'Low / Foundational'
  const semanticScore = latestReportData?.scores?.sub_scores?.semantic || 15
  const ragScore = latestReportData?.scores?.sub_scores?.rag || 20
  const auditScore = latestReportData?.scores?.sub_scores?.audit || 0
  const oversightScore = latestReportData?.scores?.sub_scores?.oversight || 20
  const dataScore = latestReportData?.scores?.sub_scores?.data || 40

  if (matchedRule) {
    response = matchedRule.response
      .replaceAll('{modelName}', modelName)
      .replaceAll('{text}', text)
      .replaceAll('{totalScore}', String(totalScore))
      .replaceAll('{maturityTier}', String(maturityTier))
      .replaceAll('{semanticScore}', String(semanticScore))
      .replaceAll('{ragScore}', String(ragScore))
      .replaceAll('{auditScore}', String(auditScore))
      .replaceAll('{oversightScore}', String(oversightScore))
      .replaceAll('{dataScore}', String(dataScore))
  } else {
    response = voiceKnowledgeBase.copilotDefault
      .replaceAll('{modelName}', modelName)
      .replaceAll('{text}', text)
  }

  return getTranslatedResponse(response, detectedLang)
}



const getFollowUpPromptsForResponse = (query) => {
  const q = query.toLowerCase()
  if (q.includes('assessment') || q.includes('report') || q.includes('evaluation')) {
    return [
      'Explain top readiness gaps',
      'Create remediation roadmap',
      'Estimate implementation costs',
      'Compare against industry benchmarks',
      'Generate executive presentation',
      'Identify compliance risks'
    ]
  }
  if (q.includes('score') || q.includes('explain') || q.includes('gap')) {
    return [
      'Build AI Adoption Roadmap',
      'Assess AI Security Risks',
      'Draft AI compliance policies',
      'How to reach Level 4 maturity?',
      'Review governance bottlenecks',
      'Calculate AI ROI'
    ]
  }
  if (q.includes('roadmap') || q.includes('adoption') || q.includes('plan')) {
    return [
      'Calculate AI ROI',
      'Define Phase 1 CoE charter',
      'Map GraphRAG semantic layer',
      'Assess AI Security Risks',
      'Review model selection grid',
      'Identify compliance risks'
    ]
  }
  if (q.includes('governance') || q.includes('security') || q.includes('risk') || q.includes('compliance')) {
    return [
      'Assess AI Security Risks',
      'Identify compliance risks',
      'Draft secure gateway rules',
      'Review multicloud sovereignty features',
      'Explain my AI Readiness Score',
      'Calculate AI ROI'
    ]
  }
  if (q.includes('roi') || q.includes('cost') || q.includes('saving') || q.includes('opportunity')) {
    return [
      'Calculate AI ROI',
      'Estimate implementation costs',
      'Deploy cost optimization rule',
      'Review multi-cloud token broker',
      'Build AI Adoption Roadmap',
      'Explain top readiness gaps'
    ]
  }
  return [
    'Explain AI Readiness Score',
    'Build AI Adoption Roadmap',
    'Assess AI Security Risks',
    'Calculate AI ROI',
    'Identify AI Maturity Gaps'
  ]
}

// Custom premium enterprise markdown and table parser
const renderInlineStyles = (str) => {
  if (typeof str !== 'string') return str;
  const parts = [];
  const regex = /\*\*(.*?)\*\*/g;
  let match;
  let lastIndex = 0;
  let idx = 0;
  
  while ((match = regex.exec(str)) !== null) {
    if (match.index > lastIndex) {
      parts.push(str.substring(lastIndex, match.index));
    }
    parts.push(
      <strong key={`bold-${idx++}`} className="font-extrabold text-white">
        {match[1]}
      </strong>
    );
    lastIndex = regex.lastIndex;
  }
  
  if (lastIndex < str.length) {
    parts.push(str.substring(lastIndex));
  }
  
  return parts.length > 0 ? parts : str;
};

const parseMarkdownToReact = (text) => {
  if (!text) return null;
  
  const lines = text.split('\n');
  const elements = [];
  let currentTable = null;
  let currentList = null;
  let listType = null; // 'ul' or 'ol'
  
  const flushTable = (key) => {
    if (currentTable) {
      const headers = currentTable.headers;
      const rows = currentTable.rows;
      elements.push(
        <div key={`table-${key}`} className="overflow-x-auto my-3 rounded-xl border border-slate-800/60 shadow-lg">
          <table className="min-w-full divide-y divide-slate-800 bg-slate-950/40 text-left text-[11px] font-sans">
            <thead className="bg-[#070A13]">
              <tr>
                {headers.map((h, i) => (
                  <th key={i} className="px-3.5 py-2.5 font-bold text-cyan-400 border border-slate-800/40 uppercase tracking-wider text-[9px]">
                    {renderInlineStyles(h)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-slate-900/30 transition duration-100">
                  {row.map((cell, j) => (
                    <td key={j} className="px-3.5 py-2.5 text-slate-300 font-medium border border-slate-800/40">
                      {renderInlineStyles(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      currentTable = null;
    }
  };

  const flushList = (key) => {
    if (currentList) {
      if (listType === 'ul') {
        elements.push(
          <ul key={`ul-${key}`} className="list-disc pl-5 my-2 space-y-1 text-slate-350 font-sans text-xs">
            {currentList.map((item, i) => <li key={i}>{renderInlineStyles(item)}</li>)}
          </ul>
        );
      } else {
        elements.push(
          <ol key={`ol-${key}`} className="list-decimal pl-5 my-2 space-y-1 text-slate-350 font-sans text-xs">
            {currentList.map((item, i) => <li key={i}>{renderInlineStyles(item)}</li>)}
          </ol>
        );
      }
      currentList = null;
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.startsWith('|') && line.endsWith('|')) {
      flushList(i);
      const cells = line.split('|').slice(1, -1).map(c => c.trim());
      const isSeparator = cells.every(c => c.match(/^:?-+:?$/));
      if (isSeparator) continue;
      
      if (!currentTable) {
        currentTable = { headers: cells, rows: [] };
      } else {
        currentTable.rows.push(cells);
      }
      continue;
    }
    
    flushTable(i);
    
    if (line.startsWith('- ') || line.startsWith('* ')) {
      if (listType !== 'ul') {
        flushList(i);
        currentList = [];
        listType = 'ul';
      }
      currentList.push(line.substring(2));
      continue;
    }
    
    const olMatch = line.match(/^(\d+)\.\s(.*)/);
    if (olMatch) {
      if (listType !== 'ol') {
        flushList(i);
        currentList = [];
        listType = 'ol';
      }
      currentList.push(olMatch[2]);
      continue;
    }
    
    flushList(i);
    
    if (line.startsWith('#### ')) {
      elements.push(
        <h4 key={i} className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-4 mb-2 font-sans">
          {renderInlineStyles(line.substring(5))}
        </h4>
      );
    } else if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="text-sm font-extrabold text-white mt-4 mb-2 font-sans border-b border-slate-800/40 pb-1 flex items-center gap-1.5">
          {renderInlineStyles(line.substring(4))}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="text-base font-extrabold text-white mt-5 mb-2.5 font-sans">
          {renderInlineStyles(line.substring(3))}
        </h2>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <h1 key={i} className="text-lg font-black text-cyan-400 mt-6 mb-3 font-sans">
          {renderInlineStyles(line.substring(2))}
        </h1>
      );
    } else if (line === '') {
      elements.push(<div key={i} className="h-2"></div>);
    } else {
      elements.push(
        <p key={i} className="text-[11px] text-slate-300 leading-relaxed font-sans font-medium whitespace-pre-wrap">
          {renderInlineStyles(line)}
        </p>
      );
    }
  }
  
  flushTable(lines.length);
  flushList(lines.length);
  
  return <div className="space-y-2.5">{elements}</div>;
};

export default function Dashboard() {
  const { user, changePassword, logout, updateUserRole } = useAuth()
  const userRole = (user?.role || '').toLowerCase()
  const isCfo = userRole.includes('cfo') || userRole.includes('finance') || userRole.includes('financial')
  const isCioCto = userRole.includes('cio') || userRole.includes('cto') || userRole.includes('ciso') || userRole.includes('tech') || userRole.includes('security')
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const activeTab = searchParams.get('tab') || 'home'
  const disableNav = user && !user.first_assessment_completed

  // --- AI Readiness Copilot State ---
  const [copilotSessions, setCopilotSessions] = useState(() => {
    const saved = localStorage.getItem('copilot_sessions')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        // Strip out legacy sessions containing preloaded reports or auto-generated assessment content
        const cleaned = parsed.map(session => {
          if (session.messages) {
            return {
              ...session,
              messages: session.messages.filter(msg => 
                !msg.content.includes('Assessment Report') && 
                !msg.content.includes('Executive Summary') &&
                !msg.content.includes('Pillars of Assessment')
              )
            }
          }
          return session
        }).filter(session => session.id !== 'default-session-1' || (session.messages && session.messages.length > 0))

        if (cleaned.length > 0) {
          return cleaned
        }
      } catch (e) {
        console.error(e)
      }
    }
    return [
      {
        id: 'default-session-1',
        title: 'New Chat Session',
        selectedModel: 'Gemini 2.5 Flash',
        createdDate: new Date().toISOString(),
        messages: []
      }
    ]
  })

  const [copilotActiveSessionId, setCopilotActiveSessionId] = useState(() => {
    return localStorage.getItem('copilot_active_session_id') || 'default-session-1'
  })

  const [copilotModel, setCopilotModel] = useState('Gemini 2.5 Flash')
  const [copilotInput, setCopilotInput] = useState('')
  const [copilotFiles, setCopilotFiles] = useState([])
  const [copilotListening, setCopilotListening] = useState(false)
  const [copilotStreaming, setCopilotStreaming] = useState(false)
  const [showCopilotModelDropdown, setShowCopilotModelDropdown] = useState(false)
  const [isParchment, setIsParchment] = useState(() => {
    const theme = localStorage.getItem('dashboard_theme')
    return theme === null ? true : theme === 'parchment'
  })
  const [copilotReadingId, setCopilotReadingId] = useState(null)
  const [voiceAssistantOpen, setVoiceAssistantOpen] = useState(false)
  const [voiceSuggestedPrompts, setVoiceSuggestedPrompts] = useState([])
  const [isAudioPaused, setIsAudioPaused] = useState(false)
  const [copilotLanguage, setCopilotLanguage] = useState('English (US)')
  const [voiceLanguage, setVoiceLanguage] = useState('English (US)')
  const [isLowConfidence, setIsLowConfidence] = useState(false)
  const [recordingSeconds, setRecordingSeconds] = useState(0)
  const recordingTimerRef = useRef(null)
  const [isDragging, setIsDragging] = useState(false)
  const [copilotSidebarCollapsed, setCopilotSidebarCollapsed] = useState(false)

  const fileInputRef = useRef(null)
  const copilotSpeechRecognitionRef = useRef(null)
  const voiceBottomRef = useRef(null)

  const [allAgents, setAllAgents] = useState([])
  const [activeAgentId, setActiveAgentId] = useState(0)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [copilotReadAloud, setCopilotReadAloud] = useState(false)

  // Get greeting name helper
  const getGreetingName = () => {
    if (!user) return 'User'
    if (user.first_name) return user.first_name
    if (user.name) return user.name.split(' ')[0]
    if (user.email) {
      const localPart = user.email.split('@')[0]
      if (localPart === 'demo') return 'Demo User'
      const clean = localPart.split('.')[0]
      return clean.charAt(0).toUpperCase() + clean.slice(1)
    }
    return 'User'
  }

  // Get starter prompts for an agent based on its role
  const getAgentStarters = (agent) => {
    if (!agent) return ["Explain my AI Readiness Score", "Identify AI maturity gaps", "Build an AI adoption roadmap"]
    const roleKey = (agent.role || 'base').toLowerCase()
    if (roleKey === 'ciso') {
      return [
        "Which NIST AI RMF controls are missing from this vendor's documentation?",
        "What are our top data-protection and threat-exposure gaps right now?",
        "Draft a concise risk summary of our current AI security posture."
      ]
    }
    if (roleKey === 'cfo') {
      return [
        "What's our current AI spend, and where is the biggest waste?",
        "What's our AI cost-saving opportunity and the payback period?",
        "Does this AI proposal meet our investment and governance bar?"
      ]
    }
    return ["Explain my AI Readiness Score", "Identify AI maturity gaps", "Build an AI adoption roadmap"]
  }

  // Fetch agents list
  const fetchCustomAgents = async () => {
    try {
      const res = await api.get('/agents')
      setAllAgents(res.data)
      const baseDbAgent = res.data.find(a => a.role === 'base')
      if (baseDbAgent && (activeAgentId === 0 || activeAgentId === undefined)) {
        setActiveAgentId(baseDbAgent.id)
      }
    } catch (err) {
      console.error("Failed to fetch custom agents:", err)
    }
  }

  useEffect(() => {
    if (user) {
      fetchCustomAgents()
    }
  }, [user, activeTab])

  const activeAgent = allAgents.find(a => a.id === activeAgentId) || allAgents.find(a => a.role === 'base') || null

  // Filter sessions by activeAgentId
  const displayedSessions = copilotSessions.filter(s => 
    s.agentId === activeAgentId || 
    (!s.agentId && activeAgent?.role === 'base')
  )

  const activeCopilotSession = displayedSessions.find(s => s.id === copilotActiveSessionId) || displayedSessions[0] || null

  // Ensure active model is updated when session changes
  useEffect(() => {
    if (activeCopilotSession) {
      setCopilotModel(activeCopilotSession.selectedModel || 'Gemini 2.5 Flash')
    }
  }, [copilotActiveSessionId])

  // Sync sessions when activeAgentId changes
  useEffect(() => {
    if (!activeAgentId) return;
    
    const agentSessions = copilotSessions.filter(s => s.agentId === activeAgentId);
    if (agentSessions.length > 0) {
      const lastActiveId = localStorage.getItem(`last_active_session_for_agent_${activeAgentId}`)
      if (lastActiveId && agentSessions.some(s => s.id === lastActiveId)) {
        setCopilotActiveSessionId(lastActiveId)
      } else {
        setCopilotActiveSessionId(agentSessions[0].id)
      }
    } else {
      const fallbackId = `session-${activeAgentId}-${Date.now()}`
      const newSession = {
        id: fallbackId,
        title: 'New Chat Session',
        selectedModel: copilotModel,
        createdDate: new Date().toISOString(),
        messages: [],
        agentId: activeAgentId
      }
      setCopilotSessions(prev => [newSession, ...prev])
      setCopilotActiveSessionId(fallbackId)
    }
  }, [activeAgentId])

  useEffect(() => {
    if (copilotActiveSessionId && activeAgentId) {
      localStorage.setItem(`last_active_session_for_agent_${activeAgentId}`, copilotActiveSessionId)
    }
  }, [copilotActiveSessionId, activeAgentId])

  const handleModelChange = (modelName) => {
    setCopilotModel(modelName)
    setShowCopilotModelDropdown(false)
    if (activeCopilotSession) {
      setCopilotSessions(prev => prev.map(s => 
        s.id === activeCopilotSession.id 
          ? { ...s, selectedModel: modelName } 
          : s
      ))
    }
  }

  const handleCopilotNewChat = () => {
    const newId = `session-${activeAgentId}-${Date.now()}`
    const newSession = {
      id: newId,
      title: 'New Chat Session',
      selectedModel: copilotModel,
      createdDate: new Date().toISOString(),
      messages: [],
      agentId: activeAgentId
    }
    setCopilotSessions(prev => [newSession, ...prev])
    setCopilotActiveSessionId(newId)
  }

  const handleCopilotDeleteSession = (id, e) => {
    e.stopPropagation()
    const updated = copilotSessions.filter(s => s.id !== id)
    setCopilotSessions(updated)
    const agentSessions = updated.filter(s => s.agentId === activeAgentId)
    if (copilotActiveSessionId === id) {
      if (agentSessions.length > 0) {
        setCopilotActiveSessionId(agentSessions[0].id)
      } else {
        const fallbackId = `session-${activeAgentId}-${Date.now()}`
        setCopilotSessions(prev => [
          ...prev.filter(s => s.id !== id),
          {
            id: fallbackId,
            title: 'New Chat Session',
            selectedModel: copilotModel,
            createdDate: new Date().toISOString(),
            messages: [],
            agentId: activeAgentId
          }
        ])
        setCopilotActiveSessionId(fallbackId)
      }
    }
  }

  const handleCopilotSpeak = (messageId, text) => {
    const hasSpeech = typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
    if (!hasSpeech) return;

    if (copilotReadingId === messageId) {
      window.speechSynthesis.cancel()
      setCopilotReadingId(null)
    } else {
      window.speechSynthesis.cancel()
      const plainText = text.replace(/[#*`\-]/g, '') // remove basic markdown chars
      const utterance = new SpeechSynthesisUtterance(plainText)
      utterance.onend = () => setCopilotReadingId(null)
      utterance.onerror = () => setCopilotReadingId(null)
      
      const selectedLangObj = copilotLanguages.find(l => l.name === copilotLanguage)
      if (selectedLangObj) {
        utterance.lang = selectedLangObj.code
      }

      const voices = window.speechSynthesis.getVoices()
      const targetLangPrefix = selectedLangObj ? selectedLangObj.code.split('-')[0] : 'en'
      const matchedVoice = voices.find(v => v.lang.startsWith(targetLangPrefix))
      if (matchedVoice) {
        utterance.voice = matchedVoice
      } else {
        const premiumVoice = voices.find(v => v.name.includes('Google') || v.name.includes('Natural') || v.name.includes('Microsoft David'))
        if (premiumVoice) utterance.voice = premiumVoice
      }
      
      window.speechSynthesis.speak(utterance)
      setCopilotReadingId(messageId)
    }
  }

  const toggleCopilotListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setCopilotListening(true)
      setTimeout(() => {
        setCopilotListening(false)
        setCopilotInput("Explain my AI Readiness Score")
      }, 1500)
      return
    }

    if (copilotListening) {
      copilotSpeechRecognitionRef.current?.stop()
      setCopilotListening(false)
    } else {
      const rec = new SpeechRecognition()
      rec.continuous = false
      rec.interimResults = false
      
      const selectedLangObj = copilotLanguages.find(l => l.name === copilotLanguage)
      rec.lang = selectedLangObj ? selectedLangObj.code : 'en-US'

      rec.onstart = () => {
        setCopilotListening(true)
      }

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript
        setCopilotInput(transcript)
      }

      rec.onerror = (e) => {
        console.error('Speech recognition error in Copilot:', e)
        setCopilotListening(false)
      }

      rec.onend = () => {
        setCopilotListening(false)
      }

      copilotSpeechRecognitionRef.current = rec
      rec.start()
    }
  }

  const handleCopilotFileChange = (e) => {
    const files = Array.from(e.target.files)
    if (files.length === 0) return

    const allowedExtensions = ['txt', 'md']
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase()
      return allowedExtensions.includes(ext)
    })

    if (validFiles.length < files.length) {
      alert("Some files were skipped. Only plain-text files (.txt, .md) are allowed.")
    }

    if (validFiles.length === 0) return

    const formatted = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || 'text/plain',
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: file
    }))
    setCopilotFiles(prev => [...prev, ...formatted])
    e.target.value = '' // reset input
  }

  const handleRemoveCopilotFile = (id) => {
    setCopilotFiles(prev => prev.filter(f => f.id !== id))
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length === 0) return

    const allowedExtensions = ['txt', 'md']
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop().toLowerCase()
      return allowedExtensions.includes(ext)
    })

    if (validFiles.length < files.length) {
      alert("Some files were skipped. Only plain-text files (.txt, .md) are allowed.")
    }

    if (validFiles.length === 0) return

    const formatted = validFiles.map(file => ({
      name: file.name,
      size: file.size,
      type: file.type || 'text/plain',
      id: `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      file: file
    }))
    setCopilotFiles(prev => [...prev, ...formatted])
  }

  const readFileAsText = (file) => {
    // TODO: Implement real PDF/docx parsing + pgvector chunking later in production.
    // Currently fallback to browser FileReader for plain-text (.txt, .md) only.
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result)
      reader.onerror = () => reject(reader.error)
      reader.readAsText(file)
    })
  }

  const handleCopilotSend = async (textToSend = copilotInput) => {
    const trimmed = textToSend.trim()
    if (!trimmed && copilotFiles.length === 0) return

    let currentSession = activeCopilotSession
    if (!currentSession) {
      const newId = `session-${activeAgentId}-${Date.now()}`
      currentSession = {
        id: newId,
        title: trimmed ? (trimmed.length > 25 ? trimmed.substring(0, 25) + '...' : trimmed) : 'File Upload Chat',
        selectedModel: copilotModel,
        createdDate: new Date().toISOString(),
        messages: [],
        agentId: activeAgentId
      }
      setCopilotSessions(prev => [currentSession, ...prev])
      setCopilotActiveSessionId(newId)
    }

    const attachedFiles = [...copilotFiles]

    // Add user message
    const userMsg = {
      id: `msg-user-${Date.now()}`,
      role: 'user',
      content: trimmed,
      files: attachedFiles,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...(currentSession.messages || []), userMsg]
    
    // Update session with user message
    const titleUpdated = currentSession.title === 'New Chat Session' && trimmed
      ? (trimmed.length > 25 ? trimmed.substring(0, 25) + '...' : trimmed)
      : currentSession.title

    setCopilotSessions(prev => prev.map(s => 
      s.id === currentSession.id 
        ? { ...s, title: titleUpdated, messages: updatedMessages } 
        : s
    ))

    // Clear inputs
    setCopilotInput('')
    setCopilotFiles([])

    // Start streaming bot response
    setCopilotStreaming(true)

    // Language Detection
    let detectedLang = copilotLanguage
    const query = trimmed.toLowerCase()
    if (query.includes('hola') || query.includes('reporte') || query.includes('explicar')) detectedLang = 'Spanish'
    else if (query.includes('bonjour') || query.includes('rapport')) detectedLang = 'French'
    
    if (detectedLang !== copilotLanguage) {
      setCopilotLanguage(detectedLang)
    }

    // Thread history: map past messages
    const historyList = (currentSession.messages || []).map(m => ({
      role: m.role,
      content: m.content
    }))

    // Read first file if attached
    let attachedDocRef = null
    let attachedDocContent = null
    if (attachedFiles.length > 0) {
      const firstFile = attachedFiles[0]
      attachedDocRef = firstFile.name
      if (firstFile.file) {
        try {
          attachedDocContent = await readFileAsText(firstFile.file)
        } catch (e) {
          console.error("Failed to read attached file content:", e)
        }
      }
    }

    try {
      // Execute agent run API call
      const res = await api.post(`/agents/${activeAgentId}/run`, {
        input: trimmed,
        history: historyList,
        attached_doc_ref: attachedDocRef,
        attached_doc_content: attachedDocContent
      })

      const runLog = res.data
      const botResponseText = runLog.outcome || "No output generated by the assistant."
      const followUps = runLog.follow_ups || []
      const retrievedSources = runLog.retrieved_sources || []

      // Add bot message container
      const botMsgId = `msg-bot-${Date.now()}`
      const botMsg = {
        id: botMsgId,
        role: 'assistant',
        content: '', // Start empty for streaming
        follow_ups: followUps,
        retrieved_sources: retrievedSources,
        timestamp: new Date().toISOString()
      }

      setCopilotSessions(prev => prev.map(s => 
        s.id === currentSession.id 
          ? { ...s, messages: [...updatedMessages, botMsg] } 
          : s
      ))

      // Stream effect word-by-word
      let currentIdx = 0
      const words = botResponseText.split(' ')
      const interval = setInterval(() => {
        if (currentIdx < words.length) {
          const partialResponse = words.slice(0, currentIdx + 1).join(' ')
          setCopilotSessions(prev => prev.map(s => {
            if (s.id === currentSession.id) {
              const msgs = [...s.messages]
              const lastMsgIdx = msgs.findIndex(m => m.id === botMsgId)
              if (lastMsgIdx !== -1) {
                msgs[lastMsgIdx] = { ...msgs[lastMsgIdx], content: partialResponse }
              }
              return { ...s, messages: msgs }
            }
            return s
          }))
          currentIdx++
        } else {
          clearInterval(interval)
          setCopilotStreaming(false)
          
          if (copilotReadAloud && activeAgent?.voice_enabled !== false) {
            handleCopilotSpeak(botMsgId, botResponseText)
          }
        }
      }, 30)

    } catch (err) {
      console.error("Agent execution failed:", err)
      const errorMsg = {
        id: `msg-error-${Date.now()}`,
        role: 'assistant',
        content: "I'm sorry, I encountered an error executing this request. Please verify the backend connection.",
        timestamp: new Date().toISOString()
      }
      setCopilotSessions(prev => prev.map(s => 
        s.id === currentSession.id 
          ? { ...s, messages: [...updatedMessages, errorMsg] } 
          : s
      ))
      setCopilotStreaming(false)
    }
  }

  function handleLogout() {
    logout()
    navigate('/', { replace: true })
  }

  // Tab switching helper
  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName })
  }

  // --- Report Embedding State & Logic for AI Readiness tab ---
  const reportToken = searchParams.get('reportToken')
  const [reportHtml, setReportHtml] = useState('')
  const [reportMeta, setReportMeta] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportError, setReportError] = useState('')
  const iframeRef = useRef(null)

  useEffect(() => {
    if (!reportToken || activeTab !== 'readiness') return
    let cancelled = false
    setReportLoading(true)
    setReportError('')
    Promise.all([
      api.get(`/report/by-token/${reportToken}`, {
        responseType: 'text',
        transformResponse: [(data) => data],
      }),
      api.get(`/report/by-token/${reportToken}/data`),
    ])
      .then(([htmlRes, dataRes]) => {
        if (cancelled) return
        setReportHtml(htmlRes.data || '')
        setReportMeta(dataRes.data || null)
      })
      .catch((err) => {
        if (cancelled) return
        const status = err.response?.status
        if (status === 404) setReportError('Report not found. The link may have expired.')
        else setReportError('Could not load the report. Try refreshing.')
      })
      .finally(() => {
        if (!cancelled) setReportLoading(false)
      })
    return () => { cancelled = true }
  }, [reportToken, activeTab])

  // Resize iframe dynamically
  useEffect(() => {
    if (!reportHtml || !iframeRef.current) return
    const timer = setTimeout(() => {
      try {
        const iframe = iframeRef.current
        const doc = iframe.contentDocument || iframe.contentWindow?.document
        if (doc) {
          iframe.style.height = 'auto'; // Reset first
          iframe.style.height = (doc.documentElement.scrollHeight + 40) + 'px';
        }
      } catch (e) {
        console.warn('Iframe resize failed:', e)
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [reportHtml])

  const [simulationRatio, setSimulationRatio] = useState(0.8)
  const currentSpend = reportMeta?.scores?.finops?.monthly_spend || 0
  const projectedSavings = Math.round(currentSpend * simulationRatio * 0.60 * 12)

  // --- Strategy & Roadmap Sub-Tab States ---
  const [dashboardSubTab, setDashboardSubTab] = useState('strategy')
  const [controlTowerTab, setControlTowerTab] = useState('overview')
  const [isProcurementModalOpen, setIsProcurementModalOpen] = useState(false)
  const [selectedProcurementTier, setSelectedProcurementTier] = useState(null)
  const [procurementFormSubmitted, setProcurementFormSubmitted] = useState(false)
  const [procurementForm, setProcurementForm] = useState({
    orgName: '',
    contactName: '',
    email: '',
    tier: 'core',
    notes: ''
  })

  useEffect(() => {
    if (selectedProcurementTier) {
      setProcurementForm(prev => ({ ...prev, tier: selectedProcurementTier }))
    } else {
      setProcurementForm(prev => ({ ...prev, tier: 'custom' }))
    }
  }, [selectedProcurementTier])


  // --- Voice Agent State & Logic ---
  const [isListening, setIsListening] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(false)
  const [agentText, setAgentText] = useState('Welcome back! I am your co-brand AI strategist. How can I help optimize your multi-cloud LLM architecture today?')

  // Smooth scroll to keep latest transcript visible
  useEffect(() => {
    if (voiceAssistantOpen && voiceBottomRef.current) {
      voiceBottomRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [agentText, voiceAssistantOpen])
  const getContextualWelcomeText = () => {
    if (activeTab === 'home') {
      if (isCfo) {
        return "Welcome to the CFO AI Readiness Cockpit. I can help analyze your C-suite financial metrics, estimate annual savings, simulate FinOps multi-cloud cost optimization, or review illustrative cooperative labor rates."
      }
      if (isCioCto) {
        return "Welcome to the Technical AI Readiness Cockpit. I can help analyze your GraphRAG architecture, model latencies, security scanner reports, or regulatory compliance rules."
      }
      return "Welcome to the CertaintyAI Readiness Cockpit. I can help analyze your C-suite metrics, explain your AI maturity scoring, highlight structural data gaps, or execute cost-efficiency simulations."
    }
    if (activeTab === 'dashboard') {
      if (isCfo) {
        return "Welcome to your Financial Dashboard. I can help analyze your AI Investment Health score, cost reduction metrics, monthly spend breakdown, and ROI payback timelines."
      }
      if (isCioCto) {
        return "Welcome to your Architecture Dashboard. I can help analyze your model usage distributions, workload routing metrics, and API latency metrics."
      }
      return "Welcome to your Dashboard. I can help analyze your AI Investment Health score, monthly spend breakdown, and ROI payback timelines."
    }
    if (activeTab === 'portfolio' && dashboardSubTab === 'strategy') {
      if (isCfo) {
        return "Welcome back! I am your financial AI advisor. How can I assist you with your AI cost amortization modeling or illustrative cooperative labor rates today?"
      }
      return "Welcome back! I am your strategic AI advisor. How can I assist you with your Strategic Roadmap or the MDx Cooperative AI Solutions Catalog today?"
    }
    if (activeTab === 'portfolio' && dashboardSubTab === 'observability') {
      if (isCfo) {
        return "Welcome! I am analyzing your FinOps telemetry. How can I help optimize your multi-cloud spend or calculate queries-to-value savings?"
      }
      return "Welcome! I am analyzing your LLM Observability telemetry. How can I help optimize your multi-cloud LLM cost efficiency or model latency?"
    }
    if (activeTab === 'readiness') {
      if (isCfo) {
        return "Welcome to your AI Readiness Assessment. Let's analyze your readiness score, FinOps score, and commercial risk exposure."
      }
      return "Welcome to your AI Readiness Assessment. Let's analyze your readiness score, operational maturity gaps, and regulatory compliance status."
    }
    if (activeTab === 'reports') {
      if (isCfo) {
        return "Welcome to your C-Suite Assessment History. I can help retrieve your previously completed financial portfolios and load them onto your dashboard."
      }
      return "Welcome to your Assessment History. I can help retrieve your previously completed C-suite reports, compare your maturity over time, or activate saved portfolios directly onto your Dashboard."
    }
    return "Welcome back! I am your co-brand AI strategist. How can I help optimize your multi-cloud LLM architecture today?"
  }

  const getContextualPrompts = () => {
    if (activeTab === 'dashboard') {
      if (isCfo) {
        return [
          { label: '📊 Investment Health', query: 'Explain AI Investment Health' },
          { label: '💸 Spend Categories', query: 'Analyze Cost Optimization Savings' },
          { label: '📈 ROI Payback', query: 'Calculate AI ROI & Payback' }
        ];
      }
      if (isCioCto) {
        return [
          { label: '⚙️ Model Usage', query: 'Explain AI Readiness Score' },
          { label: '📊 Maturity Gaps', query: 'Identify AI Maturity Gaps' },
          { label: '🛡️ Security Gaps', query: 'Assess AI Security Risks' }
        ];
      }
      return [
        { label: '🟢 Investment Health', query: 'Show my AI Investment Health Score breakdown' },
        { label: '💵 Spend Breakdown', query: 'Explain the current AI Spend Categories' },
        { label: '📈 ROI Payback', query: 'Show ROI timeline and break-even visualization' }
      ];
    }
    if (activeTab === 'portfolio' && dashboardSubTab === 'strategy') {
      if (isCfo) {
        return [
          { label: '🗓️ 90-Day Roadmap', query: 'Explain the 90-Day C-Suite Roadmap' },
          { label: '💼 Blended Cooperative Rates', query: 'Review Blended Cooperative Rates' },
          { label: '🌐 Solutions Catalog', query: 'Browse the MDx Cooperative AI Solutions Catalog' }
        ];
      }
      return [
        { label: '🚀 Explain Roadmap', query: 'Explain the 90-Day C-Suite Roadmap' },
        { label: '📦 Solutions Catalog', query: 'Browse the MDx Cooperative AI Solutions Catalog' },
        { label: '💼 Show Blended Rates', query: 'What are the blended labor rates for the strategic catalog?' }
      ];
    }
    if (activeTab === 'portfolio' && dashboardSubTab === 'observability') {
      if (isCfo) {
        return [
          { label: '💸 FinOps Savings', query: 'Analyze Cost Optimization Savings' },
          { label: '💵 Compare Spend', query: 'Compare Multi-Cloud FinOps' },
          { label: '📈 Model ROI', query: 'Calculate AI ROI & Payback' }
        ];
      }
      return [
        { label: '💸 FinOps Efficiency', query: 'Analyze LLM cost efficiency and monthly spend' },
        { label: '📉 Show Latency Gaps', query: 'Show latency anomalies across active LLMs' },
        { label: '🧬 Compare Models', query: 'Compare Gemini 1.5 Pro and GPT-4o performance' }
      ];
    }
    if (activeTab === 'readiness') {
      if (isCfo) {
        return [
          { label: '📊 Financial Readiness', query: 'Explain AI Investment Health' },
          { label: '🛡️ Governance Risks', query: 'Assess AI Security Risks' },
          { label: '📈 Payback Score', query: 'Calculate AI ROI & Payback' }
        ];
      }
      return [
        { label: '🛡️ HIPAA Compliance', query: 'Explain HIPAA compliance status and security rules' },
        { label: '📊 How Score works', query: 'How is the AI Readiness score calculated?' },
        { label: '⚠️ High-Risk Gaps', query: 'Identify high-risk governance and operational gaps' }
      ];
    }
    if (activeTab === 'reports') {
      if (isCfo) {
        return [
          { label: '📂 Financial History', query: 'Compare my saved assessments over time' },
          { label: '📊 Load CFO Metrics', query: 'Load my latest AI readiness report' },
          { label: '🌱 ROI Optimization', query: 'Analyze Cost Optimization Savings' }
        ];
      }
      return [
        { label: '📂 Compare Scores', query: 'Compare my saved assessments over time' },
        { label: '👁️ View Latest', query: 'Load my latest AI readiness report' },
        { label: '🌱 Maturity Timeline', query: 'How fast can we improve our maturity level?' }
      ];
    }
    if (isCfo) {
      return [
        { label: '📈 Calculate ROI', query: 'Calculate AI ROI & Payback' },
        { label: '💸 FinOps Simulation', query: 'Analyze Cost Optimization Savings' },
        { label: '📊 Investment Health', query: 'Explain AI Investment Health' }
      ];
    }
    return [
      { label: '💸 FinOps Simulation', query: 'Simulate FinOps cost savings for multi-cloud' },
      { label: '📊 Maturity Summary', query: 'Explain my AI maturity level and readiness timeline' }
    ];
  };

  // Set dynamic default suggested prompts based on active tab
  useEffect(() => {
    setVoiceSuggestedPrompts(getContextualPrompts());
  }, [activeTab, dashboardSubTab]);
  const [agentState, setAgentState] = useState('idle') // idle, listening, speaking, searching
  const [queryInput, setQueryInput] = useState('')
  const [followUps, setFollowUps] = useState([
    { text: 'Analyze LLM cost efficiency', action: 'cost' },
    { text: 'Show forecast anomalies', action: 'forecast' },
    { text: 'Review security frameworks', action: 'security' },
    { text: 'Optimize my API limits', action: 'optimize' },
  ])

  const recognitionRef = useRef(null)
  const canvasRef = useRef(null)
  const animationFrameRef = useRef(null)
  const lastSpeechTimeRef = useRef(null)
  const accumulatedTranscriptRef = useRef('')
  const silenceCheckIntervalRef = useRef(null)
  const speechStartedRef = useRef(false)

  // Web Speech API Voice synthesis setup
  const speakText = (text) => {
    if (!voiceEnabled || !voiceAssistantOpen) return
    const hasSpeech = typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
    if (!hasSpeech) return;

    window.speechSynthesis.cancel() // stop any current speech
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.onstart = () => setAgentState('speaking')
    utterance.onend = () => setAgentState('idle')
    utterance.onerror = () => setAgentState('idle')
    
    // Find premium accent matched voice
    const selectedLangObj = copilotLanguages.find(l => l.name === voiceLanguage)
    if (selectedLangObj) {
      utterance.lang = selectedLangObj.code
    }
    
    const voices = window.speechSynthesis.getVoices()
    const targetLangPrefix = selectedLangObj ? selectedLangObj.code.split('-')[0] : 'en'
    
    // Explicit female voice names and keywords for human sounding female synthesis
    const femaleKeywords = [
      'zira', 'hazel', 'samantha', 'susan', 'heera', 'victoria', 'tessa', 
      'kathy', 'haruka', 'nanako', 'lili', 'yaoyao', 'huihui', 'hortense', 
      'julie', 'helena', 'laura', 'google us english', 'female', 'woman', 'natural'
    ]
    
    // 1. Try to find a female voice in the active language
    let selectedVoice = voices.find(v => 
      v.lang.startsWith(targetLangPrefix) && 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    )
    
    // 2. If not found, try to find any active language voice that is NOT explicitly a male voice
    if (!selectedVoice) {
      const maleKeywords = ['david', 'ravi', 'mark', 'george', 'kangkang', 'claude']
      selectedVoice = voices.find(v => 
        v.lang.startsWith(targetLangPrefix) && 
        !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      )
    }
    
    // 3. Fallback to any voice matching target language
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith(targetLangPrefix))
    }
    
    // 4. Default global fallback to premium female voice signatures
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.name.includes('Zira') || 
        v.name.includes('Hazel') || 
        v.name.includes('Google US English') || 
        v.name.includes('Natural')
      )
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log("SpeechSynthesis active female voice:", selectedVoice.name)
    }
    
    window.speechSynthesis.speak(utterance)
  }

  // Stop audio immediately when the voice assistant is closed/minimized or hidden
  useEffect(() => {
    if (!voiceAssistantOpen) {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setAgentState('idle')
      setIsListening(false)
      setIsAudioPaused(false)
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current)
        silenceCheckIntervalRef.current = null
      }
      if (copilotReadingId) {
        setCopilotReadingId(null)
      }
    }
  }, [voiceAssistantOpen])



  // Global listeners to clean up audio playback on tab change or page unload
  useEffect(() => {
    const handleTabOrPageCleanup = () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setAgentState('idle')
      setIsListening(false)
      setIsAudioPaused(false)
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current)
        silenceCheckIntervalRef.current = null
      }
      if (copilotReadingId) {
        setCopilotReadingId(null)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleTabOrPageCleanup()
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleTabOrPageCleanup)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleTabOrPageCleanup)
    }
  }, [copilotReadingId])

  // Web Speech API speech recognition initialization with VAD & Accent Handling
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (SpeechRecognition) {
      const rec = new SpeechRecognition()
      rec.continuous = true       // Continuously listen to prevent premature cut-off
      rec.interimResults = true   // Capture interim results for real-time visual typing feedback
      const selectedLangObj = copilotLanguages.find(l => l.name === voiceLanguage)
      rec.lang = selectedLangObj ? selectedLangObj.code : 'en-US'

      rec.onstart = () => {
        setIsListening(true)
        setAgentState('listening')
        setAgentText('Listening... Speak naturally.')
        setIsAudioPaused(false)
        setIsLowConfidence(false)
        setRecordingSeconds(0)
        
        speechStartedRef.current = false
        lastSpeechTimeRef.current = Date.now()
        accumulatedTranscriptRef.current = ''
        
        // Start live visual recording duration timer
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current)
        recordingTimerRef.current = setInterval(() => {
          setRecordingSeconds(prev => prev + 1)
        }, 1000)

        // Start intelligent Silence Detection VAD loop (checked every 300ms)
        if (silenceCheckIntervalRef.current) clearInterval(silenceCheckIntervalRef.current)
        silenceCheckIntervalRef.current = setInterval(() => {
          const silenceDuration = Date.now() - lastSpeechTimeRef.current
          
          if (!speechStartedRef.current) {
            // Auto Stop: No speech detected for 5 seconds after mic opens
            if (silenceDuration > 5000) {
              console.log("VAD: No speech detected for 5 seconds. Auto-stopping.")
              stopListeningAndSubmit(true)
            }
          } else {
            // Silence Threshold: Auto-submit exactly 4.5 seconds after user finishes speaking (accommodates accents/fillers/pauses)
            if (silenceDuration > 4500) {
              console.log("VAD: 4.5 seconds of silence detected. Auto-submitting.")
              stopListeningAndSubmit(false)
            }
          }
        }, 300)
      }

      rec.onresult = (event) => {
        // Smart Interruption: If AI is actively speaking and user starts speaking, instantly cancel AI audio
        if (typeof window !== 'undefined' && window.speechSynthesis && window.speechSynthesis.speaking) {
          window.speechSynthesis.cancel()
          setAgentState('listening')
          setIsAudioPaused(false)
        }
        
        lastSpeechTimeRef.current = Date.now()
        speechStartedRef.current = true
        setIsAudioPaused(false)
        
        let interimTranscript = ''
        let finalTranscript = ''
        let avgConfidence = 1.0
        let finalCount = 0
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const result = event.results[i][0]
          const transcriptChunk = result.transcript
          // Handle accent tolerances and filter common background click/clack noises
          if (transcriptChunk.trim().length <= 1) continue
          
          if (event.results[i].isFinal) {
            finalTranscript += transcriptChunk + ' '
            avgConfidence = (avgConfidence * finalCount + result.confidence) / (finalCount + 1)
            finalCount++
          } else {
            interimTranscript += transcriptChunk
          }
        }
        
        // Dynamic confidence scoring
        if (finalCount > 0 && avgConfidence < 0.6) {
          setIsLowConfidence(true)
        } else if (finalCount > 0) {
          setIsLowConfidence(false)
        }
        
        if (finalTranscript) {
          // Normalize filler words like 'um', 'uh', 'let me think' naturally
          const cleanFinal = finalTranscript
            .replace(/\b(um|uh|ah|like|let me think|one second)\b/gi, '')
            .replace(/\s+/g, ' ')
          accumulatedTranscriptRef.current += cleanFinal
        }
        
        const currentDraft = (accumulatedTranscriptRef.current + interimTranscript).trim()
        if (currentDraft) {
          setAgentText(currentDraft)
        }
      }

      rec.onerror = (e) => {
        if (e.error !== 'no-speech') {
          console.error('Speech recognition error:', e)
          setAgentText('Sorry, there was an audio connection error. Click a prompt below to communicate.')
        }
        cleanupVAD()
        setIsListening(false)
        setAgentState('idle')
      }

      rec.onend = () => {
        // Only reset active listening state if the VAD loop didn't already clean it up
        cleanupVAD()
        setIsListening(false)
      }

      recognitionRef.current = rec
    }
    
    return () => {
      if (silenceCheckIntervalRef.current) {
        clearInterval(silenceCheckIntervalRef.current)
      }
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current)
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [voiceLanguage, voiceAssistantOpen])

  const cleanupVAD = () => {
    if (silenceCheckIntervalRef.current) {
      clearInterval(silenceCheckIntervalRef.current)
      silenceCheckIntervalRef.current = null
    }
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current)
      recordingTimerRef.current = null
    }
  }

  // Handle tab change: reset voice agent welcome text, and stop any active speech synthesis/listening
  useEffect(() => {
    // 1. Interrupt active voice playback & recording
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setAgentState('idle')
    setIsListening(false)
    setIsAudioPaused(false)
    cleanupVAD()
    if (copilotReadingId) {
      setCopilotReadingId(null)
    }

    // 2. Always reset welcome text dynamically to the new tab context
    setAgentText(getContextualWelcomeText())
  }, [activeTab, dashboardSubTab])

  const stopListeningAndSubmit = (isTimeout) => {
    cleanupVAD()
    recognitionRef.current?.stop()
    setIsListening(false)
    
    if (isTimeout) {
      setAgentState('idle')
      setAgentText(getContextualWelcomeText())
    } else {
      const finalQuery = accumulatedTranscriptRef.current.trim()
      if (finalQuery) {
        setQueryInput(finalQuery)
        handleAgentQuery(finalQuery)
      } else {
        setAgentState('idle')
        setAgentText(getContextualWelcomeText())
      }
    }
  }

  // Audio Waveform Visualizer supporting 4 detailed states: idle, listening, processing, speaking
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    let phase = 0

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      const width = canvas.width
      const height = canvas.height
      const centerY = height / 2

      ctx.lineWidth = 2
      
      // Determine wave properties based on active agent state
      let numWaves = 3
      let amplitude = 12
      let speed = 0.08
      let glowColor = 'rgba(34, 211, 238, 0.8)' // Cyan for thinking/listening
      
      if (agentState === 'speaking') {
        amplitude = 22
        speed = 0.14
        numWaves = 4
        glowColor = 'rgba(167, 139, 250, 0.8)' // Violet for speaking
      } else if (agentState === 'listening') {
        amplitude = 18
        speed = 0.18
        numWaves = 5
        glowColor = 'rgba(34, 211, 238, 0.9)'  // Bright Cyan for recording
      } else if (agentState === 'searching') {
        amplitude = 15
        speed = 0.12
        numWaves = 4
        glowColor = 'rgba(245, 158, 11, 0.9)'  // Gold Yellow for Processing
      } else if (agentState === 'idle') {
        amplitude = 3
        speed = 0.02
        numWaves = 2
        glowColor = 'rgba(148, 163, 184, 0.4)' // Slate for idle
      }

      ctx.shadowBlur = isParchment ? 0 : 10
      ctx.shadowColor = glowColor

      for (let i = 0; i < numWaves; i++) {
        ctx.beginPath()
        const wavePhase = phase + i * (Math.PI / 4)
        const waveAmp = amplitude * (1 - i * 0.25)
        
        if (agentState === 'speaking') {
          ctx.strokeStyle = isParchment
            ? (i === 0 ? '#A87C3C' : 'rgba(168, 124, 60, 0.4)')
            : (i === 0 ? '#A78BFA' : 'rgba(167, 139, 250, 0.4)')
        } else if (agentState === 'listening') {
          ctx.strokeStyle = isParchment
            ? (i === 0 ? '#1E3A36' : 'rgba(30, 58, 54, 0.3)')
            : (i === 0 ? '#22D3EE' : 'rgba(34, 211, 238, 0.3)')
        } else if (agentState === 'searching') {
          ctx.strokeStyle = isParchment
            ? (i === 0 ? '#7C5723' : 'rgba(124, 87, 35, 0.3)')
            : (i === 0 ? '#F59E0B' : 'rgba(245, 158, 11, 0.3)')
        } else {
          ctx.strokeStyle = isParchment
            ? (i === 0 ? '#73706A' : 'rgba(115, 112, 106, 0.2)')
            : (i === 0 ? '#94A3B8' : 'rgba(148, 163, 184, 0.2)')
        }

        for (let x = 0; x < width; x++) {
          const angle = (x / width) * Math.PI * 2 * 1.5 + wavePhase
          const y = centerY + Math.sin(angle) * waveAmp * Math.sin((x / width) * Math.PI)
          if (x === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }
        ctx.stroke()
      }

      phase += speed
      animationFrameRef.current = requestAnimationFrame(draw)
    }

    draw()
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [agentState, isParchment])

  // Mic Tap-to-Speak Trigger Action with Smart Interruption
  const toggleListening = () => {
    // Smart Interruption: If AI is actively speaking, immediately cancel speech, reset audio states, and open microphone
    if (agentState === 'speaking') {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
      setIsAudioPaused(false)
      setAgentState('idle')
    }

    if (isListening) {
      stopListeningAndSubmit(false)
    } else {
      if (recognitionRef.current) {
        // Dynamically assign active language code before starting Speech Recognition
        const selectedLangObj = copilotLanguages.find(l => l.name === copilotLanguage)
        if (selectedLangObj) {
          recognitionRef.current.lang = selectedLangObj.code
          console.log("Speech recognition language set to:", selectedLangObj.code)
        }
        recognitionRef.current.start()
      } else {
        // Fallback if Speech API is not supported in the active environment
        setAgentState('listening')
        setAgentText('Speech recognition not fully supported in this browser environment. Simulating voice prompt: "Optimize LLM cost efficiency"...')
        setTimeout(() => {
          handleAgentQuery('Analyze LLM cost efficiency')
        }, 1500)
      }
    }
  }

  // Speak dynamic streaming chunks/sentences sequentially using standard voice queueing
  const speakTextStreamingChunk = (text) => {
    if (!voiceEnabled || !voiceAssistantOpen) return
    const hasSpeech = typeof window !== 'undefined' && window.speechSynthesis && typeof SpeechSynthesisUtterance !== 'undefined';
    if (!hasSpeech) return;

    const plainText = text.replace(/[#*`\-]/g, '') // remove basic markdown chars
    const utterance = new SpeechSynthesisUtterance(plainText)
    
    // Warm, sweet, and welcoming acoustic human voice tuning
    utterance.pitch = 1.15 // Warmer, sweeter, and friendlier frequency tuning
    utterance.rate = 0.93  // Relaxed, natural, and inviting human-paced speech cadence
    
    utterance.onstart = () => {
      setAgentState('speaking')
      setIsAudioPaused(false)
    }
    
    // Find premium accent matched voice
    const selectedLangObj = copilotLanguages.find(l => l.name === voiceLanguage)
    if (selectedLangObj) {
      utterance.lang = selectedLangObj.code
    }
    
    const voices = window.speechSynthesis.getVoices()
    const targetLangPrefix = selectedLangObj ? selectedLangObj.code.split('-')[0] : 'en'
    
    // Explicit female voice names and keywords for human sounding female synthesis
    const femaleKeywords = [
      'zira', 'hazel', 'samantha', 'susan', 'heera', 'victoria', 'tessa', 
      'kathy', 'haruka', 'nanako', 'lili', 'yaoyao', 'huihui', 'hortense', 
      'julie', 'helena', 'laura', 'google us english', 'female', 'woman', 'natural'
    ]
    
    // 1. Try to find a female voice in the active language
    let selectedVoice = voices.find(v => 
      v.lang.startsWith(targetLangPrefix) && 
      femaleKeywords.some(kw => v.name.toLowerCase().includes(kw))
    )
    
    // 2. If not found, try to find any active language voice that is NOT explicitly a male voice
    if (!selectedVoice) {
      const maleKeywords = ['david', 'ravi', 'mark', 'george', 'kangkang', 'claude']
      selectedVoice = voices.find(v => 
        v.lang.startsWith(targetLangPrefix) && 
        !maleKeywords.some(kw => v.name.toLowerCase().includes(kw))
      )
    }
    
    // 3. Fallback to any voice matching target language
    if (!selectedVoice) {
      selectedVoice = voices.find(v => v.lang.startsWith(targetLangPrefix))
    }
    
    // 4. Default global fallback to premium female voice signatures
    if (!selectedVoice) {
      selectedVoice = voices.find(v => 
        v.name.includes('Zira') || 
        v.name.includes('Hazel') || 
        v.name.includes('Google US English') || 
        v.name.includes('Natural')
      )
    }
    
    if (selectedVoice) {
      utterance.voice = selectedVoice
      console.log("SpeechSynthesis active female voice:", selectedVoice.name)
    }
    
    window.speechSynthesis.speak(utterance)
  }

  // Answer Agent Query with streaming tokens & real-time TTS segment queueing
  const handleAgentQuery = (text) => {
    setAgentState('searching')
    setAgentText('Analyzing telemetry across OpenAI, Anthropic, Gemini, Azure OpenAI, and Snowflake Cortex...')
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel() // Stop any ongoing playback before starting a new run
    }

    setTimeout(() => {
      let fullResponse = ''
      let followUpPrompts = []
      let voicePrompts = []

      const query = text.toLowerCase()

      const matchedRule = voiceKnowledgeBase.voiceRules.find(rule => 
        rule.keywords.some(keyword => query.includes(keyword))
      )

      // Retrieve actual scores dynamically from latestReportData state
      const totalScore = latestReportData?.scores?.total_score || 32
      const maturityTier = latestReportData?.scores?.maturity_tier || 'Low / Foundational'

      if (matchedRule) {
        fullResponse = matchedRule.response
          .replaceAll('{modelName}', copilotModel)
          .replaceAll('{text}', text)
          .replaceAll('{totalScore}', String(totalScore))
          .replaceAll('{maturityTier}', String(maturityTier))
        followUpPrompts = matchedRule.followUps
        voicePrompts = matchedRule.voicePrompts
      } else {
        fullResponse = voiceKnowledgeBase.voiceDefault.response
          .replaceAll('{modelName}', copilotModel)
          .replaceAll('{text}', text)
        followUpPrompts = voiceKnowledgeBase.voiceDefault.followUps
        voicePrompts = voiceKnowledgeBase.voiceDefault.voicePrompts
      }

      setAgentState('speaking')
      setAgentText('')
      setFollowUps(followUpPrompts)
      setVoiceSuggestedPrompts(voicePrompts)

      // Translate response before token-by-token streaming
      const translatedResponse = getTranslatedResponse(fullResponse, voiceLanguage)
      const words = translatedResponse.split(' ')
      let currentText = ''
      let wordIndex = 0
      let lastSpokenIndex = 0

      const streamTimer = setInterval(() => {
        if (!voiceAssistantOpen) {
          clearInterval(streamTimer)
          return
        }

        if (wordIndex < words.length) {
          currentText += words[wordIndex] + ' '
          setAgentText(currentText.trim())
          wordIndex++

          // Scan for complete sentences or clauses to play dynamically
          const rawSubText = currentText.trim()
          const punctuationRegex = /[.!?]/g
          let match
          let lastSentenceEnd = 0

          while ((match = punctuationRegex.exec(rawSubText)) !== null) {
            lastSentenceEnd = match.index + 1
          }

          if (lastSentenceEnd > lastSpokenIndex) {
            const chunkToSpeak = rawSubText.slice(lastSpokenIndex, lastSentenceEnd).trim()
            if (chunkToSpeak.length > 5) {
              speakTextStreamingChunk(chunkToSpeak)
              lastSpokenIndex = lastSentenceEnd
            }
          }
        } else {
          clearInterval(streamTimer)
          // Speak any leftover sentence buffer
          const remainingText = currentText.slice(lastSpokenIndex).trim()
          if (remainingText.length > 0) {
            speakTextStreamingChunk(remainingText)
          }
        }
      }, 75) // word-by-word streaming interval
    }, 1000)
  }

  // --- Profile Page Form Logic (Integrated into Settings tab) ---
  const {
    register, handleSubmit, reset,
    formState: { errors, isSubmitting },
  } = useForm({ mode: 'onBlur' })
  const [serverError, setServerError] = useState('')
  const [success, setSuccess] = useState('')
  const [reports, setReports] = useState([])
  const [reportsLoading, setReportsLoading] = useState(true)
  const [latestReportData, setLatestReportData] = useState(null)
  const [latestReportHtml, setLatestReportHtml] = useState('')
  const [execSummary, setExecSummary] = useState('')
  const [previewAlert, setPreviewAlert] = useState(null)
  const [selectedReportId, setSelectedReportId] = useState(null)
  const [loadReportsOpen, setLoadReportsOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    api.get('/report')
      .then((res) => { if (!cancelled) setReports(res.data || []) })
      .catch((err) => { console.error(err) })
      .finally(() => { if (!cancelled) setReportsLoading(false) })
    return () => { cancelled = true }
  }, [activeTab])

  const activeReportId = selectedReportId || (reports && reports.length > 0 ? reports[0].id : null);

  useEffect(() => {
    if (activeReportId) {
      api.get(`/report/${activeReportId}/data`)
        .then((res) => {
          setLatestReportData(res.data)
        })
        .catch((err) => console.error("Error fetching report data:", err))

      api.get(`/report/${activeReportId}`)
        .then((res) => {
          setLatestReportHtml(res.data || '')
          const match = (res.data || '').match(/<p class="exec-summary-in-hero">([\s\S]*?)<\/p>/)
          if (match && match[1]) {
            const text = match[1].replace(/<[^>]*>/g, '').trim()
            setExecSummary(text)
          } else {
            setExecSummary('')
          }
        })
        .catch((err) => {
          console.error("Error fetching report html:", err)
          setLatestReportHtml('')
          setExecSummary('')
        })
    } else {
      setLatestReportData(null)
      setLatestReportHtml('')
      setExecSummary('')
    }
  }, [reports, selectedReportId])

  async function onPasswordSubmit(values) {
    setServerError('')
    setSuccess('')
    try {
      await changePassword(values.current_password, values.new_password)
      setSuccess('Your security credentials have been updated successfully.')
      reset()
    } catch (err) {
      const detail = err.response?.data?.detail
      if (typeof detail === 'string') setServerError(detail)
      else setServerError('Could not change password. Please verify current password.')
    }
  }

  // --- Dummy / Simulation data ---
  const llmModels = [
    {
      name: 'OpenAI GPT-4o',
      type: 'Core AI',
      usage: '840,320 tokens / 1M',
      percent: 84,
      calls: 2321,
      cost: '$14.20',
      tpm: '250,000 / 300,000',
      rpm: '900 / 1,000',
      forecast: 'Stable (+3% forecast)',
      status: 'Active',
      color: 'from-emerald-500 to-teal-400',
      borderGlow: 'hover:shadow-[0_0_15px_rgba(16,185,129,0.3)]',
      rec: 'OpenAI excels at complex instruction-following. Consider keeping strict code generation here.',
      partner: 'Core Provider'
    },
    {
      name: 'Anthropic Claude 3.5 Sonnet',
      type: 'Reasoning Engine',
      usage: '423,100 tokens / 1M',
      percent: 42,
      calls: 843,
      cost: '$32.40',
      tpm: '120,000 / 200,000',
      rpm: '420 / 500',
      forecast: 'Spiking (+18% predicted)',
      status: 'Active',
      color: 'from-amber-500 to-orange-400',
      borderGlow: 'hover:shadow-[0_0_15px_rgba(245,158,11,0.3)]',
      rec: 'High cost detected. Move secondary extraction tasks to Gemini 1.5 Flash.',
      partner: 'Core Provider'
    },
    {
      name: 'Google Gemini 1.5 Pro',
      type: 'Multimodal Engine',
      usage: '125,000 tokens / 2M',
      percent: 6,
      calls: 312,
      cost: '$3.75',
      tpm: '2,000,000 / 4,000,000',
      rpm: '80 / 360',
      forecast: 'Underutilized',
      status: 'Active',
      color: 'from-cyan-500 to-blue-400',
      borderGlow: 'hover:shadow-[0_0_15px_rgba(6,182,212,0.3)]',
      rec: 'Massive 2M context window. Utilize for scanning complete compliance documents.',
      partner: 'Core Provider'
    },
    {
      name: 'Azure OpenAI',
      type: 'Enterprise Partner',
      usage: '231,000 tokens / 1.5M',
      percent: 15,
      calls: 1104,
      cost: '$6.20',
      tpm: '150,000 / 300,000',
      rpm: '1,200 / 2,000',
      forecast: 'Stable',
      status: 'Standby / Fallback Enabled',
      color: 'from-indigo-500 to-blue-600',
      borderGlow: 'hover:shadow-[0_0_15px_rgba(79,70,229,0.3)]',
      rec: 'Redundant fallback route is fully operational. Auto-routes if OpenAI exceeds 85% TPM.',
      partner: 'MDx Partnered'
    },
    {
      name: 'Google Vertex AI',
      type: 'Sovereign Compliance & Agents',
      usage: '72,110 tokens / 500K',
      percent: 14,
      calls: 231,
      cost: 'Included (Enterprise Tier)',
      tpm: '90,000 / 150,000',
      rpm: '180 / 300',
      forecast: 'Highly Consistent',
      status: 'Sovereignty Protection Enforced',
      color: 'from-purple-500 to-pink-500',
      borderGlow: 'hover:shadow-[0_0_15px_rgba(168,85,247,0.3)]',
      rec: 'Sovereign guardrails are active. Vertex AI secure endpoint hosts all patient medical pipelines.',
      partner: 'MDx Partnered'
    },
    {
      name: 'Snowflake Cortex',
      type: 'Structured Relational AI',
      usage: '349,020 queries / 1M',
      percent: 35,
      calls: 3490,
      cost: '$8.90',
      tpm: '80,000 / 100,000',
      rpm: '4,000 / 5,000',
      forecast: 'Slight Decline (-4% forecast)',
      status: 'Active',
      color: 'from-sky-400 to-cyan-500',
      borderGlow: 'hover:shadow-[0_0_15px_rgba(56,189,248,0.3)]',
      rec: 'Best performance for high-throughput relational data tables. Relational cache active.',
      partner: 'MDx Partnered'
    }
  ]

  const tasksList = [
    { id: 1, name: 'HIPAA Monthly Compliance Scan', status: 'Running', progress: 68, model: 'Google Vertex AI', type: 'Security' },
    { id: 2, name: 'EHR Patient Data Intake', status: 'Active', progress: 100, model: 'Snowflake Cortex', type: 'Data Sync' },
    { id: 3, name: 'Ontology Graph Entity Reconciliation', status: 'Pending', progress: 0, model: 'Google Gemini 1.5 Pro', type: 'Ontology' },
    { id: 4, name: 'Strategic Financial Anomaly Audit', status: 'Failed', progress: 42, model: 'Azure OpenAI', type: 'FinOps' },
    { id: 5, name: 'Real-time Customer Feed Vectorization', status: 'Active', progress: 100, model: 'OpenAI GPT-4o', type: 'Data Ingestion' }
  ]

  const pluginsList = [
    { name: 'FHIR Healthcare Connector', desc: 'Secure real-time synchronization with standard EHR systems.', category: 'Compliance', status: 'Active', icon: '🏥' },
    { name: 'FinOps Cost Optimizer', desc: 'Predictive token throttling and multi-cloud model broker.', category: 'FinOps', status: 'Active', icon: '💰' },
    { name: 'GDPR Threat Shield', desc: 'Real-time anonymizer filter for personal identifiable information (PII).', category: 'Security', status: 'Inactive', icon: '🛡️' },
    { name: 'W3C Ontology Synchronizer', desc: 'Direct mapping of enterprise triples to standardized schemas.', category: 'Ontology', status: 'Active', icon: '🧬' }
  ]

  return (
    <div className={`w-full flex flex-col lg:flex-row h-[calc(100vh-64px)] overflow-hidden transition-colors duration-300 bg-[var(--dash-bg)] text-[var(--dash-text-primary)] ${isParchment ? 'theme-parchment' : ''}`}>
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />


      {/* Main Panel */}
      <main className={`flex-1 ${activeTab === 'home' ? 'h-full overflow-hidden flex flex-col p-3 lg:p-4 max-w-none space-y-3' : 'p-4 lg:py-6 lg:px-8 space-y-5 overflow-y-auto max-w-[1380px]'} mx-auto w-full`}>
        {/* Header Summary Row */}
        {activeTab !== 'home' && (
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[var(--dash-border)] pb-3">
            <div>
              <span className="text-xs uppercase tracking-widest text-[var(--dash-accent)] font-bold bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-3 py-1 rounded-full">
                {activeTab === 'dashboard' && '📊 AI Readiness Dashboard'}
                {activeTab === 'reports' && '📂 Assessment History'}
                {activeTab === 'portfolio' && (dashboardSubTab === 'strategy' ? '💎 Strategic Advisory Portfolio' : 'Live Observability Core')}
                {activeTab === 'readiness' && '🛡️ Readiness & Governance'}
                {activeTab === 'tasks' && '⚙️ System Operations'}
                {activeTab === 'insights' && '📈 Industry Benchmarks'}
                {activeTab === 'tools' && '🛠️ Model Orchestration'}
                {activeTab === 'plugins' && '🔌 Plugin Marketplace'}
                {activeTab === 'settings' && '👤 User Profile'}
                {activeTab === 'agent-builder' && '🛠️ Agent Builder'}
                {activeTab === 'control-tower' && '🏰 Control Tower'}
                {activeTab === 'integrations' && '🔌 Integrations'}
              </span>
              <h2 className="text-3xl font-extrabold text-[var(--dash-text-primary)] mt-2">
                {activeTab === 'dashboard' && 'AI Readiness Dashboard'}
                {activeTab === 'reports' && 'Saved Reports'}
                {activeTab === 'portfolio' && (dashboardSubTab === 'strategy' ? 'Strategic Advisory Portfolio' : 'LLM Observatory')}
                {activeTab === 'readiness' && 'AI Readiness Assessment Wizard'}
                {activeTab === 'tasks' && 'Active Background Workflows'}
                {activeTab === 'insights' && 'Industry Benchmark Analytics'}
                {activeTab === 'tools' && 'Integrated Model Control'}
                {activeTab === 'plugins' && 'Enterprise Plugin Store'}
                {activeTab === 'settings' && 'Account Settings'}
                {activeTab === 'agent-builder' && 'Agent Builder & Governance'}
                {activeTab === 'control-tower' && 'AI Control Tower'}
                {activeTab === 'integrations' && 'System Integrations'}
              </h2>
              {activeTab === 'dashboard' && (
                <p className="text-xs text-[var(--dash-text-secondary)] mt-1 font-medium font-sans">
                  Assessment-based analytics, maturity gaps, and opportunities.
                </p>
              )}
              {activeTab === 'control-tower' && (
                <p className="text-xs text-[var(--dash-text-secondary)] mt-1 font-medium font-sans">
                  Enterprise AI monitoring, FinOps, and policy compliance controls · Preview Mode.
                </p>
              )}
              {activeTab === 'integrations' && (
                <p className="text-xs text-[var(--dash-text-secondary)] mt-1 font-medium font-sans">
                  Connect third-party enterprise platforms to feed live data into CertaintyAI.
                </p>
              )}
              {activeTab === 'agent-builder' && (
                <p className="text-xs text-[var(--dash-text-secondary)] mt-1 font-medium font-sans">
                  Govern, build, and deploy custom C-suite AI readiness assistants with custom RAG knowledge bases.
                </p>
              )}
              {activeTab === 'readiness' && (
                <p className="text-xs text-[var(--dash-text-secondary)] mt-1 font-medium font-sans">
                  Take the 2-minute readiness survey to instantly recalculate and regenerate your strategic C-suite deliverables.
                </p>
              )}
            </div>
            <div className="flex items-center gap-3 text-xs font-sans">
              {activeTab === 'portfolio' && (
                <div className="flex bg-[var(--dash-card-bg)] border border-[var(--dash-border)] p-1 rounded-xl items-center">
                  <button
                    onClick={() => setDashboardSubTab('strategy')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      dashboardSubTab === 'strategy'
                        ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)]'
                        : 'border border-transparent text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]'
                    }`}
                  >
                    💎 Strategy
                  </button>
                  <button
                    onClick={() => setDashboardSubTab('observability')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 flex items-center gap-1.5 ${
                      dashboardSubTab === 'observability'
                        ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)]'
                        : 'border border-transparent text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)]'
                    }`}
                  >
                    📊 Observability Core
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dynamic Content Body based on selected Tab */}
        <div className={`flex flex-col ${activeTab === 'home' ? 'h-0 flex-grow overflow-hidden' : ''} w-full`}>
          <div className={`flex flex-col flex-grow ${activeTab === 'home' ? 'h-full min-h-0' : ''}`}>
            {/* TAB: HOME / AI READINESS COPILOT */}
            {activeTab === 'home' && (
              <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl overflow-hidden flex flex-col md:flex-row flex-grow h-full w-full">
                {/* Nested Left Pane: Chat Sessions History */}
                <div className={`w-full transition-all duration-300 border-r border-[var(--dash-border)] bg-[var(--dash-sidebar-bg)] p-3 flex flex-col justify-between shrink-0 ${
                  copilotSidebarCollapsed ? 'md:w-16' : 'md:w-56'
                }`}>
                  <div className="space-y-4 overflow-y-auto scrollbar-none flex-1 pr-1 font-sans">
                    <div className="flex items-center justify-between pb-2 border-b border-[var(--dash-border)] gap-2">
                      {!copilotSidebarCollapsed && (
                        <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider animate-fade-in">Sessions</span>
                      )}
                      <div className="flex items-center gap-1.5 ml-auto">
                        <button
                          onClick={() => setCopilotSidebarCollapsed(!copilotSidebarCollapsed)}
                          className="p-1 rounded-lg border border-[var(--dash-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-accent)] hover:bg-[var(--dash-hover-bg)] transition focus:outline-none focus:ring-1 focus:ring-[var(--dash-accent)] shrink-0"
                          title={copilotSidebarCollapsed ? "Expand Sessions" : "Collapse Sessions"}
                          aria-label={copilotSidebarCollapsed ? "Expand Sessions" : "Collapse Sessions"}
                        >
                        {copilotSidebarCollapsed ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                            <polyline points="9 18 15 12 9 6" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5">
                            <polyline points="15 18 9 12 15 6" />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Session List */}
                    <div className="space-y-1">
                      {copilotSessions.map(session => (
                        <div
                          key={session.id}
                          onClick={() => setCopilotActiveSessionId(session.id)}
                          className={`w-full group flex items-center justify-between px-2 py-1.5 rounded-xl text-left cursor-pointer transition duration-150 ${
                            session.id === copilotActiveSessionId
                              ? 'bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] text-[var(--dash-active-text)] shadow-[var(--dash-active-shadow)]'
                              : 'border border-transparent text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)]'
                          }`}
                          title={session.title}
                        >
                          <div className="flex items-center gap-2 truncate">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4 shrink-0 text-[var(--dash-accent)]/80">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            {!copilotSidebarCollapsed && (
                              <span className="text-xs font-semibold truncate animate-fade-in">{session.title}</span>
                            )}
                          </div>
                          {!copilotSidebarCollapsed && (
                            <button
                              onClick={(e) => handleCopilotDeleteSession(session.id, e)}
                              className="opacity-0 group-hover:opacity-100 hover:text-rose-600 p-0.5 transition shrink-0"
                              title="Delete session"
                              aria-label={`Delete session ${session.title}`}
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3 h-3">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Clean brand badge */}
                  <div className="pt-3 border-t border-[var(--dash-border)]/40 mt-3 text-[10px] text-[var(--dash-text-secondary)] flex justify-between items-center font-semibold font-sans">
                    {!copilotSidebarCollapsed ? (
                      <>
                        <span>CertaintyAI / MDx</span>
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--emerald)]"></span>
                      </>
                    ) : (
                      <span className="h-2 w-2 rounded-full bg-[var(--emerald)] mx-auto animate-pulse"></span>
                    )}
                  </div>
                </div>
              </div>

                {/* Main Chat Workspace Area */}
                <div 
                  className="flex-1 flex flex-col justify-between bg-gradient-to-b from-[var(--dash-chat-bg-from)] to-[var(--dash-chat-bg-to)] p-3 lg:p-4 overflow-hidden relative"
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  {/* Top-Bar for Agent Picker */}
                  <div className="flex items-center justify-between pb-3 border-b border-[var(--dash-border)]/40 mb-3 shrink-0">
                    <div className="relative">
                      {activeTab !== 'home' ? (
                        <button
                          onClick={() => setPickerOpen(prev => !prev)}
                          className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl px-3 py-1.5 flex items-center gap-2 hover:border-[var(--dash-accent)]/50 transition cursor-pointer text-xs font-bold text-[var(--dash-text-primary)] focus:outline-none"
                        >
                          {activeAgent?.icon && activeAgent.icon.startsWith('data:image') ? (
                            <div className="w-5 h-5 rounded overflow-hidden shrink-0 border border-slate-200">
                              <img src={activeAgent.icon} alt={activeAgent.name} className="w-full h-full object-cover" />
                            </div>
                          ) : (
                            <span className="w-5 h-5 rounded bg-[var(--dash-hover-bg)] text-[var(--dash-accent)] flex items-center justify-center shrink-0">
                              <i className={`ti ${activeAgent?.icon || 'ti-robot'} text-sm`}></i>
                            </span>
                          )}
                          <span>{activeAgent?.name || 'AI Readiness Copilot'}</span>
                          <i className={`ti ti-chevron-down text-xs text-[var(--dash-text-secondary)] transition-transform duration-200 ${pickerOpen ? 'rotate-180' : ''}`}></i>
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 px-1 py-1.5 text-xs font-bold text-[var(--dash-text-primary)] font-sans select-none">
                          <span className="w-5 h-5 rounded bg-[var(--dash-hover-bg)] text-[var(--dash-accent)] flex items-center justify-center shrink-0">
                            <i className="ti ti-robot text-sm"></i>
                          </span>
                          <span>AI Readiness Copilot</span>
                        </div>
                      )}

                      {activeTab !== 'home' && pickerOpen && (
                        <div className="absolute left-0 mt-1.5 w-64 bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl shadow-lg z-30 overflow-hidden text-xs font-sans border-[var(--dash-border)]">
                          {/* Create AI Assistant Pinned at Top */}
                          <div 
                            onClick={() => {
                              setPickerOpen(false)
                              handleTabChange('agent-builder')
                            }}
                            className="px-4 py-3 border-b border-[var(--dash-border)] hover:bg-[var(--dash-hover-bg)] text-[var(--dash-accent)] flex items-center gap-2.5 cursor-pointer font-bold transition"
                          >
                            <i className="ti ti-plus text-sm"></i>
                            <span>Create AI Assistant</span>
                          </div>

                          {/* List Title */}
                          <div className="px-4 py-2 bg-[var(--dash-bg)] text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">
                            Your Assistants
                          </div>

                          {/* Assistants list */}
                          <div className="max-h-60 overflow-y-auto">
                            {allAgents.map((agent) => (
                              <div
                                key={agent.id}
                                onClick={() => {
                                  setActiveAgentId(agent.id)
                                  setPickerOpen(false)
                                }}
                                className={`px-4 py-2.5 hover:bg-[var(--dash-hover-bg)] flex items-center justify-between cursor-pointer transition ${
                                  agent.id === activeAgentId ? 'bg-[var(--dash-hover-bg)] font-bold text-[var(--dash-text-primary)]' : 'text-[var(--dash-text-secondary)]'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 truncate">
                                  {agent.icon && agent.icon.startsWith('data:image') ? (
                                    <div className="w-5 h-5 rounded overflow-hidden shrink-0 border border-slate-200">
                                      <img src={agent.icon} alt={agent.name} className="w-full h-full object-cover" />
                                    </div>
                                  ) : (
                                    <span className="w-5 h-5 rounded bg-[var(--dash-hover-bg)] text-[var(--dash-accent)] flex items-center justify-center shrink-0">
                                      <i className={`ti ${agent.icon || 'ti-robot'} text-sm`}></i>
                                    </span>
                                  )}
                                  <span className="truncate">{agent.name}</span>
                                </div>
                                {agent.id === activeAgentId && (
                                  <i className="ti ti-check text-[var(--dash-accent)] text-sm"></i>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Drag-and-Drop Overlay */}
                  {isDragging && (
                    <div className="absolute inset-0 bg-[var(--dash-bg)]/90 backdrop-blur-md border-2 border-dashed border-[var(--dash-accent)]/50 rounded-2xl flex flex-col items-center justify-center z-[100] transition-all duration-200 animate-fade-in">
                      <div className="p-6 bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl flex flex-col items-center justify-center space-y-4 max-w-sm text-center shadow-sm">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-12 h-12 text-[var(--dash-accent)] animate-bounce">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <div>
                          <h4 className="text-sm font-bold text-[var(--dash-text-primary)] uppercase tracking-wider">Ingest Document Context</h4>
                          <p className="text-xs text-[var(--dash-text-secondary)] mt-1 leading-relaxed">
                            Drop files to ingest into CertaintyAI context. Supporting PDF, DOCX, XLSX, CSV, PPTX, TXT, PNG, JPG, JPEG.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Scrollable Conversation Container / Welcome Screen */}
                  <div className="flex-grow min-h-0 overflow-y-auto space-y-6 pr-1 pb-4">
                    {(!activeCopilotSession || !activeCopilotSession.messages || activeCopilotSession.messages.length === 0) ? (
                      /* Enhanced Welcome Screen - Header and Report Selector Only */
                      <div className="max-w-2xl mx-auto pt-2 pb-6 px-4 space-y-5 font-sans w-full text-left">
                        {/* Welcome Heading & Report Switcher */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full border-b border-[var(--dash-border)]/40 pb-4">
                          <div className="text-left">
                            <h1 className="text-2xl lg:text-3xl font-extrabold text-[var(--dash-text-primary)] tracking-tight font-sans">
                              Welcome to your AI Operating Workspace
                            </h1>
                            <p className="text-xs text-[var(--dash-text-secondary)] mt-1 font-medium font-sans">
                              Here is your AI Readiness overview, {getGreetingName()}.
                            </p>
                          </div>
                          
                          {/* Controls Row: Load Reports */}
                          <div className="flex flex-wrap items-center gap-3 shrink-0 select-none">
                            {reports && reports.length > 0 && (
                              <div className="relative">
                                <button
                                  onClick={() => setLoadReportsOpen(prev => !prev)}
                                  className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl px-4 py-2 flex items-center gap-2 hover:border-[var(--dash-accent)]/50 transition cursor-pointer text-xs font-bold text-[var(--dash-text-primary)] focus:outline-none shadow-sm font-sans"
                                >
                                  <span>📊 Load Reports</span>
                                  <i className={`ti ti-chevron-down text-xs text-[var(--dash-text-secondary)] transition-transform duration-200 ${loadReportsOpen ? 'rotate-180' : ''}`}></i>
                                </button>

                                {loadReportsOpen && (
                                  <div className="absolute right-0 mt-1.5 w-72 bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl shadow-lg z-30 overflow-hidden text-xs font-sans border-[var(--dash-border)]">
                                    <div className="px-4 py-2 bg-[var(--dash-bg)] text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">
                                      Select Assessment Report
                                    </div>
                                    <div className="max-h-60 overflow-y-auto divide-y divide-[var(--dash-border)]/40 font-sans">
                                      {reports.map((r, index) => {
                                        const isActive = activeReportId === r.id;
                                        const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, {
                                          year: 'numeric',
                                          month: 'short',
                                          day: 'numeric',
                                          hour: '2-digit',
                                          minute: '2-digit'
                                        }) : `Report #${r.id}`;
                                        return (
                                          <div
                                            key={r.id}
                                            onClick={() => {
                                              setSelectedReportId(r.id);
                                              setLoadReportsOpen(false);
                                            }}
                                            className={`px-4 py-2.5 hover:bg-[var(--dash-hover-bg)] flex flex-col cursor-pointer transition ${
                                              isActive ? 'bg-[var(--dash-hover-bg)] font-bold text-[var(--dash-text-primary)] font-semibold' : 'text-[var(--dash-text-secondary)]'
                                            }`}
                                          >
                                            <div className="flex items-center justify-between w-full">
                                              <span className="font-semibold text-xs truncate">
                                                Report ID: {r.id} {index === 0 && <span className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded bg-[var(--dash-active-bg)] text-[var(--dash-accent)] border border-[var(--dash-active-border)] ml-1">Latest</span>}
                                              </span>
                                              {isActive && (
                                                <span className="text-[var(--dash-accent)] text-[10px] font-extrabold">● Active</span>
                                              )}
                                            </div>
                                            <span className="text-[10px] text-[var(--dash-text-secondary)] mt-1">
                                              {dateStr}
                                            </span>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Suggested Actions (prompts feeding the existing chat) */}
                        <div className="space-y-3 w-full">
                          <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-widest block text-left">Suggested Executive Actions</span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                              "Explain My Readiness Score",
                              "Show Governance Gaps",
                              "Generate AI Roadmap",
                              "Estimate Business Value",
                              "Recommend AI Priorities",
                              "Prepare Executive Summary",
                              "Create Governance Plan",
                              "Build AI Control Tower Strategy"
                            ].map((prompt) => (
                              <button
                                key={prompt}
                                onClick={() => handleCopilotSend(prompt)}
                                className="text-left bg-[var(--dash-card-bg)] hover:bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] hover:border-[var(--dash-accent)]/35 p-3 rounded-xl text-xs text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] transition duration-150 shadow-sm flex flex-col justify-between group focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] min-h-[56px] w-full cursor-pointer"
                              >
                                <span className="font-bold leading-snug">{prompt}</span>
                                <span className="text-[var(--dash-accent)] font-extrabold text-right w-full text-xs opacity-60 group-hover:opacity-100 transition duration-150 mt-1">→</span>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Conversation History Bubbles */
                       <div className="space-y-4 max-w-[95%] ml-2 mr-auto md:ml-4">
                        {activeCopilotSession.messages.map((msg, index) => {
                          const isLatest = index === activeCopilotSession.messages.length - 1;
                          const isBot = msg.role === 'assistant';
                          return (
                            <div
                              key={msg.id}
                              className={`flex items-start gap-3 w-full ${
                                msg.role === 'user' ? 'justify-end' : 'justify-start'
                              }`}
                            >
                              {isBot && (
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-[var(--dash-border)] shrink-0 shadow bg-[var(--dash-card-bg)] mt-1">
                                  {activeAgent?.icon && activeAgent.icon.startsWith('data:image') ? (
                                    <img src={activeAgent.icon} alt={activeAgent.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full bg-[var(--dash-hover-bg)] text-[var(--dash-accent)] flex items-center justify-center">
                                      <i className={`ti ${activeAgent?.icon || 'ti-robot'} text-base`}></i>
                                    </div>
                                  )}
                                </div>
                              )}
                              <div className={`flex flex-col space-y-1.5 ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[85%] w-full`}>
                                {/* Message Capsule */}
                                <div
                                  className={`max-w-full rounded-2xl px-4 py-3 text-xs leading-relaxed border transition shadow ${
                                    msg.role === 'user'
                                      ? 'bg-[var(--dash-user-msg)] border-[var(--dash-user-msg-border)] text-[var(--dash-user-msg-text)]'
                                      : 'bg-[var(--dash-assistant-msg)] border-[var(--dash-assistant-msg-border)] text-[var(--dash-assistant-msg-text)]'
                                  }`}
                                >
                                {msg.role === 'user' ? (
                                  <div className="font-sans">
                                    <p className="whitespace-pre-wrap font-medium">{msg.content}</p>
                                    {msg.files && msg.files.length > 0 && (
                                      <div className="mt-2 pt-2 border-t border-[var(--dash-active-border)] flex flex-wrap gap-1.5">
                                        {msg.files.map(file => (
                                          <div
                                            key={file.id}
                                            className="bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-2 py-0.5 rounded text-[10px] text-[var(--dash-accent)] flex items-center gap-1"
                                          >
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                                            </svg>
                                            <span>{file.name}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className="space-y-3 font-sans">
                                    {/* Render Rich Markdown response with clean spacing */}
                                    <div className="prose prose-invert prose-xs max-w-none text-[var(--dash-text-secondary)] leading-relaxed font-sans">
                                      {parseMarkdownToReact(msg.content)}
                                    </div>
                                    
                                    {/* Cited Source References */}
                                    {msg.retrieved_sources && msg.retrieved_sources.length > 0 && (
                                      <div className="pt-2 border-t border-[var(--dash-border)]/40 mt-2.5 space-y-1 font-sans">
                                        <span className="text-[9px] uppercase tracking-wider text-[var(--dash-text-secondary)] font-bold block">
                                          Cited Sources
                                        </span>
                                        <div className="flex flex-wrap gap-1.5">
                                          {msg.retrieved_sources.map((src, sidx) => (
                                            <span
                                              key={sidx}
                                              className="inline-flex items-center gap-1 bg-[var(--dash-active-bg)] text-[var(--dash-accent)] border border-[var(--dash-active-border)] px-2 py-0.5 rounded text-[10px] font-medium"
                                            >
                                              <i className="ti ti-file-text text-[10px]"></i>
                                              {src}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    )}

                                    {/* Read Aloud Trigger */}
                                    <div className="pt-2 border-t border-[var(--dash-border)] flex justify-between items-center mt-2">
                                      <span className="text-[9px] uppercase tracking-wider text-[var(--dash-text-secondary)] font-bold">
                                        Generated by {copilotModel}
                                      </span>
                                      {activeAgent?.voice_enabled !== false && (
                                        <button
                                          onClick={() => handleCopilotSpeak(msg.id, msg.content)}
                                          className={`p-1.5 rounded-lg border transition focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] ${
                                            copilotReadingId === msg.id
                                              ? 'border-[var(--dash-accent)]/30 text-[var(--dash-accent)] bg-[var(--dash-active-bg)] shadow-sm'
                                              : 'border-[var(--dash-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)]'
                                          }`}
                                          title="Read this analysis aloud"
                                        >
                                          {copilotReadingId === msg.id ? (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3 animate-pulse">
                                              <line x1="1" y1="12" x2="23" y2="12" />
                                              <path d="M12 2v20M8 5v14M16 5v14M4 9v6M20 9v6" />
                                            </svg>
                                          ) : (
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3 h-3">
                                              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                                              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                                            </svg>
                                          )}
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Dynamic Contextual Follow-Up Prompts */}
                              {isBot && isLatest && !copilotStreaming && (
                                <div className="mt-2.5 max-w-[95%] space-y-2 font-sans animate-fade-in">
                                  <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-widest block">Suggested Follow-Ups</span>
                                  <div className="flex flex-wrap gap-2">
                                    {(msg.follow_ups && msg.follow_ups.length > 0
                                      ? msg.follow_ups
                                      : getFollowUpPromptsForResponse(
                                          activeCopilotSession.messages.findLast(m => m.role === 'user')?.content || ''
                                        )
                                    ).map((prompt, pidx) => (
                                      <button
                                        key={pidx}
                                        onClick={() => handleCopilotSend(prompt)}
                                        className="text-[10px] font-semibold text-[var(--dash-text-secondary)] bg-[var(--dash-card-bg)] hover:bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] hover:border-[var(--dash-accent)]/30 px-3 py-1.5 rounded-xl transition duration-150 shadow-sm hover:text-[var(--dash-text-primary)]"
                                      >
                                        {prompt}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                            </div>
                          );
                        })}
                        {copilotStreaming && (
                          <div className="flex items-center gap-1.5 pl-2 text-[var(--dash-text-secondary)] text-xs font-sans">
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--dash-accent)] animate-bounce"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--dash-accent)] animate-bounce [animation-delay:0.2s]"></span>
                            <span className="h-1.5 w-1.5 rounded-full bg-[var(--dash-accent)] animate-bounce [animation-delay:0.4s]"></span>
                            <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--dash-text-secondary)] ml-1">Streaming Telemetry...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Bottom Ask Box Panel */}
                  <div className="pt-3 border-t border-[var(--dash-border)]/40 shrink-0 space-y-2 font-sans">
                    {/* File Ingestion Chips preview */}
                    {copilotFiles.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 max-w-[95%] ml-2 mr-auto md:ml-4 px-1">
                        {copilotFiles.map(file => (
                          <div
                            key={file.id}
                            className="bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-2 py-1 rounded-xl text-[10px] text-[var(--dash-accent)] flex items-center gap-1.5 shadow-sm"
                          >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-2.5 h-2.5">
                              <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                            </svg>
                            <span className="truncate max-w-[120px]">{file.name}</span>
                            <button
                              onClick={() => handleRemoveCopilotFile(file.id)}
                              className="hover:text-[var(--rose)] transition font-bold"
                              aria-label={`Remove file ${file.name}`}
                            >
                              ×
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Floating Search Input bar */}
                    <div className="flex items-center gap-2 max-w-[95%] ml-2 mr-auto md:ml-4 w-full bg-[var(--dash-bg)]/85 border border-[var(--dash-border)] rounded-2xl px-3 py-2 focus-within:border-[var(--dash-accent)]/50 focus-within:ring-1 focus-within:ring-[var(--dash-accent)]/50 transition duration-150 shadow-inner">
                      {/* Hidden File Input */}
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleCopilotFileChange}
                        multiple
                        className="hidden"
                        accept=".txt,.md,text/plain"
                      />
                      
                      {/* Attach Document (paperclip) Button */}
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="p-1.5 rounded-lg text-[var(--dash-text-secondary)] hover:text-[var(--dash-accent)] hover:bg-[var(--dash-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] transition shrink-0"
                        title="Upload supporting plain-text documents (.txt, .md)"
                        aria-label="Upload supporting documents"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
                        </svg>
                      </button>

                      {/* Mic Toggle Trigger */}
                      {activeAgent?.voice_enabled !== false && (
                        <button
                          onClick={toggleCopilotListening}
                          className={`p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] transition duration-150 shrink-0 ${
                            copilotListening
                              ? 'text-[var(--rose)] bg-[var(--rose)]/10 shadow-sm border border-[var(--rose)]/20'
                              : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-accent)] hover:bg-[var(--dash-hover-bg)]'
                          }`}
                          title={copilotListening ? 'Stop listening...' : 'Dictate a prompt'}
                          aria-label={copilotListening ? 'Stop listening' : 'Dictate a prompt'}
                        >
                          <Icons.Mic />
                        </button>
                      )}

                      {/* Auto Read Aloud Toggle */}
                      {activeAgent?.voice_enabled !== false && (
                        <button
                          onClick={() => setCopilotReadAloud(!copilotReadAloud)}
                          className={`p-1.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] transition duration-150 shrink-0 ${
                            copilotReadAloud
                              ? 'text-[var(--dash-accent)] bg-[var(--dash-active-bg)] border border-[var(--dash-accent)]/20 shadow-sm'
                              : 'text-[var(--dash-text-secondary)] hover:text-[var(--dash-accent)] hover:bg-[var(--dash-hover-bg)]'
                          }`}
                          title={copilotReadAloud ? 'Auto Read Aloud: Enabled' : 'Auto Read Aloud: Disabled'}
                          aria-label={copilotReadAloud ? 'Disable Auto Read Aloud' : 'Enable Auto Read Aloud'}
                        >
                          <i className={`ti ${copilotReadAloud ? 'ti-volume' : 'ti-volume-off'} text-base`}></i>
                        </button>
                      )}

                      {/* Text Input area */}
                      <input
                        type="text"
                        value={copilotInput}
                        onChange={(e) => setCopilotInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            handleCopilotSend()
                          }
                        }}
                        placeholder="Ask anything about AI Readiness, Governance, Security, Architecture, Compliance, ROI, Agentic AI, Cloud Platforms, Data Readiness, or Enterprise Transformation..."
                        className="flex-grow bg-transparent border-0 text-[var(--dash-text-primary)] placeholder-[var(--dash-text-secondary)]/50 text-xs focus:ring-0 focus:outline-none py-1.5 font-sans"
                        aria-label="Chat input message"
                      />

                      {/* Language Selector */}
                      <div className="relative shrink-0">
                        <select
                          value={copilotLanguage}
                          onChange={(e) => setCopilotLanguage(e.target.value)}
                          className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl text-[10px] text-[var(--dash-text-secondary)] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] cursor-pointer max-w-[85px] truncate font-semibold"
                          title="Select Language"
                          aria-label="Select translation language"
                        >
                          {copilotLanguages.map(lang => (
                            <option key={lang.name} value={lang.name} className="bg-[var(--dash-card-bg)] text-[var(--dash-text-primary)] text-xs">
                              {lang.name}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Model Selector */}
                      <div className="relative shrink-0">
                        <select
                          value={copilotModel}
                          onChange={(e) => handleModelChange(e.target.value)}
                          className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl text-[10px] text-[var(--dash-text-secondary)] px-2 py-1 focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] cursor-pointer max-w-[100px] truncate font-semibold"
                          title="Select Model"
                          aria-label="Select inference model"
                        >
                          {copilotModels.map(model => (
                            <option key={model} value={model} className="bg-[var(--dash-card-bg)] text-[var(--dash-text-primary)] text-xs">
                              {model}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Send Trigger Button */}
                      <button
                        onClick={() => handleCopilotSend()}
                        className="p-1.5 rounded-lg text-[var(--dash-accent)] hover:text-[var(--dash-accent-hover)] hover:bg-[var(--dash-hover-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)] transition shrink-0"
                        title="Send query"
                        aria-label="Send query"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                          <line x1="22" y1="2" x2="11" y2="13" />
                          <polygon points="22 2 15 22 11 13 2 9 22 2" />
                        </svg>
                      </button>
                    </div>
                    
                    {/* Plain-text helper note */}
                    <div className="text-[10px] text-[var(--dash-text-secondary)]/75 max-w-[95%] ml-2 mr-auto md:ml-4 px-1.5 flex items-center gap-1 font-medium font-sans mt-1">
                      <i className="ti ti-info-circle text-xs"></i>
                      <span>Plain-text files for now (.txt, .md)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PORTFOLIO */}
            {activeTab === 'portfolio' && (
              <>
                {dashboardSubTab === 'strategy' ? (
                  <div className="space-y-8">
                    {/* Actionable 90-Day C-Suite Roadmap */}
                    <div className="space-y-6">
                      <h3 className="text-xl font-bold text-[var(--dash-text-primary)]">Actionable 90-Day C-Suite Roadmap</h3>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Phase 1 */}
                        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 relative overflow-hidden group hover:border-[var(--accent)] transition duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-bl-full pointer-events-none"></div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-mono font-extrabold text-[var(--accent)] uppercase bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-2.5 py-1 rounded-full">
                              Days 1 - 30
                            </span>
                            <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase">Phase 1</span>
                          </div>
                          <h4 className="text-base font-bold text-[var(--dash-text-primary)] mb-2">AI Steering Committee Foundation</h4>
                          <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed mb-4">
                            Assemble the cross-functional steering group to establish a standardized Acceptable-Use Policy and a Permitted/Restricted tools matrix.
                          </p>
                          <div className="bg-[var(--dash-bg)] rounded-xl p-3.5 border border-[var(--dash-border)] space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[var(--dash-text-secondary)] block">Deliverables</span>
                            <ul className="text-[11px] text-[var(--dash-text-secondary)] space-y-1.5">
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                AI Readiness Score Diagnostic
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                Permitted / Restricted Tools Matrix
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                Draft Acceptable-Use Policy
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Phase 2 */}
                        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 relative overflow-hidden group hover:border-[var(--accent)] transition duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-bl-full pointer-events-none"></div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-mono font-extrabold text-[var(--accent)] uppercase bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-2.5 py-1 rounded-full">
                              Days 31 - 60
                            </span>
                            <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase">Phase 2</span>
                          </div>
                          <h4 className="text-base font-bold text-[var(--dash-text-primary)] mb-2">Priority Use-Case & Ontology Mapping</h4>
                          <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed mb-4">
                            Execute the 1-Day Strategic Use-Case Discovery Workshop. Define semantic ontology boundaries around EHR patient feeds or logs to accelerate data pipelines.
                          </p>
                          <div className="bg-[var(--dash-bg)] rounded-xl p-3.5 border border-[var(--dash-border)] space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[var(--dash-text-secondary)] block">Deliverables</span>
                            <ul className="text-[11px] text-[var(--dash-text-secondary)] space-y-1.5">
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                Prioritized Use-Case Portfolio
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                Semantic Layer / Ontology Spec
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                1-Day Discovery Workshop Memo
                              </li>
                            </ul>
                          </div>
                        </div>

                        {/* Phase 3 */}
                        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 relative overflow-hidden group hover:border-[var(--accent)] transition duration-300">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[var(--accent)]/5 to-transparent rounded-bl-full pointer-events-none"></div>
                          <div className="flex justify-between items-start mb-4">
                            <span className="text-[10px] font-mono font-extrabold text-[var(--accent)] uppercase bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-2.5 py-1 rounded-full">
                              Days 61 - 90
                            </span>
                            <span className="text-xs font-bold text-[var(--dash-text-secondary)] uppercase">Phase 3</span>
                          </div>
                          <h4 className="text-base font-bold text-[var(--dash-text-primary)] mb-2">NIST Compliance & Evidence Pack</h4>
                          <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed mb-4">
                            Publish operational guidelines and map controls to NIST AI RMF 1.0, ISO/IEC 42001, SOC 2, HIPAA, GDPR, and the EU AI Act.
                          </p>
                          <div className="bg-[var(--dash-bg)] rounded-xl p-3.5 border border-[var(--dash-border)] space-y-2">
                            <span className="text-[10px] uppercase font-bold text-[var(--dash-text-secondary)] block">Deliverables</span>
                            <ul className="text-[11px] text-[var(--dash-text-secondary)] space-y-1.5">
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                Published AI Governance Rules
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                Audit-Ready Evidence Pack
                              </li>
                              <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-[var(--accent)]"></span>
                                Agent Kill-Switch Safety Playbook
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* MDx Cooperative AI Solutions Catalog */}
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-xl font-bold text-[var(--dash-text-primary)]">MDx Cooperative AI Solutions Catalog</h3>
                        <p className="text-xs text-[var(--dash-text-secondary)] mt-1">Market-competitive, procurement-ready cooperative AI agreements tailored for public sector members and departments.</p>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Starter Tier */}
                        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] hover:border-[var(--dash-border)]/80 rounded-2xl p-6 flex flex-col justify-between transition duration-200">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--dash-text-secondary)] bg-[var(--dash-bg)] border border-[var(--dash-border)] px-2 py-0.5 rounded">
                                Entry-Level
                              </span>
                              <h4 className="text-lg font-bold text-[var(--dash-text-primary)] mt-1.5">Starter Tier</h4>
                              <p className="text-xs text-[var(--dash-text-secondary)] mt-1">Best for small agencies or first AI initiatives</p>
                            </div>
                            
                            <div className="border-t border-[var(--dash-border)] pt-4 space-y-3">
                              <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] block uppercase">Scope Included:</span>
                              <ul className="text-xs text-[var(--dash-text-secondary)] space-y-2">
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  AI Readiness Assessment
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  1-Day Use-Case Discovery Workshop
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Executive AI Briefing & strategic Deck
                                </li>
                              </ul>
                            </div>

                            <div className="border-t border-[var(--dash-border)] pt-4 space-y-1">
                              <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] block uppercase">Key Staff:</span>
                              <p className="text-xs text-[var(--dash-text-secondary)]">AI Strategist, Project Manager (AI)</p>
                            </div>
                          </div>

                          <div className="pt-6 mt-6 border-t border-[var(--dash-border)]">
                            <button
                              onClick={() => {
                                setSelectedProcurementTier('starter');
                                setIsProcurementModalOpen(true);
                              }}
                              className="w-full bg-[var(--dash-bg)] hover:bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] hover:border-[var(--dash-active-border)] text-[var(--dash-text-primary)] font-bold text-xs py-2.5 rounded-xl transition duration-150"
                            >
                              Request Starter Tier
                            </button>
                          </div>
                        </div>

                        {/* Core Tier */}
                        <div className="bg-gradient-to-b from-[var(--dash-active-bg)]/30 to-[var(--dash-bg)] border-2 border-[var(--dash-accent)]/45 shadow-[0_0_20px_rgba(var(--accent-rgb),0.1)] rounded-2xl p-6 flex flex-col justify-between transition duration-200 relative">
                          <div className="absolute top-3 right-3">
                            <span className="text-[9px] uppercase font-bold text-[var(--dash-accent)] bg-[var(--dash-accent)]/10 border border-[var(--dash-accent)]/20 px-2.5 py-0.5 rounded-full">
                              Most Popular
                            </span>
                          </div>
                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--dash-accent)] bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-2 py-0.5 rounded">
                                Production Ready
                              </span>
                              <h4 className="text-lg font-bold text-[var(--dash-text-primary)] mt-1.5">Core Tier</h4>
                              <p className="text-xs text-[var(--dash-text-secondary)] mt-1">Best for departments launching production AI</p>
                            </div>
                            
                            <div className="border-t border-[var(--dash-border)] pt-4 space-y-3">
                              <span className="text-[10px] font-bold text-[var(--dash-accent)] block uppercase">Scope Included:</span>
                              <ul className="text-xs text-[var(--dash-text-secondary)] space-y-2">
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Comprehensive 90-Day Roadmap
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  1–2 Custom AI Solutions (NLP or Predictive)
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Instructor-Led Adoption Training
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Standard MLOps Setup & Monitoring
                                </li>
                              </ul>
                            </div>

                            <div className="border-t border-[var(--dash-border)] pt-4 space-y-1">
                              <span className="text-[10px] font-bold text-[var(--dash-accent)] block uppercase">Key Staff:</span>
                              <p className="text-xs text-[var(--dash-text-secondary)]">AI Architect, Data Scientist, ML Engineer, AI Trainer</p>
                            </div>
                          </div>

                          <div className="pt-6 mt-6 border-t border-[var(--dash-border)]">
                            <button
                              onClick={() => {
                                setSelectedProcurementTier('core');
                                setIsProcurementModalOpen(true);
                              }}
                              className="w-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white font-extrabold text-xs py-2.5 rounded-xl transition duration-150 shadow-[0_0_12px_rgba(var(--accent-rgb),0.25)] hover:scale-[1.01]"
                            >
                              Request Core Tier
                            </button>
                          </div>
                        </div>

                        {/* Advanced Tier */}
                        <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] hover:border-[var(--dash-border)]/80 rounded-2xl p-6 flex flex-col justify-between transition duration-200">
                          <div className="space-y-4">
                            <div>
                              <span className="text-[9px] uppercase font-bold tracking-widest text-[var(--dash-text-secondary)] bg-[var(--dash-bg)] border border-[var(--dash-border)] px-2 py-0.5 rounded">
                                Enterprise
                              </span>
                              <h4 className="text-lg font-bold text-[var(--dash-text-primary)] mt-1.5">Advanced Tier</h4>
                              <p className="text-xs text-[var(--dash-text-secondary)] mt-1">Best for enterprise multi-department rollouts</p>
                            </div>
                            
                            <div className="border-t border-[var(--dash-border)] pt-4 space-y-3">
                              <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] block uppercase">Scope Included:</span>
                              <ul className="text-xs text-[var(--dash-text-secondary)] space-y-2">
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Multiple AI Solutions (Vision/GenAI integrations)
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Advanced NIST AI RMF Governance Frameworks
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Continuous Model Retraining & Performance Tuning
                                </li>
                                <li className="flex items-start gap-2">
                                  <span className="text-[var(--emerald)] mt-0.5 font-bold">✓</span>
                                  Fully Managed AI Security Threat Monitoring
                                </li>
                              </ul>
                            </div>

                            <div className="border-t border-[var(--dash-border)] pt-4 space-y-1">
                              <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] block uppercase">Key Staff:</span>
                              <p className="text-xs text-[var(--dash-text-secondary)]">AI Architect, Cybersecurity AI Specialist, ML Engineer</p>
                            </div>
                          </div>

                          <div className="pt-6 mt-6 border-t border-[var(--dash-border)]">
                            <button
                              onClick={() => {
                                setSelectedProcurementTier('advanced');
                                setIsProcurementModalOpen(true);
                              }}
                              className="w-full bg-[var(--dash-bg)] hover:bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] hover:border-[var(--dash-active-border)] text-[var(--dash-text-primary)] font-bold text-xs py-2.5 rounded-xl transition duration-150"
                            >
                              Request Advanced Tier
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* 6-Core LLM Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {llmModels.map((model, i) => (
                        <div
                          key={i}
                          className={`relative bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 flex flex-col justify-between transition duration-300 ${model.borderGlow}`}
                        >
                          <div className="space-y-4">
                            <div className="flex justify-between items-start">
                              <div>
                                <span className="text-[10px] uppercase font-bold tracking-widest text-[var(--dash-text-secondary)] bg-[var(--dash-bg)] px-2 py-0.5 rounded border border-[var(--dash-border)]">
                                  {model.type}
                                </span>
                                <h3 className="text-lg font-bold text-[var(--dash-text-primary)] mt-1">{model.name}</h3>
                              </div>
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                                model.partner.includes('Partner') 
                                  ? 'border-[var(--dash-accent-2)]/40 text-[var(--dash-accent-2)] bg-[var(--dash-accent-2)]/10' 
                                  : 'border-[var(--dash-accent)]/40 text-[var(--dash-accent)] bg-[var(--dash-accent)]/10'
                              }`}>
                                {model.partner}
                              </span>
                            </div>

                            {/* Usage Progress */}
                            <div className="space-y-1">
                              <div className="flex justify-between text-xs text-[var(--dash-text-secondary)]">
                                <span>Quota Usage</span>
                                <span className="font-semibold text-[var(--dash-text-primary)]">{model.usage}</span>
                              </div>
                              <div className="w-full bg-[var(--dash-bg)]/60 rounded-full h-1.5 overflow-hidden">
                                <div className={`h-full bg-gradient-to-r ${model.color}`} style={{ width: `${model.percent}%` }}></div>
                              </div>
                            </div>

                            {/* Latency / Limit Stats */}
                            <div className="grid grid-cols-2 gap-3 pt-1 text-xs">
                              <div className="bg-[var(--dash-bg)]/40 p-2.5 rounded-xl border border-[var(--dash-border)]">
                                <span className="text-[10px] text-[var(--dash-text-secondary)] uppercase tracking-wider block">Limits (TPM)</span>
                                <span className="font-mono text-[var(--dash-text-primary)]">{model.tpm}</span>
                              </div>
                              <div className="bg-[var(--dash-bg)]/40 p-2.5 rounded-xl border border-[var(--dash-border)]">
                                <span className="text-[10px] text-[var(--dash-text-secondary)] uppercase tracking-wider block">Limits (RPM)</span>
                                <span className="font-mono text-[var(--dash-text-primary)]">{model.rpm}</span>
                              </div>
                            </div>

                            {/* Recommendation */}
                            <div className="flex items-start gap-2 bg-[var(--dash-bg)]/40 p-3 rounded-xl border border-[var(--dash-border)]">
                              <Icons.Lightbulb />
                              <p className="text-[11px] text-[var(--dash-text-secondary)] leading-normal font-medium">{model.rec}</p>
                            </div>
                          </div>

                          <div className="flex justify-between items-center border-t border-[var(--dash-border)] pt-4 mt-4">
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="h-2 w-2 rounded-full bg-[var(--emerald)]"></span>
                              <span className="text-[var(--dash-text-secondary)] font-medium">{model.status}</span>
                            </div>
                            <span className="text-xs font-mono font-bold text-[var(--dash-text-primary)]">{model.cost}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Forecast section */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-lg font-bold text-[var(--dash-text-primary)]">30/60/90-Day Consumption Forecast</h3>
                          <p className="text-xs text-[var(--dash-text-secondary)] mt-1">Multi-cloud forecast modeling based on scheduled jobs and current trends.</p>
                        </div>
                        <span className="text-xs text-[var(--emerald)] font-semibold bg-[var(--emerald)]/10 border border-[var(--emerald)]/30 px-3 py-1 rounded-full">
                          Model Confidence: 94.2%
                        </span>
                      </div>

                      {/* SVG Chart */}
                      <div className="relative h-44 w-full">
                        <svg viewBox="0 0 500 150" className="w-full h-full text-[var(--dash-accent)]/20">
                          {/* Grid Lines */}
                          <line x1="0" y1="20" x2="500" y2="20" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                          <line x1="0" y1="75" x2="500" y2="75" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                          <line x1="0" y1="130" x2="500" y2="130" stroke="currentColor" strokeOpacity="0.05" strokeWidth="1" />
                          
                          {/* Spline Area Gradient */}
                          <defs>
                            <linearGradient id="chartGlow" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.15" />
                              <stop offset="100%" stopColor="var(--accent-2)" stopOpacity="0" />
                            </linearGradient>
                          </defs>

                          {/* Area Fill */}
                          <path d="M 0,110 Q 80,105 150,60 T 300,100 T 450,25 L 500,25 L 500,150 L 0,150 Z" fill="url(#chartGlow)" />
                          
                          {/* Projection Line */}
                          <path 
                            d="M 0,110 Q 80,105 150,60 T 300,100 T 450,25 L 500,20" 
                            fill="none" 
                            stroke="url(#gradientLine)" 
                            strokeWidth="3.5" 
                            strokeLinecap="round"
                          />
                          
                          <linearGradient id="gradientLine" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="var(--accent)" />
                            <stop offset="50%" stopColor="var(--accent-2)" />
                            <stop offset="100%" stopColor="var(--accent-2)" />
                          </linearGradient>

                          {/* Intercept point */}
                          <circle cx="150" cy="60" r="5" fill="var(--accent)" className="animate-pulse" />
                          <circle cx="450" cy="25" r="5" fill="var(--accent-2)" className="animate-pulse" />
                        </svg>

                        <div className="absolute top-12 left-[30%] text-[10px] text-[var(--dash-accent)] font-bold bg-[var(--dash-bg)] border border-[var(--dash-accent)]/40 rounded px-2 py-0.5">
                          Actual Usage: 642K tokens
                        </div>
                        <div className="absolute top-2 right-[12%] text-[10px] text-[var(--accent-2)] font-bold bg-[var(--dash-bg)] border border-[var(--accent-2)]/40 rounded px-2 py-0.5">
                          Projected Spike: 2.1M (compliance scan)
                        </div>
                      </div>

                      <div className="flex justify-between items-center text-xs text-[var(--dash-text-secondary)] pt-4 border-t border-[var(--dash-border)]">
                        <span>Now</span>
                        <span>30 Days (Forecast)</span>
                        <span>60 Days (Forecast)</span>
                        <span>90 Days (Horizon)</span>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* TAB: CFO DASHBOARD */}
            {activeTab === 'dashboard' && (() => {
              const scores = latestReportData?.scores || {};
              const totalScore = scores.total_score || 0;
              const subScores = scores.sub_scores || {};
              const finops = scores.finops || {};
              
              // per-domain scores (from Step 1)
              const semScore = subScores.semantic ?? 0;
              const ragScore = subScores.rag ?? 0;
              const audScore = subScores.audit ?? 0;
              const ovsScore = subScores.oversight ?? 0;
              const datScore = subScores.data ?? subScores.maturity ?? 0;

              // If no report data is loaded, render the clean empty/preview state callout
              if (!latestReportData) {
                return (
                  <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-8 text-center space-y-4 font-sans max-w-2xl mx-auto my-8 shadow-sm">
                    <span className="text-4xl block">📊</span>
                    <h3 className="text-lg font-bold text-[var(--dash-text-primary)]">Ready to visualize your AI maturity?</h3>
                    <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed max-w-md mx-auto">
                      Complete your first assessment to unlock dynamic, assessment-based analytics, maturity gaps, and opportunities on this dashboard.
                    </p>
                    <div className="pt-2">
                      <button
                        onClick={() => handleTabChange('readiness')}
                        className="px-4 py-2.5 bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white text-xs font-bold rounded-xl transition duration-150 shadow-sm cursor-pointer"
                      >
                        Start Assessment Survey
                      </button>
                    </div>
                  </div>
                );
              }

              // Compute Radar Chart SVG metrics
              const cx = 150;
              const cy = 150;
              const rMax = 100;
              const angles = [
                -Math.PI / 2,                     // Top: Semantic Alignment
                -Math.PI / 2 + (2 * Math.PI) / 5, // Top-Right: RAG Accuracy
                -Math.PI / 2 + (4 * Math.PI) / 5, // Bottom-Right: Audit & Provenance
                -Math.PI / 2 + (6 * Math.PI) / 5, // Bottom-Left: Governance Oversight
                -Math.PI / 2 + (8 * Math.PI) / 5  // Top-Left: Data Maturity
              ];
              
              const labels = [
                "Semantic Alignment",
                "RAG Accuracy",
                "Audit & Provenance",
                "Governance Oversight",
                "Data Maturity"
              ];
              
              const values = [semScore, ragScore, audScore, ovsScore, datScore];

              // Concentric grid pentagons (20, 40, 60, 80, 100)
              const gridPentagons = [20, 40, 60, 80, 100].map(val => {
                const points = angles.map(angle => {
                  const x = cx + rMax * (val / 100) * Math.cos(angle);
                  const y = cy + rMax * (val / 100) * Math.sin(angle);
                  return `${x},${y}`;
                }).join(" ");
                return (
                  <polygon 
                    key={val} 
                    points={points} 
                    fill="none" 
                    stroke="var(--dash-border)" 
                    strokeWidth="0.5" 
                    strokeDasharray={val === 100 ? "" : "2,2"} 
                    opacity="0.4" 
                  />
                );
              });

              // Radar spider lines/axes
              const axisLines = angles.map((angle, i) => {
                const x = cx + rMax * Math.cos(angle);
                const y = cy + rMax * Math.sin(angle);
                return (
                  <line 
                    key={i} 
                    x1={cx} 
                    y1={cy} 
                    x2={x} 
                    y2={y} 
                    stroke="var(--dash-border)" 
                    strokeWidth="0.75" 
                    opacity="0.5" 
                  />
                );
              });

              // Radar labels placed around the vertices
              const labelElements = angles.map((angle, i) => {
                const labelOffset = 22;
                let x = cx + (rMax + labelOffset) * Math.cos(angle);
                let y = cy + (rMax + labelOffset) * Math.sin(angle);
                
                let textAnchor = "middle";
                if (Math.abs(Math.cos(angle)) > 0.1) {
                  textAnchor = Math.cos(angle) > 0 ? "start" : "end";
                }
                
                let dy = "0.33em";
                if (i === 0) dy = "-0.4em";
                if (i === 2 || i === 3) dy = "0.8em";
                
                return (
                  <text
                    key={i}
                    x={x}
                    y={y}
                    textAnchor={textAnchor}
                    dy={dy}
                    className="text-[9px] font-bold fill-[var(--dash-text-secondary)] font-sans"
                  >
                    {labels[i]}
                  </text>
                );
              });

              // Radar data polygon
              const dataPoints = angles.map((angle, i) => {
                const val = values[i];
                const x = cx + rMax * (val / 100) * Math.cos(angle);
                const y = cy + rMax * (val / 100) * Math.sin(angle);
                return `${x},${y}`;
              }).join(" ");

              const dataPolygon = (
                <polygon
                  points={dataPoints}
                  fill="var(--dash-accent)"
                  fillOpacity="0.12"
                  stroke="var(--dash-accent)"
                  strokeWidth="2"
                  className="transition-all duration-500"
                />
              );

              // Radar data points/dots
              const dataDots = angles.map((angle, i) => {
                const val = values[i];
                const x = cx + rMax * (val / 100) * Math.cos(angle);
                const y = cy + rMax * (val / 100) * Math.sin(angle);
                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r="3.5"
                    fill="var(--dash-accent)"
                    stroke="var(--dash-card-bg)"
                    strokeWidth="1.5"
                    className="transition-all duration-500"
                  />
                );
              });

              // Define fields for horizontal bar charts
              const domainFields = [
                { key: 'semantic', label: 'Semantic Alignment' },
                { key: 'rag', label: 'RAG Accuracy' },
                { key: 'audit', label: 'Audit & Provenance' },
                { key: 'oversight', label: 'Governance Oversight' },
                { key: 'data', label: 'Data Maturity' }
              ];

              // Executive interpretation gap list
              const scoresList = [
                { key: 'semantic', label: 'Semantic Alignment', score: semScore, desc: 'Enterprise data terminology and domain ontologies are fragmented. Standardize cross-system data models to reduce context leakage.' },
                { key: 'rag', label: 'RAG Accuracy', score: ragScore, desc: 'Model retrieval pipeline validation rates are low. Refine retrieval chunking parameters and index query routers to reduce hallucination risk.' },
                { key: 'audit', label: 'Audit & Provenance', score: audScore, desc: 'Audit logging for AI agent executions, prompt lineage, and outputs is missing or incomplete. Implement systematic traceability.' },
                { key: 'oversight', label: 'Governance Oversight', score: ovsScore, desc: 'AI compliance workflows and organizational oversight committees are informal or ad-hoc. Establish formal steering parameters.' },
                { key: 'data', label: 'Data Maturity', score: datScore, desc: 'Unstructured data ingestion volume, freshness, or formats are unoptimized. Build automated cleanup and ingestion pipelines.' }
              ];
              
              const lowestDomain = scoresList.reduce((min, current) => current.score < min.score ? current : min, scoresList[0]);

              let gapBg = "bg-[var(--rose)]/5 border-[var(--rose)]/20 text-[var(--rose)]";
              let gapLabel = `Primary Readiness Gap: ${lowestDomain.label}`;
              let gapIcon = "⚠️";
              if (lowestDomain.score >= 75) {
                gapBg = "bg-[var(--emerald)]/5 border-[var(--emerald)]/20 text-[var(--emerald)]";
                gapLabel = `Primary Optimization Opportunity: ${lowestDomain.label}`;
                gapIcon = "🎯";
              } else if (lowestDomain.score >= 50) {
                gapBg = "bg-[var(--amber)]/5 border-[var(--amber)]/20 text-[var(--amber)]";
                gapLabel = `Primary Development Area: ${lowestDomain.label}`;
                gapIcon = "⚡";
              }

              // 6-Tile calculations:
              const activeStage = totalScore >= 75 ? 3 : totalScore >= 40 ? 2 : 1;
              const maturityLevel = totalScore >= 75 ? "Scaling" : totalScore >= 40 ? "Piloting" : "Foundational";
              const maturityBandRange = totalScore >= 75 ? "75-100" : totalScore >= 40 ? "40-74" : "0-39";

              const coreDomainsForGaps = [
                { label: "Semantic Alignment", score: semScore },
                { label: "RAG Accuracy", score: ragScore },
                { label: "Audit & Provenance", score: audScore },
                { label: "Governance Oversight", score: ovsScore },
                { label: "Data Maturity", score: datScore }
              ];
              const gapsList = coreDomainsForGaps.filter(d => d.score < 50);
              const priorityProjectsCount = Math.min(gapsList.length, 3);
              const sortedGaps = [...gapsList].sort((a, b) => a.score - b.score);
              const lowestDomainLabels = sortedGaps.slice(0, 2).map(d => d.label).join(", ");
              const priorityProjectsSubline = lowestDomainLabels ? `${lowestDomainLabels}` : "No critical gaps identified";

              const govAvg = (ovsScore + audScore) / 2;
              let govGapLabel = "Low gap";
              if (govAvg < 50) {
                govGapLabel = "High gap";
              } else if (govAvg < 75) {
                govGapLabel = "Medium gap";
              }
              const govGapSubline = `Avg: ${govAvg}/100`;

              const stages = [
                { num: 1, name: 'FOUNDATIONAL', band: '0-39' },
                { num: 2, name: 'PILOTING & GOVERNANCE', band: '40-74' },
                { num: 3, name: 'SCALING ENTERPRISE AI', band: '75-100' }
              ];

              return (
                <div className="space-y-6">
                  {/* Executive KPI Strip (6 Tiles) */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 w-full">
                    {/* Tile 1: AI Readiness Score */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-4 flex flex-col justify-between h-28 text-left shadow-sm hover:border-[var(--dash-accent)]/40 transition-all duration-300 group">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">AI Readiness Score</span>
                        <span className="text-xs group-hover:scale-110 transition-transform duration-200">🛡️</span>
                      </div>
                      <div className="my-1">
                        <span className="text-2xl font-black text-[var(--dash-text-primary)] font-sans tracking-tight">
                          {totalScore}/100
                        </span>
                      </div>
                      <div className="text-[9px] text-[var(--dash-text-secondary)] font-semibold truncate">
                        Based on active report
                      </div>
                    </div>

                    {/* Tile 2: Maturity Level */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-4 flex flex-col justify-between h-28 text-left shadow-sm hover:border-[var(--dash-accent)]/40 transition-all duration-300 group">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">Maturity Level</span>
                        <span className="text-xs group-hover:scale-110 transition-transform duration-200">📈</span>
                      </div>
                      <div className="my-1">
                        <span className="text-2xl font-black text-[var(--dash-text-primary)] font-sans tracking-tight">
                          {maturityLevel}
                        </span>
                      </div>
                      <div className="text-[9px] text-[var(--dash-text-secondary)] font-semibold truncate">
                        Band: {maturityBandRange}
                      </div>
                    </div>

                    {/* Tile 3: Priority Projects */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-4 flex flex-col justify-between h-28 text-left shadow-sm hover:border-[var(--dash-accent)]/40 transition-all duration-300 group">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">Priority Projects</span>
                        <span className="text-xs group-hover:scale-110 transition-transform duration-200">📋</span>
                      </div>
                      <div className="my-1">
                        <span className={`text-2xl font-black font-sans tracking-tight ${priorityProjectsCount > 0 ? "text-[var(--rose)]" : "text-[var(--emerald)]"}`}>
                          {priorityProjectsCount}
                        </span>
                      </div>
                      <div className="text-[9px] text-[var(--dash-text-secondary)] font-semibold truncate" title={priorityProjectsSubline}>
                        {priorityProjectsSubline}
                      </div>
                    </div>

                    {/* Tile 4: Governance Gap */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-xl p-4 flex flex-col justify-between h-28 text-left shadow-sm hover:border-[var(--dash-accent)]/40 transition-all duration-300 group">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">Governance Gap</span>
                        <span className="text-xs group-hover:scale-110 transition-transform duration-200">⚖️</span>
                      </div>
                      <div className="my-1">
                        <span className={`text-2xl font-black font-sans tracking-tight ${
                          govGapLabel === "High gap" ? "text-[var(--rose)]" : 
                          govGapLabel === "Medium gap" ? "text-[var(--amber)]" : "text-[var(--emerald)]"
                        }`}>
                          {govGapLabel}
                        </span>
                      </div>
                      <div className="text-[9px] text-[var(--dash-text-secondary)] font-semibold truncate">
                        {govGapSubline}
                      </div>
                    </div>

                    {/* Tile 5: Value Potential (Roadmap placeholder) */}
                    <div className="bg-[var(--dash-card-bg)]/40 border border-[var(--dash-border)]/50 rounded-xl p-4 flex flex-col justify-between h-28 text-left transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">Value Potential</span>
                        <span className="text-xs filter grayscale opacity-60">💎</span>
                      </div>
                      <div className="my-1">
                        <span className="text-2xl font-black text-[var(--dash-text-secondary)] font-sans tracking-tight">
                          —
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[var(--dash-text-secondary)] font-semibold truncate">
                        <span>Roadmap feature</span>
                        <span className="bg-[var(--dash-border)]/30 border border-[var(--dash-border)]/60 text-[var(--dash-text-secondary)] px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold">
                          Roadmap
                        </span>
                      </div>
                    </div>

                    {/* Tile 6: Risk Exposure (Roadmap placeholder) */}
                    <div className="bg-[var(--dash-card-bg)]/40 border border-[var(--dash-border)]/50 rounded-xl p-4 flex flex-col justify-between h-28 text-left transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider">Risk Exposure</span>
                        <span className="text-xs filter grayscale opacity-60">⚠️</span>
                      </div>
                      <div className="my-1">
                        <span className="text-2xl font-black text-[var(--dash-text-secondary)] font-sans tracking-tight">
                          —
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-[var(--dash-text-secondary)] font-semibold truncate">
                        <span>Roadmap feature</span>
                        <span className="bg-[var(--dash-border)]/30 border border-[var(--dash-border)]/60 text-[var(--dash-text-secondary)] px-1.5 py-0.5 rounded text-[8px] uppercase tracking-wider font-extrabold">
                          Roadmap
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Relocated Maturity Band Strip */}
                  <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 space-y-4 w-full shadow-sm text-left font-sans">
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-widest block">
                        Your AI Maturity
                      </span>
                      <span className="text-[10px] font-bold text-[var(--dash-accent)] uppercase bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] px-2.5 py-0.5 rounded-lg shadow-sm">
                        Stage {activeStage} of 3
                      </span>
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2 relative">
                      {stages.map((stage, idx) => {
                        const isActive = activeStage === stage.num;
                        return (
                          <div key={stage.num} className="flex-1 flex flex-col md:flex-row items-center gap-2 relative w-full">
                            <div className={`w-full rounded-xl p-3 border transition duration-150 text-center flex flex-col justify-center items-center ${
                              isActive 
                                ? 'bg-[var(--dash-active-bg)] border-[var(--dash-active-border)] text-[var(--dash-active-text)] shadow-sm'
                                : 'bg-[var(--dash-bg)]/40 border-[var(--dash-border)]/70 opacity-50 text-[var(--dash-text-secondary)]'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-bold tracking-wider">{stage.name}</span>
                                {isActive && (
                                  <span className="text-[9px] font-extrabold uppercase bg-[var(--dash-accent)]/20 border border-[var(--dash-accent)] text-[var(--dash-accent)] px-1.5 py-0.5 rounded">
                                    Current
                                  </span>
                                )}
                              </div>
                              <span className="text-[10px] font-mono mt-1 font-semibold block">Band: {stage.band}</span>
                            </div>
                            
                            {idx < 2 && (
                              <div className={`hidden md:block w-8 h-[2px] shrink-0 ${
                                activeStage > stage.num
                                  ? 'bg-[var(--dash-accent)]/40'
                                  : 'bg-[var(--dash-border)]/40'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Top Analytics Row: Radar Spider Chart & Horizontal Bar Chart */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Radar Chart Panel */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                      <div>
                        <h3 className="text-base font-bold text-[var(--dash-text-primary)] mb-2 flex items-center gap-2">
                          <span className="text-[var(--dash-accent)]">🛡️</span> AI Maturity Radar
                        </h3>
                        <p className="text-xs text-[var(--dash-text-secondary)] mb-6 font-medium">
                          Multi-dimensional view of your assessment sub-scores across the 5 core AI readiness pillars.
                        </p>
                      </div>
                      
                      <div className="flex justify-center items-center py-4">
                        <svg width="340" height="300" viewBox="0 0 340 300" className="mx-auto overflow-visible">
                          {gridPentagons}
                          {axisLines}
                          {dataPolygon}
                          {dataDots}
                          {labelElements}
                          {/* Center Dot */}
                          <circle cx={cx} cy={cy} r="2.5" fill="var(--dash-text-secondary)" opacity="0.6" />
                        </svg>
                      </div>
                    </div>

                    {/* Bar Chart Panel */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 flex flex-col justify-between shadow-sm">
                      <div>
                        <h3 className="text-base font-bold text-[var(--dash-text-primary)] mb-2 flex items-center gap-2">
                          <span className="text-[var(--dash-accent)]">📊</span> Readiness by Domain
                        </h3>
                        <p className="text-xs text-[var(--dash-text-secondary)] mb-6 font-medium">
                          Linear breakdown of your computed scores for each assessment category.
                        </p>
                      </div>

                      <div className="space-y-5 py-4">
                        {domainFields.map(field => {
                          const score = subScores[field.key] ?? subScores.maturity ?? 0;
                          let barColor = "bg-[var(--dash-accent)]";
                          if (score < 40) barColor = "bg-[var(--rose)]";
                          else if (score < 75) barColor = "bg-[var(--amber)]";
                          
                          return (
                            <div key={field.key} className="space-y-1.5 font-sans">
                              <div className="flex justify-between text-xs font-bold">
                                <span className="text-[var(--dash-text-primary)]">{field.label}</span>
                                <span className="text-[var(--dash-text-secondary)] font-mono">{score}/100</span>
                              </div>
                              <div className="w-full bg-[var(--dash-border)]/20 h-2.5 rounded-full overflow-hidden">
                                <div
                                  className={`${barColor} h-full rounded-full transition-all duration-500`}
                                  style={{ width: `${score}%` }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Middle Row: Executive Interpretation & Calculated FinOps Metrics */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Executive Interpretation Column (2/3 width) */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 lg:col-span-2 space-y-4 shadow-sm text-left">
                      <h3 className="text-base font-bold text-[var(--dash-text-primary)] flex items-center gap-2">
                        <span className="text-[var(--dash-accent)]">📝</span> Executive Interpretation
                      </h3>
                      
                      {execSummary ? (
                        <p className="text-xs text-[var(--dash-text-primary)] leading-relaxed italic border-l-2 border-[var(--dash-accent)]/50 pl-4 font-semibold font-sans">
                          "{execSummary}"
                        </p>
                      ) : (
                        <div className="text-xs text-[var(--dash-text-secondary)] leading-relaxed italic border-l-2 border-[var(--dash-border)] pl-4 font-medium font-sans">
                          "System is processing completed assessment data to output optimized strategic brief insights."
                        </div>
                      )}

                      {/* Calculated Primary Gap Callout */}
                      <div className={`border rounded-xl p-4 space-y-2 text-xs font-sans ${gapBg}`}>
                        <div className="flex items-center gap-2 font-bold">
                          <span>{gapIcon}</span>
                          <span className="uppercase tracking-wider">{gapLabel} (Score: {lowestDomain.score}/100)</span>
                        </div>
                        <p className="leading-relaxed opacity-90">
                          {lowestDomain.desc} Formalize mitigation workflows and prioritize resource allocation to address this gap.
                        </p>
                      </div>
                    </div>

                    {/* Calculated FinOps Metrics Column (1/3 width) */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 space-y-4 shadow-sm text-left">
                      <h3 className="text-base font-bold text-[var(--dash-text-primary)] flex items-center gap-2">
                        <span className="text-[var(--dash-accent)]">⚡</span> Compute & FinOps Insights
                      </h3>
                      <p className="text-[11px] text-[var(--dash-text-secondary)] font-medium leading-relaxed">
                        Calculated model operations metrics derived from your primary provider and spend.
                      </p>

                      <div className="space-y-3 pt-2 font-sans text-xs">
                        <div className="flex items-center justify-between border-b border-[var(--dash-border)]/40 pb-2">
                          <span className="text-[var(--dash-text-secondary)] font-medium">Monthly Compute Spend</span>
                          <span className="font-extrabold text-[var(--dash-text-primary)] font-mono">
                            {finops.monthly_spend !== undefined && finops.monthly_spend > 0 ? `$${(finops.monthly_spend || 0).toLocaleString()}` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[var(--dash-border)]/40 pb-2">
                          <span className="text-[var(--dash-text-secondary)] font-medium">Estimated Compute Waste</span>
                          <span className="font-extrabold text-[var(--rose)] font-mono">
                            {finops.monthly_spend !== undefined && finops.monthly_spend > 0 ? `$${(finops.estimated_waste || 0).toLocaleString()}/mo` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between border-b border-[var(--dash-border)]/40 pb-2">
                          <span className="text-[var(--dash-text-secondary)] font-medium">Cost Efficiency Index</span>
                          <span className="font-extrabold text-[var(--dash-accent)] font-mono">
                            {finops.monthly_spend !== undefined && finops.monthly_spend > 0 ? `${finops.cost_efficiency}%` : '—'}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--dash-text-secondary)] font-medium">Workforce Optimization</span>
                          <span className="font-extrabold text-[var(--emerald)] font-mono">
                            {finops.workforce_optimization !== undefined ? `${finops.workforce_optimization}%` : '—'}
                          </span>
                        </div>
                      </div>

                      {finops.primary_provider && (
                        <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl p-3 text-[10.5px] text-[var(--dash-text-secondary)] leading-relaxed mt-2 font-medium">
                          💡 Primary provider detected as <strong className="text-[var(--dash-text-primary)] font-bold">{scores.provider_model_names?.[finops.primary_provider] || finops.primary_provider}</strong>. Enforcing Flash-model fallbacks could increase your Cost Efficiency index.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Qualitative Opportunity & Recommendations Cards */}
                  <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm text-left">
                    <h3 className="text-base font-bold text-[var(--dash-text-primary)] mb-4 flex items-center gap-2">
                      <span className="text-[var(--dash-accent)]">💡</span> Strategic Opportunities & Action Plan
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl p-4.5 space-y-2">
                        <span className="text-[10px] font-bold text-[var(--dash-accent)] uppercase tracking-wider block">Remediation Path 1</span>
                        <h4 className="text-sm font-bold text-[var(--dash-text-primary)]">AI Governance Framework</h4>
                        <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed font-sans font-medium">
                          Build a steering committee and formal permitted/restricted tools matrix. Set clear classification limits and strict human-in-the-loop policies to reduce regulatory risk.
                        </p>
                      </div>
                      <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl p-4.5 space-y-2">
                        <span className="text-[10px] font-bold text-[var(--accent-2)] uppercase tracking-wider block">Remediation Path 2</span>
                        <h4 className="text-sm font-bold text-[var(--dash-text-primary)]">Cost Controls & Gateway Routing</h4>
                        <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed font-sans font-medium">
                          Implement a model routing proxy to intercept API calls, redirecting simple summarization and lookup queries to lighter, more cost-efficient models.
                        </p>
                      </div>
                      <div className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl p-4.5 space-y-2">
                        <span className="text-[10px] font-bold text-[var(--emerald)] uppercase tracking-wider block">Remediation Path 3</span>
                        <h4 className="text-sm font-bold text-[var(--dash-text-primary)]">Data Quality & Lineage mapping</h4>
                        <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed font-sans font-medium">
                          Construct dynamic ontologies to standardize enterprise acronyms, while logging execution runs and prompt parameters for strict auditability compliance.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Relocated AI Journey Roadmap */}
                  <div id="ai-journey-roadmap" className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 space-y-4 w-full shadow-sm text-left font-sans">
                    <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-widest block">AI Journey Roadmap</span>
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-2">
                      {[
                        { label: 'Assessment Completed', done: true, roadmap: false },
                        { label: 'Executive Report Generated', done: true, roadmap: false },
                        { label: 'Connect Systems', done: false, roadmap: true },
                        { label: 'Configure Governance', done: false, roadmap: true },
                        { label: 'Deploy Agents', done: false, roadmap: true },
                        { label: 'Activate Control Tower', done: false, roadmap: true }
                      ].map((step, idx, arr) => (
                        <div key={idx} className="flex-1 flex flex-col md:flex-row items-start md:items-center gap-2 relative">
                          <div className="flex items-center gap-2">
                            {step.done ? (
                              <span className="w-5 h-5 rounded-full bg-[var(--emerald)]/20 border border-[var(--emerald)]/40 text-[var(--emerald)] flex items-center justify-center text-[10px] font-extrabold font-sans shrink-0">
                                ✓
                              </span>
                            ) : (
                              <span className="w-5 h-5 rounded-full bg-transparent border-2 border-[var(--dash-border)] text-[var(--dash-text-secondary)] flex items-center justify-center text-[10px] font-extrabold font-sans shrink-0">
                                ○
                              </span>
                            )}
                            <span className={`text-[11px] font-bold ${step.done ? 'text-[var(--dash-text-primary)]' : 'text-[var(--dash-text-secondary)]'}`}>
                              {step.label}
                            </span>
                          </div>
                          {idx < arr.length - 1 && (
                            <div className="hidden md:block flex-1 h-[1px] bg-[var(--dash-border)] mx-4 min-w-[20px]" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })()}
            
            {/* TAB: SAVED REPORTS */}
            {activeTab === 'reports' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-bold text-white">Saved Readiness Reports</h3>
                    <p className="text-sm text-slate-400 font-sans mt-1">
                      Access your previously completed AI readiness assessments and C-suite strategy briefs.
                    </p>
                  </div>
                  <button
                    onClick={() => handleTabChange('readiness')}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-cyan-400 text-slate-950 font-bold hover:from-cyan-400 hover:to-cyan-300 transition duration-250 shadow-[0_0_15px_rgba(34,211,238,0.2)] flex items-center gap-2 text-sm"
                  >
                    ➕ New Assessment
                  </button>
                </div>

                {reportsLoading ? (
                  <div className="flex flex-col items-center justify-center py-20 space-y-4">
                    <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-400"></div>
                    <span className="text-slate-400 text-sm font-sans">Retrieving saved reports...</span>
                  </div>
                ) : reports && reports.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                    {reports.map((r) => {
                      const dateStr = r.created_at ? new Date(r.created_at).toLocaleDateString(undefined, {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      }) : 'N/A';
                      const domains = r.domains || [];
                      
                      let scoreColor = 'text-rose-700 border-rose-300 bg-rose-100';
                      if (r.total_score >= 80) {
                        scoreColor = 'text-emerald-700 border-emerald-300 bg-emerald-100';
                      } else if (r.total_score >= 50) {
                        scoreColor = 'text-amber-700 border-amber-300 bg-amber-100';
                      }

                      return (
                        <div 
                          key={r.id} 
                          className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 hover:border-[var(--dash-accent)] transition duration-300 flex flex-col justify-between space-y-4 shadow-sm group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between">
                              <div>
                                <h4 className="text-base font-bold text-[var(--dash-text-primary)] group-hover:text-[var(--dash-accent)] transition duration-200">
                                  {r.company_name || 'Acme Corporation'}
                                </h4>
                                <span className="text-[10px] text-[var(--dash-text-secondary)] uppercase tracking-widest block mt-0.5 font-sans">
                                  Generated {dateStr}
                                </span>
                              </div>
                              <div className={`px-2.5 py-1 rounded-lg border font-bold text-sm ${scoreColor}`}>
                                {r.total_score}/100
                              </div>
                            </div>

                            <div className="space-y-1">
                              <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider block font-sans">Maturity Level</span>
                              <span className="text-xs font-semibold text-[var(--dash-text-primary)] font-sans block">
                                {r.maturity_tier || 'Low / Foundational'}
                              </span>
                              <span className="text-[11px] text-[var(--dash-text-secondary)] italic block leading-relaxed font-sans">
                                "{r.maturity_tagline || 'AI is a discussion, not yet a discipline.'}"
                              </span>
                            </div>

                            {domains.length > 0 && (
                              <div className="space-y-1 pt-1">
                                <span className="text-[10px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider block font-sans">Target Industries</span>
                                <div className="flex flex-wrap gap-1.5 mt-1">
                                  {domains.map((dom, i) => (
                                    <span 
                                      key={i} 
                                      className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] text-[var(--dash-text-secondary)] font-sans"
                                    >
                                      {dom}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="flex items-center gap-3 pt-2 border-t border-[var(--dash-border)]">
                            <button
                              onClick={() => {
                                // Load this report in the Dashboard Tab
                                api.get(`/report/${r.id}/data`)
                                  .then((res) => {
                                    setLatestReportData(res.data);
                                    handleTabChange('dashboard');
                                  })
                                  .catch((err) => console.error("Error activating report:", err));
                              }}
                              className="flex-1 py-2 px-3 rounded-lg text-center bg-[var(--dash-hover-bg)] border border-[var(--dash-border)] text-xs font-bold text-[var(--dash-text-primary)] hover:text-[var(--dash-hover-text)] hover:border-[var(--dash-accent)] hover:bg-[var(--dash-active-bg)] transition duration-200 font-sans"
                            >
                              📊 Load Dashboard
                            </button>
                            <a
                              href={`/report/${r.anon_token}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 py-2 px-3 rounded-lg text-center bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] text-xs font-bold text-[var(--dash-active-text)] hover:border-[var(--dash-accent)] transition duration-200 font-sans block"
                            >
                              👁 View Report
                            </a>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="border border-dashed border-slate-800 rounded-2xl p-10 text-center flex flex-col items-center justify-center space-y-4 bg-slate-950/20">
                    <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-slate-500 border border-slate-800">
                      <Icons.Reports />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-base font-bold text-white">No Saved Reports Found</h4>
                      <p className="text-xs text-slate-400 font-sans max-w-sm mx-auto">
                        You have not run any AI readiness assessments yet. Initiate a quick survey to see your strategic scorecards and optimization opportunities.
                      </p>
                    </div>
                    <button
                      onClick={() => handleTabChange('readiness')}
                      className="px-4 py-2 rounded-xl bg-cyan-950/60 border border-cyan-800/55 hover:border-cyan-500/80 hover:bg-cyan-950 text-xs font-bold text-cyan-400 transition duration-200"
                    >
                      🚀 Start AI Readiness Assessment
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB: AI READINESS */}
            {activeTab === 'readiness' && (
              <div className="space-y-6">
                {reportToken ? (
                  <div className="space-y-6">
                    {/* Header Controls for Embedded Report */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => {
                            setSearchParams({ tab: 'readiness' }) // Clears the reportToken
                            setReportHtml('')
                            setReportMeta(null)
                          }}
                          className="px-4 py-1.5 rounded-lg border border-slate-700 hover:border-slate-500 text-xs font-semibold text-slate-200 hover:text-white transition duration-200"
                        >
                          ← Start New Assessment
                        </button>
                        <span className="text-xs text-slate-400">
                          Viewing assessment report claimed under your profile.
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          const win = iframeRef.current?.contentWindow
                          if (win) {
                            try { win.focus(); win.print() } catch { window.print() }
                          } else {
                            window.print()
                          }
                        }}
                        className="px-4 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20 text-xs font-semibold transition"
                      >
                        🖨 Print Report
                      </button>
                    </div>

                    {reportLoading && (
                      <div className="flex justify-center items-center py-12 text-slate-400 text-sm">
                        Loading assessment report…
                      </div>
                    )}

                    {reportError && (
                      <div className="bg-slate-900/60 border border-slate-850 rounded-2xl p-6 text-center">
                        <p className="text-rose-400 text-sm">{reportError}</p>
                      </div>
                    )}

                    {!reportLoading && !reportError && reportHtml && (
                      <div className="space-y-6">
                        {/* Interactive FinOps Slider Simulator inside Dashboard */}
                        <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-5 mb-2 backdrop-blur">
                          <h3 className="text-cyan-400 text-[10px] font-semibold uppercase tracking-wider mb-1">💡 Interactive Cost Simulator</h3>
                          <h2 className="text-base font-bold text-slate-100 mb-2">CertaintyAI FinOps Savings Slider</h2>
                          <p className="text-xs text-slate-400 mb-4">
                            Simulate migrating standard model workloads (e.g. GPT-4/Claude Ultra) to high-speed Flash or local configurations.
                          </p>
                          
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                            <div>
                              <label className="text-[10px] text-slate-500 font-semibold uppercase block mb-1">Target Migration Ratio</label>
                              <div className="flex items-center gap-3">
                                <input
                                  type="range"
                                  min="0"
                                  max="1"
                                  step="0.05"
                                  value={simulationRatio}
                                  onChange={(e) => setSimulationRatio(parseFloat(e.target.value))}
                                  className="w-full accent-cyan-400 cursor-pointer"
                                />
                                <span className="text-xs text-cyan-400 font-bold w-12 text-right">
                                  {Math.round(simulationRatio * 100)}%
                                </span>
                              </div>
                            </div>
                            
                            <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 text-center">
                              <span className="text-[10px] text-slate-500 font-semibold uppercase block mb-0.5">Current Monthly Spend</span>
                              <span className="text-base font-bold text-slate-100">
                                {currentSpend > 0 ? `$${currentSpend.toLocaleString()}` : '—'}
                              </span>
                            </div>

                            <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30 rounded-xl p-3 text-center">
                              <span className="text-[10px] text-emerald-400 font-semibold uppercase block mb-0.5">Projected Annual Savings</span>
                              <span className="text-base font-bold text-emerald-300">
                                {currentSpend > 0 ? `$${projectedSavings.toLocaleString()}` : '—'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Document View Iframe */}
                        <div className="border border-slate-800 rounded-2xl overflow-hidden bg-[#070A13] p-4">
                          <iframe
                            ref={iframeRef}
                            title="Embedded AI Readiness Report"
                            srcDoc={reportHtml}
                            className="w-full border-none bg-[#070A13]"
                            style={{ width: '100%', minHeight: '800px', border: 'none', overflow: 'hidden' }}
                            sandbox="allow-same-origin allow-scripts allow-top-navigation allow-modals allow-popups"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 sm:p-6 backdrop-blur">
                    <SurveyWizard />
                  </div>
                )}
              </div>
            )}

            {/* TAB: INSIGHTS */}
            {activeTab === 'insights' && (
              <div className="space-y-8">
                {/* Header overview grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-[#0F172A]/50 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest">Brand Sentiment</span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-cyan-400 font-mono">96.8%</span>
                      <span className="text-xs text-emerald-400 font-semibold bg-emerald-950/20 px-2 py-0.5 rounded border border-emerald-800/30">
                        ▲ Very Positive
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Calculated across 1,230 indexed tech publications and developer threads.</p>
                  </div>

                  <div className="bg-[#0F172A]/50 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest">Global Mentions</span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-white font-mono">4,812</span>
                      <span className="text-xs text-cyan-400 font-semibold bg-cyan-950/20 px-2 py-0.5 rounded border border-cyan-800/30">
                        +14.2% weekly
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Total active discussions around MDx, CertaintyAI and multi-agent brokers.</p>
                  </div>

                  <div className="bg-[#0F172A]/50 border border-slate-800 rounded-2xl p-5 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-slate-500 block tracking-widest">Tech Index Level</span>
                    <div className="flex items-center gap-3">
                      <span className="text-3xl font-extrabold text-violet-400 font-mono">824 ms</span>
                      <span className="text-xs text-slate-400 font-semibold bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                        Avg Latency
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">Global response index tracking of partnered enterprise endpoints.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Left Column: MDx Brand Mentions Tracker */}
                  <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Ecosystem Buzz & Brand Mentions</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Live discussions indexing mentions of MDx and CertaintyAI across the web.</p>
                      </div>
                      <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse"></span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2 hover:border-cyan-500/20 transition duration-150">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span className="font-bold text-cyan-400">TechCrunch Tech Wire</span>
                          <span>4m ago</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          "CertaintyAI has democratized open semantic ontology and robust GraphRAG structures for mid-market compliance pipelines. Palantir has real, highly accessible competition."
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2 hover:border-cyan-500/20 transition duration-150">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span className="font-bold text-violet-400">VentureBeat News</span>
                          <span>2h ago</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          "MDx Blocks' multi-cloud partnership framework with **Azure OpenAI, Google Vertex AI, and Snowflake Cortex** establishes a highly secure, sovereign multi-agent deployment blueprint."
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2 hover:border-cyan-500/20 transition duration-150">
                        <div className="flex justify-between items-center text-xs text-slate-500">
                          <span className="font-bold text-slate-400">HackerNews (HN Thread #4202)</span>
                          <span>4h ago</span>
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-medium">
                          "Just deployed MDx CertaintyAI HIPAA scan directly on Google Vertex AI dedicated cloud. The deterministic ontology gateway pulled latency down to 180ms. Highly impressed!"
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Curated Latest Tech Updates */}
                  <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                    <div className="flex justify-between items-center border-b border-slate-800/40 pb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">Latest Tech Updates & AI Breakthroughs</h3>
                        <p className="text-xs text-slate-400 mt-0.5">Tracking global updates across core LLMs and partner tech stacks.</p>
                      </div>
                      <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-700">
                        Filters: Active
                      </span>
                    </div>

                    <div className="space-y-4">
                      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200 bg-cyan-950/40 text-cyan-400 border border-cyan-900/30 px-2 py-0.5 rounded">Google Gemini 1.5 Pro</span>
                          <span className="text-slate-500">Today</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">Gemini context window expansion pushes complex compliance sweeps</h4>
                        <p className="text-xs text-slate-400 leading-normal">
                          The official 2M context limit is now natively utilized within CertaintyAI to sweep raw documentation piles in single prompt windows, completely eliminating chunk fragmentation risks.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200 bg-sky-950/40 text-sky-400 border border-sky-900/30 px-2 py-0.5 rounded">Snowflake Cortex</span>
                          <span className="text-slate-500">Yesterday</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">Relational semantic caching launched across relational databases</h4>
                        <p className="text-xs text-slate-400 leading-normal">
                          Snowflake Cortex's new local relational caching enables local agent processing without public API routing, ensuring absolute data security for finance and health startups.
                        </p>
                      </div>

                      <div className="p-4 bg-slate-900/40 border border-slate-800/80 rounded-xl space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="font-bold text-slate-200 bg-purple-950/40 text-purple-400 border border-purple-900/30 px-2 py-0.5 rounded">Google Vertex AI</span>
                          <span className="text-slate-500">3d ago</span>
                        </div>
                        <h4 className="text-xs font-bold text-white mt-1">Vertex AI introduces strict single-tenant healthcare container vaults</h4>
                        <p className="text-xs text-slate-400 leading-normal">
                          Google Vertex AI secures sovereign regulatory compliance by providing physical network vaults. CertaintyAI's backend maps all confidential EHR operations to these vaults automatically.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Bottom Section: Trend Graphic */}
                <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h4 className="text-sm font-bold text-[var(--dash-text-primary)]">Daily Web Mention Trend Index (MDx / CertaintyAI)</h4>
                      <p className="text-xs text-[var(--dash-text-secondary)] mt-0.5">7-day tracking of brand index volume across dev ecosystems and tech wires.</p>
                    </div>
                    <span className="text-xs font-bold font-mono text-[var(--dash-accent)]">Peak Volume: +42%</span>
                  </div>

                  <div className="h-16 w-full relative">
                    <svg viewBox="0 0 500 50" className="w-full h-full text-[var(--dash-accent)]/20">
                      <path 
                        d="M 0,45 Q 50,40 100,20 T 200,45 T 300,10 T 400,25 T 500,5" 
                        fill="none" 
                        stroke="var(--trend-chart-stroke)" 
                        strokeWidth="2.5" 
                        strokeLinecap="round"
                        style={{ filter: 'var(--trend-chart-shadow)' }}
                      />
                      <circle cx="300" cy="10" r="4" fill="var(--trend-chart-circle-1)" />
                      <circle cx="500" cy="5" r="4" fill="var(--trend-chart-circle-2)" className="animate-pulse" />
                    </svg>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: TOOLS */}
            {activeTab === 'tools' && (
              <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Active AI Tools Configuration</h3>
                  <p className="text-xs text-slate-400 mt-1">Control models routing thresholds, keys configuration, and select default providers.</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-3">
                    <label className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Default LLM Routing Broker</label>
                    <select className="w-full bg-[#070A13] border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-400">
                      <option value="gemini">Google Gemini 1.5 Pro (Recommended - Multi-agent default)</option>
                      <option value="anthropic">Anthropic Claude 3.5 Sonnet</option>
                      <option value="openai">OpenAI GPT-4o</option>
                      <option value="azure">Azure OpenAI Private Instance (MDx Partner)</option>
                      <option value="vertex">Google Vertex AI Sandbox (MDx Partner)</option>
                      <option value="snowflake">Snowflake Cortex Triples Engine (MDx Partner)</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                      <h4 className="text-sm font-bold text-slate-200">Sandbox Mode</h4>
                      <p className="text-xs text-slate-500">Run evaluations locally without billing live production credentials.</p>
                      <div className="pt-2">
                        <button className="px-4 py-1.5 bg-emerald-500 text-slate-950 font-bold text-xs rounded-lg hover:bg-emerald-400 transition">
                          Active (Mock Billing Active)
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl space-y-2">
                      <h4 className="text-sm font-bold text-slate-200">Failover Throttling</h4>
                      <p className="text-xs text-slate-500">Auto-route to fallback partners when secondary API limits hit 80% TPM.</p>
                      <div className="pt-2">
                        <button className="px-4 py-1.5 bg-cyan-400 text-slate-950 font-bold text-xs rounded-lg hover:bg-cyan-300 transition">
                          Enabled
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB: PLUGINS */}
            {activeTab === 'plugins' && (
              <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white">MDx Enterprise Plugin Store</h3>
                  <p className="text-xs text-slate-400 mt-1">Pre-built compliance, FinOps, and database synchronization plugins for startups.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {pluginsList.map((plugin, i) => (
                    <div key={i} className="p-4 bg-slate-900/40 border border-slate-800 rounded-xl flex items-start gap-4">
                      <span className="text-3xl p-2 bg-[#070A13] border border-slate-800 rounded-xl shrink-0">{plugin.icon}</span>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">{plugin.name}</h4>
                          <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${
                            plugin.status === 'Active' ? 'border-emerald-800 text-emerald-300 bg-emerald-950/20' : 'border-slate-700 text-slate-400'
                          }`}>
                            {plugin.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 leading-normal">{plugin.desc}</p>
                        <div className="pt-2 flex justify-between items-center text-xs">
                          <span className="text-[10px] text-slate-500 uppercase tracking-widest">{plugin.category}</span>
                          <button className={`px-2.5 py-1 text-[11px] font-bold rounded ${
                            plugin.status === 'Active' ? 'bg-slate-800 text-slate-300' : 'bg-cyan-400 text-slate-950'
                          }`}>
                            {plugin.status === 'Active' ? 'Uninstall' : 'Install Plugin'}
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB: SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-8">
                {/* Account Details */}
                <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-6 space-y-3">
                  <h3 className="text-lg font-semibold text-white">Developer Account details</h3>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm pt-2">
                    <div>
                      <dt className="text-slate-500">Email Address</dt>
                      <dd className="text-slate-200 font-semibold">{user?.email}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500 mb-1">Operational Role</dt>
                      <select
                        value={user?.role || 'user'}
                        onChange={async (e) => {
                          try {
                            await updateUserRole(e.target.value);
                            setSuccess('Operational role successfully updated to ' + e.target.value);
                            setTimeout(() => setSuccess(''), 4000);
                          } catch (err) {
                            setServerError('Failed to update role');
                            setTimeout(() => setServerError(''), 4000);
                          }
                        }}
                        className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-sm font-semibold text-slate-200 focus:border-cyan-400 focus:outline-none transition w-full max-w-[240px] cursor-pointer hover:border-cyan-500"
                      >
                        <option value="user">General Enterprise User</option>
                        <option value="CFO">Chief Financial Officer (CFO)</option>
                        <option value="CIO/CTO">CIO / CTO / CISO</option>
                        <option value="Healthcare CTO">Healthcare CTO</option>
                        <option value="Cybersecurity Leader">Cybersecurity Leader</option>
                      </select>
                    </div>
                    <div>
                      <dt className="text-slate-500">Full Name</dt>
                      <dd className="text-slate-200 font-semibold">{user?.full_name || <span className="text-slate-500 italic">not set</span>}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Account Created</dt>
                      <dd className="text-slate-200 font-semibold">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}</dd>
                    </div>
                  </dl>
                </div>

                {/* Change Password */}
                <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">Update Security Password</h3>
                  <form onSubmit={handleSubmit(onPasswordSubmit)} className="space-y-4 max-w-md">
                    <div className="space-y-1">
                      <label htmlFor="current_password" className="text-sm text-slate-300">Current Password</label>
                      <input
                        id="current_password"
                        type="password"
                        autoComplete="current-password"
                        {...register('current_password', { required: 'Current password is required' })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none transition"
                      />
                      {errors.current_password && <p className="text-xs text-rose-400">{errors.current_password.message}</p>}
                    </div>

                    <div className="space-y-1">
                      <label htmlFor="new_password" className="text-sm text-slate-300">New Password</label>
                      <input
                        id="new_password"
                        type="password"
                        autoComplete="new-password"
                        {...register('new_password', {
                          required: 'New password is required',
                          minLength: { value: 8, message: 'Password must be at least 8 characters long' },
                        })}
                        className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:border-cyan-400 focus:outline-none transition"
                      />
                      {errors.new_password && <p className="text-xs text-rose-400">{errors.new_password.message}</p>}
                    </div>

                    {serverError && (
                      <p className="text-sm text-rose-400 bg-rose-950/40 border border-rose-900 rounded-md px-3 py-2">{serverError}</p>
                    )}
                    {success && (
                      <p className="text-sm text-emerald-400 bg-emerald-950/40 border border-emerald-900 rounded-md px-3 py-2">{success}</p>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2.5 rounded-lg bg-cyan-400 text-slate-950 font-bold hover:bg-cyan-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
                    >
                      {isSubmitting ? 'Updating Security...' : 'Update Password'}
                    </button>
                  </form>
                </div>

                {/* Session Management */}
                <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 text-white">System Session</h3>
                  <p className="text-xs text-slate-400 mb-4">
                    Sign out of your current developer session across this browser.
                  </p>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 rounded-lg border border-slate-700 hover:border-slate-500 text-slate-200 hover:text-white hover:bg-slate-800/40 transition duration-200 font-semibold text-sm"
                  >
                    Logout
                  </button>
                </div>
              </div>
            )}

            {/* TAB: AGENT BUILDER */}
            {activeTab === 'agent-builder' && (
              <AgentBuilder />
            )}

            {/* TAB: CONTROL TOWER */}
            {activeTab === 'control-tower' && (
              <div className="space-y-6 animate-fade-in w-full text-left">
                {/* Alert/Message block */}
                <div className="bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] rounded-2xl p-6 text-sm text-[var(--dash-text-primary)] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[var(--dash-accent)] text-base">
                    <span>🏰 Control Tower Preview Mode</span>
                  </div>
                  <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
                    Preview Mode · connect enterprise systems to activate live AI Governance, AI FinOps, Data Trust, AgentOps, and Business Value monitoring.
                  </p>
                </div>

                {/* Sub-tab Navigation */}
                <div className="flex flex-wrap bg-[var(--dash-card-bg)] border border-[var(--dash-border)] p-1 rounded-xl items-center gap-1 w-fit">
                  {[
                    { id: 'overview', label: 'Executive Overview' },
                    { id: 'cost', label: 'Cost Management' },
                    { id: 'llm', label: 'LLM Recommendations' },
                    { id: 'data', label: 'Data Lineage & Quality' },
                    { id: 'governance', label: 'Governance' },
                    { id: 'audit', label: 'Audit Trail' }
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setControlTowerTab(t.id)}
                      className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all duration-200 ${
                        controlTowerTab === t.id
                          ? 'bg-[var(--dash-active-bg)] text-[var(--dash-active-text)] border border-[var(--dash-active-border)] shadow-[var(--dash-active-shadow)]'
                          : 'border border-transparent text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] hover:bg-[var(--dash-hover-bg)]'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>

                {/* TAB CONTENT: Executive Overview */}
                {controlTowerTab === 'overview' && (
                  <div className="space-y-6">
                    {/* KPI Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
                      {[
                        { label: 'Total Agent Requests', val: '—', desc: 'Total inference queries handled by agents' },
                        { label: 'Gemini Cost', val: '—', desc: 'Accrued cost of vertex/inference calls' },
                        { label: 'Estimated Savings', val: '—', desc: 'Saved cost vs traditional advisory' },
                        { label: 'AI Risk Score', val: '—', desc: 'Aggregate policy risk rating' },
                        { label: 'Active Agents', val: '—', desc: 'Active autonomous agent workloads' },
                        { label: 'Compliance Events', val: '—', desc: 'Regulatory policy violations or blocks' }
                      ].map((card, i) => (
                        <div key={i} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 flex flex-col justify-between h-36 shadow-sm">
                          <span className="text-[10px] font-bold tracking-widest text-[var(--dash-text-secondary)] uppercase">
                            {card.label}
                          </span>
                          <span className="text-4xl font-extrabold text-[var(--dash-text-primary)] py-2">
                            {card.val}
                          </span>
                          <span className="text-[10px] text-[var(--dash-text-secondary)] font-medium">
                            {card.desc}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Chart Frame & Recommendations */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      {/* Requests by Agent Empty Chart */}
                      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                        <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4">Requests by Agent</span>
                        <div className="flex-grow flex items-center justify-center border-2 border-dashed border-[var(--dash-border)] rounded-xl bg-[var(--dash-hover-bg)]/30 min-h-[200px]">
                          <span className="text-xs text-[var(--dash-text-secondary)] font-medium font-sans">
                            Preview · connect systems to activate
                          </span>
                        </div>
                      </div>

                      {/* Executive Recommendations Preview */}
                      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[300px]">
                        <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4">Executive Recommendations</span>
                        <div className="flex-grow flex flex-col justify-center items-center p-6 border border-dashed border-[var(--dash-border)] rounded-xl bg-[var(--dash-hover-bg)]/20 text-center space-y-2">
                          <i className="ti ti-bulb text-2xl text-[var(--dash-accent)]"></i>
                          <span className="text-xs font-bold text-[var(--dash-text-primary)]">System Connection Pending</span>
                          <p className="text-[11px] text-[var(--dash-text-secondary)] max-w-sm">
                            Recommendations will generate automatically based on compliance scans, latency anomalies, and cost optimization opportunities once systems are linked.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Cost Management */}
                {controlTowerTab === 'cost' && (
                  <div className="space-y-6">
                    {/* KPI Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                      {[
                        { label: 'Gemini Cost', val: '—', desc: 'Total accrued Google Vertex AI inference spend' },
                        { label: 'Estimated Savings', val: '—', desc: 'Calculated savings from automated processing' },
                        { label: 'Cost per Agent', val: '—', desc: 'Average cost across deployed C-suite agents' },
                        { label: 'Budget Utilization', val: '—', desc: 'Spend vs allocated organizational limits' }
                      ].map((card, i) => (
                        <div key={i} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 flex flex-col justify-between h-36 shadow-sm">
                          <span className="text-[10px] font-bold tracking-widest text-[var(--dash-text-secondary)] uppercase">
                            {card.label}
                          </span>
                          <span className="text-4xl font-extrabold text-[var(--dash-text-primary)] py-2">
                            {card.val}
                          </span>
                          <span className="text-[10px] text-[var(--dash-text-secondary)] font-medium">
                            {card.desc}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Gemini Usage Summary Table */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm w-full">
                      <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4 block">Gemini Usage Summary</span>
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--dash-border)] text-[var(--dash-text-secondary)] font-bold">
                              <th className="py-2.5">Metric</th>
                              <th className="py-2.5 text-right">Value</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-[var(--dash-border)]/50 text-[var(--dash-text-primary)]">
                            {[
                              { name: 'Pro Requests', desc: 'Gemini 2.5 Pro model invocations' },
                              { name: 'Flash Requests', desc: 'Gemini 2.5 Flash model invocations' },
                              { name: 'Input Tokens', desc: 'Total processed prompt tokens' },
                              { name: 'Output Tokens', desc: 'Total generated response tokens' }
                            ].map((row, idx) => (
                              <tr key={idx} className="hover:bg-[var(--dash-hover-bg)]/25 transition">
                                <td className="py-3 pr-4">
                                  <div className="font-semibold">{row.name}</div>
                                  <div className="text-[10px] text-[var(--dash-text-secondary)]">{row.desc}</div>
                                </td>
                                <td className="py-3 text-right font-extrabold text-sm">—</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: LLM Recommendations */}
                {controlTowerTab === 'llm' && (
                  <div className="space-y-6">
                    <span className="text-sm font-bold text-[var(--dash-text-primary)] block">LLM Performance & Optimization Recommendations</span>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
                      {[
                        { title: 'Token Amortization', metric: 'Model Tiering Opportunity', desc: 'Optimize cost by routing low-complexity tasks from Gemini Pro to Gemini Flash based on routing heuristics.' },
                        { title: 'Context Window Caching', metric: 'Context Window Cache', desc: 'Configure prompt caching for large static RAG files in knowledge base to reduce token costs.' },
                        { title: 'Temperature Optimization', metric: 'Deterministic Controls', desc: 'Reduce model temperature configurations on compliance triage agents to prevent hallucination drifts.' }
                      ].map((card, i) => (
                        <div key={i} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[200px]">
                          <div>
                            <span className="text-[9px] font-bold text-[var(--dash-accent)] uppercase tracking-wider block mb-1">{card.metric}</span>
                            <h4 className="text-xs font-bold text-[var(--dash-text-primary)] mb-2">{card.title}</h4>
                            <p className="text-[11px] text-[var(--dash-text-secondary)] leading-relaxed">{card.desc}</p>
                          </div>
                          <div className="pt-4 border-t border-[var(--dash-border)]/50 mt-4 text-[10px] text-[var(--dash-text-secondary)] font-semibold flex items-center gap-1.5">
                            <i className="ti ti-link text-xs"></i>
                            <span>Awaiting connection</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Data Lineage & Quality */}
                {controlTowerTab === 'data' && (
                  <div className="space-y-6">
                    {/* KPI Tiles */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
                      {[
                        { label: 'Data Lineage Chains', val: '—', desc: 'Sovereign database lineage pathways mapped' },
                        { label: 'Provenance Coverage', val: '—', desc: 'System-wide knowledge tracking index' },
                        { label: 'Source Systems Connected', val: '—', desc: 'Linked directories, portals, and repositories' },
                        { label: 'Quality Score', val: '—', desc: 'Average confidence score of indexed documents' }
                      ].map((card, i) => (
                        <div key={i} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 flex flex-col justify-between h-36 shadow-sm">
                          <span className="text-[10px] font-bold tracking-widest text-[var(--dash-text-secondary)] uppercase">
                            {card.label}
                          </span>
                          <span className="text-4xl font-extrabold text-[var(--dash-text-primary)] py-2">
                            {card.val}
                          </span>
                          <span className="text-[10px] text-[var(--dash-text-secondary)] font-medium">
                            {card.desc}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Data Lineage Visualization Map Frame */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm w-full flex flex-col justify-between min-h-[360px]">
                      <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4">Sovereign Data Provenance & Lineage Map</span>
                      <div className="flex-grow flex items-center justify-center border-2 border-dashed border-[var(--dash-border)] rounded-xl bg-[var(--dash-hover-bg)]/30 min-h-[260px]">
                        <span className="text-xs text-[var(--dash-text-secondary)] font-medium font-sans">
                          Preview · connect systems to activate
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Governance */}
                {controlTowerTab === 'governance' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full">
                      {/* Governance Summary Table */}
                      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
                        <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4">Governance Safety Indicators</span>
                        <div className="overflow-x-auto w-full flex-grow">
                          <table className="w-full text-left text-xs border-collapse">
                            <thead>
                              <tr className="border-b border-[var(--dash-border)] text-[var(--dash-text-secondary)] font-bold">
                                <th className="py-2.5">Safety Rule</th>
                                <th className="py-2.5 text-right">Incidents</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--dash-border)]/50 text-[var(--dash-text-primary)]">
                              {[
                                { name: 'Prompt Injection Attempts', desc: 'Malicious inputs intercepted by security proxy' },
                                { name: 'Policy Violations', desc: 'Agent outputs failing governance rulesets' },
                                { name: 'Blocked Responses', desc: 'Deterministic filter overrides triggered' },
                                { name: 'Human Escalations', desc: 'Queries routed to human in the loop reviews' },
                                { name: 'Audit Coverage', desc: 'Proportion of executions stored with full traces' }
                              ].map((row, idx) => (
                                <tr key={idx} className="hover:bg-[var(--dash-hover-bg)]/25 transition">
                                  <td className="py-3 pr-4">
                                    <div className="font-semibold">{row.name}</div>
                                    <div className="text-[10px] text-[var(--dash-text-secondary)]">{row.desc}</div>
                                  </td>
                                  <td className="py-3 text-right font-extrabold text-sm">—</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      {/* Governance Risk Mix Empty Chart */}
                      <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm flex flex-col justify-between min-h-[360px]">
                        <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4">Governance Risk Mix</span>
                        <div className="flex-grow flex items-center justify-center border-2 border-dashed border-[var(--dash-border)] rounded-xl bg-[var(--dash-hover-bg)]/30 min-h-[260px]">
                          <span className="text-xs text-[var(--dash-text-secondary)] font-medium font-sans">
                            Preview · connect systems to activate
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB CONTENT: Audit Trail */}
                {controlTowerTab === 'audit' && (
                  <div className="space-y-6">
                    {/* Activity Log Table */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm w-full">
                      <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4 block">Compliance Observability Audit Log</span>
                      <div className="overflow-x-auto w-full">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="border-b border-[var(--dash-border)] text-[var(--dash-text-secondary)] font-bold">
                              <th className="py-3 px-2">Time</th>
                              <th className="py-3 px-2">User</th>
                              <th className="py-3 px-2">Agent</th>
                              <th className="py-3 px-2">Model</th>
                              <th className="py-3 px-2 text-right">Latency</th>
                              <th className="py-3 px-2 text-right">Tokens</th>
                              <th className="py-3 px-2 text-right">Cost</th>
                              <th className="py-3 px-2 text-center">Risk</th>
                              <th className="py-3 px-2 text-center">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="text-[var(--dash-text-secondary)] hover:bg-[var(--dash-hover-bg)]/10 transition">
                              <td colSpan="9" className="py-8 text-center italic text-xs font-semibold">
                                No connected agent activity yet · Preview
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Agent Health Registry */}
                    <div className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-6 shadow-sm w-full">
                      <span className="text-sm font-bold text-[var(--dash-text-primary)] mb-4 block">Agent Operational Health Status</span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[
                          { name: 'Vendor Risk Triage Agent', desc: 'CISO Compliance Engine' },
                          { name: 'AI ROI Analyzer Agent', desc: 'CFO Valuation Engine' },
                          { name: 'AI Readiness Copilot Agent', desc: 'Enterprise Assessment Engine' }
                        ].map((agent, i) => (
                          <div key={i} className="p-4 border border-[var(--dash-border)] rounded-xl bg-[var(--dash-hover-bg)]/10 flex flex-col justify-between min-h-[100px]">
                            <div>
                              <h5 className="font-bold text-xs text-[var(--dash-text-primary)]">{agent.name}</h5>
                              <span className="text-[10px] text-[var(--dash-text-secondary)] block mb-2">{agent.desc}</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px] font-semibold text-[var(--dash-text-secondary)] pt-2 border-t border-[var(--dash-border)]/30">
                              <span>Health: <span className="text-[var(--dash-text-secondary)] font-bold">—</span></span>
                              <span className="italic text-[9px]">Awaiting connection</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB: INTEGRATIONS */}
            {activeTab === 'integrations' && (
              <div className="space-y-6 animate-fade-in w-full text-left">
                <div className="bg-[var(--dash-active-bg)] border border-[var(--dash-active-border)] rounded-2xl p-6 text-sm text-[var(--dash-text-primary)] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-[var(--dash-accent)] text-base">
                    <span>🔌 Available Connectors</span>
                  </div>
                  <p className="text-xs text-[var(--dash-text-secondary)] leading-relaxed">
                    Choose from our suite of pre-built connector adapters to link your data warehouse, collaboration workspace, or CRM system to CertaintyAI's secure ontology engine.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full">
                  {[
                    'Gemini', 'Microsoft 355', 'Azure OpenAI', 'ServiceNow', 'Snowflake', 
                    'Databricks', 'Salesforce', 'Google Workspace', 'SharePoint', 'Jira', 'Confluence'
                  ].map((cName) => (
                    <div key={cName} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--dash-accent)]/30 transition duration-150 shadow-sm">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm text-[var(--dash-text-primary)]">{cName}</h4>
                          <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-secondary)] border border-[var(--dash-border)]">
                            Not Connected
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--dash-text-secondary)] mt-2 leading-relaxed">
                          Synchronize resources, schemas, and credentials with CertaintyAI security envelopes.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[var(--dash-border)]/50 space-y-2">
                        <div className="flex justify-between text-[9px] text-[var(--dash-text-secondary)]">
                          <span>Last Sync</span>
                          <span className="font-mono font-bold">—</span>
                        </div>
                        <div className="flex justify-between text-[9px] text-[var(--dash-text-secondary)]">
                          <span>Permissions</span>
                          <span className="font-bold">Read-Only</span>
                        </div>
                        <button 
                          onClick={() => setPreviewAlert({
                            title: `${cName} Connector Preview`,
                            message: 'System integrations are currently in Preview Mode. Live connection will be enabled in a future release.'
                          })}
                          className="w-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-primary)] border border-[var(--dash-border)] hover:bg-[var(--dash-active-bg)] hover:text-[var(--dash-active-text)] hover:border-[var(--dash-active-border)] text-xs font-bold py-1.5 rounded-xl transition duration-150 mt-2 cursor-pointer"
                        >
                          Connect (Preview)
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Healthcare Section */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🏥</span> Healthcare Systems
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full">
                    {[
                      { name: 'Epic', desc: 'Electronic health record (planned connector)' },
                      { name: 'Oracle Health (Cerner)', desc: 'Electronic health record (planned connector)' },
                      { name: 'athenahealth', desc: 'Electronic health record (planned connector)' },
                      { name: 'DynaMed', desc: 'Clinical decision support / evidence (planned connector)' },
                      { name: 'Electronic Prior Authorization', desc: 'CMS interoperability / FHIR-based prior-auth framework (planned connector)' }
                    ].map((conn) => (
                      <div key={conn.name} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--dash-accent)]/30 transition duration-150 shadow-sm text-left">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-[var(--dash-text-primary)]">{conn.name}</h4>
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-secondary)] border border-[var(--dash-border)] shrink-0">
                              Not Connected
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--dash-text-secondary)] mt-2 leading-relaxed">
                            {conn.desc}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[var(--dash-border)]/50 space-y-2">
                          <div className="flex justify-between text-[9px] text-[var(--dash-text-secondary)]">
                            <span>Last Sync</span>
                            <span className="font-mono font-bold">—</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-[var(--dash-text-secondary)]">
                            <span>Permissions</span>
                            <span className="font-bold">Read-Only</span>
                          </div>
                          <button
                            onClick={() => setPreviewAlert({
                              title: `${conn.name} Connector Preview`,
                              message: 'System integrations are currently in Preview Mode. Live connection will be enabled in a future release.'
                            })}
                            className="w-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-primary)] border border-[var(--dash-border)] hover:bg-[var(--dash-active-bg)] hover:text-[var(--dash-active-text)] hover:border-[var(--dash-active-border)] text-xs font-bold py-1.5 rounded-xl transition duration-150 mt-2 cursor-pointer"
                          >
                            Connect (Preview)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Data Governance & Catalog Section */}
                <div className="space-y-4 pt-4">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <span>🛡️</span> Data Governance & Catalog
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 w-full">
                    {[
                      { name: 'OpenMetadata', desc: 'Open-source data catalog (planned connector)' },
                      { name: 'Microsoft Fabric', desc: 'Unified data platform (planned connector)' },
                      { name: 'Microsoft Purview', desc: 'Data governance & catalog (planned connector)' },
                      { name: 'Google Cloud Dataplex', desc: 'Data governance & catalog (planned connector)' },
                      { name: 'IBM watsonx.data intelligence', desc: 'Data governance & lineage (planned connector)' },
                      { name: 'Amazon SageMaker Catalog', desc: 'Data governance on Amazon DataZone (planned connector)' }
                    ].map((conn) => (
                      <div key={conn.name} className="bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-5 flex flex-col justify-between space-y-4 hover:border-[var(--dash-accent)]/30 transition duration-150 shadow-sm text-left">
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <h4 className="font-bold text-sm text-[var(--dash-text-primary)]">{conn.name}</h4>
                            <span className="text-[9px] uppercase font-bold px-2 py-0.5 rounded-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-secondary)] border border-[var(--dash-border)] shrink-0">
                              Not Connected
                            </span>
                          </div>
                          <p className="text-[10px] text-[var(--dash-text-secondary)] mt-2 leading-relaxed">
                            {conn.desc}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-[var(--dash-border)]/50 space-y-2">
                          <div className="flex justify-between text-[9px] text-[var(--dash-text-secondary)]">
                            <span>Last Sync</span>
                            <span className="font-mono font-bold">—</span>
                          </div>
                          <div className="flex justify-between text-[9px] text-[var(--dash-text-secondary)]">
                            <span>Permissions</span>
                            <span className="font-bold">Read-Only</span>
                          </div>
                          <button
                            onClick={() => setPreviewAlert({
                              title: `${conn.name} Connector Preview`,
                              message: 'System integrations are currently in Preview Mode. Live connection will be enabled in a future release.'
                            })}
                            className="w-full bg-[var(--dash-hover-bg)] text-[var(--dash-text-primary)] border border-[var(--dash-border)] hover:bg-[var(--dash-active-bg)] hover:text-[var(--dash-active-text)] hover:border-[var(--dash-active-border)] text-xs font-bold py-1.5 rounded-xl transition duration-150 mt-2 cursor-pointer"
                          >
                            Connect (Preview)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Trademark Disclaimer line at the bottom */}
                <div className="pt-8 pb-2 border-t border-[var(--dash-border)]/20 text-center w-full">
                  <p className="text-[10px] text-[var(--dash-text-secondary)] max-w-2xl mx-auto leading-relaxed">
                    All product names and trademarks are the property of their respective owners. Connector availability is on our roadmap and does not imply partnership, endorsement, or certification.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Voice Agent AI Assistant Widget in Right Column */}
          {false && activeTab !== 'home' && (
            <div className="space-y-6">
            <div className="bg-gradient-to-b from-[#0F172A] to-[#070A13] border border-cyan-500/20 rounded-2xl p-6 shadow-[0_0_30px_rgba(34,211,238,0.1)] relative overflow-hidden">
              {/* Voice wave canvas background decor */}
              <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full filter blur-xl"></div>
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-violet-500/5 rounded-full filter blur-2xl"></div>

              <div className="relative space-y-5">
                {/* Header */}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2.5">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                        agentState === 'speaking' ? 'bg-violet-400' : 'bg-cyan-400'
                      }`}></span>
                      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                        agentState === 'speaking' ? 'bg-violet-500' : 'bg-cyan-500'
                      }`}></span>
                    </span>
                    <h3 className="text-sm font-bold tracking-wider text-slate-200 uppercase">Voice AI Assistant</h3>
                  </div>

                  {/* Audio Synthesis Toggle */}
                  <button
                    onClick={() => {
                      setVoiceEnabled(!voiceEnabled)
                      if (voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
                        window.speechSynthesis.cancel()
                      }
                    }}
                    className={`p-1.5 rounded-lg border transition ${
                      voiceEnabled 
                        ? 'border-cyan-500/30 text-cyan-400 bg-cyan-500/5' 
                        : 'border-slate-800 text-slate-500 hover:text-slate-400'
                    }`}
                    title={voiceEnabled ? 'Mute Assistant Voice' : 'Unmute Assistant Voice'}
                  >
                    {voiceEnabled ? <Icons.Volume /> : <Icons.VolumeX />}
                  </button>
                </div>

                {/* Animated Waveform Canvas */}
                <div className="w-full bg-[#070A13]/80 border border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center space-y-2">
                  <canvas ref={canvasRef} width="280" height="80" className="w-full h-20 rounded-lg"></canvas>
                  <span className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">
                    {agentState === 'idle' && 'System Idle'}
                    {agentState === 'listening' && 'Listening to mic...'}
                    {agentState === 'searching' && 'Analyzing data...'}
                    {agentState === 'speaking' && 'Streaming voice response...'}
                  </span>
                </div>

                {/* Transcript Dialog */}
                <div className="bg-[#070A13]/60 border border-slate-800/80 rounded-xl p-4 min-h-36 max-h-56 overflow-y-auto flex flex-col justify-between">
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{agentText}"
                  </p>
                  <div className="pt-3 border-t border-slate-800/40 mt-3 flex justify-between items-center text-[10px] text-slate-500 font-bold uppercase">
                    <span>MDx Orchestrator</span>
                    <span className="text-cyan-400/80">Online</span>
                  </div>
                </div>

                {/* Mic Trigger */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={queryInput}
                    onChange={(e) => setQueryInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && queryInput.trim() && (handleAgentQuery(queryInput), setQueryInput(''))}
                    placeholder="Ask or click a prompt below..."
                    className="flex-1 bg-[#070A13] border border-slate-800 focus:border-cyan-400 focus:outline-none rounded-lg px-3 py-2 text-xs text-slate-300"
                  />
                  <button
                    onClick={toggleListening}
                    className={`p-2.5 rounded-lg border transition duration-200 shrink-0 ${
                      isListening
                        ? 'border-rose-500/30 text-rose-400 bg-rose-500/10 shadow-[0_0_15px_rgba(239,68,68,0.2)]'
                        : 'border-cyan-500/30 text-cyan-400 hover:bg-cyan-500/10 bg-cyan-500/5'
                    }`}
                  >
                    <Icons.Mic />
                  </button>
                </div>

                {/* Recommendations & Dynamic Prompts */}
                <div className="space-y-2 pt-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Default Recommendations & Prompts</span>
                  <div className="flex flex-col gap-2">
                    {followUps.map((prompt, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setQueryInput(prompt.text)
                          handleAgentQuery(prompt.text)
                        }}
                        className="w-full text-left bg-slate-900/60 hover:bg-slate-800/60 border border-slate-800/80 hover:border-cyan-500/20 px-3.5 py-2 rounded-xl text-xs text-slate-300 transition duration-150 flex items-center justify-between"
                      >
                        <span className="truncate">{prompt.text}</span>
                        <span className="text-cyan-500 font-bold opacity-60">→</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Strategic Partnerships Co-Brand Card */}
            <div className="bg-[#0F172A]/40 border border-slate-800 rounded-2xl p-5 space-y-4">
              <div>
                <h4 className="text-xs uppercase tracking-widest text-slate-400 font-bold">Joint Ecosystem Partners</h4>
                <p className="text-[11px] text-slate-500 mt-1">MDx Strategic multi-cloud framework integrations.</p>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-extrabold text-blue-400">Microsoft</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Azure OpenAI</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-extrabold text-purple-400">Google</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Vertex AI</span>
                </div>
                <div className="bg-slate-900/60 border border-slate-800/80 p-2 rounded-lg text-center flex flex-col justify-center items-center">
                  <span className="text-xs font-extrabold text-sky-400">Snowflake</span>
                  <span className="text-[8px] uppercase tracking-wider text-slate-500 font-semibold mt-0.5">Cortex</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      </main>

      {/* Global Floating Voice AI Assistant Bot Widget (Anchored in bottom right) */}
      <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end">
        {voiceAssistantOpen && (
          <div className="mb-4 w-80 overflow-hidden bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-4.5 shadow-[var(--shadow-lg)] backdrop-blur-md flex flex-col space-y-3.5 animate-fade-in font-sans">
            {/* Header */}
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="relative w-8 h-8 rounded-full overflow-hidden border border-[var(--dash-border)] shrink-0 bg-transparent">
                  <img src="/assistant-avatar.jpg" alt="Voice AI Avatar" className="w-full h-full object-cover" />
                  <span className={`absolute bottom-0 right-0 block h-2 w-2 rounded-full border border-[var(--dash-border)] ${
                    agentState === 'speaking' ? 'bg-violet-500 animate-pulse' : (agentState === 'searching' ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500')
                  }`} />
                </div>
                <h3 className="text-xs font-bold tracking-wider text-[var(--dash-text-primary)] uppercase">Voice AI Assistant</h3>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice Language Selector */}
                <select
                  value={voiceLanguage}
                  onChange={(e) => setVoiceLanguage(e.target.value)}
                  className="bg-[var(--dash-bg)] border border-[var(--dash-border)] rounded-xl text-[10px] text-[var(--dash-text-primary)] px-2 py-1 focus:outline-none focus:ring-1 focus:ring-[var(--dash-accent)] cursor-pointer max-w-[105px] truncate font-semibold font-sans"
                  title="Select Voice Language"
                  aria-label="Select Voice translation language"
                >
                  {copilotLanguages.map(l => (
                    <option key={l.code} value={l.name} className="bg-[var(--dash-card-bg)] text-[var(--dash-text-primary)] text-xs">
                      {l.name}
                    </option>
                  ))}
                </select>

                {/* Audio Synthesis Toggle */}
                <button
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled)
                    if (voiceEnabled && typeof window !== 'undefined' && window.speechSynthesis) {
                      window.speechSynthesis.cancel()
                    }
                  }}
                  className={`p-1.5 rounded-lg border transition ${
                    voiceEnabled 
                      ? 'border-[var(--dash-accent)]/30 text-[var(--dash-accent)] bg-[var(--dash-accent)]/5' 
                      : 'border-[var(--dash-border)] text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)]'
                  }`}
                  title={voiceEnabled ? 'Mute Assistant Voice' : 'Unmute Assistant Voice'}
                >
                  {voiceEnabled ? <Icons.Volume /> : <Icons.VolumeX />}
                </button>
              </div>
            </div>

            {/* Animated Waveform Canvas */}
            <div className="w-full bg-[var(--dash-bg)]/80 border border-[var(--dash-border)] rounded-xl p-3 flex flex-col items-center justify-center space-y-2">
              <canvas ref={canvasRef} width="240" height="60" className="w-full h-16 rounded-lg"></canvas>
              <div className="flex items-center gap-1.5 text-[9px] text-[var(--dash-text-secondary)] uppercase tracking-widest font-bold">
                {agentState === 'idle' && (
                  <span className="text-[var(--dash-text-secondary)]">{isAudioPaused ? 'Audio Paused' : 'System Idle'}</span>
                )}
                {agentState === 'listening' && (
                  <div className="flex items-center gap-1 text-[var(--dash-accent)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--dash-accent)] animate-ping"></span>
                    <span>Listening...</span>
                  </div>
                )}
                {agentState === 'searching' && (
                  <div className="flex items-center gap-1 text-[var(--amber)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--amber)] animate-pulse"></span>
                    <span>⚡ Processing...</span>
                  </div>
                )}
                {agentState === 'speaking' && (
                  <div className="flex items-center gap-1 text-[var(--accent-2)]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent-2)] animate-bounce"></span>
                    <span>🔊 Speaking...</span>
                  </div>
                )}
              </div>
            </div>

            {/* Low Confidence / Accent Alert */}
            {isLowConfidence && (
              <div className="text-[9px] text-[var(--amber)] font-bold bg-[var(--amber)]/10 border border-[var(--amber)]/20 px-2.5 py-1 rounded-lg text-center animate-pulse font-sans leading-tight">
                ⚠️ Dialect match low confidence. Speak clearly or select your specific dialect accent from the language dropdown.
              </div>
            )}

            {/* Transcript Dialog */}
            <div className="bg-[var(--dash-bg)]/60 border border-[var(--dash-border)] rounded-xl p-3 min-h-24 max-h-36 overflow-y-auto scrollbar-none flex flex-col justify-between">
              <p className="text-[11px] text-[var(--dash-text-secondary)] leading-relaxed italic">
                "{agentText}"
              </p>
              <div ref={voiceBottomRef} />
              <div className="pt-2 border-t border-[var(--dash-border)]/40 mt-2 flex justify-between items-center text-[8px] text-[var(--dash-text-secondary)] font-bold uppercase">
                <span>CertaintyAI Orchestrator</span>
                <span className="text-[var(--dash-accent)]/80">Online</span>
              </div>
            </div>

            {/* Tap-to-Speak Primary Redesigned CTA Button */}
            <div className="w-full font-sans">
              {(agentState === 'idle' || agentState === 'speaking') && (
                <button
                  onClick={toggleListening}
                  className="w-full flex items-center justify-center gap-2 border border-[var(--dash-accent)]/30 hover:border-[var(--dash-accent)] text-[var(--dash-accent)] bg-[var(--dash-accent)]/5 hover:bg-[var(--dash-accent)]/10 py-3 rounded-xl transition-all duration-200 text-xs font-bold shadow-[var(--dash-active-shadow)] active:scale-98 focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-3.5 h-3.5 animate-pulse text-[var(--dash-accent)]">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                    <line x1="12" y1="19" x2="12" y2="23" />
                  </svg>
                  <span>🎤 Tap to Speak</span>
                </button>
              )}

              {agentState === 'listening' && (
                <button
                  onClick={toggleListening}
                  className="w-full flex items-center justify-center gap-2 border border-[var(--rose)]/30 text-[var(--rose)] bg-[var(--rose)]/10 py-3 rounded-xl transition-all duration-200 text-xs font-bold shadow-[0_0_20px_rgba(239,68,68,0.25)] active:scale-98 animate-pulse focus:outline-none focus:ring-2 focus:ring-[var(--rose)]"
                >
                  <span className="w-2 h-2 rounded-full bg-[var(--rose)] animate-ping"></span>
                  <span>🎤 Listening... {Math.floor(recordingSeconds / 60)}:{(recordingSeconds % 60).toString().padStart(2, '0')}</span>
                </button>
              )}

              {agentState === 'searching' && (
                <div className="w-full flex items-center justify-center gap-2 border border-[var(--amber)]/30 text-[var(--amber)] bg-[var(--amber)]/5 py-3 rounded-xl transition-all duration-200 text-xs font-bold cursor-not-allowed">
                  <svg className="animate-spin h-3.5 w-3.5 text-[var(--amber)]" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>⚡ Processing...</span>
                </div>
              )}
            </div>

            {/* Contextual Prompts List */}
            <div className="flex flex-col gap-1.5 pt-1.5 border-t border-[var(--dash-border)]/60 font-sans">
              <span className="text-[8px] font-bold text-[var(--dash-text-secondary)] uppercase tracking-wider block">Suggested Prompts</span>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto scrollbar-none">
                {voiceSuggestedPrompts.map((p, i) => (
                  <button
                    key={i}
                    onClick={() => handleAgentQuery(p.query)}
                    className="text-[9px] font-semibold text-[var(--dash-accent)] hover:text-[var(--dash-hover-text)] bg-[var(--dash-accent)]/10 border border-[var(--dash-accent)]/20 hover:border-[var(--dash-accent)] px-2 py-1 rounded-lg transition duration-150 text-left truncate max-w-full"
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Clutter removed under AntiGravity 2.0 instructions to keep focus strictly on Chat, Voice, and AI Interaction */}
          </div>
        )}

        {/* Pulse Floating bot toggle circular button */}
        <button
          onClick={() => setVoiceAssistantOpen(!voiceAssistantOpen)}
          className="w-14 h-14 rounded-full hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center text-white relative overflow-hidden shrink-0"
          style={{
            background: 'var(--voice-toggle-bg)',
            border: 'var(--voice-toggle-border)',
            boxShadow: 'var(--voice-toggle-shadow)'
          }}
          title={voiceAssistantOpen ? "Close Assistant" : "Open Assistant"}
        >
          <div className="relative w-full h-full">
            <span 
              className="animate-ping absolute inset-0 rounded-full opacity-20"
              style={{ backgroundColor: 'var(--voice-pulse-color)' }}
            ></span>
            <img
              src="/assistant-avatar.jpg"
              alt="Assistant Avatar"
              className="w-full h-full object-cover rounded-full"
            />
            {voiceAssistantOpen && (
              <div className="absolute inset-0 bg-slate-950/70 flex items-center justify-center rounded-full transition duration-200 animate-fade-in">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-5 h-5 text-white">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </div>
            )}
          </div>
        </button>
      </div>

      {/* Cooperative Procurement Modal Overlay */}
        {isProcurementModalOpen && (
          <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <div className="bg-[#0B0F19] border border-slate-800 rounded-3xl w-full max-w-2xl overflow-hidden shadow-[0_0_50px_rgba(99,102,241,0.15)] flex flex-col my-8">
              {/* Modal Header */}
              <div className="flex justify-between items-center p-6 border-b border-slate-800/60 bg-[#0F172A]/40">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-cyan-400 bg-cyan-950/40 border border-cyan-850 px-2 py-0.5 rounded">
                    Initiate Partnership
                  </span>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2 mt-1">
                    <span>💎</span> Cooperative Procurement Framework
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setIsProcurementModalOpen(false);
                    setProcurementFormSubmitted(false);
                  }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition duration-150"
                  title="Close modal"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="w-5 h-5">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[75vh] space-y-6 scrollbar-none">
                {procurementFormSubmitted ? (
                  <div className="text-center py-8 px-4 space-y-4 animate-fade-in">
                    <div className="w-16 h-16 bg-emerald-950/30 border-2 border-emerald-500 rounded-full flex items-center justify-center mx-auto text-emerald-400 text-3xl shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                      ✓
                    </div>
                    <h4 className="text-xl font-bold text-slate-100">Proposal Requested Successfully!</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                      A co-brand strategist and solutions architect from our cooperative advisory team will contact you within 24 hours at <strong className="text-cyan-400 font-semibold">{procurementForm.email || 'your email'}</strong> to finalize your customized Statement of Work (SOW).
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => {
                          setIsProcurementModalOpen(false);
                          setProcurementFormSubmitted(false);
                          setProcurementForm({ orgName: '', contactName: '', email: '', tier: 'core', notes: '' });
                        }}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-6 py-2.5 rounded-xl transition duration-150"
                      >
                        Return to Strategy Advisory
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Catalog Staffing & Vehicle Info */}
                    <div className="bg-[#0F172A]/50 border border-slate-800 p-4 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">Illustrative Blended Rates</h4>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        This catalog displays illustrative, example cooperative labor rates. These sample figures demonstrate the kind of pre-negotiated, procurement-ready fixed-price packages and blended labor rates that cut public sector sourcing times from months to hours.
                      </p>
                      
                      <div className="border-t border-slate-800/60 pt-3">
                        <span className="text-[9px] uppercase font-bold text-slate-500 block mb-2">Blended SOW Labor Rates:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] text-slate-350">
                          <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                            <span className="text-slate-500 block">AI Strategist</span>
                            <span className="font-mono font-bold text-slate-200">$185/hr</span>
                          </div>
                          <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                            <span className="text-slate-500 block">AI Architect</span>
                            <span className="font-mono font-bold text-slate-200">$210/hr</span>
                          </div>
                          <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                            <span className="text-slate-500 block">Data Scientist</span>
                            <span className="font-mono font-bold text-slate-200">$195/hr</span>
                          </div>
                          <div className="bg-slate-900/40 p-2 rounded-lg border border-slate-850">
                            <span className="text-slate-500 block">ML Engineer</span>
                            <span className="font-mono font-bold text-slate-200">$190/hr</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Interactive Form */}
                    <form 
                      onSubmit={(e) => {
                        e.preventDefault();
                        setProcurementFormSubmitted(true);
                      }} 
                      className="space-y-4 text-xs"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block" htmlFor="orgName">Organization Name *</label>
                          <input
                            type="text"
                            id="orgName"
                            required
                            value={procurementForm.orgName}
                            onChange={(e) => setProcurementForm(prev => ({ ...prev, orgName: e.target.value }))}
                            placeholder="e.g. Health Agency / Cyber Agency"
                            className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-3.5 py-2 text-slate-250"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block" htmlFor="contactName">Contact Representative *</label>
                          <input
                            type="text"
                            id="contactName"
                            required
                            value={procurementForm.contactName}
                            onChange={(e) => setProcurementForm(prev => ({ ...prev, contactName: e.target.value }))}
                            placeholder="e.g. Dr. Jane Doe / CIO"
                            className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-3.5 py-2 text-slate-250"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block" htmlFor="contactEmail">Representative Email *</label>
                          <input
                            type="email"
                            id="contactEmail"
                            required
                            value={procurementForm.email}
                            onChange={(e) => setProcurementForm(prev => ({ ...prev, email: e.target.value }))}
                            placeholder="e.g. contact@agency.gov"
                            className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-3.5 py-2 text-slate-250"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-slate-400 font-bold block" htmlFor="procureTier">Target Cooperative Tier</label>
                          <select
                            id="procureTier"
                            value={procurementForm.tier}
                            onChange={(e) => setProcurementForm(prev => ({ ...prev, tier: e.target.value }))}
                            className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-3 py-2 text-slate-250 font-semibold cursor-pointer"
                          >
                            <option value="starter" className="bg-slate-950">Starter Tier (Assessment, Workshop, Deck)</option>
                            <option value="core" className="bg-slate-950">Core Tier (Roadmap, 1-2 AI Solutions, Training)</option>
                            <option value="advanced" className="bg-slate-950">Advanced Tier (Multi-solution, compliance, Managed)</option>
                            <option value="custom" className="bg-slate-950">Custom Advisory Engagement</option>
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-slate-400 font-bold block" htmlFor="notes">Discovery Notes & Primary Objectives</label>
                        <textarea
                          id="notes"
                          rows="3"
                          value={procurementForm.notes}
                          onChange={(e) => setProcurementForm(prev => ({ ...prev, notes: e.target.value }))}
                          placeholder="What data feeds (e.g. patient records, server logs) are in scope? What objectives are paramount in the next 90 days?"
                          className="w-full bg-[#070A13] border border-slate-800 focus:border-cyan-500 focus:outline-none rounded-xl px-3.5 py-2 text-slate-250 font-sans resize-none"
                        ></textarea>
                      </div>

                      <div className="pt-4 border-t border-slate-800/40 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setIsProcurementModalOpen(false);
                            setProcurementFormSubmitted(false);
                          }}
                          className="bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200 font-bold px-4 py-2.5 rounded-xl transition duration-150"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          className="bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-extrabold px-6 py-2.5 rounded-xl shadow-[0_0_15px_rgba(34,211,238,0.2)] hover:scale-101 transition duration-150"
                        >
                          Initiate SOW Discovery
                        </button>
                      </div>
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
        
        {previewAlert && (
          <div className="fixed bottom-4 right-4 z-50 bg-[var(--dash-card-bg)] border border-[var(--dash-border)] rounded-2xl p-4 shadow-xl max-w-sm font-sans animate-fade-in">
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-[var(--dash-text-primary)] uppercase tracking-wider">
                  {previewAlert.title}
                </h4>
                <p className="text-[11px] text-[var(--dash-text-secondary)] leading-relaxed">
                  {previewAlert.message}
                </p>
              </div>
              <button 
                onClick={() => setPreviewAlert(null)}
                className="text-[var(--dash-text-secondary)] hover:text-[var(--dash-text-primary)] font-bold text-sm cursor-pointer"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
  )
}
