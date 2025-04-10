import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://yxyazvfxzsnkcbyqamlv.supabase.co';
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl4eWF6dmZ4enNua2NieXFhbWx2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQyNjA0MzUsImV4cCI6MjA1OTgzNjQzNX0.qCEfAAXMVrBVK7cyqQhFExOWBy0bjoDUf-gkVHggcxQ';

export const supabase = createClient(supabaseUrl, supabaseKey);
