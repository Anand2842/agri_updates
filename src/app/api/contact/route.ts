import { NextRequest, NextResponse } from 'next/server';
import { resend, isResendConfigured } from '@/lib/resend';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { firstName, lastName, email, subject, message } = body;

        // Validation
        if (!firstName || !lastName || !email || !message) {
            return NextResponse.json(
                { error: 'Name, email, and message are required' },
                { status: 400 }
            );
        }

        const fullName = `${firstName} ${lastName}`;

        // 1. Save to Supabase (Database)
        // Note: Check if 'contact_messages' table has 'first_name'/'last_name' or just 'name'.
        // Assuming it keeps 'name', we combine them.
        const { error: dbError } = await supabase
            .from('contact_messages')
            .insert([
                { name: fullName, email, subject, message }
            ]);

        if (dbError) {
            console.error('Database error:', dbError);
        }

        // 2. Send Notification Email via Resend
        if (isResendConfigured && resend) {
            const { error: emailError } = await resend.emails.send({
                from: 'Agri Updates Contact <onboarding@resend.dev>',
                to: ['aanand.ak15@gmail.com'], // Updated to user's email
                replyTo: email,
                subject: `New Contact Message: ${subject || 'No Subject'}`,
                html: `
                    <h2>New Message from ${fullName}</h2>
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
