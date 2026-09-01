import { PrismaClient } from "@prisma/client";
import type {
  IssueCategory,
  IssueSeverity,
  IssueStatus,
  ContactStatus,
  CanvassStatus,
  ConsentStatus,
  DonorTier,
  PledgeStatus,
  CampaignPillar,
  TaskStatus,
  ReadinessStatus,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import { randomUUID as cryptoRandomUUID } from "node:crypto";

import { ROLE_DEFINITIONS } from "../src/lib/roles";
import { CONSTITUENCIES, TOTAL_REGISTERED_ELECTORS, VILLAGE_NAMES } from "./seed-data/geo";
import {
  MALE_FIRST_NAMES,
  FEMALE_FIRST_NAMES,
  LAST_NAMES,
  OCCUPATIONS,
  STREET_SUFFIXES,
  ISSUE_TITLES,
} from "./seed-data/names";

const prisma = new PrismaClient();

/** Plain-`string` wrapper — avoids the branded UUID template-literal type
 * that `crypto.randomUUID()` returns leaking into every id field's inferred type. */
function uuid(): string {
  return cryptoRandomUUID();
}

// ---------------------------------------------------------------------------
// Deterministic RNG so the demo dataset is reproducible across seed runs.
// ---------------------------------------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rand = mulberry32(42);

function randInt(min: number, max: number) {
  return Math.floor(rand() * (max - min + 1)) + min;
}
function pick<T>(arr: readonly T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function weightedPick<T>(items: [T, number][]): T {
  const total = items.reduce((s, [, w]) => s + w, 0);
  let r = rand() * total;
  for (const [value, weight] of items) {
    if (r < weight) return value;
    r -= weight;
  }
  return items[items.length - 1][0];
}
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = randInt(0, i);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
/** Largest-remainder method: integers proportional to weights, summing exactly to total. */
function distributeInt(total: number, weights: number[]): number[] {
  const sumW = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (total * w) / sumW);
  const floors = raw.map(Math.floor);
  let remainder = total - floors.reduce((a, b) => a + b, 0);
  const order = raw
    .map((v, i) => ({ i, frac: v - Math.floor(v) }))
    .sort((a, b) => b.frac - a.frac);
  const result = [...floors];
  for (let k = 0; k < remainder; k++) result[order[k % order.length].i] += 1;
  return result;
}
function randomDateBetween(start: Date, end: Date) {
  return new Date(start.getTime() + rand() * (end.getTime() - start.getTime()));
}
function slug(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.|\.$/g, "");
}

const CAMPAIGN_START = new Date("2026-02-01T00:00:00Z");
const CAMPAIGN_NOW = new Date("2026-08-30T00:00:00Z");
const DEMO_PASSWORD = "NdcDemo2026!";

function ageBandOf(age: number) {
  if (age < 25) return "18-24";
  if (age < 35) return "25-34";
  if (age < 45) return "35-44";
  if (age < 55) return "45-54";
  if (age < 65) return "55-64";
  if (age < 75) return "65-74";
  return "75+";
}

async function main() {
  console.log("Resetting database…");
  const tableNames = [
    "data_lineage",
    "suppression_records",
    "consent_records",
    "data_sources",
    "saved_segments",
    "saved_queries",
    "election_day_assignments",
    "election_day_operations",
    "readiness_items",
    "audit_logs",
    "notifications",
    "automation_runs",
    "automation_rules",
    "risks",
    "relationships",
    "employee_payments",
    "expenses",
    "vendors",
    "fundraising_events",
    "pledges",
    "donations",
    "donors",
    "media_campaigns",
    "content_items",
    "channels",
    "campaign_messages",
    "election_results",
    "elections",
    "candidates",
    "campaign_milestones",
    "campaign_tasks",
    "survey_answers",
    "survey_questions",
    "canvass_sessions",
    "walk_list_members",
    "walk_lists",
    "field_turfs",
    "issue_reports",
    "issues",
    "interactions",
    "interaction_types",
    "household_members",
    "households",
    "voter_contacts",
    "voters",
    "polling_divisions",
    "constituencies",
    "user_constituency_access",
    "user_roles",
    "users",
    "roles",
  ];
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE ${tableNames.map((t) => `"${t}"`).join(", ")} RESTART IDENTITY CASCADE;`
  );

  // ---------------------------------------------------------------------
  // Roles & users
  // ---------------------------------------------------------------------
  console.log("Seeding roles & users…");
  const roleRows = ROLE_DEFINITIONS.map((r) => ({
    id: uuid(),
    key: r.key,
    name: r.name,
    description: r.description,
    isNational: r.isNational,
  }));
  await prisma.role.createMany({ data: roleRows });
  const roleIdByKey = new Map<string, string>(roleRows.map((r) => [r.key, r.id]));

  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 10);

  type SeedUser = {
    id: string;
    name: string;
    email: string;
    roleKeys: string[];
    constituencyCodes?: string[];
  };
  const users: SeedUser[] = [
    { id: uuid(), name: "Alicia Redhead", email: "admin@ndcvrm.gd", roleKeys: ["ADMINISTRATOR"] },
    { id: uuid(), name: "Marcus Charles", email: "campaign.manager@ndcvrm.gd", roleKeys: ["CAMPAIGN_MANAGER"] },
    { id: uuid(), name: "Dr. Yolande Frederick", email: "candidate@ndcvrm.gd", roleKeys: ["CANDIDATE"] },
    { id: uuid(), name: "Kester Baptiste", email: "data.lead@ndcvrm.gd", roleKeys: ["DATA_LEAD"] },
    { id: uuid(), name: "Sherma Antoine", email: "comms.lead@ndcvrm.gd", roleKeys: ["COMMUNICATIONS_LEAD"] },
    { id: uuid(), name: "Winston Nedd", email: "finance.lead@ndcvrm.gd", roleKeys: ["FINANCE_LEAD"] },
    { id: uuid(), name: "Petronella Isaac", email: "dpo@ndcvrm.gd", roleKeys: ["DATA_PROTECTION_LEAD"] },
    {
      id: uuid(),
      name: "Curtis Gilbert",
      email: "field.coordinator@ndcvrm.gd",
      roleKeys: ["FIELD_COORDINATOR"],
      constituencyCodes: ["TSG", "SGNE", "SGNW", "SGS", "SGSE"],
    },
    { id: uuid(), name: "Merle Simon", email: "organiser.tsg@ndcvrm.gd", roleKeys: ["ORGANISER"], constituencyCodes: ["TSG"] },
  ];

  for (const c of CONSTITUENCIES) {
    users.push({
      id: uuid(),
      name: `${pick(c.divisions % 2 === 0 ? MALE_FIRST_NAMES : FEMALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      email: `organiser.${c.code.toLowerCase()}@ndcvrm.gd`,
      roleKeys: ["ORGANISER"],
      constituencyCodes: [c.code],
    });
    users.push({
      id: uuid(),
      name: `${pick(MALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      email: `canvasser.${c.code.toLowerCase()}@ndcvrm.gd`,
      roleKeys: ["CANVASSER"],
      constituencyCodes: [c.code],
    });
  }
  // de-dupe emails from the two org.tsg entries
  const seenEmails = new Set<string>();
  const finalUsers = users.filter((u) => {
    if (seenEmails.has(u.email)) return false;
    seenEmails.add(u.email);
    return true;
  });

  await prisma.user.createMany({
    data: finalUsers.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      passwordHash,
      active: true,
    })),
  });
  await prisma.userRole.createMany({
    data: finalUsers.flatMap((u) =>
      u.roleKeys.map((rk) => ({ id: uuid(), userId: u.id, roleId: roleIdByKey.get(rk)! }))
    ),
  });

  // ---------------------------------------------------------------------
  // Geography: constituencies & polling divisions
  // ---------------------------------------------------------------------
  console.log("Seeding constituencies & polling divisions…");

  type PD = { id: string; code: string; name: string; constituencyId: string; constituencyCode: string; registeredElectors: number };
  const pdRows: PD[] = [];
  const constituencyIdByCode = new Map<string, string>();
  const constituencyRows = CONSTITUENCIES.map((c) => {
    const id = uuid();
    constituencyIdByCode.set(c.code, id);
    return { id, code: c.code, name: c.name, parish: c.parish, registeredElectors: 0 };
  });

  // Weight each division randomly, then scale so the grand total is exact.
  const divisionWeights: number[] = [];
  const divisionMeta: { constituencyCode: string; index: number }[] = [];
  for (const c of CONSTITUENCIES) {
    for (let i = 0; i < c.divisions; i++) {
      divisionWeights.push(randInt(450, 980));
      divisionMeta.push({ constituencyCode: c.code, index: i });
    }
  }
  const electorCounts = distributeInt(TOTAL_REGISTERED_ELECTORS, divisionWeights);

  divisionMeta.forEach((meta, idx) => {
    const constituencyId = constituencyIdByCode.get(meta.constituencyCode)!;
    const villageOptions = VILLAGE_NAMES[meta.constituencyCode];
    const village = villageOptions[meta.index % villageOptions.length];
    const code = `${meta.constituencyCode}-${String(meta.index + 1).padStart(2, "0")}`;
    pdRows.push({
      id: uuid(),
      code,
      name: `${village} Polling Division`,
      constituencyId,
      constituencyCode: meta.constituencyCode,
      registeredElectors: electorCounts[idx],
    });
  });

  for (const pd of pdRows) {
    const c = constituencyRows.find((c) => c.id === pd.constituencyId)!;
    c.registeredElectors += pd.registeredElectors;
  }

  await prisma.constituency.createMany({
    data: constituencyRows.map((c) => ({
      id: c.id,
      code: c.code,
      name: c.name,
      parish: c.parish,
      registeredElectors: c.registeredElectors,
    })),
  });
  await prisma.pollingDivision.createMany({
    data: pdRows.map((pd) => ({
      id: pd.id,
      code: pd.code,
      name: pd.name,
      constituencyId: pd.constituencyId,
      registeredElectors: pd.registeredElectors,
    })),
  });

  await prisma.userConstituencyAccess.createMany({
    data: finalUsers.flatMap((u) =>
      (u.constituencyCodes ?? []).map((code) => ({
        id: uuid(),
        userId: u.id,
        constituencyId: constituencyIdByCode.get(code)!,
      }))
    ),
  });

  const grandTotal = constituencyRows.reduce((s, c) => s + c.registeredElectors, 0);
  console.log(`  Registered electors total: ${grandTotal} (target ${TOTAL_REGISTERED_ELECTORS})`);

  // Election cycle
  await prisma.election.create({
    data: {
      name: "2027 Grenada General Election",
      cycleLabel: "2027 General Election",
      electionDate: new Date("2027-03-15T00:00:00Z"),
      isActive: true,
    },
  });

  // ---------------------------------------------------------------------
  // Interaction types
  // ---------------------------------------------------------------------
  const interactionTypeDefs = [
    { key: "DOOR_KNOCK", label: "Door Knock", category: "FIELD" as const },
    { key: "PHONE_CALL", label: "Phone Call", category: "PHONE" as const },
    { key: "TEXT_MESSAGE", label: "Text Message", category: "DIGITAL" as const },
    { key: "WHATSAPP_MESSAGE", label: "WhatsApp Message", category: "DIGITAL" as const },
    { key: "COMMUNITY_MEETING", label: "Community Meeting", category: "EVENT" as const },
    { key: "RALLY_ATTENDANCE", label: "Rally Attendance", category: "EVENT" as const },
    { key: "OFFICE_VISIT", label: "Office Visit", category: "OFFICE" as const },
    { key: "EMAIL_OUTREACH", label: "Email Outreach", category: "DIGITAL" as const },
  ];
  const interactionTypeRows = interactionTypeDefs.map((t) => ({ id: uuid(), ...t }));
  await prisma.interactionType.createMany({ data: interactionTypeRows });

  // ---------------------------------------------------------------------
  // Voters, households, contacts
  // ---------------------------------------------------------------------
  console.log("Seeding voters…");
  const TOTAL_DETAILED_VOTERS = 4000;
  const voterTargets = distributeInt(
    TOTAL_DETAILED_VOTERS,
    pdRows.map((pd) => pd.registeredElectors)
  );

  const staffByConstituency = new Map<string, string[]>();
  for (const u of finalUsers) {
    for (const code of u.constituencyCodes ?? []) {
      const arr = staffByConstituency.get(code) ?? [];
      arr.push(u.id);
      staffByConstituency.set(code, arr);
    }
  }
  const dataLeadId = finalUsers.find((u) => u.email === "data.lead@ndcvrm.gd")!.id;

  type VoterRow = {
    id: string;
    voterNumber: string;
    firstName: string;
    lastName: string;
    sex: "MALE" | "FEMALE" | null;
    sexSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
    dateOfBirth: Date | null;
    ageBand: string | null;
    ageBandSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
    occupation: string | null;
    occupationSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
    addressLine: string;
    parish: string;
    phone: string | null;
    phoneSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
    email: string | null;
    emailSource: "KNOWN" | "ESTIMATED" | "UNKNOWN";
    constituencyId: string;
    pollingDivisionId: string;
    contactStatus: string;
    canvassStatus: string;
    interactionCount: number;
    lastContactAt: Date | null;
    overallDataQuality: "KNOWN" | "ESTIMATED" | "UNKNOWN";
    recordSource: string;
    householdId: string | null;
  };

  const voterRows: VoterRow[] = [];
  const householdRows: { id: string; constituencyId: string; pollingDivisionId: string; addressLine: string; parish: string }[] = [];
  const householdMemberRows: { id: string; householdId: string; voterId: string; relationshipToHead: string | null }[] = [];
  let voterSeq = 1_000_001;

  const constituencyById = new Map(constituencyRows.map((c) => [c.id, c]));

  pdRows.forEach((pd, pdIdx) => {
    const target = voterTargets[pdIdx];
    const villageOptions = VILLAGE_NAMES[pd.constituencyCode];
    let remaining = target;
    let clusterCursor = 0;
    while (remaining > 0) {
      const clusterSize = Math.min(
        weightedPick<number>([[1, 50], [2, 20], [3, 15], [4, 15]]),
        remaining
      );
      const village = pick(villageOptions);
      const houseNumber = randInt(1, 180);
      const addressLine = `${houseNumber} ${village} ${pick(STREET_SUFFIXES)}`;
      const parish = constituencyById.get(pd.constituencyId)!.parish;

      let householdId: string | null = null;
      if (clusterSize >= 2) {
        householdId = uuid();
        householdRows.push({
          id: householdId,
          constituencyId: pd.constituencyId,
          pollingDivisionId: pd.id,
          addressLine,
          parish,
        });
      }

      for (let m = 0; m < clusterSize; m++) {
        const isFemale = rand() < 0.51;
        const firstName = pick(isFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES);
        const lastName = pick(LAST_NAMES);

        const sexKnown = rand() < 0.97;
        const sex = sexKnown ? (isFemale ? "FEMALE" : "MALE") : null;
        const sexSource = sexKnown ? "KNOWN" : "UNKNOWN";

        let dateOfBirth: Date | null = null;
        let ageBand: string | null = null;
        let ageBandSource: "KNOWN" | "ESTIMATED" | "UNKNOWN" = "UNKNOWN";
        if (rand() < 0.55) {
          const age = randInt(18, 88);
          const dob = new Date(CAMPAIGN_NOW);
          dob.setFullYear(dob.getFullYear() - age);
          dob.setMonth(randInt(0, 11), randInt(1, 28));
          dateOfBirth = dob;
          ageBand = ageBandOf(age);
          ageBandSource = "KNOWN";
        } else if (rand() < 0.65) {
          ageBand = pick(["18-24", "25-34", "35-44", "45-54", "55-64", "65-74", "75+"]);
          ageBandSource = "ESTIMATED";
        }

        let occupation: string | null = null;
        let occupationSource: "KNOWN" | "ESTIMATED" | "UNKNOWN" = "UNKNOWN";
        const occRoll = rand();
        if (occRoll < 0.3) {
          occupation = pick(OCCUPATIONS);
          occupationSource = "KNOWN";
        } else if (occRoll < 0.5) {
          occupation = pick(OCCUPATIONS);
          occupationSource = "ESTIMATED";
        }

        const phoneKnown = rand() < 0.42;
        const phone = phoneKnown ? `+1 473-${randInt(400, 459)}-${String(randInt(0, 9999)).padStart(4, "0")}` : null;
        const emailKnown = rand() < 0.16;
        const email = emailKnown
          ? `${slug(firstName)}.${slug(lastName)}${randInt(1, 99)}@${pick(["gmail.com", "hotmail.com", "yahoo.com"])}`
          : null;

        const contactStatus = weightedPick<string>([
          ["NOT_CONTACTED", 0.55],
          ["ATTEMPTED", 0.15],
          ["CONTACTED", 0.25],
          ["REFUSED", 0.03],
          ["MOVED", 0.015],
          ["DECEASED", 0.005],
        ]);
        let canvassStatus = "NOT_CANVASSED";
        if (contactStatus === "CONTACTED" || contactStatus === "ATTEMPTED") {
          canvassStatus = weightedPick([["CANVASSED", 0.7], ["REVISIT_NEEDED", 0.15], ["NOT_CANVASSED", 0.15]]);
        } else if (rand() < 0.05) {
          canvassStatus = "REVISIT_NEEDED";
        }

        let interactionCount = 0;
        if (contactStatus === "ATTEMPTED" || contactStatus === "REFUSED") interactionCount = 1;
        else if (contactStatus === "CONTACTED") interactionCount = randInt(1, 4);
        else if (contactStatus === "MOVED") interactionCount = rand() < 0.5 ? 1 : 0;

        const lastContactAt = interactionCount > 0 ? randomDateBetween(CAMPAIGN_START, CAMPAIGN_NOW) : null;

        const sources = [sexSource, ageBandSource, occupationSource];
        const overallDataQuality: "KNOWN" | "ESTIMATED" | "UNKNOWN" = sources.every((s) => s === "KNOWN")
          ? "KNOWN"
          : sources.some((s) => s === "UNKNOWN")
            ? "UNKNOWN"
            : "ESTIMATED";

        const voterId = uuid();
        voterRows.push({
          id: voterId,
          voterNumber: `GD${voterSeq++}`,
          firstName,
          lastName,
          sex,
          sexSource,
          dateOfBirth,
          ageBand,
          ageBandSource,
          occupation,
          occupationSource,
          addressLine,
          parish,
          phone,
          phoneSource: phoneKnown ? "KNOWN" : "UNKNOWN",
          email,
          emailSource: emailKnown ? "KNOWN" : "UNKNOWN",
          constituencyId: pd.constituencyId,
          pollingDivisionId: pd.id,
          contactStatus,
          canvassStatus,
          interactionCount,
          lastContactAt,
          overallDataQuality,
          recordSource: "June 2026 Official Register",
          householdId,
        });

        if (householdId) {
          householdMemberRows.push({
            id: uuid(),
            householdId,
            voterId,
            relationshipToHead: m === 0 ? "Head of Household" : pick(["Spouse", "Child", "Sibling", "Parent", "Other Relative"]),
          });
        }
      }

      remaining -= clusterSize;
      clusterCursor += clusterSize;
    }
  });

  await prisma.household.createMany({ data: householdRows });

  for (let i = 0; i < voterRows.length; i += 1000) {
    await prisma.voter.createMany({ data: voterRows.slice(i, i + 1000) as never });
  }
  await prisma.householdMember.createMany({ data: householdMemberRows });

  console.log(`  Seeded ${voterRows.length} detailed voter records across ${pdRows.length} polling divisions.`);

  // Voter contacts (structured multi-channel)
  console.log("Seeding voter contacts, interactions, consent…");
  const contactRows: { id: string; voterId: string; channel: string; value: string; isPrimary: boolean; consentStatus: ConsentStatus }[] = [];
  const consentRows: { id: string; voterId: string; channel: string; status: ConsentStatus; source: string }[] = [];
  for (const v of voterRows) {
    if (v.phone) {
      const consentStatus = weightedPick<ConsentStatus>([["OPT_IN", 0.45], ["OPT_OUT", 0.1], ["UNKNOWN", 0.45]]);
      contactRows.push({ id: uuid(), voterId: v.id, channel: "PHONE", value: v.phone, isPrimary: true, consentStatus });
      if (rand() < 0.3) {
        consentRows.push({ id: uuid(), voterId: v.id, channel: "PHONE", status: consentStatus, source: "Field Canvass" });
      }
    }
    if (v.email) {
      const consentStatus = weightedPick<ConsentStatus>([["OPT_IN", 0.4], ["OPT_OUT", 0.08], ["UNKNOWN", 0.52]]);
      contactRows.push({ id: uuid(), voterId: v.id, channel: "EMAIL", value: v.email, isPrimary: !v.phone, consentStatus });
      if (rand() < 0.3) {
        consentRows.push({ id: uuid(), voterId: v.id, channel: "EMAIL", status: consentStatus, source: "Field Canvass" });
      }
    }
  }
  await prisma.voterContact.createMany({ data: contactRows });
  await prisma.consentRecord.createMany({ data: consentRows });

  const suppressionCandidates = shuffle(voterRows.filter((v) => v.contactStatus === "REFUSED" || v.contactStatus === "DECEASED"));
  const suppressionRows = suppressionCandidates.slice(0, Math.min(60, suppressionCandidates.length)).map((v) => ({
    id: uuid(),
    voterId: v.id,
    reason: v.contactStatus === "DECEASED" ? "Deceased — confirmed by household" : "Voter requested no further contact",
    channel: null,
  }));
  await prisma.suppressionRecord.createMany({ data: suppressionRows });

  // Interactions
  const interactionRows: {
    id: string;
    voterId: string;
    typeId: string;
    constituencyId: string;
    pollingDivisionId: string;
    summary: string;
    outcome: string;
    occurredAt: Date;
    recordedByUserId: string | null;
  }[] = [];
  const fieldTypeIds = interactionTypeRows.filter((t) => t.category === "FIELD").map((t) => t.id);
  const otherTypeIds = interactionTypeRows.map((t) => t.id);

  for (const v of voterRows) {
    if (v.interactionCount === 0) continue;
    const constituencyCode = pdRows.find((p) => p.id === v.pollingDivisionId)!.constituencyCode;
    const staffPool = staffByConstituency.get(constituencyCode) ?? [dataLeadId];
    for (let i = 0; i < v.interactionCount; i++) {
      const typeId = i === 0 && v.canvassStatus === "CANVASSED" ? pick(fieldTypeIds) : pick(otherTypeIds);
      interactionRows.push({
        id: uuid(),
        voterId: v.id,
        typeId,
        constituencyId: v.constituencyId,
        pollingDivisionId: v.pollingDivisionId,
        summary: v.contactStatus === "REFUSED" ? "Voter declined to discuss campaign issues." : "Discussed local priorities and campaign platform.",
        outcome: v.contactStatus === "REFUSED" ? "Declined" : weightedPick([["Positive", 0.55], ["Neutral", 0.3], ["Negative", 0.15]]),
        occurredAt: v.lastContactAt ?? randomDateBetween(CAMPAIGN_START, CAMPAIGN_NOW),
        recordedByUserId: pick(staffPool),
      });
    }
  }
  for (let i = 0; i < interactionRows.length; i += 1000) {
    await prisma.interaction.createMany({ data: interactionRows.slice(i, i + 1000) });
  }
  console.log(`  Seeded ${interactionRows.length} interactions.`);

  // ---------------------------------------------------------------------
  // Issues
  // ---------------------------------------------------------------------
  console.log("Seeding issue register…");
  const categories = Object.keys(ISSUE_TITLES) as IssueCategory[];
  const issueRows: {
    id: string;
    title: string;
    category: IssueCategory;
    constituencyId: string;
    pollingDivisionId: string | null;
    description: string | null;
    severity: IssueSeverity;
    status: IssueStatus;
    ownerUserId: string | null;
    estimatedPeopleAffected: number;
    firstReportedAt: Date;
    resolutionNotes: string | null;
  }[] = [];
  const issueReportRows: { id: string; issueId: string; voterId: string | null; reportedByUserId: string | null; note: string | null; source: string; createdAt: Date }[] = [];

  const votersByConstituency = new Map<string, VoterRow[]>();
  for (const v of voterRows) {
    const arr = votersByConstituency.get(v.constituencyId) ?? [];
    arr.push(v);
    votersByConstituency.set(v.constituencyId, arr);
  }

  for (let i = 0; i < 150; i++) {
    const category = pick(categories);
    const constituency = pick(constituencyRows);
    const pdForConstituency = pdRows.filter((p) => p.constituencyId === constituency.id);
    const pollingDivisionId = rand() < 0.6 ? pick(pdForConstituency).id : null;
    const status = weightedPick<IssueStatus>([
      ["REPORTED", 0.28],
      ["ACKNOWLEDGED", 0.2],
      ["IN_PROGRESS", 0.25],
      ["RESOLVED", 0.2],
      ["CLOSED", 0.07],
    ]);
    const severity = weightedPick<IssueSeverity>([["LOW", 0.3], ["MEDIUM", 0.4], ["HIGH", 0.22], ["CRITICAL", 0.08]]);
    const staffPool = staffByConstituency.get(constituency.code) ?? [dataLeadId];
    const firstReportedAt = randomDateBetween(CAMPAIGN_START, CAMPAIGN_NOW);

    const issueId = uuid();
    issueRows.push({
      id: issueId,
      title: pick(ISSUE_TITLES[category]),
      category,
      constituencyId: constituency.id,
      pollingDivisionId,
      description: `Constituents in ${constituency.name} have raised this ${category.toLowerCase().replace("_", " ")} concern through canvassing and community outreach.`,
      severity,
      status,
      ownerUserId: rand() < 0.75 ? pick(staffPool) : null,
      estimatedPeopleAffected: randInt(5, 420),
      firstReportedAt,
      resolutionNotes: status === "RESOLVED" || status === "CLOSED" ? "Resolved following coordination with the relevant public agency." : null,
    });

    const constituencyVoters = votersByConstituency.get(constituency.id) ?? [];
    const reportCount = randInt(1, 6);
    for (let r = 0; r < reportCount; r++) {
      issueReportRows.push({
        id: uuid(),
        issueId,
        voterId: constituencyVoters.length > 0 && rand() < 0.7 ? pick(constituencyVoters).id : null,
        reportedByUserId: rand() < 0.4 ? pick(staffPool) : null,
        note: rand() < 0.5 ? "Raised during door-to-door canvass." : null,
        source: rand() < 0.6 ? "Field Report" : "Community Meeting",
        createdAt: randomDateBetween(firstReportedAt, CAMPAIGN_NOW),
      });
    }
  }
  await prisma.issue.createMany({ data: issueRows });
  await prisma.issueReport.createMany({ data: issueReportRows });
  console.log(`  Seeded ${issueRows.length} issues with ${issueReportRows.length} reports.`);

  // ---------------------------------------------------------------------
  // Finance: donors, donations, pledges
  // ---------------------------------------------------------------------
  console.log("Seeding finance data…");
  const donorRows: { id: string; name: string; contactPhone: string; contactEmail: string; constituencyId: string | null; tier: DonorTier; amountPledged: number; amountReceived: number; lastContributionAt: Date; status: string }[] = [];
  const donationRows: { id: string; donorId: string; amount: number; date: Date; method: string }[] = [];
  const pledgeRows: { id: string; donorId: string; amount: number; amountPaid: number; dueDate: Date; status: PledgeStatus }[] = [];

  const TIER_RANGE: Record<string, [number, number]> = {
    GRASSROOTS: [50, 300],
    SUPPORTER: [300, 1500],
    MAJOR: [1500, 10000],
    LEADERSHIP: [10000, 50000],
  };
  for (let i = 0; i < 48; i++) {
    const tier = weightedPick<DonorTier>([["GRASSROOTS", 0.55], ["SUPPORTER", 0.3], ["MAJOR", 0.12], ["LEADERSHIP", 0.03]]);
    const [lo, hi] = TIER_RANGE[tier];
    const isFemale = rand() < 0.5;
    const donorId = uuid();
    const donationCount = randInt(1, 3);
    let received = 0;
    const dDates: Date[] = [];
    for (let d = 0; d < donationCount; d++) {
      const amount = randInt(lo, hi);
      received += amount;
      const date = randomDateBetween(CAMPAIGN_START, CAMPAIGN_NOW);
      dDates.push(date);
      donationRows.push({ id: uuid(), donorId, amount, date, method: pick(["BANK_TRANSFER", "CASH", "CHEQUE", "MOBILE_MONEY"]) });
    }
    const pledged = received + (rand() < 0.4 ? randInt(lo, hi) : 0);
    if (pledged > received) {
      const dueDate = randomDateBetween(CAMPAIGN_NOW, new Date("2027-02-01"));
      pledgeRows.push({
        id: uuid(),
        donorId,
        amount: pledged - received,
        amountPaid: 0,
        dueDate,
        status: dueDate < CAMPAIGN_NOW ? "OVERDUE" : "PENDING",
      });
    }
    donorRows.push({
      id: donorId,
      name: `${pick(isFemale ? FEMALE_FIRST_NAMES : MALE_FIRST_NAMES)} ${pick(LAST_NAMES)}`,
      contactPhone: `+1 473-${randInt(400, 459)}-${String(randInt(0, 9999)).padStart(4, "0")}`,
      contactEmail: `donor${i}@${pick(["gmail.com", "hotmail.com"])}`,
      constituencyId: rand() < 0.8 ? pick(constituencyRows).id : null,
      tier,
      amountPledged: pledged,
      amountReceived: received,
      lastContributionAt: dDates.sort((a, b) => b.getTime() - a.getTime())[0],
      status: "ACTIVE",
    });
  }
  await prisma.donor.createMany({ data: donorRows });
  await prisma.donation.createMany({ data: donationRows });
  await prisma.pledge.createMany({ data: pledgeRows });

  // ---------------------------------------------------------------------
  // Campaign tasks & readiness
  // ---------------------------------------------------------------------
  console.log("Seeding campaign tasks & election readiness…");
  const pillars: CampaignPillar[] = ["STRATEGY", "OUTREACH", "FINANCE", "VOTER_INTELLIGENCE", "OPERATIONS", "ELECTION_READINESS"];
  const taskTitlesByPillar: Record<string, string[]> = {
    STRATEGY: ["Finalize candidate messaging framework", "Approve campaign milestone calendar", "Review key issues briefing"],
    OUTREACH: ["Publish weekly content calendar", "Coordinate town hall in target constituency", "Launch WhatsApp broadcast list"],
    FINANCE: ["Reconcile monthly donor ledger", "Follow up on overdue pledges", "Submit vendor payment batch"],
    VOTER_INTELLIGENCE: ["Clean up duplicate voter records", "Expand phone coverage in low-contact divisions", "Review data quality report"],
    OPERATIONS: ["Recruit additional canvassers", "Schedule weekly field coordination call", "Audit walk list completion rates"],
    ELECTION_READINESS: ["Confirm polling day transportation plan", "Finalize poll worker roster", "Test command centre communications"],
  };
  const taskRows = [];
  for (let i = 0; i < 60; i++) {
    const pillar = pick(pillars);
    const status = weightedPick<TaskStatus>([["NOT_STARTED", 0.25], ["IN_PROGRESS", 0.4], ["BLOCKED", 0.1], ["DONE", 0.25]]);
    const constituency = rand() < 0.5 ? pick(constituencyRows) : null;
    const staffPool = constituency ? staffByConstituency.get(constituency.code) ?? [dataLeadId] : finalUsers.map((u) => u.id);
    taskRows.push({
      id: uuid(),
      title: pick(taskTitlesByPillar[pillar]),
      description: null,
      pillar,
      constituencyId: constituency?.id ?? null,
      ownerUserId: pick(staffPool),
      status,
      priority: pick(["LOW", "MEDIUM", "HIGH"]),
      dueDate: randomDateBetween(CAMPAIGN_NOW, new Date("2027-03-15")),
      progressPct: status === "DONE" ? 100 : status === "NOT_STARTED" ? 0 : status === "BLOCKED" ? randInt(10, 40) : randInt(20, 90),
    });
  }
  await prisma.campaignTask.createMany({ data: taskRows });

  const readinessSections = [
    { key: "Election Day Operations Plan", national: true },
    { key: "Polling Division Coverage", national: false },
    { key: "Poll Worker Assignment", national: false },
    { key: "Sign Holder Assignment", national: false },
    { key: "Transportation Plan", national: false },
    { key: "Volunteer Coverage", national: false },
    { key: "Communications Plan", national: true },
    { key: "Command Centre Staffing", national: true },
    { key: "Incident Reporting Plan", national: true },
    { key: "Thank You Event", national: true },
    { key: "Post-Election Scorecard", national: true },
  ];
  const readinessRows = [];
  for (const section of readinessSections) {
    if (section.national) {
      readinessRows.push({
        id: uuid(),
        section: section.key,
        constituencyId: null,
        title: section.key,
        status: weightedPick<ReadinessStatus>([["READY", 0.2], ["IN_PROGRESS", 0.45], ["NOT_STARTED", 0.2], ["AT_RISK", 0.1], ["BLOCKED", 0.05]]),
        ownerUserId: pick(finalUsers.filter((u) => !u.constituencyCodes).map((u) => u.id)),
      });
    } else {
      for (const c of constituencyRows) {
        readinessRows.push({
          id: uuid(),
          section: section.key,
          constituencyId: c.id,
          title: `${section.key} — ${c.name}`,
          status: weightedPick<ReadinessStatus>([["READY", 0.2], ["IN_PROGRESS", 0.45], ["NOT_STARTED", 0.2], ["AT_RISK", 0.1], ["BLOCKED", 0.05]]),
          ownerUserId: pick(staffByConstituency.get(constituencyRows.find((cc) => cc.id === c.id)!.code) ?? [dataLeadId]),
        });
      }
    }
  }
  await prisma.readinessItem.createMany({ data: readinessRows });

  // ---------------------------------------------------------------------
  // Canvass sessions (field visits)
  // ---------------------------------------------------------------------
  console.log("Seeding canvass sessions…");
  const canvassers = finalUsers.filter((u) => u.roleKeys.includes("CANVASSER") || u.roleKeys.includes("ORGANISER"));
  const sessionRows = [];
  for (let i = 0; i < 170; i++) {
    const canvasser = pick(canvassers);
    const startedAt = randomDateBetween(CAMPAIGN_START, CAMPAIGN_NOW);
    const doorsAttempted = randInt(8, 45);
    sessionRows.push({
      id: uuid(),
      canvasserUserId: canvasser.id,
      startedAt,
      endedAt: new Date(startedAt.getTime() + randInt(45, 180) * 60000),
      doorsAttempted,
      conversationsLogged: randInt(Math.floor(doorsAttempted * 0.3), doorsAttempted),
      syncStatus: "SYNCED",
    });
  }
  await prisma.canvassSession.createMany({ data: sessionRows });

  // ---------------------------------------------------------------------
  // Data sources
  // ---------------------------------------------------------------------
  await prisma.dataSource.createMany({
    data: [
      { id: uuid(), name: "June 2026 Official Voter Register", description: "Grenada Electoral Office register export.", type: "OFFICIAL_REGISTER" },
      { id: uuid(), name: "Field Canvass Reports", description: "Door-to-door and phone canvassing results.", type: "FIELD_CANVASS" },
      { id: uuid(), name: "Demographic Estimate Model", description: "Age-band and occupation inference where the register is silent.", type: "ESTIMATE_MODEL" },
      { id: uuid(), name: "Manual Data Entry", description: "Corrections and additions entered directly by data staff.", type: "MANUAL_ENTRY" },
    ],
  });

  console.log("Seed complete.");
  console.log(`Users: ${finalUsers.length} | Constituencies: ${constituencyRows.length} | Polling divisions: ${pdRows.length}`);
  console.log(`Voters (detailed): ${voterRows.length} | Households: ${householdRows.length} | Interactions: ${interactionRows.length}`);
  console.log(`Issues: ${issueRows.length} | Donors: ${donorRows.length} | Tasks: ${taskRows.length} | Readiness items: ${readinessRows.length}`);
  console.log(`Demo login password for all seeded accounts: ${DEMO_PASSWORD}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
