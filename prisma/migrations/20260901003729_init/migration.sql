-- CreateEnum
CREATE TYPE "DataQuality" AS ENUM ('KNOWN', 'ESTIMATED', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "Sex" AS ENUM ('MALE', 'FEMALE');

-- CreateEnum
CREATE TYPE "ContactStatus" AS ENUM ('NOT_CONTACTED', 'ATTEMPTED', 'CONTACTED', 'REFUSED', 'MOVED', 'DECEASED');

-- CreateEnum
CREATE TYPE "CanvassStatus" AS ENUM ('NOT_CANVASSED', 'CANVASSED', 'REVISIT_NEEDED');

-- CreateEnum
CREATE TYPE "InteractionCategory" AS ENUM ('FIELD', 'PHONE', 'EVENT', 'DIGITAL', 'OFFICE');

-- CreateEnum
CREATE TYPE "IssueCategory" AS ENUM ('ROADS', 'DRAINAGE', 'WATER', 'GARBAGE', 'HOUSING', 'LAND_TENURE', 'EMPLOYMENT', 'HEALTH', 'SAFETY', 'EDUCATION', 'INFRASTRUCTURE', 'OTHER');

-- CreateEnum
CREATE TYPE "IssueSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "IssueStatus" AS ENUM ('REPORTED', 'ACKNOWLEDGED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "WalkListMemberStatus" AS ENUM ('PENDING', 'VISITED', 'NOT_HOME', 'REFUSED', 'MOVED');

-- CreateEnum
CREATE TYPE "WalkListStatus" AS ENUM ('DRAFT', 'SAVED', 'ASSIGNED', 'IN_PROGRESS', 'COMPLETE');

-- CreateEnum
CREATE TYPE "CampaignPillar" AS ENUM ('STRATEGY', 'OUTREACH', 'FINANCE', 'VOTER_INTELLIGENCE', 'OPERATIONS', 'ELECTION_READINESS');

-- CreateEnum
CREATE TYPE "TaskStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'BLOCKED', 'DONE');

-- CreateEnum
CREATE TYPE "ContentStatus" AS ENUM ('DRAFT', 'REVIEW', 'APPROVED', 'SCHEDULED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "ChannelKind" AS ENUM ('BROADCAST', 'DIRECT');

-- CreateEnum
CREATE TYPE "DonorTier" AS ENUM ('GRASSROOTS', 'SUPPORTER', 'MAJOR', 'LEADERSHIP');

-- CreateEnum
CREATE TYPE "PledgeStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE');

-- CreateEnum
CREATE TYPE "ExpenseStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID', 'REJECTED');

-- CreateEnum
CREATE TYPE "RelationshipType" AS ENUM ('HOUSEHOLD', 'FAMILY', 'COMMUNITY_ORGANIZATION', 'PROFESSIONAL', 'BUSINESS', 'VOLUNTEER');

-- CreateEnum
CREATE TYPE "RiskSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "RiskStatus" AS ENUM ('OPEN', 'MONITORING', 'MITIGATED', 'CLOSED');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('DRAFT', 'DRY_RUN', 'REVIEW', 'ACTIVE', 'DISABLED');

-- CreateEnum
CREATE TYPE "ReadinessStatus" AS ENUM ('READY', 'IN_PROGRESS', 'NOT_STARTED', 'AT_RISK', 'BLOCKED');

-- CreateEnum
CREATE TYPE "EDayAssignmentRole" AS ENUM ('POLL_WORKER', 'SIGN_HOLDER', 'DRIVER', 'COORDINATOR');

-- CreateEnum
CREATE TYPE "ConsentStatus" AS ENUM ('OPT_IN', 'OPT_OUT', 'UNKNOWN');

-- CreateEnum
CREATE TYPE "SegmentKind" AS ENUM ('GEOGRAPHIC', 'CANVASSING_LIST', 'CONSENT_STATE', 'CONTACT_COMPLETENESS', 'ISSUE_GROUP', 'OTHER');

-- CreateEnum
CREATE TYPE "DataSourceType" AS ENUM ('OFFICIAL_REGISTER', 'FIELD_CANVASS', 'IMPORT', 'MANUAL_ENTRY', 'ESTIMATE_MODEL');

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isNational" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_roles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roleId" TEXT NOT NULL,

    CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_constituency_access" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,

    CONSTRAINT "user_constituency_access_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "constituencies" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parish" TEXT NOT NULL,
    "registeredElectors" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "constituencies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "polling_divisions" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "registeredElectors" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "polling_divisions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voters" (
    "id" TEXT NOT NULL,
    "voterNumber" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "sex" "Sex",
    "sexSource" "DataQuality" NOT NULL DEFAULT 'UNKNOWN',
    "dateOfBirth" TIMESTAMP(3),
    "ageBand" TEXT,
    "ageBandSource" "DataQuality" NOT NULL DEFAULT 'UNKNOWN',
    "occupation" TEXT,
    "occupationSource" "DataQuality" NOT NULL DEFAULT 'UNKNOWN',
    "addressLine" TEXT,
    "parish" TEXT,
    "phone" TEXT,
    "phoneSource" "DataQuality" NOT NULL DEFAULT 'UNKNOWN',
    "email" TEXT,
    "emailSource" "DataQuality" NOT NULL DEFAULT 'UNKNOWN',
    "constituencyId" TEXT NOT NULL,
    "pollingDivisionId" TEXT NOT NULL,
    "contactStatus" "ContactStatus" NOT NULL DEFAULT 'NOT_CONTACTED',
    "canvassStatus" "CanvassStatus" NOT NULL DEFAULT 'NOT_CANVASSED',
    "interactionCount" INTEGER NOT NULL DEFAULT 0,
    "lastContactAt" TIMESTAMP(3),
    "overallDataQuality" "DataQuality" NOT NULL DEFAULT 'KNOWN',
    "recordSource" TEXT NOT NULL DEFAULT '2026 Official Register',
    "householdId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "voters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "voter_contacts" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "consentStatus" "ConsentStatus" NOT NULL DEFAULT 'UNKNOWN',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "voter_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "households" (
    "id" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "pollingDivisionId" TEXT NOT NULL,
    "addressLine" TEXT NOT NULL,
    "parish" TEXT,
    "lastVisitedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "households_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "household_members" (
    "id" TEXT NOT NULL,
    "householdId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "relationshipToHead" TEXT,

    CONSTRAINT "household_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interaction_types" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" "InteractionCategory" NOT NULL,

    CONSTRAINT "interaction_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interactions" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "typeId" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "pollingDivisionId" TEXT NOT NULL,
    "summary" TEXT,
    "outcome" TEXT,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "recordedByUserId" TEXT,

    CONSTRAINT "interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issues" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" "IssueCategory" NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "pollingDivisionId" TEXT,
    "description" TEXT,
    "severity" "IssueSeverity" NOT NULL DEFAULT 'MEDIUM',
    "status" "IssueStatus" NOT NULL DEFAULT 'REPORTED',
    "ownerUserId" TEXT,
    "estimatedPeopleAffected" INTEGER NOT NULL DEFAULT 0,
    "firstReportedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastUpdateAt" TIMESTAMP(3) NOT NULL,
    "resolutionNotes" TEXT,

    CONSTRAINT "issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "issue_reports" (
    "id" TEXT NOT NULL,
    "issueId" TEXT NOT NULL,
    "voterId" TEXT,
    "reportedByUserId" TEXT,
    "note" TEXT,
    "source" TEXT NOT NULL DEFAULT 'Field Report',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "issue_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "field_turfs" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "pollingDivisionId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UNASSIGNED',
    "assignedCanvasserName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "field_turfs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walk_lists" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "pollingDivisionId" TEXT,
    "filterJson" JSONB,
    "estimatedSize" INTEGER NOT NULL DEFAULT 0,
    "status" "WalkListStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT,
    "assignedToUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "walk_lists_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "walk_list_members" (
    "id" TEXT NOT NULL,
    "walkListId" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "status" "WalkListMemberStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "walk_list_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "canvass_sessions" (
    "id" TEXT NOT NULL,
    "walkListId" TEXT,
    "canvasserUserId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "doorsAttempted" INTEGER NOT NULL DEFAULT 0,
    "conversationsLogged" INTEGER NOT NULL DEFAULT 0,
    "syncStatus" TEXT NOT NULL DEFAULT 'SYNCED',

    CONSTRAINT "canvass_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_questions" (
    "id" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'SINGLE_CHOICE',
    "options" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_questions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "survey_answers" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "voterId" TEXT,
    "canvassSessionId" TEXT,
    "answerText" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "survey_answers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_tasks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "pillar" "CampaignPillar" NOT NULL,
    "constituencyId" TEXT,
    "ownerUserId" TEXT,
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "priority" TEXT NOT NULL DEFAULT 'MEDIUM',
    "dueDate" TIMESTAMP(3),
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaign_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_milestones" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "pillar" "CampaignPillar" NOT NULL,
    "dueDate" TIMESTAMP(3),
    "status" "TaskStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_milestones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "constituencyId" TEXT,
    "bio" TEXT,
    "photoUrl" TEXT,
    "isLeader" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cycleLabel" TEXT NOT NULL,
    "electionDate" TIMESTAMP(3) NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_results" (
    "id" TEXT NOT NULL,
    "electionId" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "candidateId" TEXT,
    "votesReceived" INTEGER,
    "turnoutPct" DOUBLE PRECISION,

    CONSTRAINT "election_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaign_messages" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "approvedByName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "campaign_messages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "channels" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" "ChannelKind" NOT NULL,
    "platform" TEXT,

    CONSTRAINT "channels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "content_items" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "channelId" TEXT,
    "audienceGeography" TEXT,
    "message" TEXT,
    "mediaUrl" TEXT,
    "authorUserId" TEXT,
    "approverUserId" TEXT,
    "publishDate" TIMESTAMP(3),
    "status" "ContentStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "content_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "media_campaigns" (
    "id" TEXT NOT NULL,
    "campaignName" TEXT NOT NULL,
    "channelId" TEXT,
    "platform" TEXT NOT NULL,
    "mediaType" TEXT NOT NULL,
    "constituencyId" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "budget" DECIMAL(12,2) NOT NULL,
    "spend" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "claimedReach" INTEGER NOT NULL DEFAULT 0,
    "objective" TEXT,
    "notes" TEXT,

    CONSTRAINT "media_campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contactPhone" TEXT,
    "contactEmail" TEXT,
    "constituencyId" TEXT,
    "tier" "DonorTier" NOT NULL DEFAULT 'GRASSROOTS',
    "amountPledged" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountReceived" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "lastContributionAt" TIMESTAMP(3),
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "donations" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "notes" TEXT,

    CONSTRAINT "donations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pledges" (
    "id" TEXT NOT NULL,
    "donorId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "amountPaid" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dueDate" TIMESTAMP(3),
    "status" "PledgeStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pledges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fundraising_events" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "location" TEXT,
    "goal" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "amountRaised" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "expenses" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "attendance" INTEGER NOT NULL DEFAULT 0,
    "organizerUserId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PLANNED',
    "notes" TEXT,

    CONSTRAINT "fundraising_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "contact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "expenses" (
    "id" TEXT NOT NULL,
    "vendorId" TEXT,
    "category" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" "ExpenseStatus" NOT NULL DEFAULT 'PENDING',
    "description" TEXT,
    "submittedByUserId" TEXT,

    CONSTRAINT "expenses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employee_payments" (
    "id" TEXT NOT NULL,
    "employeeName" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "payPeriodStart" TIMESTAMP(3) NOT NULL,
    "payPeriodEnd" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paidAt" TIMESTAMP(3),

    CONSTRAINT "employee_payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "relationships" (
    "id" TEXT NOT NULL,
    "voterAId" TEXT NOT NULL,
    "voterBId" TEXT NOT NULL,
    "type" "RelationshipType" NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "relationships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "risks" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "constituencyId" TEXT,
    "severity" "RiskSeverity" NOT NULL DEFAULT 'MEDIUM',
    "probability" TEXT NOT NULL DEFAULT 'MEDIUM',
    "impact" TEXT NOT NULL DEFAULT 'MEDIUM',
    "ownerUserId" TEXT,
    "mitigation" TEXT,
    "status" "RiskStatus" NOT NULL DEFAULT 'OPEN',
    "dateOpened" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastReviewed" TIMESTAMP(3),

    CONSTRAINT "risks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_rules" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "triggerJson" JSONB NOT NULL,
    "conditionJson" JSONB,
    "actionJson" JSONB NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'DRAFT',
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "automation_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "automation_runs" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "dryRun" BOOLEAN NOT NULL DEFAULT true,
    "result" JSONB,
    "triggeredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "automation_runs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "title" TEXT NOT NULL,
    "body" TEXT,
    "category" TEXT NOT NULL DEFAULT 'SYSTEM',
    "module" TEXT,
    "link" TEXT,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "recordType" TEXT NOT NULL,
    "recordId" TEXT,
    "previousValue" JSONB,
    "newValue" JSONB,
    "module" TEXT,
    "constituencyId" TEXT,
    "ipAddress" TEXT,
    "sessionInfo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_day_operations" (
    "id" TEXT NOT NULL,
    "constituencyId" TEXT NOT NULL,
    "pollingDivisionId" TEXT NOT NULL,
    "pollingLocation" TEXT,
    "coordinatorUserId" TEXT,
    "pollWorkersRequired" INTEGER NOT NULL DEFAULT 0,
    "pollWorkersAssigned" INTEGER NOT NULL DEFAULT 0,
    "signHoldersRequired" INTEGER NOT NULL DEFAULT 0,
    "signHoldersAssigned" INTEGER NOT NULL DEFAULT 0,
    "driversRequired" INTEGER NOT NULL DEFAULT 0,
    "driversAssigned" INTEGER NOT NULL DEFAULT 0,
    "status" "ReadinessStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "notes" TEXT,
    "issues" TEXT,
    "emergencyContact" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "election_day_operations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_day_assignments" (
    "id" TEXT NOT NULL,
    "operationId" TEXT NOT NULL,
    "role" "EDayAssignmentRole" NOT NULL,
    "assignedName" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'CONFIRMED',

    CONSTRAINT "election_day_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "readiness_items" (
    "id" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "constituencyId" TEXT,
    "title" TEXT NOT NULL,
    "status" "ReadinessStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "ownerUserId" TEXT,
    "notes" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "readiness_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_queries" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'Voter Register',
    "filterJson" JSONB NOT NULL,
    "columnsJson" JSONB,
    "createdByUserId" TEXT,
    "isShared" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_queries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "saved_segments" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "kind" "SegmentKind" NOT NULL DEFAULT 'OTHER',
    "filterJson" JSONB NOT NULL,
    "voterCount" INTEGER NOT NULL DEFAULT 0,
    "createdByUserId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "saved_segments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_sources" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" "DataSourceType" NOT NULL,
    "lastImportedAt" TIMESTAMP(3),

    CONSTRAINT "data_sources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_lineage" (
    "id" TEXT NOT NULL,
    "voterId" TEXT,
    "fieldName" TEXT NOT NULL,
    "sourceId" TEXT NOT NULL,
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "capturedByName" TEXT,

    CONSTRAINT "data_lineage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_records" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" "ConsentStatus" NOT NULL DEFAULT 'UNKNOWN',
    "capturedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "source" TEXT,

    CONSTRAINT "consent_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppression_records" (
    "id" TEXT NOT NULL,
    "voterId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "channel" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "suppression_records_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "roles_key_key" ON "roles"("key");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_roles_userId_roleId_key" ON "user_roles"("userId", "roleId");

-- CreateIndex
CREATE UNIQUE INDEX "user_constituency_access_userId_constituencyId_key" ON "user_constituency_access"("userId", "constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "constituencies_code_key" ON "constituencies"("code");

-- CreateIndex
CREATE UNIQUE INDEX "constituencies_name_key" ON "constituencies"("name");

-- CreateIndex
CREATE UNIQUE INDEX "polling_divisions_code_key" ON "polling_divisions"("code");

-- CreateIndex
CREATE INDEX "polling_divisions_constituencyId_idx" ON "polling_divisions"("constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "voters_voterNumber_key" ON "voters"("voterNumber");

-- CreateIndex
CREATE INDEX "voters_constituencyId_idx" ON "voters"("constituencyId");

-- CreateIndex
CREATE INDEX "voters_pollingDivisionId_idx" ON "voters"("pollingDivisionId");

-- CreateIndex
CREATE INDEX "voters_lastName_firstName_idx" ON "voters"("lastName", "firstName");

-- CreateIndex
CREATE INDEX "voters_contactStatus_idx" ON "voters"("contactStatus");

-- CreateIndex
CREATE INDEX "voters_canvassStatus_idx" ON "voters"("canvassStatus");

-- CreateIndex
CREATE INDEX "voter_contacts_voterId_idx" ON "voter_contacts"("voterId");

-- CreateIndex
CREATE INDEX "households_constituencyId_idx" ON "households"("constituencyId");

-- CreateIndex
CREATE INDEX "households_pollingDivisionId_idx" ON "households"("pollingDivisionId");

-- CreateIndex
CREATE UNIQUE INDEX "household_members_householdId_voterId_key" ON "household_members"("householdId", "voterId");

-- CreateIndex
CREATE UNIQUE INDEX "interaction_types_key_key" ON "interaction_types"("key");

-- CreateIndex
CREATE INDEX "interactions_voterId_idx" ON "interactions"("voterId");

-- CreateIndex
CREATE INDEX "interactions_constituencyId_idx" ON "interactions"("constituencyId");

-- CreateIndex
CREATE INDEX "interactions_occurredAt_idx" ON "interactions"("occurredAt");

-- CreateIndex
CREATE INDEX "issues_constituencyId_idx" ON "issues"("constituencyId");

-- CreateIndex
CREATE INDEX "issues_status_idx" ON "issues"("status");

-- CreateIndex
CREATE INDEX "issues_category_idx" ON "issues"("category");

-- CreateIndex
CREATE INDEX "issue_reports_issueId_idx" ON "issue_reports"("issueId");

-- CreateIndex
CREATE INDEX "field_turfs_constituencyId_idx" ON "field_turfs"("constituencyId");

-- CreateIndex
CREATE INDEX "walk_lists_constituencyId_idx" ON "walk_lists"("constituencyId");

-- CreateIndex
CREATE UNIQUE INDEX "walk_list_members_walkListId_voterId_key" ON "walk_list_members"("walkListId", "voterId");

-- CreateIndex
CREATE INDEX "campaign_tasks_pillar_idx" ON "campaign_tasks"("pillar");

-- CreateIndex
CREATE INDEX "campaign_tasks_status_idx" ON "campaign_tasks"("status");

-- CreateIndex
CREATE UNIQUE INDEX "elections_cycleLabel_key" ON "elections"("cycleLabel");

-- CreateIndex
CREATE UNIQUE INDEX "channels_name_key" ON "channels"("name");

-- CreateIndex
CREATE INDEX "content_items_status_idx" ON "content_items"("status");

-- CreateIndex
CREATE UNIQUE INDEX "relationships_voterAId_voterBId_type_key" ON "relationships"("voterAId", "voterBId", "type");

-- CreateIndex
CREATE INDEX "notifications_userId_idx" ON "notifications"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_recordType_idx" ON "audit_logs"("recordType");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- CreateIndex
CREATE INDEX "election_day_operations_constituencyId_idx" ON "election_day_operations"("constituencyId");

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_roles" ADD CONSTRAINT "user_roles_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "roles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_constituency_access" ADD CONSTRAINT "user_constituency_access_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_constituency_access" ADD CONSTRAINT "user_constituency_access_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "polling_divisions" ADD CONSTRAINT "polling_divisions_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_pollingDivisionId_fkey" FOREIGN KEY ("pollingDivisionId") REFERENCES "polling_divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voters" ADD CONSTRAINT "voters_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "voter_contacts" ADD CONSTRAINT "voter_contacts_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "households" ADD CONSTRAINT "households_pollingDivisionId_fkey" FOREIGN KEY ("pollingDivisionId") REFERENCES "polling_divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_householdId_fkey" FOREIGN KEY ("householdId") REFERENCES "households"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "household_members" ADD CONSTRAINT "household_members_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_typeId_fkey" FOREIGN KEY ("typeId") REFERENCES "interaction_types"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_pollingDivisionId_fkey" FOREIGN KEY ("pollingDivisionId") REFERENCES "polling_divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interactions" ADD CONSTRAINT "interactions_recordedByUserId_fkey" FOREIGN KEY ("recordedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_pollingDivisionId_fkey" FOREIGN KEY ("pollingDivisionId") REFERENCES "polling_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issues" ADD CONSTRAINT "issues_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_issueId_fkey" FOREIGN KEY ("issueId") REFERENCES "issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "issue_reports" ADD CONSTRAINT "issue_reports_reportedByUserId_fkey" FOREIGN KEY ("reportedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_turfs" ADD CONSTRAINT "field_turfs_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "field_turfs" ADD CONSTRAINT "field_turfs_pollingDivisionId_fkey" FOREIGN KEY ("pollingDivisionId") REFERENCES "polling_divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_lists" ADD CONSTRAINT "walk_lists_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_lists" ADD CONSTRAINT "walk_lists_pollingDivisionId_fkey" FOREIGN KEY ("pollingDivisionId") REFERENCES "polling_divisions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_lists" ADD CONSTRAINT "walk_lists_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_lists" ADD CONSTRAINT "walk_lists_assignedToUserId_fkey" FOREIGN KEY ("assignedToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_list_members" ADD CONSTRAINT "walk_list_members_walkListId_fkey" FOREIGN KEY ("walkListId") REFERENCES "walk_lists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "walk_list_members" ADD CONSTRAINT "walk_list_members_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvass_sessions" ADD CONSTRAINT "canvass_sessions_walkListId_fkey" FOREIGN KEY ("walkListId") REFERENCES "walk_lists"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "canvass_sessions" ADD CONSTRAINT "canvass_sessions_canvasserUserId_fkey" FOREIGN KEY ("canvasserUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_answers" ADD CONSTRAINT "survey_answers_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "survey_questions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_answers" ADD CONSTRAINT "survey_answers_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "survey_answers" ADD CONSTRAINT "survey_answers_canvassSessionId_fkey" FOREIGN KEY ("canvassSessionId") REFERENCES "canvass_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_tasks" ADD CONSTRAINT "campaign_tasks_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaign_tasks" ADD CONSTRAINT "campaign_tasks_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_results" ADD CONSTRAINT "election_results_electionId_fkey" FOREIGN KEY ("electionId") REFERENCES "elections"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_results" ADD CONSTRAINT "election_results_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_results" ADD CONSTRAINT "election_results_candidateId_fkey" FOREIGN KEY ("candidateId") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_authorUserId_fkey" FOREIGN KEY ("authorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "content_items" ADD CONSTRAINT "content_items_approverUserId_fkey" FOREIGN KEY ("approverUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_campaigns" ADD CONSTRAINT "media_campaigns_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "channels"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media_campaigns" ADD CONSTRAINT "media_campaigns_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donors" ADD CONSTRAINT "donors_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "donations" ADD CONSTRAINT "donations_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pledges" ADD CONSTRAINT "pledges_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "donors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fundraising_events" ADD CONSTRAINT "fundraising_events_organizerUserId_fkey" FOREIGN KEY ("organizerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_vendorId_fkey" FOREIGN KEY ("vendorId") REFERENCES "vendors"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "expenses" ADD CONSTRAINT "expenses_submittedByUserId_fkey" FOREIGN KEY ("submittedByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_voterAId_fkey" FOREIGN KEY ("voterAId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "relationships" ADD CONSTRAINT "relationships_voterBId_fkey" FOREIGN KEY ("voterBId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "risks" ADD CONSTRAINT "risks_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_rules" ADD CONSTRAINT "automation_rules_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "automation_runs" ADD CONSTRAINT "automation_runs_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "automation_rules"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_day_operations" ADD CONSTRAINT "election_day_operations_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_day_operations" ADD CONSTRAINT "election_day_operations_pollingDivisionId_fkey" FOREIGN KEY ("pollingDivisionId") REFERENCES "polling_divisions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_day_operations" ADD CONSTRAINT "election_day_operations_coordinatorUserId_fkey" FOREIGN KEY ("coordinatorUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_day_assignments" ADD CONSTRAINT "election_day_assignments_operationId_fkey" FOREIGN KEY ("operationId") REFERENCES "election_day_operations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_items" ADD CONSTRAINT "readiness_items_constituencyId_fkey" FOREIGN KEY ("constituencyId") REFERENCES "constituencies"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "readiness_items" ADD CONSTRAINT "readiness_items_ownerUserId_fkey" FOREIGN KEY ("ownerUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_queries" ADD CONSTRAINT "saved_queries_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "saved_segments" ADD CONSTRAINT "saved_segments_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_lineage" ADD CONSTRAINT "data_lineage_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_lineage" ADD CONSTRAINT "data_lineage_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "data_sources"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_records" ADD CONSTRAINT "consent_records_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppression_records" ADD CONSTRAINT "suppression_records_voterId_fkey" FOREIGN KEY ("voterId") REFERENCES "voters"("id") ON DELETE CASCADE ON UPDATE CASCADE;
