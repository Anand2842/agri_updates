import { NextRequest, NextResponse } from 'next/server';
import { resend, isResendConfigured } from '@/lib/resend';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { jobId, reason, otherDetails } = body;

        if (!jobId || !reason) {
            return NextResponse.json(
                { error: 'Job ID and reason are required' },
                { status: 400 }
            );
        }

        if (isResendConfigured && resend) {
            await resend.emails.send({
                from: 'Agri Updates <reports@resend.dev>',
                to: ['anand@antigravity.dev'],
                subject: `Job Reported: ID ${jobId}`,
                html: `
                    <h2>Job Report Received</h2>
                    <p><strong>Job ID:</strong> ${jobId}</p>
                    <p><strong>Reason:</strong> ${reason}</p>
                    <p><strong>Details:</strong> ${otherDetails || 'None provided'}</p>
                `
            });
        } else {
            console.log('Job Report (Email not configured):', { jobId, reason, otherDetails });
        }

        return NextResponse.json({
            message: 'Report submitted successfully. We will review this job shortly.'
        });

    } catch (error) {
        console.error('Report Job API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
