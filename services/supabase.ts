import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cqilofthfsaiajivnzbu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNxaWxvZnRoZnNhaWFqaXZuemJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzEwMjA5ODgsImV4cCI6MjA4NjU5Njk4OH0.frhRsyP8Sof63fu1tj0-yxe-gf5HxXYmXFsm6EUKSl8';

export const supabase = createClient(supabaseUrl, supabaseKey);