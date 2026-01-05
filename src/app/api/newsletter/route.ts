import { NextRequest, NextResponse } from 'next/server';
import { resend, isResendConfigured } from '@/lib/resend';

export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        // Basic email validation
        if (!email || !email.includes('@')) {
            return NextResponse.json(
                { error: 'Please provide a valid email address' },
                { status: 400 }
            );
        }

        // Check if Resend is configured
        if (!isResendConfigured || !resend) {
            console.warn('Newsletter: Resend not configured, email saved to console only');
            console.log('New newsletter subscriber:', email);
            return NextResponse.json({
                message: 'Successfully subscribed to newsletter!',
                note: 'Email service not configured'
            });
        }

        // Send email using Resend
        const { data, error } = await resend.emails.send({
            from: 'Agri Updates <onboarding@resend.dev>',
            to: ['anand@antigravity.dev'],
            subject: 'New Newsletter Subscription',
            html: `<p>New subscriber: <strong>${email}</strong></p>`
        });

        if (error) {
            console.error('Resend error:', error);
            return NextResponse.json(
                { error: 'Failed to subscribe' },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: 'Successfully subscribed to newsletter!',
            data
        });

    } catch (error) {
        console.error('Newsletter subscription error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
