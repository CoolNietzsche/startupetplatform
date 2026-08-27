"use server";

import db from "@/lib/db/index";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { createNotification } from "@/lib/notifications";
import { calculateTotalPercentage, meetsThreshold } from "@/lib/directive/scoring-presets";

export async function getDashboardData() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    // 1. Fetch Committee Memberships
    const committees = await db.committee.findMany({
      where: {
        status: "ACTIVE",
        members: {
          some: {
            userId: userId,
            removedAt: null,
          },
        },
      },
      include: {
        members: {
          where: { removedAt: null },
        },
        assignments: {
          where: {
            status: { not: "CANCELLED" },
          },
        },
        ecoAssignments: {
          where: {
            active: true,
          },
        },
      },
    });

    const committeeIds = committees.map((c) => c.id);

    const formattedCommittees = committees.map((c) => {
      const activeEcoAssessments = c.ecoAssignments.filter((a) => a.active).length;
      const activeStartupAssessments = c.assignments.filter((a) => a.status !== "COMPLETED").length;
      
      const completedEcoAssessments = c.ecoAssignments.filter((a) => !a.active).length;
      const completedStartupAssessments = c.assignments.filter((a) => a.status === "COMPLETED").length;
      
      return {
        id: c.id,
        name: c.name,
        activeAssessments: activeEcoAssessments + activeStartupAssessments,
        completedAssessments: completedEcoAssessments + completedStartupAssessments,
        members: c.members.length,
      };
    });

    // 2. Fetch Eco Assignments (Pending, Under Review, and Completed)
    const allEcoAssignments = await db.ecoCommitteeAssignment.findMany({
      where: {
        committeeId: { in: committeeIds },
      },
      include: {
        committee: {
          include: {
            members: {
              where: { removedAt: null }
            }
          }
        },
        ecoApplication: {
          include: {
            builder: true,
          }
        },
        memberReviews: {
          include: { 
            scores: true,
            member: true
          }
        },
        decision: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const finalizedStatuses = ["COMMITTEE_REVIEW_SUBMITTED", "CERTIFIED", "REJECTED"];

    const mappedEco = allEcoAssignments.map(a => {
      const committee = committees.find(c => c.id === a.committeeId);
      const userReview = a.memberReviews.find(r => r.member.userId === userId && r.status === 'SUBMITTED');
      
      const allScores = a.memberReviews
        .filter(rev => rev.status === 'SUBMITTED')
        .flatMap(rev => rev.scores.map(s => s.score));
      
      const averageScore = allScores.length > 0 ? allScores.reduce((acc, b) => acc + Number(b), 0) / allScores.length : 0;
      
      const userScores = userReview?.scores.map(s => s.score) || [];
      const yourTotalScore = userScores.length > 0 ? userScores.reduce((acc, b) => acc + Number(b), 0) / userScores.length : 0;

      const userValuations = userReview?.scores.map(s => s.weightSnapshot || 0) || [];
      const yourTotalValuation = userValuations.reduce((acc, b) => acc + Number(b), 0);

      const isChair = a.chairMemberId === a.committee.members.find(m => m.userId === userId)?.id;

      let uiStatus = a.ecoApplication.status?.toLowerCase() || 'pending';
      if (finalizedStatuses.includes(a.ecoApplication.status)) {
        uiStatus = a.decision?.finalDecision?.toLowerCase() || 'submitted';
      } else if (userReview) {
        uiStatus = 'submitted';
      }

      return {
        id: a.ecoApplicationId,
        assignmentId: a.id,
        entityType: 'ecosystem',
        entityName: a.ecoApplication.name || a.ecoApplication.builder?.name || 'Unknown',
        entityLogo: null,
        sector: 'Ecosystem',
        stage: 'N/A',
        committeeId: a.committeeId,
        committeeName: a.committee.name,
        dueDate: new Date(a.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        submittedDate: a.decision?.submittedAt?.toISOString() || a.updatedAt.toISOString(),
        status: uiStatus,
        completedVotes: a.memberReviews.filter((r: any) => r.status === 'SUBMITTED').length,
        requiredVotes: committee?.members.length || 1,
        yourScore: yourTotalScore,
        yourTotalValuation: yourTotalValuation,
        isChair,
        finalDecision: a.decision?.finalDecision,
        committeeSummary: a.decision?.summary,
        avgScore: averageScore,
        createdAt: a.createdAt.toISOString(),
        hasSubmitted: !!userReview,
        applicationStatus: a.ecoApplication.status
      };
    });

    // 2.5 Fetch Startup Assignments (Pending, Under Review, and Completed)
    const allStartupAssignments = await db.applicationCommitteeAssignment.findMany({
      where: {
        committeeId: { in: committeeIds },
        status: { not: "CANCELLED" }
      },
      include: {
        committee: {
          include: {
            members: {
              where: { removedAt: null }
            }
          }
        },
        application: true,
        evaluations: {
          include: {
            scores: true,
            evaluator: true
          }
        },
        aggregate: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const mappedStartup = allStartupAssignments.map(a => {
      const committee = committees.find(c => c.id === a.committeeId);
      const userEvaluation = a.evaluations.find(e => e.evaluatorId === userId && e.status === 'SUBMITTED');
      
      const allScores = a.evaluations
        .filter(ev => ev.status === 'SUBMITTED')
        .flatMap(ev => ev.scores.map(s => s.score));
      const averageScore = allScores.length > 0 ? allScores.reduce((acc, b) => acc + Number(b), 0) / allScores.length : 0;

      const userScores = userEvaluation?.scores.map(s => s.score) || [];
      const yourTotalScore = userScores.length > 0 ? userScores.reduce((acc, b) => acc + Number(b), 0) / userScores.length : 0;

      const userValuations = userEvaluation?.scores.map(s => s.weightSnapshot || 0) || [];
      const yourTotalValuation = userValuations.reduce((acc, b) => acc + Number(b), 0);

      const isChair = a.committee.members.find((m: any) => m.userId === userId)?.memberRole === 'CHAIR';

      let uiStatus = a.application.status?.toLowerCase() || 'pending';
      if (finalizedStatuses.includes(a.application.status)) {
        if (a.aggregate) {
          uiStatus = a.aggregate.result === 'PASSED' ? 'approve' : 'reject';
        } else {
          uiStatus = 'submitted';
        }
      } else if (userEvaluation) {
        uiStatus = 'submitted';
      }

      return {
        id: a.applicationId,
        assignmentId: a.id,
        entityType: 'startup',
        entityName: a.application.startupName || 'Unknown Startup',
        entityLogo: null,
        sector: a.application.industry || 'Unknown Sector',
        stage: a.application.typeOfCompany || 'N/A',
        committeeId: a.committeeId,
        committeeName: a.committee.name,
        dueDate: new Date(a.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        submittedDate: userEvaluation?.submittedAt?.toISOString() || a.updatedAt.toISOString(),
        status: uiStatus,
        completedVotes: a.evaluations.filter((r: any) => r.status === 'SUBMITTED').length,
        requiredVotes: committee?.members.length || 1,
        yourScore: yourTotalScore,
        yourTotalValuation: yourTotalValuation,
        isChair,
        finalDecision: a.aggregate?.result || undefined,
        committeeSummary: userEvaluation?.overallComment || undefined,
        avgScore: averageScore,
        createdAt: a.createdAt.toISOString(),
        hasSubmitted: !!userEvaluation,
        applicationStatus: a.application.status
      }
    });

    // Partition into tabs
    const pendingAssessments = [
      ...mappedEco.filter(a => !finalizedStatuses.includes(a.applicationStatus) && !a.hasSubmitted && a.applicationStatus === "ASSIGNED_TO_COMMITTEE"),
      ...mappedStartup.filter(a => !finalizedStatuses.includes(a.applicationStatus) && !a.hasSubmitted && a.applicationStatus === "ASSIGNED_TO_COMMITTEE")
    ];

    const underReviewAssessments = [
      ...mappedEco.filter(a => !finalizedStatuses.includes(a.applicationStatus) && (a.hasSubmitted || a.applicationStatus === "IN_COMMITTEE_REVIEW")),
      ...mappedStartup.filter(a => !finalizedStatuses.includes(a.applicationStatus) && (a.hasSubmitted || a.applicationStatus === "IN_COMMITTEE_REVIEW"))
    ];

    const completedAssessments = [
      ...mappedEco.filter(a => finalizedStatuses.includes(a.applicationStatus)),
      ...mappedStartup.filter(a => finalizedStatuses.includes(a.applicationStatus))
    ];



    return { 
      success: true, 
      data: {
        committees: formattedCommittees,
        pendingAssessments,
        underReviewAssessments,
        completedAssessments,
        upcomingMeetings: [],
      } 
    };
  } catch (error: any) {
    console.error("Failed to fetch dashboard data:", error);
    return {
      success: false,
      message: error.message || "Failed to fetch dashboard data",
    };
  }
}

export async function getAssessmentResults(applicationId: string, entityType: 'ecosystem' | 'startup' = 'ecosystem') {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (entityType === 'startup') {
      const assignment = await db.applicationCommitteeAssignment.findFirst({
        where: { applicationId: applicationId, status: { not: "CANCELLED" } },
        include: {
          committee: { include: { criteria: true } },
          application: true,
          evaluations: {
            where: { status: "SUBMITTED" },
            include: {
              evaluator: true,
              scores: true
            }
          },
          aggregate: true
        }
      });

      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      const criteria = assignment.committee.criteria;
      const reviews = assignment.evaluations;

      const committeeMembers = await db.committeeMember.findMany({
        where: { committeeId: assignment.committeeId, removedAt: null },
        include: { user: true }
      });

      const resolvedMemberResults = await Promise.all(committeeMembers.map(async (member) => {
        const review = assignment.evaluations.find(e => e.evaluatorId === member.userId);
        const isChair = assignment.chairMemberId === member.id || member.memberRole === 'CHAIR';

        if (!review) {
          return {
            memberId: member.userId,
            memberName: `${member.user.firstName} ${member.user.lastName}`,
            email: member.user.email,
            phoneNumber: member.user.phoneNumber,
            address: member.user.address,
            userRole: member.user.role,
            averageRating: 0,
            totalValuation: 0,
            recommendation: 'PENDING',
            overallComment: 'Evaluation not yet submitted',
            criteriaScores: [],
            isChair: isChair
          };
        }

        const allRatings = review.scores.map(s => s.score);
        const averageRating = allRatings.length > 0
          ? allRatings.reduce((acc, b) => acc + Number(b), 0) / allRatings.length
          : 0;

        const totalValuation = review.scores.reduce((sum, s) => sum + Number(s.weightSnapshot), 0);

        const criteriaScores = review.scores.map(s => ({
          criterionId: s.criterionId,
          score: s.score,
          valuation: s.weightSnapshot,
          recommendation: null,
          comment: s.comment
        }));

        // Determine recommendation from aggregate if available, else mark as submitted
        let rec = 'SUBMITTED';
        if (assignment.aggregate) {
           rec = assignment.aggregate.result === 'PASSED' ? 'APPROVE' : 'REJECT';
        }

        return {
          memberId: member.userId,
          memberName: `${member.user.firstName} ${member.user.lastName}`,
          email: member.user.email,
          phoneNumber: member.user.phoneNumber,
          address: member.user.address,
          userRole: member.user.role,
          averageRating,
          totalValuation,
          recommendation: rec,
          overallComment: review.overallComment,
          criteriaScores,
          isChair: isChair
        };
      }));

      const allTotalValuations = resolvedMemberResults.map(r => r.totalValuation);
      const overallAverageValuation = allTotalValuations.length > 0
        ? allTotalValuations.reduce((a, b) => a + b, 0) / allTotalValuations.length
        : 0;

      const allAverageRatings = resolvedMemberResults.map(r => r.averageRating);
      const overallAverageRating = allAverageRatings.length > 0
        ? allAverageRatings.reduce((a, b) => a + Number(b), 0) / allAverageRatings.length
        : 0;

      const totalWeightAvailable = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
      
      const totalMembersCount = await db.committeeMember.count({
        where: { committeeId: assignment.committeeId, removedAt: null }
      });

      return {
        success: true,
        data: {
          applicationId,
          applicationName: assignment.application.startupName,
          committeeName: assignment.committee.name,
          criteria: criteria.map(c => ({ id: c.id, name: c.name, weight: c.weight })),
          memberResults: resolvedMemberResults,
          overallAverageValuation,
          overallAverageRating,
          totalWeightAvailable,
          totalMembersCount,
          decision: assignment.aggregate ? { finalDecision: assignment.aggregate.result, summary: assignment.notes || "" } : null
        }
      };
    }

    // Default: ECOSYSTEM
    const assignment = await db.ecoCommitteeAssignment.findFirst({
      where: { ecoApplicationId: applicationId, active: true },
      include: {
        committee: {
          include: {
            criteria: true
          }
        },
        ecoApplication: true,
        memberReviews: {
          where: { status: "SUBMITTED" },
          include: {
            member: {
              include: {
                user: true
              }
            },
            scores: true
          }
        },
        decision: true
      }
    });

    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }

    // Total members assigned to this committee
    const totalMembersCount = await db.committeeMember.count({
      where: { committeeId: assignment.committeeId, removedAt: null }
    });

    const criteria = assignment.committee.criteria;
    const reviews = assignment.memberReviews;

    const committeeMembers = await db.committeeMember.findMany({
      where: { committeeId: assignment.committeeId, removedAt: null },
      include: { user: { select: { firstName: true, lastName: true, email: true, phoneNumber: true, address: true, role: true } } }
    });

    const memberResults = committeeMembers.map(member => {
      const review = reviews.find(r => r.memberId === member.id);
      const isChair = assignment.chairMemberId === member.id || member.memberRole === 'CHAIR';

      if (!review) {
        return {
          memberId: member.id,
          memberName: `${member.user.firstName} ${member.user.lastName}`,
          email: member.user.email,
          phoneNumber: member.user.phoneNumber,
          address: member.user.address,
          userRole: member.user.role,
          averageRating: 0,
          totalValuation: 0,
          recommendation: 'PENDING',
          overallComment: 'Review not yet submitted',
          criteriaScores: [],
          isChair: isChair
        };
      }

      const allRatings = review.scores.map(s => s.score);
      const averageRating = allRatings.length > 0 
        ? allRatings.reduce((acc, b) => acc + Number(b), 0) / allRatings.length 
        : 0;
      
      const totalValuation = review.scores.reduce((sum, s) => sum + Number(s.weightSnapshot), 0);
      
      const criteriaScores = review.scores.map(s => ({
        criterionId: s.criterionId,
        score: s.score,
        valuation: s.weightSnapshot,
        recommendation: s.recommendation,
        comment: s.comment
      }));

      return {
        memberId: member.id,
        memberName: `${member.user.firstName} ${member.user.lastName}`,
        email: member.user.email,
        phoneNumber: member.user.phoneNumber,
        address: member.user.address,
        userRole: member.user.role,
        averageRating,
        totalValuation,
        recommendation: review.recommendation,
        overallComment: review.comment,
        criteriaScores,
        isChair: isChair
      };
    });

    // Calculate aggregated metrics across all members
    const allTotalValuations = memberResults.map(r => r.totalValuation);
    const overallAverageValuation = allTotalValuations.length > 0 
      ? allTotalValuations.reduce((a, b) => a + b, 0) / allTotalValuations.length 
      : 0;

    const allAverageRatings = memberResults.map(r => r.averageRating);
    const overallAverageRating = allAverageRatings.length > 0
      ? allAverageRatings.reduce((a, b) => a + b, 0) / allAverageRatings.length
      : 0;

    const totalWeightAvailable = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);

    return {
      success: true,
      data: {
        applicationId,
        applicationName: assignment.ecoApplication.name,
        committeeName: assignment.committee.name,
        criteria: criteria.map(c => ({ id: c.id, name: c.name, weight: c.weight })),
        memberResults,
        overallAverageValuation,
        overallAverageRating,
        totalWeightAvailable,
        totalMembersCount,
        decision: assignment.decision
      }
    };
  } catch (error: any) {
    console.error("Failed to get assessment results:", error);
    return { success: false, message: error.message };
  }
}

export async function getAssessmentDetails(applicationId: string, entityType: 'ecosystem' | 'startup' = 'ecosystem') {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    if (entityType === 'startup') {
      const assignment = await db.applicationCommitteeAssignment.findFirst({
        where: { applicationId: applicationId, status: { not: "CANCELLED" } },
        include: {
          committee: { include: { criteria: true } },
          application: {
            include: {
              businessLicenseFile: true,
              articlesOfIncorpFile: true,
              pitchDeckFile: true,
              financialsFile: true,
              founders: true,
              statusHistory: {
                orderBy: { createdAt: 'desc' }
              }
            }
          },
          aggregate: true
        }
      });

      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      if (assignment.application.status === "ASSIGNED_TO_COMMITTEE") {
        // COI check per Art. 14.1 — prompt member to declare conflicts
        const { checkPotentialConflict } = await import("@/lib/directive/conflict-of-interest");

        await db.$transaction([
          db.application.update({
            where: { id: applicationId },
            data: { status: "IN_COMMITTEE_REVIEW" }
          }),
          db.applicationStatusHistory.create({
            data: {
              applicationId: applicationId,
              status: "IN_COMMITTEE_REVIEW",
              comment: "Committee member started the review process."
            }
          })
        ]);
        assignment.application.status = "IN_COMMITTEE_REVIEW";
      }

      const member = await db.committeeMember.findFirst({
        where: {
          committeeId: assignment.committeeId,
          userId: userId,
          removedAt: null
        }
      });

      if (!member) {
        return { success: false, message: "User is not a member of this committee" };
      }

      const existingReview = await db.applicationEvaluation.findFirst({
        where: {
          assignmentId: assignment.id,
          evaluatorId: userId
        },
        include: { scores: true }
      });

      // Map to same object shape as eco
      const mappedExistingReview = existingReview ? {
        id: existingReview.id,
        assignmentId: existingReview.assignmentId,
        memberId: existingReview.evaluatorId,
        status: existingReview.status,
        recommendation: null,
        comment: existingReview.overallComment,
        submittedAt: existingReview.submittedAt,
        scores: existingReview.scores.map(s => ({
          ...s,
          recommendation: null
        }))
      } : null;

      const documents = [];
      const app = assignment.application;
      
      if (app.businessLicenseFile) {
        documents.push({
          id: app.businessLicenseFile.id,
          name: 'Business License',
          type: app.businessLicenseFile.mimeType || 'application/pdf',
          size: `${(app.businessLicenseFile.size / 1024 / 1024).toFixed(2)} MB`,
          url: `/api/files/${app.businessLicenseFile.id}`,
          uploadedAt: app.businessLicenseFile.createdAt
        });
      }
      
      if (app.pitchDeckFile) {
        documents.push({
          id: app.pitchDeckFile.id,
          name: 'Pitch Deck',
          type: app.pitchDeckFile.mimeType || 'application/pdf',
          size: `${(app.pitchDeckFile.size / 1024 / 1024).toFixed(2)} MB`,
          url: `/api/files/${app.pitchDeckFile.id}`,
          uploadedAt: app.pitchDeckFile.createdAt
        });
      }

      if (app.articlesOfIncorpFile) {
        documents.push({
          id: app.articlesOfIncorpFile.id,
          name: 'Articles of Incorporation',
          type: app.articlesOfIncorpFile.mimeType || 'application/pdf',
          size: `${(app.articlesOfIncorpFile.size / 1024 / 1024).toFixed(2)} MB`,
          url: `/api/files/${app.articlesOfIncorpFile.id}`,
          uploadedAt: app.articlesOfIncorpFile.createdAt
        });
      }

      if (app.financialsFile) {
        documents.push({
          id: app.financialsFile.id,
          name: 'Financial Statements',
          type: app.financialsFile.mimeType || 'application/pdf',
          size: `${(app.financialsFile.size / 1024 / 1024).toFixed(2)} MB`,
          url: `/api/files/${app.financialsFile.id}`,
          uploadedAt: app.financialsFile.createdAt
        });
      }

      // Compute evaluation SLA (30 days from assignment per Art. 9.1/17)
      const slaDays = 30;
      const slaDeadline = new Date(assignment.assignedAt.getTime() + slaDays * 24 * 60 * 60 * 1000);
      const now = new Date();
      const slaDiffMs = slaDeadline.getTime() - now.getTime();
      const slaRemainingDays = Math.max(0, Math.ceil(slaDiffMs / (1000 * 60 * 60 * 24)));
      const slaOverdue = now > slaDeadline;

      return {
        success: true,
        data: {
          application: {
            ...app,
            name: app.startupName, // Alias for unified UI
            builder: null, // Ensure null consistency
            history: app.statusHistory
          },
          criteria: assignment.committee.criteria,
          existingReview: mappedExistingReview,
          isChair: member.memberRole === 'CHAIR',
          documents,
          decision: assignment.aggregate ? { finalDecision: assignment.aggregate.result, summary: assignment.notes || "" } : null,
          evaluationSla: {
            assignedAt: assignment.assignedAt.toISOString(),
            slaDeadline: slaDeadline.toISOString(),
            slaRemainingDays,
            isOverdue: slaOverdue,
          },
        }
      };
    }

    // Default: ECOSYSTEM
    const assignment = await db.ecoCommitteeAssignment.findFirst({
      where: { ecoApplicationId: applicationId, active: true },
      include: {
        committee: {
          include: {
            criteria: true
          }
        },
        ecoApplication: {
          include: {
            builder: {
              include: {
                businessLicenseFile: true,
                taxRegistrationFile: true
              }
            },
            statusHistory: {
              include: { changedBy: { select: { firstName: true, lastName: true } } },
              orderBy: { createdAt: 'desc' }
            }
          }
        },
        decision: true
      }
    });

    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }

    // Auto-transition application to IN_COMMITTEE_REVIEW once a member starts reviewing
    if (assignment.ecoApplication.status === "ASSIGNED_TO_COMMITTEE") {
      await db.$transaction([
        db.ecoApplication.update({
          where: { id: applicationId },
          data: { status: "IN_COMMITTEE_REVIEW" }
        }),
        db.ecoApplicationStatusHistory.create({
          data: {
            ecoApplicationId: applicationId,
            fromStatus: "ASSIGNED_TO_COMMITTEE",
            toStatus: "IN_COMMITTEE_REVIEW",
            changedById: userId,
            reason: "Committee member started the review process."
          }
        })
      ]);
      assignment.ecoApplication.status = "IN_COMMITTEE_REVIEW";
    }

    // Find the committee member record for the current user
    const member = await db.committeeMember.findFirst({
      where: {
        committeeId: assignment.committeeId,
        userId: userId,
        removedAt: null
      }
    });

    if (!member) {
      return { success: false, message: "User is not a member of this committee" };
    }

    // Fetch existing review draft if any
    const existingReview = await db.ecoCommitteeReview.findFirst({
      where: {
        assignmentId: assignment.id,
        memberId: member.id
      },
      include: {
        scores: true
      }
    });

    // Format documents for UI
    const documents = [];
    const builder = assignment.ecoApplication.builder;
    
    if (builder?.businessLicenseFile) {
      documents.push({
        id: builder.businessLicenseFile.id,
        name: 'Business License',
        type: builder.businessLicenseFile.mimeType || 'application/pdf',
        size: `${(builder.businessLicenseFile.size / 1024 / 1024).toFixed(2)} MB`,
        url: `/api/files/${builder.businessLicenseFile.id}`,
        uploadedAt: builder.businessLicenseFile.createdAt
      });
    }
    
    if (builder?.taxRegistrationFile) {
      documents.push({
        id: builder.taxRegistrationFile.id,
        name: 'Tax Registration',
        type: builder.taxRegistrationFile.mimeType || 'application/pdf',
        size: `${(builder.taxRegistrationFile.size / 1024 / 1024).toFixed(2)} MB`,
        url: `/api/files/${builder.taxRegistrationFile.id}`,
        uploadedAt: builder.taxRegistrationFile.createdAt
      });
    }

    return {
      success: true,
      data: {
        application: {
          ...assignment.ecoApplication,
          history: assignment.ecoApplication.statusHistory
        },
        criteria: assignment.committee.criteria,
        existingReview,
        isChair: assignment.chairMemberId === member.id || member.memberRole === 'CHAIR',
        documents,
        decision: assignment.decision
      }
    };
  } catch (error: any) {
    console.error("Failed to get assessment details:", error);
    return { success: false, message: error.message };
  }
}

export async function saveAssessment(
  applicationId: string, 
  scores: Record<string, { score: number, weightEvaluation: number, recommendation: any, comment: string }>,
  overallRecommendation: any,
  overallComment: string,
  isSubmit: boolean = false,
  entityType: 'ecosystem' | 'startup' = 'ecosystem'
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    if (entityType === 'startup') {
      const assignment = await db.applicationCommitteeAssignment.findFirst({
        where: { applicationId: applicationId, status: { not: "CANCELLED" } },
        include: { committee: true, application: true }
      });

      if (!assignment) {
        return { success: false, message: "Assignment not found" };
      }

      const member = await db.committeeMember.findFirst({
        where: { committeeId: assignment.committeeId, userId: userId, removedAt: null }
      });

      if (!member) {
        return { success: false, message: "User is not a member of this committee" };
      }

      const review = await db.applicationEvaluation.upsert({
        where: {
          assignmentId_evaluatorId: {
            assignmentId: assignment.id,
            evaluatorId: userId
          }
        },
        update: {
          overallComment: overallComment,
          recommendation: overallRecommendation,
          status: isSubmit ? "SUBMITTED" : "DRAFT",
          submittedAt: isSubmit ? new Date() : undefined
        },
        create: {
          applicationId: applicationId,
          assignmentId: assignment.id,
          evaluatorId: userId,
          committeeId: assignment.committeeId,
          overallComment: overallComment,
          recommendation: overallRecommendation,
          status: isSubmit ? "SUBMITTED" : "DRAFT",
          submittedAt: isSubmit ? new Date() : undefined
        }
      });

      // Save individual scores
      let totalWeightedScore = 0;

      for (const criterionId in scores) {
        const s = scores[criterionId];
        const criterion = await db.committeeCriterion.findUnique({
          where: { id: criterionId }
        });

        if (criterion) {
          // Clamp weightEvaluation to not exceed criterion weight
          const clampedWeightEval = Math.max(0, Math.min(criterion.weight, s.weightEvaluation));
          const clampedScore = Math.max(0, Math.min(5, s.score));

          await db.applicationEvaluationScore.upsert({
            where: {
              evaluationId_criterionId: {
                evaluationId: review.id,
                criterionId: criterionId
              }
            },
            update: {
              score: clampedScore,
              comment: s.comment,
              weightSnapshot: clampedWeightEval
            },
            create: {
              evaluationId: review.id,
              criterionId: criterionId,
              score: clampedScore,
              comment: s.comment,
              weightSnapshot: clampedWeightEval
            }
          });
          totalWeightedScore += clampedWeightEval;
        }
      }

      // Important: Save the calculated total score to the evaluation record for the aggregate to work
      await db.applicationEvaluation.update({
        where: { id: review.id },
        data: { totalScore: totalWeightedScore }
      });

      if (isSubmit) {
        await db.applicationStatusHistory.create({
          data: {
            applicationId: applicationId,
            status: "IN_COMMITTEE_REVIEW",
            comment: `Committee member evaluation submitted.`
          }
        });

        // Notify Chair
        if (assignment.chairMemberId) {
          const chair = await db.committeeMember.findUnique({
            where: { id: assignment.chairMemberId },
            include: { user: true }
          });
          
          if (chair?.userId) {
            const memberName = `${session.user.name || 'A member'}`;
            await createNotification({
              userId: chair.userId,
              title: "New Evaluation Submitted",
              message: `${memberName} has submitted their review for ${assignment.application.startupName || 'a startup'}.`,
              type: 'info',
              link: `/committee-portal/assessments/startup/${applicationId}`
            });
          }
        }
      }

      return { success: true };
      }

    // Default: ECOSYSTEM
    const assignment = await db.ecoCommitteeAssignment.findFirst({
      where: { ecoApplicationId: applicationId, active: true },
      include: {
        committee: true,
        ecoApplication: true
      }
    });

    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }

    const member = await db.committeeMember.findFirst({
      where: { committeeId: assignment.committeeId, userId: userId, removedAt: null }
    });

    if (!member) {
      return { success: false, message: "User is not a member of this committee" };
    }

    const reviewRecommendation = overallRecommendation || null;

    const review = await db.ecoCommitteeReview.upsert({
      where: {
        assignmentId_memberId: {
          assignmentId: assignment.id,
          memberId: member.id
        }
      },
      update: {
        recommendation: reviewRecommendation,
        comment: overallComment,
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        submittedAt: isSubmit ? new Date() : undefined
      },
      create: {
        ecoApplicationId: applicationId,
        assignmentId: assignment.id,
        memberId: member.id,
        recommendation: reviewRecommendation,
        comment: overallComment,
        status: isSubmit ? "SUBMITTED" : "DRAFT",
        submittedAt: isSubmit ? new Date() : undefined
      }
    });

    // Save individual scores
    for (const criterionId in scores) {
      const s = scores[criterionId];
      const criterion = await db.committeeCriterion.findUnique({
        where: { id: criterionId }
      });

      if (criterion) {
        const scoreRecommendation = s.recommendation || null;
        const clampedWeightEval = Math.max(0, Math.min(criterion.weight, s.weightEvaluation));
        const clampedScore = Math.max(0, Math.min(5, s.score));

        await db.ecoCommitteeReviewScore.upsert({
          where: {
            reviewId_criterionId: {
              reviewId: review.id,
              criterionId: criterionId
            }
          },
          update: {
            score: clampedScore,
            recommendation: scoreRecommendation,
            comment: s.comment,
            weightSnapshot: clampedWeightEval
          },
          create: {
            reviewId: review.id,
            criterionId: criterionId,
            score: clampedScore,
            recommendation: scoreRecommendation,
            comment: s.comment,
            weightSnapshot: clampedWeightEval
          }
        });
      }
    }

    if (isSubmit) {
      await db.ecoApplicationStatusHistory.create({
        data: {
          ecoApplicationId: applicationId,
          fromStatus: "IN_COMMITTEE_REVIEW",
          toStatus: "IN_COMMITTEE_REVIEW",
          changedById: userId,
          reason: `Committee member evaluation submitted.`
        }
      });

      // Notify Chair
      if (assignment.chairMemberId) {
        const chair = await db.committeeMember.findUnique({
          where: { id: assignment.chairMemberId },
          include: { user: true }
        });
        
        if (chair?.userId) {
          const memberName = `${session.user.name || 'A member'}`;
          await createNotification({
            userId: chair.userId,
            title: "New Evaluation Submitted",
            message: `${memberName} has submitted their review for ${assignment.ecoApplication.name || 'an ecosystem application'}.`,
            type: 'info',
            link: `/committee-portal/assessments/ecosystem/${applicationId}`
          });
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to save assessment:", error);
    return { success: false, message: error.message };
  }
}

export async function submitFinalDecision(
  applicationId: string,
  finalRecommendation: string,
  finalComment: string,
  entityType: 'ecosystem' | 'startup' = 'ecosystem'
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    if (entityType === 'startup') {
      const assignment = await db.applicationCommitteeAssignment.findFirst({
        where: { applicationId: applicationId, status: { not: "CANCELLED" } },
        include: { committee: { include: { criteria: true } }, application: true }
      });

      if (!assignment) return { success: false, message: "Assignment not found" };

      const member = await db.committeeMember.findFirst({
        where: { committeeId: assignment.committeeId, userId: userId, removedAt: null }
      });

      if (!member) return { success: false, message: "User is not a member of this committee" };

      const isChair = assignment.chairMemberId === member.id || member.memberRole === 'CHAIR';
      if (!isChair) return { success: false, message: "Only the Committee Chair can submit the final decision" };

      // Check if all members submitted
      const totalMembers = await db.committeeMember.count({
        where: { committeeId: assignment.committeeId, removedAt: null }
      });

      const submittedReviewsCount = await db.applicationEvaluation.count({
        where: { assignmentId: assignment.id, status: "SUBMITTED" }
      });

      if (submittedReviewsCount < totalMembers) {
        return { 
          success: false, 
          message: `Waiting for all committee evaluations. Only ${submittedReviewsCount} of ${totalMembers} members have submitted.` 
        };
      }

      // Calculate total score from evaluations for the aggregate
      const evaluations = await db.applicationEvaluation.findMany({
        where: { assignmentId: assignment.id, status: "SUBMITTED" },
        include: { scores: true }
      });

      const totalScoreSum = evaluations.reduce((sum, ev) => {
        // Use saved totalScore if available, otherwise calculate from weighted scores
        if (ev.totalScore !== null && ev.totalScore !== undefined && ev.totalScore > 0) {
          return sum + ev.totalScore;
        }
        const calculated = ev.scores.reduce((s, score) => s + (Number(score.weightSnapshot) || 0), 0);
        return sum + calculated;
      }, 0);
      const averageTotalScore = evaluations.length > 0 ? totalScoreSum / evaluations.length : 0;

      // Pass threshold check from committee preset, with stage-based override
      const committeeWithThreshold = await db.committee.findUnique({
        where: { id: assignment.committeeId },
        select: { passThreshold: true },
      });

      // Check if this is a second renewal (Post-Initial stage renewal → 75% threshold)
      const application = await db.application.findUnique({
        where: { id: applicationId },
        select: { type: true, directiveStage: true },
      });
      const { getThresholdForStage } = await import("@/lib/directive/stages");
      const isSecondRenewal = application?.type === "RENEWAL" && application?.directiveStage === "POST_INITIAL";
      const stageThreshold = application?.directiveStage
        ? getThresholdForStage(application.directiveStage as any, isSecondRenewal)
        : null;

      const threshold = stageThreshold ?? committeeWithThreshold?.passThreshold;

      if (threshold !== null && threshold !== undefined) {
        const totalCriteriaWeight = assignment.committee.criteria.reduce(
          (sum, c) => sum + c.weight,
          0,
        );
        const scorePercent =
          totalCriteriaWeight > 0
            ? (averageTotalScore / totalCriteriaWeight) * 100
            : 0;

        if (
          (finalRecommendation === "APPROVE" ||
            finalRecommendation === "PASSED") &&
          !meetsThreshold(scorePercent, threshold)
        ) {
          return {
            success: false,
            message: `Score ${scorePercent.toFixed(1)}% does not meet the committee's pass threshold of ${threshold}%. Adjust scores or change recommendation to REJECT.`,
          };
        }
      }

      const evalResult = (finalRecommendation === 'APPROVE' || finalRecommendation === 'PASSED') ? 'PASSED' : 'FAILED';

      // Record the official committee decision for startup
      await db.applicationEvaluationAggregate.upsert({
        where: { assignmentId: assignment.id },
        update: {
          result: evalResult,
          totalScore: averageTotalScore,
          computedAt: new Date()
        },
        create: {
          assignmentId: assignment.id,
          result: evalResult,
          totalScore: averageTotalScore
        }
      });

      // Save summary in assignment notes
      if (finalComment) {
        await db.applicationCommitteeAssignment.update({
          where: { id: assignment.id },
          data: { notes: finalComment }
        });
      }

      await db.application.update({
        where: { id: applicationId },
        data: { status: "COMMITTEE_REVIEW_SUBMITTED" }
      });

      await db.applicationStatusHistory.create({
        data: {
          applicationId: applicationId,
          status: "COMMITTEE_REVIEW_SUBMITTED",
          comment: `Final committee decision: ${finalRecommendation}. ${finalComment}`
        }
      });

      // -- NEW NOTIFICATIONS --
      
      // 1. Notify Applicant
      if (assignment.application.userId) {
        await createNotification({
          userId: assignment.application.userId,
          title: "Application Review Updated",
          message: `Your application "${assignment.application.startupName}" has completed the committee review phase.`,
          type: 'success',
          link: `/dashboard/application`,
          sendAsEmail: true
        });
      }

      // 2. Notify Committee Members
      const members = await db.committeeMember.findMany({
        where: { committeeId: assignment.committeeId, removedAt: null }
      });

      for (const m of members) {
        if (m.userId === userId) continue; // Skip chair
        await createNotification({
          userId: m.userId,
          title: "Committee Review Finalized",
          message: `The final decision for "${assignment.application.startupName}" has been submitted by the Chair.`,
          type: 'info',
          link: `/committee-portal/assessments/startup/${applicationId}`
        });
      }

      // 3. Notify Admins (Super Admins)
      const admins = await db.user.findMany({
        where: { role: 'SUPER_ADMIN' }
      });

      for (const admin of admins) {
        await createNotification({
          userId: admin.id,
          title: "Committee Review Completed",
          message: `The committee has finalized their evaluation of "${assignment.application.startupName}" as ${finalRecommendation}.`,
          type: 'success',
          link: `/admins-new/applications`,
          sendAsEmail: true
        });
      }

      return { success: true };
    }

    // Ecosystem logic
    const assignment = await db.ecoCommitteeAssignment.findFirst({
      where: { ecoApplicationId: applicationId, active: true },
      include: {
        committee: true,
        ecoApplication: true
      }
    });

    if (!assignment) {
      return { success: false, message: "Assignment not found" };
    }

    const member = await db.committeeMember.findFirst({
      where: { committeeId: assignment.committeeId, userId: userId, removedAt: null }
    });

    if (!member) {
      return { success: false, message: "User is not a member of this committee" };
    }

    const isChair = assignment.chairMemberId === member.id || member.memberRole === 'CHAIR';
    if (!isChair) {
      return { success: false, message: "Only the Committee Chair can submit the final decision" };
    }

    // Check if all members have submitted their individual evaluations
    const totalMembers = await db.committeeMember.count({
      where: { committeeId: assignment.committeeId, removedAt: null }
    });

    const submittedReviewsCount = await db.ecoCommitteeReview.count({
      where: { assignmentId: assignment.id, status: "SUBMITTED" }
    });

    if (submittedReviewsCount < totalMembers) {
      return { 
        success: false, 
        message: `All committee members must submit their evaluations before the final decision can be submitted.` 
      };
    }

    // Record the official committee decision
    await db.ecoCommitteeDecision.upsert({
      where: { assignmentId: assignment.id },
      update: {
        summary: finalComment,
        finalDecision: finalRecommendation,
        submittedAt: new Date()
      },
      create: {
        assignmentId: assignment.id,
        chairMemberId: member.id,
        summary: finalComment,
        finalDecision: finalRecommendation
      }
    });

    await db.ecoApplication.update({
      where: { id: applicationId },
      data: { status: "COMMITTEE_REVIEW_SUBMITTED" }
    });

    await db.ecoApplicationStatusHistory.create({
      data: {
        ecoApplicationId: applicationId,
        fromStatus: "IN_COMMITTEE_REVIEW",
        toStatus: "COMMITTEE_REVIEW_SUBMITTED",
        changedById: userId,
        reason: `Final committee decision: ${finalRecommendation}. ${finalComment}`
      }
    });

    // -- NEW NOTIFICATIONS --
    
    // 1. Notify Builder
    if (assignment.ecoApplication.builderId) {
      const builder = await db.ecosystemBuilder.findUnique({
        where: { id: assignment.ecoApplication.builderId }
      });
      if (builder?.userId) {
        await createNotification({
          userId: builder.userId,
          title: "Application Review Updated",
          message: `Your ecosystem application "${assignment.ecoApplication.name}" has completed the committee review phase.`,
          type: 'success',
          link: `/ecosystem-builder`
        });
      }
    }

    // 2. Notify Committee Members
    const members = await db.committeeMember.findMany({
      where: { committeeId: assignment.committeeId, removedAt: null }
    });

    for (const m of members) {
      if (m.userId === userId) continue;
      await createNotification({
        userId: m.userId,
        title: "Committee Review Finalized",
        message: `The final decision for "${assignment.ecoApplication.name}" has been submitted by the Chair.`,
        type: 'info',
        link: `/committee-portal/assessments/ecosystem/${applicationId}`
      });
    }

    // 3. Notify Admins
    const admins = await db.user.findMany({
      where: { role: 'SUPER_ADMIN' }
    });

    for (const admin of admins) {
      await createNotification({
        userId: admin.id,
        title: "Committee Review Completed",
        message: `The committee has finalized their evaluation of "${assignment.ecoApplication.name}" as ${finalRecommendation}.`,
        type: 'success',
        link: `/admins-new/ecosystem`,
        sendAsEmail: true
      });
    }

    return { success: true };
  } catch (error: any) {
    console.error("Failed to submit final decision:", error);
    return { success: false, message: error.message };
  }
}


export async function startAssessmentReview(applicationId: string, entityType: 'ecosystem' | 'startup' = 'ecosystem') {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return { success: false, message: "Unauthorized" };
    }

    if (entityType === 'startup') {
       const application = await db.application.findUnique({
         where: { id: applicationId },
         select: { status: true }
       });

       // Transition only if it's currently assigned to committee
       if (application?.status === "ASSIGNED_TO_COMMITTEE") {
         await db.application.update({
           where: { id: applicationId },
           data: { 
             status: "IN_COMMITTEE_REVIEW",
             statusHistory: {
               create: {
                 status: "IN_COMMITTEE_REVIEW",
                 comment: "Committee review started"
               }
             }
           }
         });
       }
    } else {
       const application = await db.ecoApplication.findUnique({
         where: { id: applicationId },
         select: { status: true }
       });

       if (application?.status === "ASSIGNED_TO_COMMITTEE") {
         await db.ecoApplication.update({
           where: { id: applicationId },
           data: { 
             status: "IN_COMMITTEE_REVIEW",
             statusHistory: {
               create: {
                 toStatus: "IN_COMMITTEE_REVIEW",
                 changedById: session.user.id,
                 reason: "Committee review started"
               }
             }
           }
         });
       }
    }

    // Ensure the front-end reflects the new status across relevant views
    revalidatePath("/committee-portal/dashboard");
    revalidatePath("/committee-portal/assessments");
    revalidatePath("/committee-portal/assessments/ecosystem");
    revalidatePath("/committee-portal/assessments/startup");
    revalidatePath("/admins-new/applications");
    revalidatePath("/admins-new/ecosystem");

    return { success: true };
  } catch (error: any) {
    console.error("Failed to start assessment review:", error);
    return { success: false, message: error.message };
  }
}
