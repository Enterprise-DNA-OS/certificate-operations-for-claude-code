insert into services(id,code,name,owner,backup_owner,critical,review_on) values
 ('10000000-0000-4000-8000-000000000001','PORTAL','Kauri customer portal','Mere','Lin',true,current_date+30),
 ('10000000-0000-4000-8000-000000000002','INTERNAL','Kauri internal services','','',false,current_date-14) on conflict do nothing;
insert into certificates(id,fingerprint,common_name,serial_number,issuer,not_before,not_after,trust_type) values
 ('20000000-0000-4000-8000-000000000001',repeat('a',64),'portal.example.test','AA01','Demo public issuer',now()-interval '170 days',now()+interval '10 days','public-tls'),
 ('20000000-0000-4000-8000-000000000002',repeat('b',64),'portal.example.test','BB02','Demo public issuer',now()-interval '1 day',now()+interval '180 days','public-tls'),
 ('20000000-0000-4000-8000-000000000003',repeat('c',64),'legacy.example.test','CC03','Demo private issuer',now()-interval '365 days',now()-interval '3 days','private'),
 ('20000000-0000-4000-8000-000000000004',repeat('d',64),'longlife.example.test','DD04','Demo public issuer',now()-interval '1 day',now()+interval '365 days','public-tls') on conflict do nothing;
insert into endpoints(id,code,name,service_id,certificate_id,observed_at) values
 ('30000000-0000-4000-8000-000000000001','PORTAL-A','portal-a.example.test:443','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',now()-interval '2 days'),
 ('30000000-0000-4000-8000-000000000002','PORTAL-B','portal-b.example.test:443','10000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000001',now()-interval '20 days'),
 ('30000000-0000-4000-8000-000000000003','LEGACY','legacy.example.test:8443','10000000-0000-4000-8000-000000000002','20000000-0000-4000-8000-000000000003',now()-interval '40 days') on conflict do nothing;
insert into renewals(id,code,certificate_id,replacement_id,owner,due_on,rollback_plan) values
 ('40000000-0000-4000-8000-000000000001','ROTATE-01','20000000-0000-4000-8000-000000000001','20000000-0000-4000-8000-000000000002','Mere',current_date-1,'Reinstate prior binding after operator approval and check both endpoints') on conflict do nothing;
insert into renewal_targets(id,renewal_id,endpoint_id) values
 ('50000000-0000-4000-8000-000000000001','40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001'),
 ('50000000-0000-4000-8000-000000000002','40000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000002') on conflict do nothing;
insert into verifications(id,endpoint_id,fingerprint,result,evidence,actor,checked_at) values
 ('60000000-0000-4000-8000-000000000001','30000000-0000-4000-8000-000000000001',repeat('a',64),'pass','Fictional demo check A','Demo operator',now()-interval '1 day'),
 ('60000000-0000-4000-8000-000000000002','30000000-0000-4000-8000-000000000002',repeat('a',64),'pass','Fictional demo stale check B','Demo operator',now()-interval '19 days') on conflict do nothing;
