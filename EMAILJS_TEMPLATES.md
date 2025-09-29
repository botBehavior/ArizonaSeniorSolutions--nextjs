# EmailJS Template Setup Guide

## Contact Form Template (`template_q64ztcq`)

**Template ID:** `template_q64ztcq`

**Subject:** `New Contact Inquiry - {{from_name}}`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Contact Inquiry</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #3B82F6 0%, #1E40AF 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">🏥 New Contact Inquiry</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Senior Care Solutions Website</p>
    </div>

    <div style="background: white; border: 1px solid #E5E7EB; border-radius: 0 0 10px 10px; padding: 30px;">
        <h2 style="color: #1F2937; margin-top: 0;">👤 Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 8px 0;">{{from_name}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Phone:</td>
                <td style="padding: 8px 0;">{{phone}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">
                    <a href="mailto:{{user_email}}" style="color: #3B82F6;">{{user_email}}</a>
                </td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Relationship:</td>
                <td style="padding: 8px 0;">{{relationship}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Timeline:</td>
                <td style="padding: 8px 0;">{{urgency}}</td>
            </tr>
        </table>

        <h2 style="color: #1F2937; margin-top: 30px;">💬 Message</h2>
        <div style="background: #F9FAFB; padding: 20px; border-radius: 8px; border-left: 4px solid #3B82F6;">
            {{message}}
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #FEF3C7; border-radius: 8px; border: 1px solid #F59E0B;">
            <h3 style="margin: 0 0 10px 0; color: #92400E;">⚡ Action Required</h3>
            <p style="margin: 0; color: #92400E;">
                This inquiry was submitted through the contact form. Please respond within 24 hours as promised on the website.
            </p>
        </div>
    </div>
</body>
</html>
```

## Testimonial Form Template (`template_aekk8md`)

**Template ID:** `template_aekk8md`

**Subject:** `New Testimonial - {{from_name}}`

**HTML Body:**
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>New Testimonial Received</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
    <div style="background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="margin: 0; font-size: 24px;">💝 New Testimonial Received</h1>
        <p style="margin: 10px 0 0 0; opacity: 0.9;">Senior Care Solutions Website</p>
    </div>

    <div style="background: white; border: 1px solid #E5E7EB; border-radius: 0 0 10px 10px; padding: 30px;">
        <h2 style="color: #1F2937; margin-top: 0;">👤 Contact Information</h2>
        <table style="width: 100%; border-collapse: collapse;">
            <tr>
                <td style="padding: 8px 0; font-weight: bold; width: 120px;">Name:</td>
                <td style="padding: 8px 0;">{{from_name}}</td>
            </tr>
            <tr>
                <td style="padding: 8px 0; font-weight: bold;">Email:</td>
                <td style="padding: 8px 0;">
                    <a href="mailto:{{user_email}}" style="color: #10B981;">{{user_email}}</a>
                </td>
            </tr>
        </table>

        <h2 style="color: #1F2937; margin-top: 30px;">💝 Testimonial</h2>
        <div style="background: #F0FDF4; padding: 20px; border-radius: 8px; border-left: 4px solid #10B981;">
            {{message}}
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #DBEAFE; border-radius: 8px; border: 1px solid #3B82F6;">
            <h3 style="margin: 0 0 10px 0; color: #1E40AF;">📝 Next Steps</h3>
            <ul style="margin: 0; padding-left: 20px; color: #1E40AF;">
                <li>Send a thank you email to {{from_name}}</li>
                <li>Consider adding this to Google Reviews if appropriate</li>
                <li>Share with your team for quality improvement</li>
            </ul>
        </div>
    </div>
</body>
</html>
```

## Setup Instructions

1. **Log into EmailJS Dashboard:** https://www.emailjs.com/
2. **Navigate to Email Templates**
3. **Create two new templates** with the exact IDs above
4. **Copy and paste the HTML** into each template
5. **Test the templates** by submitting forms on your website

## Template Variables Used

**Contact Form:**
- `{{from_name}}` - Full name
- `{{phone}}` - Phone number
- `{{user_email}}` - Email address
- `{{relationship}}` - Relationship to loved one
- `{{urgency}}` - Timeline preference
- `{{message}}` - Main message

**Testimonial Form:**
- `{{from_name}}` - Full name
- `{{user_email}}` - Email address
- `{{message}}` - Testimonial content
