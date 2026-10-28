create function touch_updated_at() returns trigger language plpgsql as $$ begin new.updated_at=now(); return new; end $$;
create table services (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 owner text not null default '', backup_owner text not null default '', critical boolean not null default false,
 review_on date not null default current_date, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table certificates (
 id uuid primary key default gen_random_uuid(), fingerprint text not null unique check(fingerprint ~ '^[a-f0-9]{64}$'),
 common_name text not null, serial_number text not null, issuer text not null default '',
 not_before timestamptz not null, not_after timestamptz not null check(not_after>not_before),
 trust_type text not null default 'unknown' check(trust_type in ('public-tls','private','unknown')),
 state text not null default 'active' check(state in ('active','revoked','retired')),
 source_data jsonb not null default '{}'::jsonb,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table endpoints (
 id uuid primary key default gen_random_uuid(), code text not null unique, name text not null,
 service_id uuid not null references services, certificate_id uuid not null references certificates,
 observed_at timestamptz not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table renewals (
 id uuid primary key default gen_random_uuid(), code text not null unique,
 certificate_id uuid not null references certificates, replacement_id uuid not null references certificates,
 owner text not null, due_on date not null, rollback_plan text not null,
 status text not null default 'planned' check(status in ('planned','approved','closed')),
 approved_by text, approved_at timestamptz, approval_evidence text, closed_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 check(certificate_id<>replacement_id)
);
create table renewal_targets (
 id uuid primary key default gen_random_uuid(), renewal_id uuid not null references renewals, endpoint_id uuid not null references endpoints,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(renewal_id,endpoint_id)
);
create table installations (
 id uuid primary key default gen_random_uuid(), renewal_id uuid not null references renewals, endpoint_id uuid not null references endpoints,
 certificate_id uuid not null references certificates, actor text not null, evidence text not null,
 installed_at timestamptz not null, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table verifications (
 id uuid primary key default gen_random_uuid(), endpoint_id uuid not null references endpoints,
 fingerprint text not null check(fingerprint ~ '^[a-f0-9]{64}$'), result text not null check(result in ('pass','fail')),
 evidence text not null, actor text not null, checked_at timestamptz not null,
 sequence bigint generated always as identity, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table activity (
 id uuid primary key default gen_random_uuid(), action text not null, actor text not null, record_id uuid,
 before_data jsonb, after_data jsonb, note text not null default '',
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table imports (
 id uuid primary key default gen_random_uuid(), source text not null, file_hash text not null, actor text not null,
 inserted integer not null, unchanged integer not null,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
do $$ declare t text; begin foreach t in array array['services','certificates','endpoints','renewals','renewal_targets','installations','verifications','activity','imports'] loop
 execute format('create trigger touch before update on %I for each row execute function touch_updated_at()',t);
 execute format('alter table %I enable row level security',t);
 execute format('revoke all on %I from public',t);
end loop; end $$;
create view certificate_inventory as
 select c.*, ceil(extract(epoch from(c.not_after-now()))/86400)::int days_left,
 (select count(*)::int from endpoints e where e.certificate_id=c.id) endpoint_count
 from certificates c;
create view endpoint_health as
 select e.id,e.code,e.name,s.code service,s.owner,s.backup_owner,s.critical,c.common_name,c.fingerprint,c.state,
 c.not_after,e.observed_at, v.result latest_result,v.checked_at,v.evidence,
 case when c.state<>'active' then 'inactive-certificate'
 when c.not_after<=now() then 'expired'
 when c.not_before>now() then 'not-yet-valid'
 when v.id is null then 'unverified'
 when v.fingerprint<>c.fingerprint or v.checked_at<e.observed_at then 'stale-verification'
 when v.result='fail' then 'failed-check'
 when v.checked_at<now()-interval '14 days' then 'stale-check'
 else 'verified' end health
 from endpoints e join services s on s.id=e.service_id join certificates c on c.id=e.certificate_id
 left join lateral(select * from verifications where endpoint_id=e.id order by checked_at desc,sequence desc limit 1)v on true;
create view renewal_progress as
 select r.id,r.code,c.common_name,r.owner,r.due_on,r.status,
 (select count(*)::int from renewal_targets where renewal_id=r.id) target_count,
 (select count(*)::int from renewal_targets t join endpoints e on e.id=t.endpoint_id
 join endpoint_health h on h.id=e.id
 where t.renewal_id=r.id and e.certificate_id=r.replacement_id and h.health='verified'
 and exists(select 1 from installations i where i.renewal_id=r.id and i.endpoint_id=e.id and i.certificate_id=r.replacement_id and i.installed_at<=h.checked_at)) verified_count
 from renewals r join certificates c on c.id=r.certificate_id;
create view compliance_findings as
 select 'TLS-VALIDITY'::text rule, c.common_name item,'Public TLS validity exceeds the issuance-date maximum'::text finding,
 'https://cabforum.org/2025/04/11/ballot-sc081v3-introduce-schedule-of-reducing-validity-and-data-reuse-periods/'::text source
 from certificates c where c.trust_type='public-tls' and c.state='active' and
 extract(epoch from(c.not_after-c.not_before))/86400 > case when c.not_before>='2029-03-15T00:00:00Z' then 47 when c.not_before>='2027-03-15T00:00:00Z' then 100 when c.not_before>='2026-03-15T00:00:00Z' then 200 else 398 end
 union all select 'SCOPE',common_name,'Trust scope unknown: public TLS rule cannot be assessed','Local completeness policy' from certificates where trust_type='unknown' and state='active'
 union all select 'OWNER',code,'Missing primary or backup owner','Local ownership policy' from services where owner='' or backup_owner=''
 union all select 'REVIEW',code,'Service purpose and ownership review overdue','Local quarterly review policy' from services where review_on<current_date
 union all select 'DEPLOYMENT',code,'Closed renewal no longer has current verification on every target','Local renewal evidence policy' from renewal_progress where status='closed' and verified_count<target_count;
