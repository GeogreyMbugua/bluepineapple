'use server';

import { revalidatePath } from 'next/cache';

export async function refreshUsers() {
  revalidatePath('/admin/users');
}
