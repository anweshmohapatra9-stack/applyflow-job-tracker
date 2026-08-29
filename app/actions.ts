'use server';

import { revalidatePath } from 'next/cache';

import { getChatGPTUser } from './chatgpt-auth';
import {
  insertApplication,
  removeApplication,
  setApplicationStatus,
} from '@/db/applications';
import { applicationStatuses, type ApplicationStatus } from '@/db/schema';

export type ApplicationActionState = {
  ok: boolean;
  error?: string;
};

function requiredText(formData: FormData, key: string): string {
  const value = formData.get(key);
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error(`${key} is required`);
  }
  return value.trim().slice(0, 160);
}

function optionalText(formData: FormData, key: string, limit: number): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value.trim().slice(0, limit) : '';
}

function isApplicationStatus(value: string): value is ApplicationStatus {
  return applicationStatuses.includes(value as ApplicationStatus);
}

export async function createApplication(
  _previousState: ApplicationActionState,
  formData: FormData,
): Promise<ApplicationActionState> {
  const user = await getChatGPTUser();
  if (!user) return { ok: false, error: 'Sign in to save applications.' };

  try {
    const company = requiredText(formData, 'company');
    const role = requiredText(formData, 'role');
    const rawStatus = optionalText(formData, 'status', 24) || 'applied';
    if (!isApplicationStatus(rawStatus)) {
      return { ok: false, error: 'Choose a valid application status.' };
    }

    const appliedOn = optionalText(formData, 'appliedOn', 10);
    if (appliedOn && !/^\d{4}-\d{2}-\d{2}$/.test(appliedOn)) {
      return { ok: false, error: 'Choose a valid application date.' };
    }

    const now = new Date();
    await insertApplication({
      userId: user.userId,
      company,
      role,
      status: rawStatus,
      location: optionalText(formData, 'location', 120),
      appliedOn: appliedOn || null,
      notes: optionalText(formData, 'notes', 2000),
      createdAt: now,
      updatedAt: now,
    });
    revalidatePath('/');
    return { ok: true };
  } catch (error) {
    return {
      ok: false,
      error:
        error instanceof Error ? error.message : 'Unable to save application.',
    };
  }
}

export async function updateApplicationStatus(
  id: number,
  status: string,
): Promise<ApplicationActionState> {
  const user = await getChatGPTUser();
  if (!user) return { ok: false, error: 'Sign in to update applications.' };
  if (!Number.isInteger(id) || id < 1 || !isApplicationStatus(status)) {
    return { ok: false, error: 'Invalid application update.' };
  }

  await setApplicationStatus(user.userId, id, status);
  revalidatePath('/');
  return { ok: true };
}

export async function deleteApplication(
  id: number,
): Promise<ApplicationActionState> {
  const user = await getChatGPTUser();
  if (!user) return { ok: false, error: 'Sign in to delete applications.' };
  if (!Number.isInteger(id) || id < 1) {
    return { ok: false, error: 'Invalid application.' };
  }

  await removeApplication(user.userId, id);
  revalidatePath('/');
  return { ok: true };
}
