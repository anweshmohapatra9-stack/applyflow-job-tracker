# ApplyFlow Job Tracker

ApplyFlow is a full-stack job application dashboard for organizing opportunities, monitoring interview progress, and keeping a job search focused.

**[View the live application](https://anwesh-applyflow-job-tracker.anweshmohapatra9.chatgpt.site/)**

## Highlights

- Track company, role, location, application date, notes, and current status
- Search applications and filter the pipeline by stage
- Review dashboard metrics for active applications, interviews, offers, and response rate
- Move applications through saved, applied, interviewing, offered, rejected, or withdrawn stages
- Secure sign-in with private, per-user application data
- Responsive interface designed for desktop and mobile use

## Technology

- TypeScript, React 19, and Vinext
- Tailwind CSS and shadcn components
- Cloudflare D1 with Drizzle ORM
- Server actions for validated data mutations
- OpenAI Sites authentication and hosting

## Application structure

```text
app/          Dashboard, authentication, and server actions
components/   Reusable interface components
db/           Database schema and application queries
drizzle/      Versioned database migrations
public/       Static assets
```

Every database operation is scoped to the authenticated user on the server. Visitors can explore demonstration data without signing in; authenticated users receive their own persistent workspace.

## Run locally

Requirements: Node.js 22.13 or newer and pnpm.

```bash
pnpm install
pnpm dev
```

Then open `http://localhost:3000`.

## Production check

```bash
pnpm build
```

## Related project

The companion [Job Application Tracker API](https://github.com/anweshmohapatra9-stack/job-application-tracker-api) demonstrates the same product domain with Python, FastAPI, SQLite, automated tests, and Docker.
