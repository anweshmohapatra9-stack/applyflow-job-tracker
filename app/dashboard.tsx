'use client';

import {
  ArrowUpRight,
  BriefcaseBusiness,
  CalendarDays,
  ChevronRight,
  CircleCheckBig,
  Clock3,
  LogIn,
  LogOut,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
} from 'lucide-react';
import {
  useActionState,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from 'react';

import {
  createApplication,
  deleteApplication,
  updateApplicationStatus,
  type ApplicationActionState,
} from './actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';

export type DashboardApplication = {
  id: number;
  company: string;
  role: string;
  status: string;
  location: string;
  appliedOn: string | null;
  notes: string;
  updatedAt: string;
};

type DashboardProps = {
  applications: DashboardApplication[];
  signedIn: boolean;
  displayName: string;
  signInPath: string;
  signOutPath: string;
};

const statusLabels: Record<string, string> = {
  saved: 'Saved',
  applied: 'Applied',
  interviewing: 'Interviewing',
  offered: 'Offered',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

const statusStyles: Record<string, string> = {
  interviewing: 'border-violet-200 bg-violet-50 text-violet-700',
  applied: 'border-blue-200 bg-blue-50 text-blue-700',
  offered: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  saved: 'border-slate-200 bg-slate-50 text-slate-600',
  rejected: 'border-rose-200 bg-rose-50 text-rose-700',
  withdrawn: 'border-amber-200 bg-amber-50 text-amber-700',
};

const initialActionState: ApplicationActionState = { ok: false };

function formatDate(value: string | null): string {
  if (!value) return 'Not set';
  return new Intl.DateTimeFormat('en', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(value));
}

export function Dashboard({
  applications,
  signedIn,
  displayName,
  signInPath,
  signOutPath,
}: DashboardProps) {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionState, formAction, formPending] = useActionState(
    createApplication,
    initialActionState,
  );
  const [updating, startTransition] = useTransition();

  useEffect(() => {
    if (!actionState.ok) return;
    const closeDialog = window.setTimeout(() => setDialogOpen(false), 0);
    return () => window.clearTimeout(closeDialog);
  }, [actionState.ok]);

  const filteredApplications = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return applications.filter((application) => {
      const matchesStatus =
        statusFilter === 'all' || application.status === statusFilter;
      const matchesQuery =
        !normalizedQuery ||
        application.company.toLowerCase().includes(normalizedQuery) ||
        application.role.toLowerCase().includes(normalizedQuery);
      return matchesStatus && matchesQuery;
    });
  }, [applications, query, statusFilter]);

  const counts = useMemo(() => {
    const count = (status: string) =>
      applications.filter((application) => application.status === status)
        .length;
    const applied = applications.length - count('saved');
    const responses =
      count('interviewing') + count('offered') + count('rejected');
    return {
      saved: count('saved'),
      applied: count('applied'),
      interviewing: count('interviewing'),
      offered: count('offered'),
      closed: count('rejected') + count('withdrawn'),
      active: count('applied') + count('interviewing') + count('offered'),
      responseRate: applied ? Math.round((responses / applied) * 100) : 0,
    };
  }, [applications]);

  const pipeline = [
    { label: 'Saved', count: counts.saved, color: 'bg-slate-300' },
    { label: 'Applied', count: counts.applied, color: 'bg-blue-500' },
    {
      label: 'Interviewing',
      count: counts.interviewing,
      color: 'bg-violet-500',
    },
    { label: 'Offered', count: counts.offered, color: 'bg-emerald-500' },
    { label: 'Closed', count: counts.closed, color: 'bg-rose-400' },
  ];

  const metrics = [
    {
      label: 'Total applications',
      value: applications.length,
      detail: signedIn ? 'Your saved records' : 'Interactive preview',
      icon: BriefcaseBusiness,
    },
    {
      label: 'Active pipeline',
      value: counts.active,
      detail: `${counts.interviewing} interviews`,
      icon: Clock3,
    },
    {
      label: 'Offers',
      value: counts.offered,
      detail: applications.length
        ? `${Math.round((counts.offered / applications.length) * 100)}% conversion`
        : 'Start building momentum',
      icon: CircleCheckBig,
    },
    {
      label: 'Response rate',
      value: `${counts.responseRate}%`,
      detail: 'Based on active outcomes',
      icon: TrendingUp,
    },
  ];

  function changeStatus(id: number, status: string) {
    startTransition(async () => {
      await updateApplicationStatus(id, status);
    });
  }

  function remove(id: number) {
    if (!window.confirm('Delete this application? This cannot be undone.'))
      return;
    startTransition(async () => {
      await deleteApplication(id);
    });
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border/70 bg-card/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1440px] items-center gap-6 px-4 sm:px-6 lg:px-8">
          <a className="flex items-center gap-2.5" href="#top">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <BriefcaseBusiness className="size-4.5" />
            </span>
            <span className="font-heading text-lg font-semibold tracking-[-0.02em]">
              ApplyFlow
            </span>
          </a>
          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Primary"
          >
            <Button variant="secondary">Dashboard</Button>
            <Button variant="ghost">Applications</Button>
            <Button variant="ghost">Insights</Button>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative hidden w-56 lg:block">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8"
                placeholder="Search applications"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
              />
            </div>
            {signedIn ? (
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger render={<Button size="lg" />}>
                  <Plus data-icon="inline-start" /> Add application
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg">
                  <DialogHeader>
                    <DialogTitle>Add an application</DialogTitle>
                    <DialogDescription>
                      Save the opportunity now and keep its next step visible.
                    </DialogDescription>
                  </DialogHeader>
                  <form action={formAction}>
                    <FieldGroup className="grid gap-4 sm:grid-cols-2">
                      <Field>
                        <FieldLabel htmlFor="company">Company</FieldLabel>
                        <Input
                          id="company"
                          name="company"
                          required
                          maxLength={160}
                        />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="role">Role</FieldLabel>
                        <Input id="role" name="role" required maxLength={160} />
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="status">Status</FieldLabel>
                        <NativeSelect
                          id="status"
                          name="status"
                          className="w-full"
                          defaultValue="applied"
                        >
                          {Object.entries(statusLabels).map(
                            ([value, label]) => (
                              <NativeSelectOption key={value} value={value}>
                                {label}
                              </NativeSelectOption>
                            ),
                          )}
                        </NativeSelect>
                      </Field>
                      <Field>
                        <FieldLabel htmlFor="appliedOn">
                          Application date
                        </FieldLabel>
                        <Input id="appliedOn" name="appliedOn" type="date" />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="location">Location</FieldLabel>
                        <Input
                          id="location"
                          name="location"
                          maxLength={120}
                          placeholder="Remote, Bengaluru, London…"
                        />
                      </Field>
                      <Field className="sm:col-span-2">
                        <FieldLabel htmlFor="notes">Notes</FieldLabel>
                        <Textarea
                          id="notes"
                          name="notes"
                          maxLength={2000}
                          placeholder="Contact, next step, interview notes…"
                        />
                      </Field>
                    </FieldGroup>
                    {actionState.error ? (
                      <FieldError className="mt-3">
                        {actionState.error}
                      </FieldError>
                    ) : null}
                    <DialogFooter className="mt-5">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button type="submit" disabled={formPending}>
                        {formPending ? 'Saving…' : 'Save application'}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            ) : (
              <Button
                size="lg"
                nativeButton={false}
                render={
                  <a
                    href={signInPath}
                    target="_top"
                    aria-label="Sign in with ChatGPT to start"
                  />
                }
              >
                <LogIn data-icon="inline-start" /> Sign in to start
              </Button>
            )}
          </div>
        </div>
      </header>

      <div
        id="top"
        className="mx-auto max-w-[1440px] px-4 py-7 sm:px-6 lg:px-8 lg:py-9"
      >
        <section className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <p className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
              <Sparkles className="size-3.5" />
              {signedIn
                ? `${displayName}'s job search`
                : 'Your job search command center'}
            </p>
            <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
              Keep every opportunity moving.
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
              Track applications, focus follow-ups, and see where your pipeline
              is gaining momentum.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <NativeSelect
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              aria-label="Filter applications by status"
            >
              <NativeSelectOption value="all">All statuses</NativeSelectOption>
              {Object.entries(statusLabels).map(([value, label]) => (
                <NativeSelectOption key={value} value={value}>
                  {label}
                </NativeSelectOption>
              ))}
            </NativeSelect>
            {signedIn ? (
              <Button
                variant="outline"
                size="icon-lg"
                nativeButton={false}
                render={
                  <a href={signOutPath} target="_top" aria-label="Sign out" />
                }
              >
                <LogOut />
                <span className="sr-only">Sign out</span>
              </Button>
            ) : (
              <Button variant="outline" size="lg">
                <CalendarDays data-icon="inline-start" /> Demo data
              </Button>
            )}
          </div>
        </section>

        <section
          className="mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"
          aria-label="Pipeline metrics"
        >
          {metrics.map((metric) => (
            <Card
              key={metric.label}
              className="border-0 shadow-[0_12px_30px_rgb(20_30_50/5%)]"
            >
              <CardHeader>
                <CardDescription>{metric.label}</CardDescription>
                <CardAction>
                  <span className="grid size-9 place-items-center rounded-xl bg-secondary text-primary">
                    <metric.icon className="size-4" />
                  </span>
                </CardAction>
                <CardTitle className="mt-3 text-3xl font-semibold tracking-[-0.04em]">
                  {metric.value}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs font-medium text-muted-foreground">
                  {metric.detail}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="mt-3 grid gap-3 xl:grid-cols-[minmax(0,1.7fr)_minmax(280px,0.7fr)]">
          <Card className="border-0 shadow-[0_12px_30px_rgb(20_30_50/5%)]">
            <CardHeader>
              <CardTitle>Application pipeline</CardTitle>
              <CardDescription>
                Current opportunities by hiring stage
              </CardDescription>
              <CardAction>
                <Button variant="ghost" size="sm">
                  View pipeline <ChevronRight data-icon="inline-end" />
                </Button>
              </CardAction>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3 sm:grid-cols-5">
                {pipeline.map((stage) => (
                  <div
                    key={stage.label}
                    className="rounded-xl border border-border/70 bg-background p-3.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span
                        className={`size-2.5 rounded-full ${stage.color}`}
                      />
                      <span className="font-mono text-2xl font-semibold tabular-nums">
                        {stage.count}
                      </span>
                    </div>
                    <p className="mt-6 text-xs font-medium text-muted-foreground">
                      {stage.label}
                    </p>
                  </div>
                ))}
              </div>
              <div
                className="mt-5 flex h-2 overflow-hidden rounded-full bg-muted"
                aria-label="Application stage distribution"
              >
                {pipeline.map((stage) => (
                  <span
                    key={stage.label}
                    className={stage.color}
                    style={{
                      width: applications.length
                        ? `${(stage.count / applications.length) * 100}%`
                        : '0%',
                    }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 bg-primary text-primary-foreground shadow-[0_12px_30px_rgb(20_30_50/8%)]">
            <CardHeader>
              <CardDescription className="text-primary-foreground/65">
                Weekly focus
              </CardDescription>
              <CardTitle className="text-xl">
                Keep your next steps visible.
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-6 text-primary-foreground/70">
                Review recent applications and follow up while conversations are
                still warm.
              </p>
              <Button variant="secondary" className="mt-5">
                Review follow-ups <ArrowUpRight data-icon="inline-end" />
              </Button>
            </CardContent>
          </Card>
        </section>

        <section className="mt-3">
          <Card className="border-0 shadow-[0_12px_30px_rgb(20_30_50/5%)]">
            <CardHeader>
              <CardTitle>Applications</CardTitle>
              <CardDescription>
                {filteredApplications.length} matching opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              {filteredApplications.length ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Updated</TableHead>
                      {signedIn ? (
                        <TableHead className="text-right">Actions</TableHead>
                      ) : null}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredApplications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.company}
                          <span className="mt-0.5 block text-xs font-normal text-muted-foreground">
                            {application.location}
                          </span>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {application.role}
                        </TableCell>
                        <TableCell>
                          {signedIn ? (
                            <NativeSelect
                              value={application.status}
                              onChange={(event) =>
                                changeStatus(application.id, event.target.value)
                              }
                              disabled={updating}
                              aria-label={`Status for ${application.company}`}
                            >
                              {Object.entries(statusLabels).map(
                                ([value, label]) => (
                                  <NativeSelectOption key={value} value={value}>
                                    {label}
                                  </NativeSelectOption>
                                ),
                              )}
                            </NativeSelect>
                          ) : (
                            <Badge
                              variant="outline"
                              className={statusStyles[application.status]}
                            >
                              {statusLabels[application.status]}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {formatDate(application.updatedAt)}
                        </TableCell>
                        {signedIn ? (
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => remove(application.id)}
                              disabled={updating}
                            >
                              <Trash2 />
                              <span className="sr-only">
                                Delete {application.company}
                              </span>
                            </Button>
                          </TableCell>
                        ) : null}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <Empty className="border">
                  <EmptyHeader>
                    <EmptyMedia variant="icon">
                      <BriefcaseBusiness />
                    </EmptyMedia>
                    <EmptyTitle>No applications found</EmptyTitle>
                    <EmptyDescription>
                      {applications.length
                        ? 'Try a different search or status filter.'
                        : 'Add your first opportunity to start building a clear pipeline.'}
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    {signedIn ? (
                      <Button onClick={() => setDialogOpen(true)}>
                        <Plus /> Add application
                      </Button>
                    ) : (
                      <Button
                        nativeButton={false}
                        render={
                          <a
                            href={signInPath}
                            target="_top"
                            aria-label="Sign in with ChatGPT to start"
                          />
                        }
                      >
                        <LogIn /> Sign in to start
                      </Button>
                    )}
                  </EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
