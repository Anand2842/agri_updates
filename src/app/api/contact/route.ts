import { NextRequest, NextResponse } from 'next/server';
import { resend, isResendConfigured } from '@/lib/resend';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, subject, message } = body;

        // Validation
        if (!name || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        // 1. Save to Supabase (Database)
        const { error: dbError } = await supabase
            .from('contact_messages')
            .insert([
                { name, email, subject, message }
            ]);

        if (dbError) {
            console.error('Database error:', dbError);
            // We continue even if DB save fails? Or return error? 
            // Better to log and try email. But for now, let's just log.
        }

        // 2. Send Notification Email via Resend
        // We only send if RESEND_API_KEY is present
        if (isResendConfigured && resend) {
            const { error: emailError } = await resend.emails.send({
                from: 'Agri Updates Contact <contact@resend.dev>', // Update with verify domain
                to: ['anand@antigravity.dev'], // Admin email
                replyTo: email,
                subject: `New Contact Message: ${subject || 'No Subject'}`,
                html: `
                    <h2>New Message from ${name}</h2>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Subject:</strong> ${subject}</p>
                    <p><strong>Message:</strong></p>
                    <p>${message}</p>
                `
            });

            if (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail the request if just email fails, as long as logic is "contact form submitted"
            }
        }

        return NextResponse.json({
            message: 'Message sent successfully!'
        });

    } catch (error) {
        console.error('Contact API Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
