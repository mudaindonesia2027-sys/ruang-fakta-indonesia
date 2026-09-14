# GitHub → Vercel Workflow

1. Create a private GitHub repository.
2. Upload/push this consolidated project.
3. Import the repository into Vercel.
4. Add the environment variables.
5. Deploy.
6. Test the generated public URL.
7. Configure a custom domain when ready.

Recommended branch flow:
- `main` → production
- `develop` → staging/development

Never commit `.env.local`, database passwords, service-role keys, or OAuth secrets.
