# Landing Page Template

A streamlined template for creating landing pages with forms, backend, and email notifications.

## Quick Start

1. Copy this template to your new project
2. Run `npm run setup` to initialize the project
3. Configure your environment variables in `.env`
4. Set up your database and email service
5. Run `npm run dev` to start development

## Features

- ✅ Astro with TypeScript
- ✅ Tailwind CSS for styling
- ✅ PostgreSQL database
- ✅ Resend email service
- ✅ Vercel deployment ready
- ✅ Form validation
- ✅ Admin dashboard
- ✅ CSV export
- ✅ Responsive design

## Environment Setup

Copy `env.example` to `.env` and configure:

- Database URL
- Resend API key
- Admin credentials
- Admin email addresses

## Database Setup

The template includes database initialization. Make sure your PostgreSQL database is accessible and the connection string is correct.

## Email Setup

Configure Resend API key and admin email addresses for notifications.

## Deployment

Deploy to Vercel with zero configuration. Make sure to set all environment variables in your Vercel dashboard.

## Troubleshooting

### Vercel Deployment Issues
- **Error**: "Cannot find module '/var/task/dist/server/entry.mjs'"
- **Solution**: 
  1. Ensure `@astrojs/vercel` adapter is installed (not `@astrojs/vercel/serverless`)
  2. Verify `output: 'server'` is set in `astro.config.mjs`
  3. Check Vercel project settings → General → Build & Development Settings
  4. Ensure "Framework Preset" is set to "Astro" (or auto-detected)
  5. Build Command should be: `npm run build`
  6. Output Directory should be empty (adapter handles this automatically)
  7. If issue persists, try clearing Vercel build cache and redeploying

### Database Connection Issues
- **Error**: "Cannot read properties of undefined (reading 'searchParams')"
- **Solution**: Check DATABASE_URL format and SSL configuration

### Email Service Issues
- **Error**: "RESEND_API_KEY appears to be invalid"
- **Solution**: Ensure API key starts with 're_' and is properly set in environment variables

### Common Setup Issues
- **Database Connection**: Always test connection before deployment
- **Email Configuration**: Verify Resend API key format (starts with 're_')
- **Environment Variables**: Ensure all required variables are set in Vercel dashboard
- **SSL Configuration**: Use SSL connections for production databases

## Customization

- Update form fields in `src/lib/database.ts`
- Modify email templates in `src/lib/email.ts`
- Customize styling in `src/components/`
- Add new pages in `src/pages/`
