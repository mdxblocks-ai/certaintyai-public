import React, { useState, useEffect, useRef } from 'react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';

const ALL_TOOLS = ["Web search", "Doc retrieval", "Score lookup", "Email", "Calendar", "Database query", "Notify Slack"];
const ICONS = ["ti-robot", "ti-shield-check", "ti-file-search", "ti-scale", "ti-building-bank", "ti-heart-pulse", "ti-gavel", "ti-briefcase", "ti-chart-dots", "ti-radar"];

export default function AgentBuilder() {
  const { user } = useAuth();
  
  // Views: 'library' or 'builder'
  const [view, setView] = useState('library');
  const [agents, setAgents] = useState([]);
  const [selectedAgent, setSelectedAgent] = useState(null);
  
  // Form States
  const [role, setRole] = useState('ciso');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState('');
  const [icon, setIcon] = useState('ti-robot');
  const [model, setModel] = useState('Gemini 2.5 · Vertex AI');
  const [maxSteps, setMaxSteps] = useState(25);
  const [temperature, setTemperature] = useState(0.3);
  const [selectedTools, setSelectedTools] = useState([]);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  
  // Knowledge Base States
  const [documents, setDocuments] = useState([]);
  const [srcTab, setSrcTab] = useState('local');
  const [spUrl, setSpUrl] = useState('');
  const [ptUrl, setPtUrl] = useState('');
  const [uploadingDoc, setUploadingDoc] = useState(false);
  
  // Advanced Settings Expander
  const [advOpen, setAdvOpen] = useState(false);
  
  // Testing States
  const [testInput, setTestInput] = useState('Check compliance of vendor security policy');
  const [testTrace, setTestTrace] = useState([]);
  const [runningTest, setRunningTest] = useState(false);
  const [showTrace, setShowTrace] = useState(false);
  
  // UI States
  const [showIconMenu, setShowIconMenu] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [roleTemplates, setRoleTemplates] = useState({});
  
  const fileInputRef = useRef(null);
  const imgInputRef = useRef(null);

  // Load Agents & Configuration on Mount
  useEffect(() => {
    fetchAgents();
    fetchRoleTemplates();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await api.get('/agents');
      setAgents(res.data);
    } catch (err) {
      console.error("Failed to fetch custom agents:", err);
    }
  };

  const fetchRoleTemplates = async () => {
    try {
      const res = await api.get('/agents/role-templates');
      setRoleTemplates(res.data);
    } catch (err) {
      console.error("Failed to fetch role templates:", err);
      // Local fallback
      setRoleTemplates({
        ciso: {
          icon: "ti-shield-check",
          name: "Vendor Risk Triage",
          desc: "Reviews vendor docs and flags missing controls vs NIST AI RMF.",
          inst: "You are a CISO's security analyst. Review documents through a security and risk lens: flag missing or weak controls against NIST AI RMF, identify data-protection and threat-exposure gaps, and draft a concise risk summary for review.",
          tools: ["Web search", "Doc retrieval", "Score lookup", "Notify Slack"],
          hint: "Pre-filled for a CISO: security & risk lens, controls, threat exposure."
        },
        cfo: {
          icon: "ti-building-bank",
          name: "AI ROI Analyzer",
          desc: "Assesses cost, ROI, and budget impact of AI initiatives.",
          inst: "You are a CFO's finance analyst. Review documents through a financial lens: estimate cost and ROI, flag budget and value-realization risks, and summarize the business case in board-ready terms.",
          tools: ["Database query", "Doc retrieval", "Score lookup", "Calendar"],
          hint: "Pre-filled for a CFO: cost, ROI, budget impact, value realization."
        }
      });
    }
  };

  const showToastNotification = (msg) => {
    setToastMsg(msg);
    setShowToast(true);
    setTimeout(() => {
      setShowToast(false);
    }, 2200);
  };

  // Pre-fill fields when selecting/switching C-Suite Role Focus
  const handleRoleSelection = (selectedRole) => {
    setRole(selectedRole);
    const template = roleTemplates[selectedRole];
    if (template) {
      setName(template.name);
      setDescription(template.desc);
      setInstructions(template.inst);
      setIcon(template.icon);
      setSelectedTools(template.tools || []);
      showToastNotification(`${selectedRole.toUpperCase()} template applied`);
    }
  };

  // Helper to save agent if it doesn't exist yet (before document upload/linking)
  const ensureAgentCreated = async () => {
    if (selectedAgent) return selectedAgent.id;
    
    // Create new agent with current form values
    try {
      const payload = {
        name: name || "Untitled Agent",
        description: description || "No description.",
        instructions: instructions || "",
        icon,
        role,
        model,
        temperature: parseFloat(temperature),
        max_steps: parseInt(maxSteps),
        tools: selectedTools,
        voice_enabled: voiceEnabled
      };
      const res = await api.post('/agents', payload);
      const newAgent = res.data;
      setSelectedAgent(newAgent);
      // Add to local agents list immediately
      setAgents(prev => [...prev, newAgent]);
      return newAgent.id;
    } catch (err) {
      console.error("Failed to pre-create agent for document storage:", err);
      showToastNotification("Error initializing agent. Please try again.");
      throw err;
    }
  };

  const openBuilder = (agent) => {
    setShowTrace(false);
    setTestTrace([]);
    if (!agent) {
      // Create new agent: default to CISO pre-fills
      setSelectedAgent(null);
      setRole('ciso');
      setName('');
      setDescription('');
      setInstructions('');
      setIcon('ti-shield-check');
      setModel('Gemini 2.5 · Vertex AI');
      setMaxSteps(25);
      setTemperature(0.3);
      setSelectedTools([]);
      setDocuments([]);
      setVoiceEnabled(true);
      
      // Apply CISO pre-fill immediately
      const template = roleTemplates['ciso'];
      if (template) {
        setName(template.name);
        setDescription(template.desc);
        setInstructions(template.inst);
        setIcon(template.icon);
        setSelectedTools(template.tools || []);
      }
    } else {
      setSelectedAgent(agent);
      setRole(agent.role || 'ciso');
      setName(agent.name);
      setDescription(agent.description);
      setInstructions(agent.instructions);
      setIcon(agent.icon || 'ti-robot');
      setModel(agent.model || 'Gemini 2.5 · Vertex AI');
      setMaxSteps(agent.max_steps || 25);
      setTemperature(agent.temperature !== undefined ? agent.temperature : 0.3);
      setSelectedTools(agent.tools || []);
      setDocuments(agent.documents || []);
      setVoiceEnabled(agent.voice_enabled !== undefined ? agent.voice_enabled : true);
    }
    setView('builder');
  };

  const toggleTool = (toolName) => {
    setSelectedTools(prev => 
      prev.includes(toolName) 
        ? prev.filter(t => t !== toolName) 
        : [...prev, toolName]
    );
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingDoc(true);
    try {
      const agentId = await ensureAgentCreated();
      const formData = new FormData();
      formData.append('source_type', 'local');
      formData.append('source_ref', file.name);
      formData.append('file', file);

      const res = await api.post(`/agents/${agentId}/documents`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setDocuments(prev => [...prev, res.data]);
      showToastNotification("Document uploaded & indexed");
    } catch (err) {
      console.error("Failed to upload file:", err);
      showToastNotification("Upload failed. Verify local document.");
    } finally {
      setUploadingDoc(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleLinkUrl = async (sourceType) => {
    const url = sourceType === 'sharepoint' ? spUrl : ptUrl;
    if (!url.trim()) {
      showToastNotification("Paste a URL first");
      return;
    }

    try {
      const agentId = await ensureAgentCreated();
      const formData = new FormData();
      formData.append('source_type', sourceType);
      formData.append('source_ref', url);

      const res = await api.post(`/agents/${agentId}/documents`, formData);
      setDocuments(prev => [...prev, res.data]);
      
      if (sourceType === 'sharepoint') setSpUrl('');
      else setPtUrl('');
      
      showToastNotification("Linked & queued for indexing");
    } catch (err) {
      console.error("Failed to link URL:", err);
      showToastNotification("Failed to link document source");
    }
  };

  const handleCustomIconUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = () => {
      setIcon(reader.result); // Save base64 directly to icon field
      setShowIconMenu(false);
    };
    reader.readAsDataURL(file);
  };

  const runTestQuery = async () => {
    if (!name.trim()) {
      showToastNotification("Name your agent before running a test");
      return;
    }
    
    setRunningTest(true);
    setShowTrace(true);
    setTestTrace([]);
    
    try {
      const agentId = await ensureAgentCreated();
      // Ensure current form config is updated to database before running the test
      const payload = {
        name,
        description,
        instructions,
        icon,
        role,
        model,
        temperature: parseFloat(temperature),
        max_steps: parseInt(maxSteps),
        tools: selectedTools,
        voice_enabled: voiceEnabled
      };
      await api.put(`/agents/${agentId}`, payload);
      
      // Run agent execution loop
      const res = await api.post(`/agents/${agentId}/run`, { input: testInput });
      const runLog = res.data;
      
      // Animate steps onto screen
      const logSteps = runLog.steps || [];
      logSteps.forEach((s, idx) => {
        setTimeout(() => {
          setTestTrace(prev => [...prev, s]);
        }, 300 * (idx + 1));
      });
      
      setTimeout(() => {
        showToastNotification("Test run complete — logged");
        setRunningTest(false);
      }, 300 * (logSteps.length + 1));
      
    } catch (err) {
      console.error("Test execution failed:", err);
      setTestTrace(prev => [
        ...prev,
        { step: 1, type: "error", detail: "Execution failed. Vertex/Gemini connection returned error." }
      ]);
      setRunningTest(false);
    }
  };

  const deployAgent = async () => {
    if (!name.trim()) {
      showToastNotification("Please enter an agent name");
      return;
    }

    try {
      const payload = {
        name,
        description,
        instructions,
        icon,
        role,
        model,
        temperature: parseFloat(temperature),
        max_steps: parseInt(maxSteps),
        tools: selectedTools,
        voice_enabled: voiceEnabled
      };
      
      if (selectedAgent) {
        // Update
        await api.put(`/agents/${selectedAgent.id}`, payload);
        showToastNotification("Agent updated & deployed");
      } else {
        // Create
        await api.post('/agents', payload);
        showToastNotification("Agent deployed");
      }
      
      await fetchAgents();
      setTimeout(() => {
        setView('library');
      }, 600);
    } catch (err) {
      console.error("Failed to deploy agent:", err);
      showToastNotification("Failed to deploy agent");
    }
  };

  const getStyleWord = (temp) => {
    const val = parseFloat(temp);
    if (val <= 0.3) return "focused";
    if (val >= 0.7) return "creative";
    return "balanced";
  };

  const getShortUrl = (url) => {
    try {
      const parsed = url.replace(/^https?:\/\//, '').split('/');
      return parsed[0] + (parsed.length > 2 ? '/…/' + parsed[parsed.length - 1] : '');
    } catch (e) {
      return url.slice(0, 28);
    }
  };

  return (
    <div className="agent-builder-container p-6 rounded-2xl bg-[#F4F0E6] border border-slate-300 text-[#14161A] shadow-lg max-w-6xl mx-auto w-full">
      {/* Dynamic Scoped CSS overrides */}
      <style>{`
        .agent-builder-container {
          --parchment:#F4F0E6; --surface:#FBF9F3; --card:#FEFDFA;
          --ink:#14161A; --muted:#5A5750; --faint:#8A857A;
          --brass:#A87C3C; --brass-deep:#7A5A24; --brass-tint:#EDE3CF; --brass-tint2:#F0E5D0;
          --teal:#1E3A36; --teal-tint:#EAF1EE;
          --line:rgba(20,22,26,0.12); --line2:rgba(20,22,26,0.18);
        }
        .serif { font-family: 'Fraunces', serif; }
      `}</style>

      {/* Header bar */}
      <div className="flex items-center justify-between border-b border-slate-300 pb-4 mb-6">
        <div>
          <h3 className="serif text-2xl font-bold tracking-tight">Governance Agent Registry</h3>
          <p className="text-xs text-slate-500 mt-1 font-sans">
            Compose and manage role-aware autonomous compliance engines — no code required.
          </p>
        </div>
      </div>

      {/* LIBRARY VIEW */}
      {view === 'library' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
            {agents.map((agent) => (
              <div
                key={agent.id}
                onClick={() => openBuilder(agent)}
                className="bg-[#FEFDFA] border border-slate-200 hover:border-[#A87C3C] hover:shadow-md hover:-translate-y-0.5 rounded-xl p-5 cursor-pointer transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="text-base font-bold flex items-center gap-2 text-[#14161A]">
                    {agent.icon && agent.icon.startsWith('data:image') ? (
                      <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0 border border-slate-200">
                        <img src={agent.icon} alt={agent.name} className="w-full h-full object-cover" />
                      </div>
                    ) : (
                      <span className="w-8 h-8 rounded-lg bg-[#EAF1EE] text-[#1E3A36] flex items-center justify-center shrink-0">
                        <i className={`ti ${agent.icon || 'ti-robot'} text-lg`}></i>
                      </span>
                    )}
                    <span className="truncate">{agent.name}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2.5 leading-relaxed line-clamp-3">
                    {agent.description}
                  </p>
                </div>
                <div className="text-[11px] text-[#8A857A] flex gap-4 pt-3 mt-4 border-t border-slate-100">
                  <span className="flex items-center gap-1 font-sans font-medium">
                    <i className="ti ti-tools"></i> {agent.tools ? agent.tools.length : 0} capability pills
                  </span>
                  <span className="flex items-center gap-1 font-sans font-medium">
                    <i className="ti ti-player-play"></i> {agent.run_count || 0} runs
                  </span>
                </div>
              </div>
            ))}
            
            {/* New Agent Card */}
            <div
              onClick={() => openBuilder(null)}
              className="border-2 border-dashed border-[#A87C3C] text-[#7A5A24] bg-transparent hover:bg-[#EDE3CF]/20 rounded-xl p-5 cursor-pointer min-h-[145px] flex flex-col items-center justify-center gap-2 transition-all"
            >
              <i className="ti ti-plus text-2xl"></i>
              <span className="text-sm font-semibold">New Agent</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 text-center italic pt-4">
            Click an agent card to edit configuration or audit run history trace.
          </p>
        </div>
      )}

      {/* BUILDER VIEW */}
      {view === 'builder' && (
        <div className="space-y-5">
          {/* Back button */}
          <button 
            onClick={() => { setView('library'); fetchAgents(); }}
            className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-[#1E3A36] transition"
          >
            <i className="ti ti-arrow-left"></i> Back to registry
          </button>

          {/* C-Suite focus segment */}
          <div className="bg-[#FBF9F3] border border-slate-200 rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">C-Suite Focus</span>
              <div className="flex rounded-lg overflow-hidden border border-slate-300">
                <button
                  type="button"
                  onClick={() => handleRoleSelection('ciso')}
                  className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition ${
                    role === 'ciso' ? 'bg-[#1E3A36] text-[#EAF1EE]' : 'bg-[#FEFDFA] text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <i className="ti ti-shield-check"></i> CISO
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleSelection('cfo')}
                  className={`px-4 py-2 text-xs font-semibold flex items-center gap-1.5 transition ${
                    role === 'cfo' ? 'bg-[#1E3A36] text-[#EAF1EE]' : 'bg-[#FEFDFA] text-slate-500 hover:bg-slate-100'
                  }`}
                >
                  <i className="ti ti-building-bank"></i> CFO
                </button>
              </div>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              {role === 'ciso' ? (
                <span>Pre-filled for a <b>CISO</b>: security & risk lens, controls, threat exposure.</span>
              ) : (
                <span>Pre-filled for a <b>CFO</b>: cost, ROI, budget impact, value realization.</span>
              )}
            </p>
          </div>

          {/* Main Form Fields */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left Panel */}
            <div className="lg:col-span-7 space-y-4 bg-[#FEFDFA] border border-slate-200 rounded-xl p-5">
              
              {/* Icon & Name Row */}
              <div className="flex items-end gap-3">
                <div className="relative shrink-0">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Icon</label>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setShowIconMenu(prev => !prev); }}
                    className="w-12 h-12 rounded-xl bg-[#1E3A36] text-[#EAF1EE] border border-slate-200 flex items-center justify-center text-xl overflow-hidden hover:scale-[1.03] transition cursor-pointer"
                  >
                    {icon && icon.startsWith('data:image') ? (
                      <img src={icon} alt="custom icon" className="w-full h-full object-cover" />
                    ) : (
                      <i className={`ti ${icon}`}></i>
                    )}
                  </button>
                  
                  {/* Iconpicker menu popover */}
                  {showIconMenu && (
                    <div className="absolute left-0 mt-2 w-56 bg-[#FBF9F3] border border-slate-300 rounded-xl p-3 shadow-lg z-20 flex flex-wrap gap-2">
                      {ICONS.map((ic) => (
                        <button
                          key={ic}
                          type="button"
                          onClick={() => { setIcon(ic); setShowIconMenu(false); }}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition ${
                            icon === ic ? 'bg-[#1E3A36] text-[#EAF1EE]' : 'bg-[#EDE3CF] text-[#7A5A24] hover:bg-[#1E3A36] hover:text-[#EAF1EE]'
                          }`}
                        >
                          <i className={`ti ${ic}`}></i>
                        </button>
                      ))}
                      <label className="w-8 h-8 rounded-lg border border-dashed border-[#A87C3C] text-[#7A5A24] bg-[#FEFDFA] flex items-center justify-center cursor-pointer hover:bg-slate-100 transition">
                        <i className="ti ti-photo text-sm"></i>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleCustomIconUpload}
                          className="hidden"
                          ref={imgInputRef}
                        />
                      </label>
                    </div>
                  )}
                </div>
                
                <div className="flex-grow">
                  <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Agent Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Vendor Risk Triage"
                    className="w-full bg-[#FBF9F3] border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:border-[#A87C3C] focus:outline-none transition"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="One line explaining what this agent accomplishes"
                  className="w-full bg-[#FBF9F3] border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:border-[#A87C3C] focus:outline-none transition"
                />
              </div>

              {/* Instructions / Prompt */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1.5">Instructions</label>
                <textarea
                  rows="4"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="Describe the agent's role, rules of engagement, and governance requirements."
                  className="w-full bg-[#FBF9F3] border border-slate-300 rounded-lg px-3 py-2 text-xs font-sans font-semibold leading-relaxed focus:border-[#A87C3C] focus:outline-none transition resize-y"
                ></textarea>
              </div>

              {/* Advanced settings expander */}
              <div className="border-t border-slate-200 pt-3">
                <button
                  type="button"
                  onClick={() => setAdvOpen(prev => !prev)}
                  className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1E3A36] transition focus:outline-none"
                >
                  <i className={`ti ti-chevron-right transition-transform duration-200 ${advOpen ? 'rotate-90' : ''}`}></i>
                  Advanced Settings
                </button>
                
                {advOpen && (
                  <div className="mt-3 space-y-4 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-bold text-[#8A857A] uppercase block mb-1.5">Model</label>
                        <select
                          value={model}
                          onChange={(e) => setModel(e.target.value)}
                          className="w-full bg-[#FBF9F3] border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none"
                        >
                          <option>Gemini 2.5 · Vertex AI</option>
                          <option>Gemini 2.5 Flash · Vertex AI</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-[#8A857A] uppercase block mb-1.5">Effort Limit (Step Cap)</label>
                        <input
                          type="number"
                          value={maxSteps}
                          onChange={(e) => setMaxSteps(e.target.value)}
                          className="w-full bg-[#FBF9F3] border border-slate-300 rounded-lg px-2.5 py-2 text-xs font-semibold focus:outline-none"
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between items-center mb-1">
                        <label className="text-[10px] font-bold text-[#8A857A] uppercase block">Response Style</label>
                        <span className="text-[10px] font-bold text-[#7A5A24]">{getStyleWord(temperature)}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={temperature}
                        onChange={(e) => setTemperature(parseFloat(e.target.value))}
                        className="w-full accent-[#A87C3C] cursor-pointer"
                      />
                      <div className="flex justify-between text-[9px] text-slate-400 font-semibold font-sans mt-0.5">
                        <span>Focused</span>
                        <span>Creative</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between bg-[#FBF9F3] border border-slate-200 rounded-lg p-2.5 mt-2">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-[#1E3A36]">Voice Enabled</span>
                        <span className="text-[10px] text-slate-400 font-sans">Allow voice transcription and read-aloud features in chat</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={voiceEnabled}
                          onChange={(e) => setVoiceEnabled(e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#1E3A36]"></div>
                      </label>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Panel */}
            <div className="lg:col-span-5 space-y-4 bg-[#FEFDFA] border border-slate-200 rounded-xl p-5">
              
              {/* Capabilities Pills */}
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase block mb-2">What this agent can do</label>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_TOOLS.map((t) => {
                    const isSelected = selectedTools.includes(t);
                    return (
                      <button
                        key={t}
                        type="button"
                        onClick={() => toggleTool(t)}
                        className={`px-3 py-1.5 rounded-lg text-xs transition border font-sans font-medium cursor-pointer ${
                          isSelected 
                            ? 'bg-[#1E3A36] text-[#EAF1EE] border-[#1E3A36]' 
                            : 'bg-[#FBF9F3] text-slate-600 border-slate-200 hover:border-[#1E3A36]'
                        }`}
                      >
                        {t}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* RAG Knowledge Base */}
              <div>
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase block">Knowledge Base</label>
                    <span className="text-[9.5px] text-slate-400 font-medium font-sans">Select documents this agent references.</span>
                  </div>
                </div>
                
                {/* Source Tabs */}
                <div className="flex gap-1 border-b border-slate-200 pb-2 mb-3">
                  {['local', 'sharepoint', 'portal'].map((tab) => (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setSrcTab(tab)}
                      className={`flex-1 py-1.5 text-[10.5px] font-bold rounded-lg border transition ${
                        srcTab === tab 
                          ? 'bg-[#EDE3CF] text-[#7A5A24] border-[#A87C3C]' 
                          : 'bg-[#FBF9F3] text-slate-500 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <i className={`ti ${
                        tab === 'local' ? 'ti-device-laptop' : tab === 'sharepoint' ? 'ti-brand-windows' : 'ti-link'
                      } mr-1`}></i>
                      {tab === 'local' ? 'Local' : tab === 'sharepoint' ? 'SharePoint' : 'Portal URL'}
                    </button>
                  ))}
                </div>

                {/* Sub Tab Panes */}
                {srcTab === 'local' && (
                  <div 
                    onClick={() => fileInputRef.current && fileInputRef.current.click()}
                    className="border-2 border-dashed border-slate-300 hover:border-[#A87C3C] bg-[#FBF9F3] rounded-xl p-4 text-center cursor-pointer transition text-xs font-semibold text-slate-400 flex flex-col items-center justify-center gap-1.5"
                  >
                    <i className="ti ti-upload text-lg"></i>
                    {uploadingDoc ? 'Uploading & indexing...' : 'Click to browse & index a document'}
                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleFileUpload}
                      className="hidden"
                      accept=".txt,.md,.pdf,.json"
                    />
                  </div>
                )}

                {srcTab === 'sharepoint' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={spUrl}
                      onChange={(e) => setSpUrl(e.target.value)}
                      placeholder="https://mdxblocks.sharepoint.com/sites/..."
                      className="flex-grow bg-[#FBF9F3] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLinkUrl('sharepoint')}
                      className="bg-[#1E3A36] text-[#EAF1EE] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#15302C] transition"
                    >
                      Link
                    </button>
                  </div>
                )}

                {srcTab === 'portal' && (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={ptUrl}
                      onChange={(e) => setPtUrl(e.target.value)}
                      placeholder="https://procurement.opengov.com/portal/..."
                      className="flex-grow bg-[#FBF9F3] border border-slate-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={() => handleLinkUrl('portal')}
                      className="bg-[#1E3A36] text-[#EAF1EE] px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-[#15302C] transition"
                    >
                      Ingest
                    </button>
                  </div>
                )}

                {/* Attached Files List */}
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {documents.map((doc) => (
                    <span
                      key={doc.id}
                      className="inline-flex items-center gap-1 bg-[#EAF1EE] text-[#1E3A36] border border-[#1E3A36]/10 px-2 py-1 rounded-md text-[10.5px] font-sans font-medium"
                    >
                      <i className={`ti ${
                        doc.source_type === 'local' ? 'ti-file' : doc.source_type === 'sharepoint' ? 'ti-brand-windows' : 'ti-link'
                      } text-xs`}></i>
                      {doc.source_type === 'local' ? doc.source_ref : getShortUrl(doc.source_ref)}
                      <span className="text-[9px] text-[#A87C3C] bg-white border border-[#A87C3C]/20 px-1 rounded uppercase tracking-wide">
                        {doc.status}
                      </span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Governance compliance notice */}
              <div className="bg-[#EAF1EE] border border-[#1E3A36]/10 rounded-xl p-3.5 text-[11px] text-[#1E3A36] leading-relaxed flex items-start gap-2">
                <i className="ti ti-shield-check text-base mt-0.5 shrink-0"></i>
                <p>
                  Every run is logged step-by-step for audit. C-Suite role feeds prompt and template configurations only — the deterministic scoring engine remains completely untouched.
                </p>
              </div>
            </div>

          </div>

          {/* Form Actions (Test / Deploy) */}
          <div className="flex items-center justify-between border-t border-slate-300 pt-4 mt-6">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={testInput}
                onChange={(e) => setTestInput(e.target.value)}
                placeholder="Sample run input..."
                className="w-56 sm:w-80 bg-[#FEFDFA] border border-slate-300 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:border-[#A87C3C]"
              />
              <button
                type="button"
                onClick={runTestQuery}
                disabled={runningTest}
                className="bg-[#FEFDFA] border border-slate-300 text-slate-700 hover:bg-[#EDE3CF] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-1.5 transition disabled:opacity-60 cursor-pointer"
              >
                <i className="ti ti-player-play text-xs text-[#A87C3C]"></i>
                {runningTest ? 'Running...' : 'Test'}
              </button>
            </div>
            
            <button
              type="button"
              onClick={deployAgent}
              className="bg-[#A87C3C] text-white hover:bg-[#7A5A24] px-5 py-2 rounded-lg text-xs font-bold shadow-md hover:scale-[1.01] active:scale-[0.99] transition cursor-pointer"
            >
              Deploy Agent
            </button>
          </div>

          {/* Live Run Trace Output */}
          {showTrace && (
            <div className="bg-[#FBF9F3] border border-slate-300 rounded-xl p-5 mt-5 space-y-3 shadow-inner">
              <div className="text-xs font-bold text-[#1E3A36] flex items-center gap-2 border-b border-slate-200 pb-2">
                <i className="ti ti-history"></i> Run Trace Log
                <span className="text-[10px] text-slate-400 font-sans tracking-wide">
                  · {getStyleWord(temperature)} · limit {maxSteps}
                </span>
              </div>
              
              <div className="space-y-3.5 pt-1 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
                {testTrace.map((step, idx) => (
                  <div key={idx} className="flex gap-3 text-xs leading-relaxed border-l-2 border-slate-200 pl-4 relative">
                    <span className="w-5 h-5 rounded-full bg-[#EDE3CF] text-[#7A5A24] border border-[#A87C3C]/30 flex items-center justify-center text-[10px] font-bold shrink-0 absolute -left-[11px] top-0.5">
                      {step.step}
                    </span>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-800 uppercase tracking-widest text-[9px] bg-slate-200/50 px-1.5 py-0.2 rounded border border-slate-300">
                          {step.type === 'tool_call' ? 'tool call' : step.type === 'complete' ? 'complete' : step.type === 'error' ? 'error' : 'reasoning'}
                        </span>
                        {step.tool && <span className="text-[10px] text-[#A87C3C] font-semibold">{step.tool}</span>}
                      </div>
                      <p className="text-slate-700 whitespace-pre-wrap">{step.detail}</p>
                    </div>
                  </div>
                ))}
                
                {testTrace.length === 0 && (
                  <div className="text-xs text-slate-400 italic text-center py-4">
                    Initializing model execution trace...
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      )}

      {/* Floating Success Toast */}
      {showToast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1E3A36] text-[#EAF1EE] px-4.5 py-2.5 rounded-xl shadow-lg flex items-center gap-2 text-xs font-semibold z-50 animate-bounce">
          <i className="ti ti-circle-check text-[#A87C3C]"></i>
          <span>{toastMsg}</span>
        </div>
      )}
    </div>
  );
}
