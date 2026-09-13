import { eq, desc } from "drizzle-orm";
import { getDb } from "../../../../db";
import { careerApplications } from "../../../../db/schema";
import { supabase } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = String(searchParams.get("email") || "").trim().toLowerCase();

  if (!email || !email.includes("@")) {
    return Response.json({ active: false });
  }

  try {
    const db = await getDb();
    const records = await db
      .select()
      .from(careerApplications)
      .where(eq(careerApplications.email, email))
      .orderBy(desc(careerApplications.createdAt))
      .limit(1);

    if (records && records.length > 0) {
      const latest = records[0];
      const isRejected = latest.status === "Rejected";

      return Response.json({
        active: !isRejected,
        applicationId: latest.applicationId,
        status: latest.status || "New",
        isRejected,
        createdAt: latest.createdAt,
        interestedRole: latest.interestedRole,
      });
    }

    // Also check Supabase if DB returns empty
    if (supabase) {
      const { data } = await supabase
        .from("career_applications")
        .select("*")
        .eq("email", email)
        .order("created_at", { ascending: false })
        .limit(1);

      if (data && data.length > 0) {
        const latest = data[0];
        const isRejected = latest.status === "Rejected";
        return Response.json({
          active: !isRejected,
          applicationId: latest.application_id || latest.applicationId,
          status: latest.status || "New",
          isRejected,
          createdAt: latest.created_at || latest.createdAt,
          interestedRole: latest.interested_role || latest.interestedRole,
        });
      }
    }

    return Response.json({ active: false });
  } catch (error) {
    return Response.json({ active: false });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const rawMobile = String(body.mobile || "").trim();
    const mobile = rawMobile.replace(/\D/g, "").slice(-10);

    const city = String(body.city || "").trim();
    const state = String(body.state || "").trim();
    const country = String(body.country || "India").trim();

    const interestedRole = String(body.interestedRole || "").trim();
    const preferredPosition = String(body.preferredPosition || "").trim();
    const workMode = String(body.workMode || "Remote").trim();

    const qualification = String(body.qualification || "").trim();
    const degreeCourse = String(body.degreeCourse || "").trim();
    const fieldOfStudy = String(body.fieldOfStudy || "").trim();
    const institution = String(body.institution || "").trim();
    const graduationYear = String(body.graduationYear || "").trim();

    const skills = Array.isArray(body.skills)
      ? body.skills.join(", ")
      : String(body.skills || "").trim();

    const experienceLevel = String(body.experienceLevel || "").trim();
    const experienceDetails = String(body.experienceDetails || "").trim();
    const projectDetails = String(body.projectDetails || "").trim();

    const linkedinUrl = String(body.linkedinUrl || "").trim();
    const githubUrl = String(body.githubUrl || "").trim();
    const portfolioUrl = String(body.portfolioUrl || "").trim();
    let resumeFileRef = String(body.resumeFileRef || "").trim();

    // Cap resume base64 payload to 500KB to prevent payload overflow
    if (resumeFileRef.length > 500000) {
      resumeFileRef = resumeFileRef.slice(0, 500000);
    }

    const source = String(body.source || "VPANSAK Website").trim();
    const sourceOther = String(body.sourceOther || "").trim();
    const whyVpansak = String(body.whyVpansak || "").trim();
    const careerGoals = String(body.careerGoals || "").trim();

    const availability = String(body.availability || "Immediately").trim();
    const interviewAvailability = String(body.interviewAvailability || "Yes").trim();
    const expectedCompensation = String(body.expectedCompensation || "").trim();
    const referral = String(body.referral || "No").trim();
    const referralName = String(body.referralName || "").trim();
    const consent = Boolean(body.consent);

    // Strict Mandatory Fields Validation
    if (!fullName) {
      return Response.json({ error: "Full Name is required. Please enter your full name." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Valid Email Address is required. Please enter your email." }, { status: 400 });
    }
    if (!mobile || mobile.length !== 10) {
      return Response.json({ error: "Valid 10-digit Mobile Number is required." }, { status: 400 });
    }
    if (!city) {
      return Response.json({ error: "Current City is required. Please enter your city." }, { status: 400 });
    }
    if (!state) {
      return Response.json({ error: "State / Region is required. Please enter your state." }, { status: 400 });
    }
    if (!interestedRole) {
      return Response.json({ error: "Role Category selection is required." }, { status: 400 });
    }
    if (!preferredPosition) {
      return Response.json({ error: "Preferred Position / Job Title is required." }, { status: 400 });
    }
    if (!qualification) {
      return Response.json({ error: "Highest Qualification selection is required." }, { status: 400 });
    }
    if (!degreeCourse) {
      return Response.json({ error: "Degree / Course name is required." }, { status: 400 });
    }
    if (!fieldOfStudy) {
      return Response.json({ error: "Field of Study / Specialization is required." }, { status: 400 });
    }
    if (!institution) {
      return Response.json({ error: "College / Institution name is required." }, { status: 400 });
    }
    if (!graduationYear) {
      return Response.json({ error: "Graduation Year is required." }, { status: 400 });
    }
    if (!skills) {
      return Response.json({ error: "Key Skills are required. Please list your main skills." }, { status: 400 });
    }
    if (!experienceLevel) {
      return Response.json({ error: "Experience Level selection is required." }, { status: 400 });
    }
    if (!experienceDetails) {
      return Response.json({ error: "Experience / Background summary details are required." }, { status: 400 });
    }
    if (!whyVpansak) {
      return Response.json({ error: "Please answer: 'Why do you want to join VPANSAK?'" }, { status: 400 });
    }
    if (!careerGoals) {
      return Response.json({ error: "Please answer: 'What are you looking to learn/achieve in your next role?'" }, { status: 400 });
    }
    if (!consent) {
      return Response.json({ error: "You must confirm that the information provided is true and accurate." }, { status: 400 });
    }

    const db = await getDb();

    // Check for existing active application for this email
    const existingRecords = await db
      .select()
      .from(careerApplications)
      .where(eq(careerApplications.email, email))
      .orderBy(desc(careerApplications.createdAt))
      .limit(1);

    if (existingRecords && existingRecords.length > 0) {
      const activeApp = existingRecords[0];
      // If status is NOT "Rejected", prevent duplicate submission
      if (activeApp.status !== "Rejected") {
        return Response.json(
          {
            activeApplication: true,
            status: activeApp.status || "Under Review",
            applicationId: activeApp.applicationId,
            error: `A application for this email (Tracking Code: ${activeApp.applicationId}) is already in processing (Status: ${activeApp.status || "New"}). Re-application is allowed only if your previous application is rejected.`,
          },
          { status: 400 }
        );
      }
    }

    const applicationId = `VPC-CAREER-${Math.floor(100000 + Math.random() * 900000)}`;

    const newRecord = {
      applicationId,
      fullName,
      email,
      mobile,
      city,
      state,
      country,
      interestedRole,
      preferredPosition,
      workMode,
      qualification,
      degreeCourse,
      fieldOfStudy,
      institution,
      graduationYear,
      skills,
      experienceLevel,
      experienceDetails,
      projectDetails,
      linkedinUrl,
      githubUrl,
      portfolioUrl,
      resumeFileRef,
      source,
      sourceOther,
      whyVpansak,
      careerGoals,
      availability,
      interviewAvailability,
      expectedCompensation,
      referral,
      referralName,
      consent,
      status: "New",
      adminNotes: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.insert(careerApplications).values(newRecord);

    // Sync to Supabase cloud database if configured
    if (supabase) {
      try {
        await supabase.from("career_applications").insert([
          {
            application_id: applicationId,
            full_name: fullName,
            email,
            mobile,
            city,
            state,
            country,
            interested_role: interestedRole,
            preferred_position: preferredPosition,
            work_mode: workMode,
            qualification,
            degree_course: degreeCourse,
            field_of_study: fieldOfStudy,
            institution,
            graduation_year: graduationYear,
            skills,
            experience_level: experienceLevel,
            experience_details: experienceDetails,
            project_details: projectDetails,
            linkedin_url: linkedinUrl,
            github_url: githubUrl,
            portfolio_url: portfolioUrl,
            resume_file_ref: resumeFileRef,
            source,
            source_other: sourceOther,
            why_vpansak: whyVpansak,
            career_goals: careerGoals,
            availability,
            interview_availability: interviewAvailability,
            expected_compensation: expectedCompensation,
            referral,
            referral_name: referralName,
            consent: consent ? 1 : 0,
            status: "New",
            created_at: new Date().toISOString(),
          },
        ]);
      } catch (err) {
        console.error("Supabase sync notice for career application:", err);
      }
    }

    return Response.json({
      success: true,
      applicationId,
      message: "Application submitted successfully. Thank you for your interest in VPANSAK!",
    });
  } catch (error: any) {
    console.error("Error submitting career application:", error);
    return Response.json(
      { error: "Failed to submit career application. Please ensure all fields are filled out correctly." },
      { status: 500 }
    );
  }
}
