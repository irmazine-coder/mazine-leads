"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase";
import { Search, Plus, LogOut, Sparkles, Building2, Users, Target, X, Download } from "lucide-react";

type Lead = {
  id: string;
  business_name: string;
  category: string | null;
  city: string | null;
  state: string | null;
  instagram_url: string | null;
  website_url: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  source: string | null;
  notes: string | null;
  status: string;
  created_at: string;
};

const statuses = [
  ["descoberta", "Descoberta"], ["cadastrado", "Cadastrado"], ["analisado", "Analisado"],
  ["oportunidade", "Oportunidade"], ["abordagem", "Abordagem"], ["acompanhamento", "Acompanhamento"],
  ["negociacao", "Negociação"], ["cliente", "Cliente"], ["descartado", "Descartado"]
];

const emptyForm = {
  business_name: "", category: "Moda feminina", city: "Campo Grande", state: "MS",
  instagram_url: "", website_url: "", phone: "", whatsapp: "", address: "",
  source: "", notes: "", status: "descoberta"
};

export default function LeadsApp() {
  const [supabase] = useState(() => createClient());
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("todos");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, next) => setSession(next));
    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  useEffect(() => {
    if (session) loadLeads();
  }, [session]);

  async function loadLeads() {
    setLoading(true);
    const { data, error } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
    if (error) setError(error.message);
    else setLeads((data || []) as Lead[]);
    setLoading(false);
  }

  async function login(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setError(error.message);
    setBusy(false);
  }

  async function logout() { await supabase.auth.signOut(); setLeads([]); }

  function openNew() { setEditing(null); setForm(emptyForm); setModal(true); }
  function openEdit(lead: Lead) {
    setEditing(lead.id);
    setForm({
      business_name: lead.business_name || "", category: lead.category || "", city: lead.city || "",
      state: lead.state || "", instagram_url: lead.instagram_url || "", website_url: lead.website_url || "",
      phone: lead.phone || "", whatsapp: lead.whatsapp || "", address: lead.address || "",
      source: lead.source || "", notes: lead.notes || "", status: lead.status || "descoberta"
    });
    setModal(true);
  }

  async function saveLead(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { ...form };
    const result = editing
      ? await supabase.from("leads").update(payload).eq("id", editing)
      : await supabase.from("leads").insert(payload);
    if (result.error) setError(result.error.message);
    else { setModal(false); await loadLeads(); }
    setBusy(false);
  }

  async function deleteLead(id: string) {
    if (!confirm("Excluir este lead?")) return;
    const { error } = await supabase.from("leads").delete().eq("id", id);
    if (error) setError(error.message); else loadLeads();
  }

  const visible = useMemo(() => leads.filter(l => {
    const matches = `${l.business_name} ${l.category || ""} ${l.city || ""} ${l.instagram_url || ""}`.toLowerCase().includes(query.toLowerCase());
    return matches && (filter === "todos" || l.status === filter);
  }), [leads, query, filter]);

  function exportCsv() {
    const header = ["Empresa","Categoria","Cidade","Instagram","Site","Telefone","WhatsApp","Status","Observações"];
    const rows = visible.map(l => [l.business_name,l.category,l.city,l.instagram_url,l.website_url,l.phone,l.whatsapp,l.status,l.notes]);
    const csv = [header, ...rows].map(row => row.map(v => `"${String(v || "").replaceAll('"','""')}"`).join(";")).join("\n");
    const url = URL.createObjectURL(new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" }));
    const a = document.createElement("a"); a.href = url; a.download = "mazine-leads.csv"; a.click(); URL.revokeObjectURL(url);
  }

  if (loading && !session) return <main className="center"><div className="loader">MAZINE <span>LEADS</span></div></main>;

  if (!session) return <main className="login-wrap">
    <section className="login-card">
      <div className="brand-mark">M</div><p className="eyebrow">MAZINE DIGITAL CREATIVE</p>
      <h1>MAZINE <span>LEADS</span></h1>
      <p className="muted">Sua central privada de prospecção comercial.</p>
      <form onSubmit={login} className="stack">
        <label>E-mail<input type="email" required value={email} onChange={e=>setEmail(e.target.value)} placeholder="seu@email.com" /></label>
        <label>Senha<input type="password" required value={password} onChange={e=>setPassword(e.target.value)} placeholder="Sua senha" /></label>
        {error && <p className="error">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? "Entrando..." : "Acessar painel"}</button>
      </form>
      <p className="tiny">Acesso restrito • Ambiente privado</p>
    </section>
  </main>;

  return <main className="shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark small">M</div><div><b>MAZINE</b><small>LEADS</small></div></div>
      <div className="side-label">ESPAÇO DE TRABALHO</div>
      <div className="nav-active"><Building2 size={17}/> Prospecção</div>
      <div className="sidebar-bottom"><span className="online-dot"/> Ambiente privado <button className="icon-button" title="Sair" onClick={logout}><LogOut size={16}/></button></div>
    </aside>
    <section className="main">
      <header className="topbar"><div><p className="eyebrow">PAINEL COMERCIAL</p><h1>Prospecção <span>inteligente.</span></h1><p className="muted">Organize oportunidades e acompanhe cada relacionamento.</p></div><div className="top-actions"><button className="secondary" onClick={exportCsv}><Download size={16}/> Exportar</button><button className="primary" onClick={openNew}><Plus size={17}/> Novo lead</button></div></header>
      <div className="stats">
        <div className="stat"><div className="stat-icon"><Building2/></div><small>Total de leads</small><strong>{leads.length}</strong></div>
        <div className="stat"><div className="stat-icon"><Target/></div><small>Oportunidades</small><strong>{leads.filter(l=>l.status==="oportunidade").length}</strong></div>
        <div className="stat"><div className="stat-icon"><Users/></div><small>Em negociação</small><strong>{leads.filter(l=>l.status==="negociacao").length}</strong></div>
        <div className="stat"><div className="stat-icon"><Sparkles/></div><small>Clientes</small><strong>{leads.filter(l=>l.status==="cliente").length}</strong></div>
      </div>
      <section className="panel">
        <div className="panel-head"><div><h2>Seus leads</h2><p className="muted">Base de empresas identificadas para a MAZINE.</p></div><div className="controls"><div className="search"><Search size={16}/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar empresa..." /></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="todos">Todos os status</option>{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></div></div>
        {error && <p className="error notice">{error}</p>}
        {loading ? <div className="empty">Carregando seus leads...</div> : visible.length === 0 ? <div className="empty"><div className="empty-icon"><Building2/></div><b>Nenhum lead por aqui ainda.</b><p>Adicione a primeira empresa para começar sua prospecção.</p><button className="primary" onClick={openNew}><Plus size={16}/> Adicionar primeiro lead</button></div> :
          <div className="table-wrap"><table><thead><tr><th>EMPRESA</th><th>CIDADE</th><th>INSTAGRAM / SITE</th><th>STATUS</th><th></th></tr></thead><tbody>{visible.map(l=><tr key={l.id}><td><b>{l.business_name}</b><small>{l.category}</small></td><td>{l.city}{l.state ? `, ${l.state}` : ""}</td><td>{l.instagram_url ? <a href={l.instagram_url} target="_blank" rel="noreferrer">Instagram</a> : l.website_url ? <a href={l.website_url} target="_blank" rel="noreferrer">Site</a> : "—"}</td><td><span className={`status ${l.status}`}>{statuses.find(s=>s[0]===l.status)?.[1] || l.status}</span></td><td className="row-actions"><button onClick={()=>openEdit(l)}>Editar</button><button onClick={()=>deleteLead(l.id)}>Excluir</button></td></tr>)}</tbody></table></div>}
      </section>
      <footer>MAZINE LEADS <span>•</span> Prospecção com estratégia.</footer>
    </section>
    {modal && <div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setModal(false)}}><form className="modal" onSubmit={saveLead}>
      <div className="modal-head"><div><p className="eyebrow">CADASTRO COMERCIAL</p><h2>{editing ? "Editar lead" : "Novo lead"}</h2></div><button type="button" className="icon-button" onClick={()=>setModal(false)}><X/></button></div>
      <div className="form-grid">
        <label className="wide">Nome da empresa *<input required value={form.business_name} onChange={e=>setForm({...form,business_name:e.target.value})}/></label>
        <label>Categoria<input value={form.category} onChange={e=>setForm({...form,category:e.target.value})}/></label>
        <label>Status<select value={form.status} onChange={e=>setForm({...form,status:e.target.value})}>{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>
        <label>Cidade<input value={form.city} onChange={e=>setForm({...form,city:e.target.value})}/></label>
        <label>Estado<input value={form.state} onChange={e=>setForm({...form,state:e.target.value})}/></label>
        <label>Instagram (URL)<input value={form.instagram_url} onChange={e=>setForm({...form,instagram_url:e.target.value})}/></label>
        <label>Site (URL)<input value={form.website_url} onChange={e=>setForm({...form,website_url:e.target.value})}/></label>
        <label>Telefone<input value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})}/></label>
        <label>WhatsApp<input value={form.whatsapp} onChange={e=>setForm({...form,whatsapp:e.target.value})}/></label>
        <label className="wide">Endereço<input value={form.address} onChange={e=>setForm({...form,address:e.target.value})}/></label>
        <label className="wide">Fonte da informação<input value={form.source} onChange={e=>setForm({...form,source:e.target.value})}/></label>
        <label className="wide">Observações<textarea rows={3} value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/></label>
      </div>
      {error && <p className="error">{error}</p>}
      <div className="modal-actions"><button type="button" className="secondary" onClick={()=>setModal(false)}>Cancelar</button><button className="primary" disabled={busy}>{busy ? "Salvando..." : "Salvar lead"}</button></div>
    </form></div>}
  </main>;
}
