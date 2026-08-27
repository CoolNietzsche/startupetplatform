'use server'

import db from "@/lib/db";
import { sendEmail } from '@/lib/actions/send-email';
import { formatDistanceToNow } from 'date-fns';

interface NewsDigestEmail {
    ethiopianNews: Array<{
        title: string;
        url: string;
        source: string;
    }>;
    africanNews: Array<{
        title: string;
        url: string;
        source: string;
    }>;
}

interface OpportunityAlert {
    opportunity: {
        title: string;
        organization: string;
        amount?: string;
        deadline?: Date;
        applicationUrl: string;
        category: string;
    };
}

export async function sendNewsDigest(userId: string, digest: NewsDigestEmail) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { notificationPrefs: true },
    });

    if (!user?.notificationPrefs?.newsDigest) return;

    const html = `
        <h2>Your Startup News Digest</h2>
        
        <h3>Ethiopian Tech News</h3>
        <ul>
            ${digest.ethiopianNews.map(news => `
                <li>
                    <a href="${news.url}">${news.title}</a>
                    <span style="color: #666;"> - ${news.source}</span>
                </li>
            `).join('')}
        </ul>

        <h3>African Startup Scene</h3>
        <ul>
            ${digest.africanNews.map(news => `
                <li>
                    <a href="${news.url}">${news.title}</a>
                    <span style="color: #666;"> - ${news.source}</span>
                </li>
            `).join('')}
        </ul>

        <p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/ecosystem">View more on the dashboard</a>
        </p>
    `;

    await sendEmail({
        to: user.email,
        subject: "Your Daily Startup News Digest",
        html,
    });
}

export async function sendOpportunityAlert(userId: string, alert: OpportunityAlert) {
    const user = await db.user.findUnique({
        where: { id: userId },
        include: { notificationPrefs: true },
    });

    if (!user?.notificationPrefs?.fundingAlerts) return;

    const deadline = alert.opportunity.deadline 
        ? formatDistanceToNow(alert.opportunity.deadline, { addSuffix: true })
        : 'No deadline specified';

    const html = `
        <h2>New Funding Opportunity Alert</h2>
        
        <div style="margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h3 style="margin: 0 0 10px 0;">${alert.opportunity.title}</h3>
            <p style="color: #666;">by ${alert.opportunity.organization}</p>
            
            ${alert.opportunity.amount ? `
                <p style="font-weight: bold;">Amount: ${alert.opportunity.amount}</p>
            ` : ''}
            
            <p>Deadline: ${deadline}</p>
            
            <div style="margin-top: 20px;">
                <a href="${alert.opportunity.applicationUrl}" 
                   style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Apply Now
                </a>
            </div>
        </div>

        <p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/ecosystem">View more opportunities</a>
        </p>
    `;

    await sendEmail({
        to: user.email,
        subject: `New ${alert.opportunity.category} Opportunity Available`,
        html,
    });
}

export async function sendDeadlineReminder(userId: string, opportunityId: string) {
    const savedOpportunity = await db.savedOpportunity.findUnique({
        where: {
            userId_opportunityId: {
                userId,
                opportunityId,
            },
        },
        include: {
            user: true,
            opportunity: true,
        },
    });

    if (!savedOpportunity) return;

    const html = `
        <h2>Funding Opportunity Deadline Reminder</h2>
        
        <div style="margin: 20px 0; padding: 20px; border: 1px solid #eee; border-radius: 5px;">
            <h3 style="margin: 0 0 10px 0;">${savedOpportunity.opportunity.title}</h3>
            <p style="color: #666;">by ${savedOpportunity.opportunity.organization}</p>
            
            <p style="color: #f00; font-weight: bold;">
                Deadline: ${savedOpportunity.opportunity.deadline?.toLocaleDateString()}
            </p>
            
            ${savedOpportunity.notes ? `
                <div style="margin: 15px 0; padding: 10px; background: #f7f7f7; border-radius: 5px;">
                    <strong>Your Notes:</strong><br>
                    ${savedOpportunity.notes}
                </div>
            ` : ''}
            
            <div style="margin-top: 20px;">
                <a href="${savedOpportunity.opportunity.applicationUrl}" 
                   style="background: #0070f3; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                    Apply Now
                </a>
            </div>
        </div>
    `;

    await sendEmail({
        to: savedOpportunity.user.email,
        subject: "Reminder: Funding Opportunity Deadline Approaching",
        html,
    });
}
