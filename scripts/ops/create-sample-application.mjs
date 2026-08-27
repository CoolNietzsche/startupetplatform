// Usage: node create-sample-application.mjs <startupName> <ownerEmail> [password]
// Creates (or reuses) an owner user account, then creates a sample startup
// Application under it with plausible demo data plus one Founder record.
// Intended for demoing/testing the review pipeline - not real applicant data.
import { prisma } from "./_db.mjs";
import bcrypt from "bcryptjs";

const [startupName, ownerEmail, password = "Startup@ET"] = process.argv.slice(2);

if (!startupName || !ownerEmail) {
  console.error("Usage: node create-sample-application.mjs <startupName> <ownerEmail> [password]");
  process.exit(1);
}

let user = await prisma.user.findUnique({ where: { email: ownerEmail } });
if (!user) {
  const hashed = await bcrypt.hash(password, 10);
  const [firstName, ...rest] = startupName.split(" ");
  user = await prisma.user.create({
    data: {
      email: ownerEmail,
      password: hashed,
      firstName: firstName || "Sample",
      lastName: rest.join(" ") || "Founder",
      role: "USER",
      emailVerified: true,
      onboardingCompleted: true,
    },
  });
  console.log(`Created owner user: ${user.email} (password: ${password})`);
} else {
  console.log(`Reusing existing owner user: ${user.email}`);
}

const application = await prisma.application.create({
  data: {
    userId: user.id,
    status: "PENDING",
    startupName,
    numberOfEmployees: 8,
    numberOfFounders: 1,
    foundingDate: new Date("2024-01-15"),
    industry: "Software / SaaS",
    website: `https://${startupName.toLowerCase().replace(/\s+/g, "")}.com`,
    phoneNumber: "+251911000000",
    email: ownerEmail,
    typeOfCompany: "Private Limited Company (PLC)",
    tin: "0000000000",
    vision: `To become Ethiopia's leading platform in our space.`,
    mission: `Building high-quality software solutions for the Ethiopian market.`,
    productDescription: `${startupName} builds software tools for local businesses.`,
    uniqueValueProposition: "Locally built, locally supported, built for Ethiopian business workflows.",
    problemStatement: "Local businesses lack access to affordable, well-supported software tooling.",
    solution: "A suite of SaaS products tailored to the Ethiopian market.",
    innovationDescription: "Applies modern software practices to underserved local business processes.",
    targetMarket: "Small and medium Ethiopian businesses.",
    competitiveAdvantage: "Local market knowledge and direct customer support.",
    scalabilityPlan: "Expand product line and scale customer support team regionally.",
    traction: "Early pilot customers onboarded, positive feedback.",
    revenue: "Pre-revenue / early revenue",
    totalFundingRaised: "0",
    investmentNeeded: "50000",
    useOfFunds: "Product development and hiring.",
    reason: "Sample application created for demo/testing purposes.",
    type: "INITIAL",
  },
});

await prisma.founder.create({
  data: {
    applicationId: application.id,
    fullName: `${user.firstName} ${user.lastName}`,
    email: ownerEmail,
    role: "Founder & CEO",
    noOfShares: 1000,
  },
});

console.log(`Created application: ${application.id} for "${startupName}" (status: ${application.status})`);

await prisma.$disconnect();
