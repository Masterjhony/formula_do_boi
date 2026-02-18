'use server';

import { createClient } from '@/utils/supabase/server';

import { revalidatePath } from 'next/cache';

export interface TacticalTask {
    id: string;
    title: string;
    description?: string;
    status: string;
    priority: string;
    due_date?: string;
    assignees?: string[];
    position: number;
    created_at: string;
}

export async function getTasks() {
    const supabase = await createClient();
    const { data, error } = await supabase
        .from('tactical_tasks')
        .select('*')
        .order('position', { ascending: true }); // We might want to order by status then position, or handle sorting in JS

    if (error) {
        console.error('Error fetching tasks:', error);
        return [];
    }

    return data as TacticalTask[];
}

export async function createTask(task: Omit<TacticalTask, 'id' | 'created_at'>) {
    const supabase = await createClient();

    // Get max position to append
    const { data: maxPosData } = await supabase
        .from('tactical_tasks')
        .select('position')
        .eq('status', task.status)
        .order('position', { ascending: false })
        .limit(1)
        .single();

    const newPosition = (maxPosData?.position || 0) + 1000;

    const { data, error } = await supabase
        .from('tactical_tasks')
        .insert({ ...task, position: newPosition })
        .select()
        .single();

    if (error) {
        console.error('Error creating task:', error);
        throw new Error('Failed to create task');
    }

    revalidatePath('/web-admin/tactical-plan');
    return data as TacticalTask;
}

export async function updateTask(id: string, updates: Partial<TacticalTask>) {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('tactical_tasks')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

    if (error) {
        console.error('Error updating task:', error);
        throw new Error('Failed to update task');
    }

    revalidatePath('/web-admin/tactical-plan');
    return data;
}

export async function moveTask(id: string, newStatus: string, newPosition: number) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tactical_tasks')
        .update({ status: newStatus, position: newPosition })
        .eq('id', id);

    if (error) {
        console.error('Error moving task:', error);
        throw new Error('Failed to move task');
    }

    revalidatePath('/web-admin/tactical-plan');
}

export async function deleteTask(id: string) {
    const supabase = await createClient();

    const { error } = await supabase
        .from('tactical_tasks')
        .delete()
        .eq('id', id);

    if (error) {
        console.error('Error deleting task:', error);
        throw new Error('Failed to delete task');
    }

    revalidatePath('/web-admin/tactical-plan');
}

export async function getProfiles() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email, role'); // Assuming these fields exist

    if (error) {
        // If profiles table isn't readable or fields missing, return empty or handle.
        // For now, log and return empty.
        console.error('Error fetching profiles:', error);
        return [];
    }

    return data;
}
