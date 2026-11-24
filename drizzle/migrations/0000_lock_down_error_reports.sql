DO $$ BEGIN CREATE TYPE public.app_role AS ENUM ('admin','user'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view own roles" ON public.user_roles;
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$ SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role) $$;

DROP POLICY IF EXISTS "Anyone can delete error reports" ON public.error_reports;
DROP POLICY IF EXISTS "Anyone can update error reports" ON public.error_reports;
DROP POLICY IF EXISTS "Anyone can view error reports" ON public.error_reports;
DROP POLICY IF EXISTS "Anyone can insert error reports" ON public.error_reports;

CREATE POLICY "Anyone can submit valid error reports" ON public.error_reports FOR INSERT TO anon, authenticated
WITH CHECK (
  length(message) <= 5000 AND length(error_id) <= 200
  AND severity IN ('low','medium','high','critical')
  AND length(category) <= 100
  AND status = 'new'
  AND coalesce(length(stack_trace),0) <= 20000
);
CREATE POLICY "Admins can view error reports" ON public.error_reports FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can update error reports" ON public.error_reports FOR UPDATE TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins can delete error reports" ON public.error_reports FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));
REVOKE SELECT, UPDATE, DELETE ON public.error_reports FROM anon;
GRANT INSERT ON public.error_reports TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.error_reports TO authenticated;
GRANT ALL ON public.error_reports TO service_role;