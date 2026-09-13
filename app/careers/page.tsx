"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  Briefcase,
  CheckCircle2,
  ChevronDown,
  Code2,
  Compass,
  Copy,
  Cpu,
  FileText,
  GraduationCap,
  Globe,
  Headphones,
  Heart,
  HelpCircle,
  Layers,
  Lightbulb,
  Lock,
  Mail,
  MapPin,
  Megaphone,
  PackageCheck,
  Phone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Send,
  Upload,
  User,
  Users,
  Wrench,
} from "lucide-react";

export default function CareersPage() {
  const [selectedRole, setSelectedRole] = useState("all");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    mobile: "",
    city: "",
    state: "",
    country: "India",
    interestedRole: "Software Development",
    preferredPosition: "",
    workMode: "Remote",
    qualification: "Undergraduate",
    degreeCourse: "",
    fieldOfStudy: "",
    institution: "",
    graduationYear: "",
    skills: "",
    experienceLevel: "Fresher",
    experienceDetails: "",
    hasProjects: "Yes",
    projectName: "",
    projectDesc: "",
    projectTech: "",
    projectContribution: "",
    projectLink: "",
    linkedinUrl: "",
    githubUrl: "",
    portfolioUrl: "",
    resumeFileRef: "",
    source: "VPANSAK Website",
    sourceOther: "",
    whyVpansak: "",
    careerGoals: "",
    availability: "Immediately",
    interviewAvailability: "Yes",
    expectedCompensation: "",
    referral: "No",
    referralName: "",
    consent: false,
  });

  const [resumeFileName, setResumeFileName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  const roles = [
    {
      id: "dev-web",
      category: "Software Development",
      title: "Frontend / Full-Stack Web Developer",
      type: "Full-Time / Internship",
      mode: "Remote / Hybrid",
      location: "Bareilly / Remote",
      exp: "Fresher – 2 Years",
      skills: ["React", "Next.js", "TypeScript", "Tailwind CSS", "Git"],
      desc: "Help build and maintain responsive frontend web applications and high-performance digital products for VPANSAK.",
    },
    {
      id: "ai-tech",
      category: "AI / Technology",
      title: "AI Tools & Automation Associate",
      type: "Full-Time / Internship",
      mode: "Remote",
      location: "Remote",
      exp: "Fresher – 1 Year",
      skills: ["Python", "AI Prompting", "Web Automation", "API Integration"],
      desc: "Explore AI tools, automate customer support workflows, and build smart digital features for VPANSAK platform.",
    },
    {
      id: "design-ui",
      category: "UI/UX Design",
      title: "UI/UX & Product Designer",
      type: "Full-Time / Part-Time",
      mode: "Remote",
      location: "Remote",
      exp: "Fresher – 3 Years",
      skills: ["Figma", "UI Design", "User Research", "Wireframing", "Prototyping"],
      desc: "Craft beautiful, user-centered shopping web interfaces, design tokens, icons, and interactive visual flows.",
    },
    {
      id: "mktg-digital",
      category: "Digital Marketing",
      title: "Digital Growth & SEO Specialist",
      type: "Full-Time / Internship",
      mode: "Hybrid / Remote",
      location: "Bareilly / Remote",
      exp: "Fresher – 2 Years",
      skills: ["SEO", "Social Media", "Content Strategy", "Google Analytics", "Brand Awareness"],
      desc: "Drive organic search visibility, execute digital marketing campaigns, and build brand awareness for VPANSAK.",
    },
    {
      id: "cust-support",
      category: "Customer Support",
      title: "Customer Experience & Support Executive",
      type: "Full-Time / Shift",
      mode: "Remote / Flexible",
      location: "Bareilly / Remote",
      exp: "Fresher – 1 Year",
      skills: ["Communication", "Problem Solving", "Email & Chat Support", "Customer Care"],
      desc: "Assist customers with order inquiries, tracking, returns, and support tickets via phone, email, and live support portal.",
    },
    {
      id: "ops-biz",
      category: "Business Operations",
      title: "E-Commerce Operations Coordinator",
      type: "Full-Time",
      mode: "On-site / Hybrid",
      location: "Bareilly HQ",
      exp: "Fresher – 2 Years",
      skills: ["Inventory Management", "Logistics Coordination", "Vendor Relations", "Excel"],
      desc: "Manage fulfillment workflows, package dispatching, stock accuracy, and warehouse logistics operations.",
    },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target;
    const name = target.name;
    const value = target.type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg("Resume file size must be under 5 MB.");
      return;
    }

    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|doc|docx)$/i)) {
      setErrorMsg("Please upload a valid PDF, DOC, or DOCX document.");
      return;
    }

    setResumeFileName(file.name);
    setErrorMsg("");

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({
        ...prev,
        resumeFileRef: String(reader.result || file.name),
      }));
    };
    reader.readAsDataURL(file);
  };

  const handleQuickApply = (roleTitle: string, categoryName: string) => {
    setFormData((prev) => ({
      ...prev,
      interestedRole: categoryName,
      preferredPosition: roleTitle,
    }));
    const element = document.getElementById("application-form-section");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    // Form validations
    if (!formData.fullName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    if (!formData.email.trim() || !formData.email.includes("@")) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }
    if (!formData.mobile.trim() || formData.mobile.trim().length < 8) {
      setErrorMsg("Please enter a valid mobile number.");
      return;
    }
    if (!formData.city.trim()) {
      setErrorMsg("Please enter your current city.");
      return;
    }
    if (!formData.interestedRole) {
      setErrorMsg("Please select the role you are interested in.");
      return;
    }
    if (!formData.qualification) {
      setErrorMsg("Please select your highest qualification.");
      return;
    }
    if (!formData.consent) {
      setErrorMsg("Please confirm that the information provided is accurate.");
      return;
    }

    setSubmitting(true);

    try {
      const projectDetailsFormatted =
        formData.hasProjects === "Yes" && formData.projectName
          ? `Project: ${formData.projectName} | Desc: ${formData.projectDesc} | Tech: ${formData.projectTech} | Role: ${formData.projectContribution} | Link: ${formData.projectLink}`
          : "";

      const payload = {
        ...formData,
        projectDetails: projectDetailsFormatted || formData.experienceDetails,
      };

      const res = await fetch("/api/careers/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSubmittedId(data.applicationId);
      } else {
        setErrorMsg(data.error || "Failed to submit application. Please try again.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const copyToClipboard = () => {
    if (!submittedId) return;
    navigator.clipboard.writeText(submittedId);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 3000);
  };

  const filteredRoles =
    selectedRole === "all"
      ? roles
      : roles.filter((r) => r.category.toLowerCase().includes(selectedRole.toLowerCase()));

  return (
    <main className="legal-page" style={{ background: "#0b1329", color: "#ffffff", minHeight: "100vh" }}>
      {/* Global Sub-Header Header */}
      <header className="sub-header" style={{ background: "#070d19", borderColor: "rgba(255, 255, 255, 0.08)" }}>
        <Link className="shop-brand" href="/">
          <img className="brand-logo" src="/vpansak-logo-dark.jpeg" alt="VPANSAK" />
          <span>
            <strong>VPANSAK</strong>
            <small style={{ color: "#38bdf8" }}>CAREERS PORTAL</small>
          </span>
        </Link>
        <nav>
          <Link href="/" style={{ color: "#94a3b8" }}>
            <ArrowLeft size={14} /> Store
          </Link>
          <Link href="/info" style={{ color: "#94a3b8" }}>Info Hub</Link>
          <a href="#open-positions" style={{ color: "#38bdf8", fontWeight: 700 }}>Open Roles</a>
        </nav>
      </header>

      {/* Careers Hero Section */}
      <section
        className="legal-hero"
        style={{
          padding: "70px 20px 60px",
          textAlign: "center",
          background: "radial-gradient(circle at 50% 0, rgba(37, 99, 235, 0.35), transparent 60%), #070d19",
          color: "#ffffff",
        }}
      >
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 14px", borderRadius: 30, background: "rgba(56, 189, 248, 0.12)", border: "1px solid rgba(56, 189, 248, 0.3)", color: "#38bdf8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 20 }}>
          <Sparkles size={15} /> Join Our Growing D2C Brand Team
        </div>
        <h1 style={{ fontSize: "clamp(34px, 5vw, 54px)", fontWeight: 900, letterSpacing: "-0.03em", margin: "0 0 16px", color: "#ffffff" }}>
          Build Your Career With <span style={{ color: "#38bdf8" }}>VPANSAK</span>
        </h1>
        <p style={{ maxWidth: 720, margin: "0 auto 28px", color: "#94a3b8", fontSize: 16, lineHeight: 1.7 }}>
          Join VPANSAK and help us build products, technology, commerce and experiences for the next generation of customers.
        </p>

        <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
          <a
            href="#application-form-section"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              borderRadius: 8,
              background: "#2563eb",
              color: "#ffffff",
              fontWeight: 800,
              fontSize: 14,
              textDecoration: "none",
              boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
            }}
          >
            <Send size={16} /> Apply for a Role
          </a>
          <a
            href="#open-positions"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "14px 28px",
              borderRadius: 8,
              background: "rgba(255, 255, 255, 0.08)",
              border: "1px solid rgba(255, 255, 255, 0.15)",
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 14,
              textDecoration: "none",
            }}
          >
            <Compass size={16} /> Explore Opportunities
          </a>
        </div>
      </section>

      {/* Main Careers Content Container */}
      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "40px 20px 80px" }}>
        {/* Why Join VPANSAK */}
        <section style={{ marginBottom: 60 }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", margin: "0 0 10px" }}>
              Why Join VPANSAK?
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 14, maxWidth: 600, margin: "0 auto" }}>
              We value curiosity, ownership, and practical execution. Here is what you will find working with us:
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: 18,
            }}
          >
            <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <Cpu size={28} style={{ color: "#38bdf8", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Technology</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>Work on modern web technologies, AI tools, and high-performance digital products.</p>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <BookOpen size={28} style={{ color: "#a855f7", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Learning</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>Develop practical hands-on skills while working directly on real-world systems.</p>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <Award size={28} style={{ color: "#22c55e", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Ownership</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>Take responsibility for features, contribute ideas, and see your impact live.</p>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <Rocket size={28} style={{ color: "#f97316", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Growth</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>Build your long-term career path with an expanding technology-driven brand.</p>
            </div>

            <div style={{ background: "rgba(15, 23, 42, 0.7)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 22, borderRadius: 12 }}>
              <Lightbulb size={28} style={{ color: "#eab308", marginBottom: 12 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#ffffff", margin: "0 0 6px" }}>Innovation</h3>
              <p style={{ fontSize: 13, color: "#94a3b8", margin: 0, lineHeight: 1.6 }}>Explore innovative ideas across technology, commerce, and customer experience.</p>
            </div>
          </div>
        </section>

        {/* Open Positions Section */}
        <section id="open-positions" style={{ marginBottom: 60, scrollMarginTop: 80 }}>
          <div style={{ textAlign: "center", marginBottom: 30 }}>
            <h2 style={{ fontSize: 28, fontWeight: 800, color: "#ffffff", margin: "0 0 10px" }}>
              Explore Open Opportunities
            </h2>
            <p style={{ color: "#94a3b8", fontSize: 14, margin: 0 }}>
              Filter roles by department or submit a general application profile below.
            </p>
          </div>

          {/* Department Filter Pills */}
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap", marginBottom: 30 }}>
            {[
              { id: "all", label: "All Departments" },
              { id: "software", label: "Software & Web" },
              { id: "ai", label: "AI & Automation" },
              { id: "design", label: "UI/UX Design" },
              { id: "marketing", label: "Marketing & Growth" },
              { id: "support", label: "Customer Support" },
              { id: "operations", label: "Operations" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: "pointer",
                  border: selectedRole === tab.id ? "1px solid #38bdf8" : "1px solid rgba(255, 255, 255, 0.1)",
                  background: selectedRole === tab.id ? "#1e293b" : "rgba(15, 23, 42, 0.4)",
                  color: selectedRole === tab.id ? "#38bdf8" : "#94a3b8",
                  transition: "all 0.2s",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Role Cards Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 20 }}>
            {filteredRoles.map((role) => (
              <div
                key={role.id}
                style={{
                  background: "rgba(15, 23, 42, 0.8)",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: 12,
                  padding: 24,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                    <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: "0.06em", background: "rgba(56, 189, 248, 0.12)", color: "#38bdf8", padding: "4px 10px", borderRadius: 12, textTransform: "uppercase" }}>
                      {role.category}
                    </span>
                    <span style={{ fontSize: 11, color: "#64748b", display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <MapPin size={12} /> {role.location}
                    </span>
                  </div>

                  <h3 style={{ fontSize: 17, fontWeight: 800, color: "#ffffff", margin: "0 0 8px" }}>
                    {role.title}
                  </h3>
                  <p style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.6, margin: "0 0 16px" }}>
                    {role.desc}
                  </p>

                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 20 }}>
                    {role.skills.map((skill) => (
                      <span key={skill} style={{ fontSize: 11, color: "#cbd5e1", background: "rgba(255, 255, 255, 0.05)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "2px 8px", borderRadius: 6 }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div style={{ paddingTop: 16, borderTop: "1px solid rgba(255, 255, 255, 0.08)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: 12, color: "#64748b" }}>
                    <strong>{role.type}</strong> • {role.exp}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleQuickApply(role.title, role.category)}
                    style={{
                      padding: "8px 16px",
                      borderRadius: 6,
                      background: "#2563eb",
                      color: "#ffffff",
                      fontSize: 12,
                      fontWeight: 800,
                      border: 0,
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 4,
                    }}
                  >
                    Apply Now <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* General Profile Banner */}
          <div
            style={{
              marginTop: 28,
              padding: 24,
              borderRadius: 12,
              background: "linear-gradient(135deg, rgba(30, 41, 59, 0.9) 0%, rgba(15, 23, 42, 0.9) 100%)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 16,
            }}
          >
            <div>
              <h4 style={{ margin: "0 0 4px", fontSize: 16, fontWeight: 800, color: "#ffffff" }}>
                Don't see your specific role listed?
              </h4>
              <p style={{ margin: 0, fontSize: 13, color: "#94a3b8" }}>
                Submit a general candidate profile. We continuously review profiles for upcoming positions across technology, operations, design, and marketing.
              </p>
            </div>
            <a
              href="#application-form-section"
              style={{
                padding: "10px 20px",
                borderRadius: 8,
                background: "rgba(56, 189, 248, 0.15)",
                border: "1px solid rgba(56, 189, 248, 0.4)",
                color: "#38bdf8",
                fontWeight: 800,
                fontSize: 13,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Submit Profile <ArrowRight size={14} style={{ marginLeft: 4 }} />
            </a>
          </div>
        </section>

        {/* Job Application Form Section */}
        <section id="application-form-section" style={{ scrollMarginTop: 80 }}>
          <div
            style={{
              background: "#0f172a",
              border: "1px solid rgba(255, 255, 255, 0.12)",
              borderRadius: 16,
              padding: "36px 28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.4)",
            }}
          >
            {submittedId ? (
              /* Success Confirmation Card */
              <div style={{ textAlign: "center", padding: "40px 20px" }}>
                <div style={{ width: 70, height: 70, borderRadius: "50%", background: "rgba(34, 197, 94, 0.15)", border: "2px solid #22c55e", color: "#22c55e", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                  <CheckCircle2 size={38} />
                </div>
                <h2 style={{ fontSize: 26, fontWeight: 900, color: "#ffffff", margin: "0 0 10px" }}>
                  Application Submitted Successfully!
                </h2>
                <p style={{ fontSize: 15, color: "#94a3b8", maxWidth: 600, margin: "0 auto 24px", lineHeight: 1.6 }}>
                  Thank you for your interest in joining VPANSAK. Our talent review team will evaluate your profile and contact you if an opportunity matches your skill set.
                </p>

                <div
                  style={{
                    background: "rgba(15, 23, 42, 0.9)",
                    border: "1px solid rgba(56, 189, 248, 0.3)",
                    padding: 20,
                    borderRadius: 12,
                    display: "inline-block",
                    marginBottom: 30,
                  }}
                >
                  <span style={{ fontSize: 12, color: "#64748b", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 6, fontWeight: 800 }}>
                    YOUR APPLICATION REFERENCE ID
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, justifyContent: "center" }}>
                    <code style={{ fontSize: 20, fontWeight: 900, color: "#38bdf8", letterSpacing: "0.05em" }}>
                      {submittedId}
                    </code>
                    <button
                      type="button"
                      onClick={copyToClipboard}
                      style={{
                        padding: "6px 12px",
                        borderRadius: 6,
                        background: copiedId ? "#16a34a" : "#1e293b",
                        color: "#ffffff",
                        border: "1px solid rgba(255, 255, 255, 0.15)",
                        cursor: "pointer",
                        fontSize: 12,
                        fontWeight: 700,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      {copiedId ? <CheckCircle2 size={14} /> : <Copy size={14} />}
                      {copiedId ? "Copied" : "Copy ID"}
                    </button>
                  </div>
                </div>

                <div>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedId(null);
                      setFormData((prev) => ({ ...prev, fullName: "", email: "", mobile: "", city: "" }));
                    }}
                    style={{
                      padding: "12px 24px",
                      borderRadius: 8,
                      background: "#2563eb",
                      color: "#ffffff",
                      fontWeight: 800,
                      border: 0,
                      cursor: "pointer",
                    }}
                  >
                    Submit Another Application
                  </button>
                </div>
              </div>
            ) : (
              /* Application Form */
              <form onSubmit={handleSubmit}>
                <div style={{ borderBottom: "1px solid rgba(255, 255, 255, 0.08)", paddingBottom: 20, marginBottom: 30 }}>
                  <span style={{ color: "#38bdf8", fontSize: 12, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                    CANDIDATE APPLICATION FORM
                  </span>
                  <h2 style={{ fontSize: 24, fontWeight: 800, color: "#ffffff", margin: "6px 0 6px" }}>
                    Apply for a Role at VPANSAK
                  </h2>
                  <p style={{ fontSize: 13, color: "#94a3b8", margin: 0 }}>
                    Please fill out the details accurately. Fields marked with an asterisk (*) are required.
                  </p>
                </div>

                {errorMsg && (
                  <div
                    style={{
                      padding: "14px 18px",
                      borderRadius: 8,
                      background: "rgba(239, 68, 68, 0.15)",
                      border: "1px solid rgba(239, 68, 68, 0.4)",
                      color: "#fca5a5",
                      fontSize: 13,
                      marginBottom: 24,
                    }}
                  >
                    ⚠️ {errorMsg}
                  </div>
                )}

                {/* SECTION 1: BASIC INFORMATION */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    1. Basic Information
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        placeholder="e.g. Alok Singh"
                        required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="e.g. name@example.com"
                        required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Mobile Number *
                      </label>
                      <input
                        type="tel"
                        name="mobile"
                        value={formData.mobile}
                        onChange={handleInputChange}
                        placeholder="e.g. +91 9876543210"
                        required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Current City *
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleInputChange}
                        placeholder="e.g. Bareilly / New Delhi"
                        required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        State / Region
                      </label>
                      <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleInputChange}
                        placeholder="e.g. Uttar Pradesh"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Country
                      </label>
                      <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        placeholder="India"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 2: ROLE INFORMATION */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    2. Role Preferences
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Which role category interests you? *
                      </label>
                      <select
                        name="interestedRole"
                        value={formData.interestedRole}
                        onChange={handleInputChange}
                        required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="Software Development">Software / Web Development</option>
                        <option value="AI / Technology">AI / Machine Learning</option>
                        <option value="UI/UX Design">UI/UX Design</option>
                        <option value="Digital Marketing">Digital Marketing & SEO</option>
                        <option value="Content / Social Media">Content & Social Media</option>
                        <option value="Customer Support">Customer Support</option>
                        <option value="Business Operations">Business Operations</option>
                        <option value="Product / Project Management">Product / Project Management</option>
                        <option value="Internship">Internship (Any Area)</option>
                        <option value="Other">Other Category</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Preferred Specific Title
                      </label>
                      <input
                        type="text"
                        name="preferredPosition"
                        value={formData.preferredPosition}
                        onChange={handleInputChange}
                        placeholder="e.g. Frontend Developer / React Intern"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Preferred Work Mode
                      </label>
                      <select
                        name="workMode"
                        value={formData.workMode}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="Remote">Remote</option>
                        <option value="Hybrid">Hybrid</option>
                        <option value="On-site">On-site (Bareilly HQ)</option>
                        <option value="Flexible">Flexible</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* SECTION 3: EDUCATION */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    3. Educational Background
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Highest Qualification *
                      </label>
                      <select
                        name="qualification"
                        value={formData.qualification}
                        onChange={handleInputChange}
                        required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="Class 10">Class 10</option>
                        <option value="Class 12">Class 12</option>
                        <option value="Diploma">Diploma</option>
                        <option value="Undergraduate">Undergraduate (B.Tech, B.Sc, BCA, BBA, B.Com, etc.)</option>
                        <option value="Postgraduate">Postgraduate (M.Tech, M.Sc, MCA, MBA, etc.)</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Degree / Course
                      </label>
                      <input
                        type="text"
                        name="degreeCourse"
                        value={formData.degreeCourse}
                        onChange={handleInputChange}
                        placeholder="e.g. B.Tech / BCA / B.Sc"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Field of Study / Specialization
                      </label>
                      <input
                        type="text"
                        name="fieldOfStudy"
                        value={formData.fieldOfStudy}
                        onChange={handleInputChange}
                        placeholder="e.g. Computer Science / IT / Commerce"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        College / University / Institution
                      </label>
                      <input
                        type="text"
                        name="institution"
                        value={formData.institution}
                        onChange={handleInputChange}
                        placeholder="e.g. AKTU / MJP Rohilkhand University"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Graduation Year / Expected Year
                      </label>
                      <input
                        type="text"
                        name="graduationYear"
                        value={formData.graduationYear}
                        onChange={handleInputChange}
                        placeholder="e.g. 2025 / 2026"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 4: SKILLS */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    4. Key Skills
                  </h3>
                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                      Your Key Skills (Separate with commas)
                    </label>
                    <input
                      type="text"
                      name="skills"
                      value={formData.skills}
                      onChange={handleInputChange}
                      placeholder="e.g. HTML, CSS, JavaScript, React, Next.js, Node.js, Python, Git, Figma, SEO"
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                    />
                    <small style={{ display: "block", marginTop: 6, color: "#64748b", fontSize: 12 }}>
                      Mention both technical and soft skills relevant to your interested role.
                    </small>
                  </div>
                </div>

                {/* SECTION 5: EXPERIENCE & PROJECTS */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    5. Experience & Projects
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Experience Level *
                      </label>
                      <select
                        name="experienceLevel"
                        value={formData.experienceLevel}
                        onChange={handleInputChange}
                        required
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="Fresher">Fresher (No formal work experience)</option>
                        <option value="Student">Student (Currently studying)</option>
                        <option value="Internship experience">Internship Experience</option>
                        <option value="Less than 1 year">Less than 1 year</option>
                        <option value="1-2 years">1 – 2 years</option>
                        <option value="2-5 years">2 – 5 years</option>
                        <option value="5+ years">5+ years</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Have you built/worked on projects?
                      </label>
                      <select
                        name="hasProjects"
                        value={formData.hasProjects}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="Yes">Yes, I have project work</option>
                        <option value="No">No project work yet</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                      Tell us about your experience / background
                    </label>
                    <textarea
                      name="experienceDetails"
                      rows={3}
                      value={formData.experienceDetails}
                      onChange={handleInputChange}
                      placeholder="Briefly describe your previous work, internship, college activities or relevant practice..."
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14, resize: "vertical" }}
                    />
                  </div>

                  {formData.hasProjects === "Yes" && (
                    <div style={{ background: "rgba(30, 41, 59, 0.5)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: 18, borderRadius: 10 }}>
                      <h4 style={{ margin: "0 0 12px", fontSize: 14, fontWeight: 700, color: "#38bdf8" }}>
                        Best Project Highlight
                      </h4>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 14 }}>
                        <input
                          type="text"
                          name="projectName"
                          value={formData.projectName}
                          onChange={handleInputChange}
                          placeholder="Project Name (e.g. E-Commerce Web App)"
                          style={{ padding: "10px 12px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#ffffff", fontSize: 13 }}
                        />
                        <input
                          type="text"
                          name="projectTech"
                          value={formData.projectTech}
                          onChange={handleInputChange}
                          placeholder="Technologies Used (e.g. React, Next.js, Node)"
                          style={{ padding: "10px 12px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#ffffff", fontSize: 13 }}
                        />
                        <input
                          type="text"
                          name="projectContribution"
                          value={formData.projectContribution}
                          onChange={handleInputChange}
                          placeholder="Your Contribution / Role"
                          style={{ padding: "10px 12px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#ffffff", fontSize: 13 }}
                        />
                        <input
                          type="url"
                          name="projectLink"
                          value={formData.projectLink}
                          onChange={handleInputChange}
                          placeholder="Project / Demo / GitHub URL (optional)"
                          style={{ padding: "10px 12px", borderRadius: 6, background: "#0f172a", border: "1px solid #334155", color: "#ffffff", fontSize: 13 }}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SECTION 6: PROFESSIONAL LINKS */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    6. Professional Profiles & Portfolio (Optional)
                  </h3>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        LinkedIn Profile URL
                      </label>
                      <input
                        type="url"
                        name="linkedinUrl"
                        value={formData.linkedinUrl}
                        onChange={handleInputChange}
                        placeholder="https://linkedin.com/in/username"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        GitHub Profile URL
                      </label>
                      <input
                        type="url"
                        name="githubUrl"
                        value={formData.githubUrl}
                        onChange={handleInputChange}
                        placeholder="https://github.com/username"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Portfolio / Personal Website URL
                      </label>
                      <input
                        type="url"
                        name="portfolioUrl"
                        value={formData.portfolioUrl}
                        onChange={handleInputChange}
                        placeholder="https://yourportfolio.com"
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      />
                    </div>
                  </div>
                </div>

                {/* SECTION 7: RESUME UPLOAD */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    7. Resume / CV Upload (Optional for early profiles)
                  </h3>
                  <div
                    style={{
                      border: "2px dashed #334155",
                      borderRadius: 10,
                      padding: 24,
                      textAlign: "center",
                      background: "rgba(30, 41, 59, 0.4)",
                    }}
                  >
                    <Upload size={32} style={{ color: "#38bdf8", marginBottom: 10 }} />
                    <p style={{ margin: "0 0 6px", fontSize: 14, color: "#ffffff", fontWeight: 700 }}>
                      Upload your Resume / CV (PDF, DOC, DOCX)
                    </p>
                    <p style={{ margin: "0 0 14px", fontSize: 12, color: "#64748b" }}>
                      Max file size: 5 MB. Do not attach passwords or sensitive ID cards.
                    </p>

                    <label
                      style={{
                        padding: "9px 20px",
                        borderRadius: 6,
                        background: "#1e293b",
                        border: "1px solid #38bdf8",
                        color: "#38bdf8",
                        fontSize: 13,
                        fontWeight: 700,
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 6,
                      }}
                    >
                      <FileText size={15} /> Select Resume File
                      <input type="file" accept=".pdf,.doc,.docx" onChange={handleFileUpload} style={{ display: "none" }} />
                    </label>

                    {resumeFileName && (
                      <div style={{ marginTop: 12, fontSize: 13, color: "#22c55e", fontWeight: 700 }}>
                        ✓ Selected: {resumeFileName}
                      </div>
                    )}
                  </div>
                </div>

                {/* SECTION 8: ADDITIONAL DETAILS */}
                <div style={{ marginBottom: 32 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 800, color: "#38bdf8", borderBottom: "1px solid rgba(56, 189, 248, 0.2)", paddingBottom: 8, marginBottom: 18 }}>
                    8. Additional Details
                  </h3>

                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 18, marginBottom: 18 }}>
                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        How did you hear about VPANSAK?
                      </label>
                      <select
                        name="source"
                        value={formData.source}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="VPANSAK Website">VPANSAK Website</option>
                        <option value="Google Search">Google Search</option>
                        <option value="Instagram">Instagram</option>
                        <option value="X">X (Twitter)</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="YouTube">YouTube</option>
                        <option value="Friend / Referral">Friend / Referral</option>
                        <option value="College / University">College / University</option>
                        <option value="Online Community">Online Community</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    {formData.source === "Other" && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                          Specify Source
                        </label>
                        <input
                          type="text"
                          name="sourceOther"
                          value={formData.sourceOther}
                          onChange={handleInputChange}
                          placeholder="Please specify"
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                        />
                      </div>
                    )}

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        When can you start?
                      </label>
                      <select
                        name="availability"
                        value={formData.availability}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="Immediately">Immediately</option>
                        <option value="Within 2 weeks">Within 2 weeks</option>
                        <option value="Within 1 month">Within 1 month</option>
                        <option value="1-3 months">1 – 3 months</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Available for online/telephonic interview?
                      </label>
                      <select
                        name="interviewAvailability"
                        value={formData.interviewAvailability}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="Yes">Yes</option>
                        <option value="No">No</option>
                      </select>
                    </div>

                    <div>
                      <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                        Referred by someone at VPANSAK?
                      </label>
                      <select
                        name="referral"
                        value={formData.referral}
                        onChange={handleInputChange}
                        style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                      >
                        <option value="No">No</option>
                        <option value="Yes">Yes</option>
                      </select>
                    </div>

                    {formData.referral === "Yes" && (
                      <div>
                        <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                          Referral Person Name
                        </label>
                        <input
                          type="text"
                          name="referralName"
                          value={formData.referralName}
                          onChange={handleInputChange}
                          placeholder="Name of VPANSAK team member"
                          style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14 }}
                        />
                      </div>
                    )}
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                      Why do you want to join VPANSAK?
                    </label>
                    <textarea
                      name="whyVpansak"
                      rows={3}
                      value={formData.whyVpansak}
                      onChange={handleInputChange}
                      placeholder="Tell us what interests you about VPANSAK and how you think you could contribute..."
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14, resize: "vertical" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontSize: 13, fontWeight: 700, marginBottom: 6, color: "#cbd5e1" }}>
                      What are you looking to learn or achieve in your next role?
                    </label>
                    <textarea
                      name="careerGoals"
                      rows={3}
                      value={formData.careerGoals}
                      onChange={handleInputChange}
                      placeholder="Tell us about your learning goals and career aspirations..."
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 8, background: "#1e293b", border: "1px solid #334155", color: "#ffffff", fontSize: 14, resize: "vertical" }}
                    />
                  </div>
                </div>

                {/* SECTION 9: DECLARATION & CONSENT */}
                <div style={{ padding: 18, borderRadius: 10, background: "rgba(30, 41, 59, 0.4)", border: "1px solid rgba(255, 255, 255, 0.08)", marginBottom: 28 }}>
                  <label style={{ display: "flex", alignItems: "flex-start", gap: 10, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      name="consent"
                      checked={formData.consent}
                      onChange={handleInputChange}
                      style={{ marginTop: 3, width: 16, height: 16, accentColor: "#2563eb" }}
                    />
                    <span style={{ fontSize: 13, color: "#cbd5e1", lineHeight: 1.5 }}>
                      I confirm that the information provided by me is accurate to the best of my knowledge. I understand that application data will be processed solely by VPANSAK talent evaluation team for recruitment purposes.
                    </span>
                  </label>
                </div>

                {/* SUBMIT BUTTON */}
                <div style={{ textAlign: "right" }}>
                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "14px 32px",
                      borderRadius: 8,
                      background: submitting ? "#64748b" : "#2563eb",
                      color: "#ffffff",
                      fontSize: 15,
                      fontWeight: 800,
                      border: 0,
                      cursor: submitting ? "not-allowed" : "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      boxShadow: "0 10px 25px -5px rgba(37, 99, 235, 0.4)",
                    }}
                  >
                    {submitting ? (
                      <>
                        <Sparkles size={16} className="animate-spin" /> Submitting...
                      </>
                    ) : (
                      <>
                        <Send size={16} /> Submit Application
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255, 255, 255, 0.08)", padding: "30px 20px", textAlign: "center", background: "#070d19", color: "#64748b", fontSize: 13 }}>
        <p style={{ margin: "0 0 8px" }}>
          © {new Date().getFullYear()} VPANSAK Shopping & Technology initiatives. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap", fontSize: 12 }}>
          <Link href="/info/about" style={{ color: "#94a3b8" }}>About HQ</Link>
          <Link href="/policies/privacy-policy" style={{ color: "#94a3b8" }}>Privacy Policy</Link>
          <Link href="/policies/terms-and-conditions" style={{ color: "#94a3b8" }}>Terms & Conditions</Link>
          <Link href="/careers" style={{ color: "#38bdf8", fontWeight: 700 }}>Careers Portal</Link>
        </div>
      </footer>
    </main>
  );
}
