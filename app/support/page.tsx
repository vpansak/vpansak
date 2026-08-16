"use client";

import { Bot, CheckCircle2, ChevronRight, CircleHelp, Headphones, Mail, MessageSquareText, Search, Send, ShieldCheck, Store, TicketCheck, ExternalLink } from "lucide-react";
import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";

type Ticket={ticketId:string;customerName:string;category:string;subject:string;status:string;priority:string;createdAt:string;updatedAt:string};
type Reply={authorType:string;authorName:string;message:string;createdAt:string};
const categories=["Order","Payment","Refund","Return","Delivery","Login","Technical","Seller","Merchant","Website","Other"];
const quick=["Where is my order?","How do I request a return?","My payment failed","How can I become a seller?"];

function smartAnswer(text:string){
  const q=text.toLowerCase();
  if(q.includes("order")||q.includes("delivery"))
    return "You can track your order using your VPO Order ID at https://vpansak.vercel.app/track or https://vpansaksupporthub.lovable.app/track. If delayed, please submit a ticket at https://vpansaksupporthub.lovable.app/submit.";
  if(q.includes("return")||q.includes("refund"))
    return "To request a return or refund, submit a ticket with your Order ID at https://vpansaksupporthub.lovable.app/submit. Track your ticket status anytime at https://vpansaksupporthub.lovable.app/track.";
  if(q.includes("payment")||q.includes("upi"))
    return "If money was deducted for a failed payment, please submit a ticket under Payment category at https://vpansaksupporthub.lovable.app/submit with your payment reference. Never share OTP or UPI PIN.";
  if(q.includes("seller")||q.includes("merchant"))
    return "To become a seller, register at https://vpansak.vercel.app/seller. Manage your products from https://vpansak.vercel.app/seller/dashboard or get seller support at https://vpansaksupporthub.lovable.app/.";
  
  return "I am the VPANSAK Smart Support Assistant. If I am unable to resolve your question, please access our official Support Portals:\n\n• Support Hub: https://vpansaksupporthub.lovable.app/\n• Create Ticket: https://vpansaksupporthub.lovable.app/submit\n• Track Ticket Status: https://vpansaksupporthub.lovable.app/track\n• Smart AI Chat: https://vpansaksupporthub.lovable.app/chat";
}

export default function SupportPage(){
  const [tab,setTab]=useState("assistant");
  const [question,setQuestion]=useState("");
  const [chat,setChat]=useState<Array<{role:string;text:string}>>([
    {role:"bot",text:"Namaste! I’m the VPANSAK Smart Support Assistant. How can I help with your order, payment, return or seller account? If I cannot solve your issue, I will provide instant access to our Support Hub (https://vpansaksupporthub.lovable.app/)."}
  ]);
  const [created,setCreated]=useState("");
  const [trackId,setTrackId]=useState("");
  const [linkedOrder,setLinkedOrder]=useState("");
  const [supportSubject,setSupportSubject]=useState("");
  const [replyEmail,setReplyEmail]=useState("");
  const [ticket,setTicket]=useState<Ticket|null>(null);
  const [replies,setReplies]=useState<Reply[]>([]);
  const [error,setError]=useState("");
  const [busy,setBusy]=useState(false);

  useEffect(()=>{
    const timer=window.setTimeout(()=>{
      const order=new URLSearchParams(window.location.search).get("order");
      if(order){
        setTab("create");
        setLinkedOrder(order.toUpperCase());
        setSupportSubject(`Help with order ${order.toUpperCase()}`);
      }
    },0);
    return()=>window.clearTimeout(timer);
  },[]);

  const ask=(value=question)=>{
    if(!value.trim())return;
    setChat((c)=>[...c,{role:"user",text:value.trim()},{role:"bot",text:smartAnswer(value)}]);
    setQuestion("");
  };

  const create=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    const formElement=e.currentTarget;
    setBusy(true);
    setError("");
    const f=new FormData(formElement);
    const body={customerName:f.get("name"),email:f.get("email"),mobile:f.get("mobile"),category:f.get("category"),orderId:f.get("orderId"),priority:f.get("priority"),subject:f.get("subject"),description:f.get("message")};
    const res=await fetch("/api/tickets",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(body)});
    const data=await res.json();
    if(res.ok){
      setCreated(data.ticketId);
      setTrackId(data.ticketId);
      setReplyEmail(String(body.email||""));
      setLinkedOrder("");
      setSupportSubject("");
      formElement.reset();
    }else setError(data.error||"Could not create ticket");
    setBusy(false);
  };

  const track=async(value=trackId)=>{
    const id=value.trim().toUpperCase();
    setBusy(true);
    setError("");
    const res=await fetch(`/api/tickets?id=${encodeURIComponent(id)}`);
    const data=await res.json();
    if(res.ok){
      setTicket(data.ticket);
      setReplies(data.replies||[]);
      setTrackId(id);
    }else{
      setTicket(null);
      setError(data.error||"Ticket not found");
    }
    setBusy(false);
  };

  const reply=async(e:FormEvent<HTMLFormElement>)=>{
    e.preventDefault();
    if(!ticket)return;
    const formElement=e.currentTarget;
    const f=new FormData(formElement);
    const res=await fetch("/api/tickets/reply",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({ticketId:ticket.ticketId,email:f.get("email"),message:f.get("message")})});
    const data=await res.json();
    if(res.ok){
      formElement.reset();
      setReplyEmail("");
      track(ticket.ticketId);
    }else setError(data.error||"Could not send reply");
  };

  return (
    <main className="support-page">
      <header className="sub-header">
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small>SUPPORT HUB</small>
          </span>
        </Link>
        <nav>
          <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">
            Support Hub <ExternalLink size={12} />
          </a>
          <a href="https://vpansaksupporthub.lovable.app/track" target="_blank" rel="noreferrer">
            Track Ticket <ExternalLink size={12} />
          </a>
          <a href="https://vpansaksupporthub.lovable.app/submit" target="_blank" rel="noreferrer">
            Create Ticket <ExternalLink size={12} />
          </a>
          <a href="https://vpansaksupporthub.lovable.app/chat" target="_blank" rel="noreferrer">
            Smart AI <ExternalLink size={12} />
          </a>
        </nav>
      </header>

      <section className="support-hero">
        <small>ONE PLACE FOR EVERY QUESTION</small>
        <h1>How can we help?</h1>
        <p>Get guided answers, create a support ticket and track every update with a unique Ticket ID.</p>
        <div className="support-trust">
          <span><ShieldCheck/>Private &amp; secure</span>
          <span><TicketCheck/>Trackable tickets</span>
          <span><Headphones/>Human support workflow</span>
        </div>
      </section>

      <div className="support-shell">
        <aside>
          <button className={tab==="assistant"?"active":""} onClick={()=>setTab("assistant")}>
            <Bot/>
            <span><strong>Smart Assistant</strong><small>Instant guided answers</small></span>
            <ChevronRight/>
          </button>
          <a href="https://vpansaksupporthub.lovable.app/submit" target="_blank" rel="noreferrer" className="support-aside-link">
            <MessageSquareText/>
            <span><strong>Create Ticket</strong><small>https://vpansaksupporthub.lovable.app/submit</small></span>
            <ExternalLink size={14}/>
          </a>
          <a href="https://vpansaksupporthub.lovable.app/track" target="_blank" rel="noreferrer" className="support-aside-link">
            <Search/>
            <span><strong>Track Ticket</strong><small>https://vpansaksupporthub.lovable.app/track</small></span>
            <ExternalLink size={14}/>
          </a>
          <a href="https://vpansaksupporthub.lovable.app/chat" target="_blank" rel="noreferrer" className="support-aside-link">
            <Bot/>
            <span><strong>Smart AI Chat</strong><small>https://vpansaksupporthub.lovable.app/chat</small></span>
            <ExternalLink size={14}/>
          </a>
          <button className={tab==="merchant"?"active":""} onClick={()=>setTab("merchant")}>
            <Store/>
            <span><strong>Merchant Help</strong><small>Seller onboarding guide</small></span>
            <ChevronRight/>
          </button>
        </aside>

        <section className="support-content">
          {error&&<button className="support-alert" onClick={()=>setError("")}>{error}</button>}

          {tab==="assistant"&&(
            <div className="assistant-panel">
              <header>
                <span><Bot/></span>
                <div>
                  <small>VPANSAK SMART SUPPORT</small>
                  <h2>Support Assistant</h2>
                  <p>Guided help • Never asks for OTP or PIN</p>
                </div>
              </header>
              <div className="chat-window">
                {chat.map((m,i)=>(
                  <div className={`chat-message ${m.role}`} key={i}>
                    {m.role==="bot"&&<Bot/>}
                    <p style={{ whiteSpace: "pre-line" }}>{m.text}</p>
                  </div>
                ))}
              </div>
              <div className="quick-questions">
                {quick.map((q)=><button onClick={()=>ask(q)} key={q}>{q}</button>)}
              </div>
              <form className="chat-input" onSubmit={(e)=>{e.preventDefault();ask()}}>
                <input value={question} onChange={(e)=>setQuestion(e.target.value)} placeholder="Type your question…"/>
                <button><Send/></button>
              </form>
              <small className="assistant-note">
                For direct ticket creation and live tracking, visit our official Support Hub at{" "}
                <a href="https://vpansaksupporthub.lovable.app/submit" target="_blank" rel="noreferrer" style={{ textDecoration: "underline", color: "#1766ef" }}>
                  https://vpansaksupporthub.lovable.app/submit
                </a>
              </small>
            </div>
          )}

          {tab==="create"&&(
            <div className="support-form">
              <small>SUPPORT REQUEST</small>
              <h2>Create a new ticket</h2>
              <p>Give complete details once. You will receive a Ticket ID for tracking.</p>
              {created&&(
                <div className="ticket-created">
                  <CheckCircle2/>
                  <span>
                    <strong>Ticket created successfully</strong>
                    <b>{created}</b>
                    <small>Save this ID. It is required to track updates.</small>
                  </span>
                  <a href="https://vpansaksupporthub.lovable.app/track" target="_blank" rel="noreferrer" className="btn-primary" style={{ padding: "8px 14px", background: "#1766ef", color: "#fff", borderRadius: 6, fontSize: 12, textDecoration: "none" }}>
                    Track on Support Hub <ExternalLink size={12} />
                  </a>
                </div>
              )}
              <form onSubmit={create}>
                <div>
                  <label>Full name<input name="name" required maxLength={100}/></label>
                  <label>Email<input name="email" type="email" required maxLength={160}/></label>
                  <label>Mobile<input name="mobile" required maxLength={20}/></label>
                  <label>Category<select name="category" required defaultValue=""><option value="" disabled>Select issue</option>{categories.map((c)=><option key={c}>{c}</option>)}</select></label>
                  <label>Order ID (optional)<input name="orderId" value={linkedOrder} onChange={(e)=>setLinkedOrder(e.target.value.toUpperCase())} placeholder="VPO123456" maxLength={9}/></label>
                  <label>Priority<select name="priority"><option>Normal</option><option>High</option><option>Urgent</option></select></label>
                  <label className="wide">Subject<input name="subject" value={supportSubject} onChange={(e)=>setSupportSubject(e.target.value)} required maxLength={160}/></label>
                  <label className="wide">Describe your issue<textarea name="message" required minLength={10} maxLength={2000} placeholder="Tell us what happened, when it happened and what help you need."/></label>
                </div>
                <label className="consent"><input type="checkbox" required/>I confirm these details are correct and contain no OTP, UPI PIN or card PIN.</label>
                <button disabled={busy}>{busy?"Creating…":"Create support ticket"}<Send/></button>
              </form>
            </div>
          )}

          {tab==="track"&&(
            <div className="ticket-tracker">
              <small>TICKET STATUS</small>
              <h2>Track a support ticket</h2>
              <form className="ticket-search" onSubmit={(e)=>{e.preventDefault();track()}}>
                <Search/>
                <input value={trackId} onChange={(e)=>setTrackId(e.target.value.toUpperCase())} placeholder="VPT123456" maxLength={9}/>
                <button disabled={busy}>{busy?"Checking…":"Track"}</button>
              </form>
              {ticket?(
                <div className="ticket-result">
                  <header>
                    <div>
                      <small>TICKET ID</small>
                      <h3>{ticket.ticketId}</h3>
                      <p>{ticket.category} • {new Date(ticket.createdAt).toLocaleString("en-IN")}</p>
                    </div>
                    <span>{ticket.status}</span>
                  </header>
                  <div className="ticket-subject">
                    <strong>{ticket.subject}</strong>
                    <small>Priority: {ticket.priority}</small>
                  </div>
                  <div className="reply-history">
                    {replies.map((r,i)=>(
                      <article className={r.authorType} key={`${r.createdAt}-${i}`}>
                        <span>{r.authorName}</span>
                        <p>{r.message}</p>
                        <small>{new Date(r.createdAt).toLocaleString("en-IN")}</small>
                      </article>
                    ))}
                  </div>
                  {ticket.status!=="Closed"&&(
                    <form className="ticket-reply" onSubmit={reply}>
                      <input name="email" type="email" value={replyEmail} onChange={(e)=>setReplyEmail(e.target.value)} placeholder="Ticket email" required/>
                      <textarea name="message" required minLength={3} placeholder="Add more information or reply to support…"/>
                      <button><Send/>Send reply</button>
                    </form>
                  )}
                </div>
              ):(
                <div className="ticket-empty">
                  <TicketCheck/>
                  <h3>Enter your Ticket ID</h3>
                  <p>Ticket IDs begin with VPT. You can also track live at <a href="https://vpansaksupporthub.lovable.app/track" target="_blank" rel="noreferrer">https://vpansaksupporthub.lovable.app/track</a>.</p>
                </div>
              )}
            </div>
          )}

          {tab==="merchant"&&(
            <div className="merchant-help">
              <small>SELLER &amp; MERCHANT SUPPORT</small>
              <h2>Start selling with confidence.</h2>
              <p>VPANSAK seller onboarding includes registration, document review, KYC verification and approval before products can go live.</p>
              <div>
                {[{n:"01",t:"Register",d:"Submit business, bank and pickup details."},{n:"02",t:"Upload KYC",d:"Aadhaar, PAN, photo and signature are stored securely."},{n:"03",t:"Verification",d:"The admin team reviews submitted information."},{n:"04",t:"Start selling",d:"Approved sellers can manage products and inventory."}].map((s)=>(
                  <article key={s.n}>
                    <b>{s.n}</b>
                    <h3>{s.t}</h3>
                    <p>{s.d}</p>
                  </article>
                ))}
              </div>
              <Link href="/seller">Become a Seller <ChevronRight/></Link>
              <Link className="merchant-dashboard-link" href="/seller/dashboard">Open Seller Dashboard</Link>
              <p className="merchant-contact">
                <CircleHelp/>Need help? Email <a href="mailto:support.vpansak@gmail.com">support.vpansak@gmail.com</a> or visit <a href="https://vpansaksupporthub.lovable.app/" target="_blank" rel="noreferrer">Support Hub</a>.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

