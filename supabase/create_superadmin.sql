-- SCRIPT PARA CRIAR O USUÁRIO ADMINISTRADOR (gestor@nia-ai.com.br)
-- Execute este script no SQL Editor do painel do seu Supabase.

INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  recovery_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  '00000000-0000-0000-0000-000000000000',
  uuid_generate_v4(),
  'authenticated',
  'authenticated',
  'gestor@nia-ai.com.br',
  crypt('Gb$120525nia', gen_salt('bf')),
  now(),
  now(),
  now(),
  '{"provider":"email","providers":["email"],"is_superadmin":true}',
  '{}',
  now(),
  now(),
  '',
  '',
  '',
  ''
)
ON CONFLICT (email) DO UPDATE SET 
  encrypted_password = crypt('Gb$120525nia', gen_salt('bf')),
  raw_app_meta_data = '{"provider":"email","providers":["email"],"is_superadmin":true}',
  email_confirmed_at = now();
