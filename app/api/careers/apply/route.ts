import { getDb } from "../../../../db";
import { careerApplications } from "../../../../db/schema";
import { supabase } from "../../../lib/supabase";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const fullName = String(body.fullName || "").trim();
    const email = String(body.email || "").trim().toLowerCase();
    const mobile = String(body.mobile || "").trim();
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
    const resumeFileRef = String(body.resumeFileRef || "").trim();

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

    // Validation
    if (!fullName) {
      return Response.json({ error: "Please enter your full name." }, { status: 400 });
    }
    if (!email || !email.includes("@")) {
      return Response.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    if (!mobile || mobile.length < 8) {
      return Response.json({ error: "Please enter a valid mobile number." }, { status: 400 });
    }
    if (!city) {
      return Response.json({ error: "Please enter your current city." }, { status: 400 });
    }
    if (!interestedRole) {
      return Response.json({ error: "Please select the role you are interested in." }, { status: 400 });
    }
    if (!qualification) {
      return Response.json({ error: "Please select your highest qualification." }, { status: 400 });
    }
    if (!experienceLevel) {
      return Response.json({ error: "Please select your experience level." }, { status: 400 });
    }
    if (!consent) {
      return Response.json({ error: "Please confirm that the provided information is accurate." }, { status: 400 });
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

    const db = await getDb();
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
      { error: "Failed to submit career application. Please try again." },
      { status: 500 }
    );
  }
}
