--
-- PostgreSQL database dump
--

\restrict SIahobZyr9U0x8gAZ0nMkBlKFuw1xnYO9njZhYTcsms8uxPKqV1DIPRWYE7dZt6

-- Dumped from database version 16.14
-- Dumped by pg_dump version 16.14

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

ALTER TABLE ONLY public.users DROP CONSTRAINT users_partner_id_fkey;
ALTER TABLE ONLY public.tickets DROP CONSTRAINT tickets_partner_id_fkey;
ALTER TABLE ONLY public.ticket_messages DROP CONSTRAINT ticket_messages_ticket_id_fkey;
ALTER TABLE ONLY public.ticket_messages DROP CONSTRAINT ticket_messages_sender_id_fkey;
ALTER TABLE ONLY public.refresh_sessions DROP CONSTRAINT refresh_sessions_user_id_fkey;
ALTER TABLE ONLY public.payouts DROP CONSTRAINT payouts_partner_id_fkey;
ALTER TABLE ONLY public.partners DROP CONSTRAINT partners_referred_by_id_fkey;
ALTER TABLE ONLY public.partner_tags DROP CONSTRAINT partner_tags_partner_id_fkey;
ALTER TABLE ONLY public.partner_sources DROP CONSTRAINT partner_sources_partner_id_fkey;
ALTER TABLE ONLY public.partner_pipelines DROP CONSTRAINT partner_pipelines_partner_id_fkey;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_user_id_fkey;
ALTER TABLE ONLY public.notification_prefs DROP CONSTRAINT notification_prefs_user_id_fkey;
ALTER TABLE ONLY public.lead_status_history DROP CONSTRAINT lead_status_history_partner_id_fkey;
ALTER TABLE ONLY public.lead_snapshots DROP CONSTRAINT lead_snapshots_partner_id_fkey;
ALTER TABLE ONLY public.commissions DROP CONSTRAINT commissions_partner_id_fkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_actor_user_id_fkey;
DROP INDEX public.webhook_events_status_received_at_idx;
DROP INDEX public.webhook_events_event_id_key;
DROP INDEX public.users_partner_id_idx;
DROP INDEX public.users_email_key;
DROP INDEX public.tickets_partner_id_idx;
DROP INDEX public.ticket_messages_ticket_id_idx;
DROP INDEX public.ticket_messages_sender_id_idx;
DROP INDEX public.refresh_sessions_user_id_idx;
DROP INDEX public.payouts_partner_id_idx;
DROP INDEX public.partner_tags_partner_id_idx;
DROP INDEX public.partner_tags_partner_id_amocrm_tag_id_key;
DROP INDEX public.partner_sources_partner_id_idx;
DROP INDEX public.partner_sources_partner_id_amocrm_source_key;
DROP INDEX public.partner_pipelines_partner_id_idx;
DROP INDEX public.partner_pipelines_partner_id_amocrm_pipeline_id_key;
DROP INDEX public.notifications_user_id_is_read_idx;
DROP INDEX public.notifications_user_id_created_at_idx;
DROP INDEX public.lead_status_history_partner_id_changed_at_idx;
DROP INDEX public.lead_snapshots_partner_id_updated_at_source_idx;
DROP INDEX public.lead_snapshots_external_lead_id_partner_id_key;
DROP INDEX public.lead_snapshots_external_lead_id_idx;
DROP INDEX public.commissions_partner_id_idx;
DROP INDEX public.audit_logs_created_at_idx;
ALTER TABLE ONLY public.webhook_events DROP CONSTRAINT webhook_events_pkey;
ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
ALTER TABLE ONLY public.tickets DROP CONSTRAINT tickets_pkey;
ALTER TABLE ONLY public.ticket_messages DROP CONSTRAINT ticket_messages_pkey;
ALTER TABLE ONLY public.refresh_sessions DROP CONSTRAINT refresh_sessions_pkey;
ALTER TABLE ONLY public.payouts DROP CONSTRAINT payouts_pkey;
ALTER TABLE ONLY public.partners DROP CONSTRAINT partners_pkey;
ALTER TABLE ONLY public.partner_tags DROP CONSTRAINT partner_tags_pkey;
ALTER TABLE ONLY public.partner_sources DROP CONSTRAINT partner_sources_pkey;
ALTER TABLE ONLY public.partner_pipelines DROP CONSTRAINT partner_pipelines_pkey;
ALTER TABLE ONLY public.notifications DROP CONSTRAINT notifications_pkey;
ALTER TABLE ONLY public.notification_prefs DROP CONSTRAINT notification_prefs_pkey;
ALTER TABLE ONLY public.lead_status_history DROP CONSTRAINT lead_status_history_pkey;
ALTER TABLE ONLY public.lead_snapshots DROP CONSTRAINT lead_snapshots_pkey;
ALTER TABLE ONLY public.commissions DROP CONSTRAINT commissions_pkey;
ALTER TABLE ONLY public.audit_logs DROP CONSTRAINT audit_logs_pkey;
ALTER TABLE ONLY public._prisma_migrations DROP CONSTRAINT _prisma_migrations_pkey;
ALTER TABLE public.webhook_events ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.ticket_messages ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.payouts ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.partner_tags ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.partner_sources ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.partner_pipelines ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.lead_status_history ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.lead_snapshots ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.commissions ALTER COLUMN id DROP DEFAULT;
ALTER TABLE public.audit_logs ALTER COLUMN id DROP DEFAULT;
DROP SEQUENCE public.webhook_events_id_seq;
DROP TABLE public.webhook_events;
DROP TABLE public.users;
DROP TABLE public.tickets;
DROP SEQUENCE public.ticket_messages_id_seq;
DROP TABLE public.ticket_messages;
DROP TABLE public.refresh_sessions;
DROP SEQUENCE public.payouts_id_seq;
DROP TABLE public.payouts;
DROP TABLE public.partners;
DROP SEQUENCE public.partner_tags_id_seq;
DROP TABLE public.partner_tags;
DROP SEQUENCE public.partner_sources_id_seq;
DROP TABLE public.partner_sources;
DROP SEQUENCE public.partner_pipelines_id_seq;
DROP TABLE public.partner_pipelines;
DROP TABLE public.notifications;
DROP TABLE public.notification_prefs;
DROP SEQUENCE public.lead_status_history_id_seq;
DROP TABLE public.lead_status_history;
DROP SEQUENCE public.lead_snapshots_id_seq;
DROP TABLE public.lead_snapshots;
DROP SEQUENCE public.commissions_id_seq;
DROP TABLE public.commissions;
DROP SEQUENCE public.audit_logs_id_seq;
DROP TABLE public.audit_logs;
DROP TABLE public._prisma_migrations;
DROP TYPE public."WebhookStatus";
DROP TYPE public."UserRole";
DROP TYPE public."TicketStatus";
DROP TYPE public."PayoutType";
DROP TYPE public."PayoutStatus";
DROP TYPE public."NotificationType";
DROP TYPE public."CommissionType";
DROP TYPE public."CommissionStatus";
-- *not* dropping schema, since initdb creates it
--
-- Name: public; Type: SCHEMA; Schema: -; Owner: -
--

-- *not* creating schema, since initdb creates it


--
-- Name: SCHEMA public; Type: COMMENT; Schema: -; Owner: -
--

COMMENT ON SCHEMA public IS '';


--
-- Name: CommissionStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommissionStatus" AS ENUM (
    'PENDING',
    'AVAILABLE',
    'PAID'
);


--
-- Name: CommissionType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."CommissionType" AS ENUM (
    'DIRECT',
    'REFERRAL'
);


--
-- Name: NotificationType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."NotificationType" AS ENUM (
    'LEAD_STATUS_CHANGED',
    'BROKER_ASSIGNED',
    'PAYOUT_STATUS_CHANGED',
    'NEW_REFERRAL',
    'SYSTEM_ALERT',
    'NEW_PARTNER',
    'SUPPORT_TICKET',
    'NEW_LEAD'
);


--
-- Name: PayoutStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PayoutStatus" AS ENUM (
    'PENDING',
    'PROCESSING',
    'COMPLETED',
    'CANCELLED'
);


--
-- Name: PayoutType; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."PayoutType" AS ENUM (
    'BANK_TRANSFER',
    'CASH',
    'USDT'
);


--
-- Name: TicketStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."TicketStatus" AS ENUM (
    'OPEN',
    'IN_PROGRESS',
    'RESOLVED',
    'CLOSED'
);


--
-- Name: UserRole; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."UserRole" AS ENUM (
    'partner_user',
    'admin'
);


--
-- Name: WebhookStatus; Type: TYPE; Schema: public; Owner: -
--

CREATE TYPE public."WebhookStatus" AS ENUM (
    'received',
    'processed',
    'failed'
);


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.audit_logs (
    id bigint NOT NULL,
    request_id text NOT NULL,
    actor_user_id text,
    actor_role text,
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.audit_logs_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: commissions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.commissions (
    id bigint NOT NULL,
    partner_id text NOT NULL,
    external_lead_id bigint,
    amount numeric(18,2) NOT NULL,
    currency text DEFAULT 'AED'::text NOT NULL,
    type public."CommissionType" NOT NULL,
    status public."CommissionStatus" DEFAULT 'PENDING'::public."CommissionStatus" NOT NULL,
    description text,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


--
-- Name: commissions_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.commissions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: commissions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.commissions_id_seq OWNED BY public.commissions.id;


--
-- Name: lead_snapshots; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_snapshots (
    id bigint NOT NULL,
    external_lead_id bigint NOT NULL,
    partner_id text NOT NULL,
    title text NOT NULL,
    status text NOT NULL,
    budget numeric(18,2),
    city text,
    comment text,
    contact_name text,
    contact_phone text,
    contact_email text,
    broker_name text,
    broker_phone text,
    broker_email text,
    amocrm_source text,
    tag_ids bigint[],
    updated_at_source timestamp with time zone NOT NULL,
    synced_at timestamp with time zone NOT NULL,
    pipeline_id bigint,
    created_at_source timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    custom_fields jsonb
);


--
-- Name: lead_snapshots_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lead_snapshots_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lead_snapshots_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lead_snapshots_id_seq OWNED BY public.lead_snapshots.id;


--
-- Name: lead_status_history; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.lead_status_history (
    id bigint NOT NULL,
    external_lead_id bigint NOT NULL,
    partner_id text NOT NULL,
    from_status text,
    to_status text NOT NULL,
    changed_at timestamp with time zone NOT NULL,
    changed_by text,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: lead_status_history_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.lead_status_history_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: lead_status_history_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.lead_status_history_id_seq OWNED BY public.lead_status_history.id;


--
-- Name: notification_prefs; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notification_prefs (
    user_id text NOT NULL,
    on_status_change boolean DEFAULT true NOT NULL,
    on_broker_change boolean DEFAULT true NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    on_weekly_summary boolean DEFAULT false NOT NULL
);


--
-- Name: notifications; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.notifications (
    id text NOT NULL,
    user_id text NOT NULL,
    type public."NotificationType" NOT NULL,
    title text NOT NULL,
    message text NOT NULL,
    link text,
    is_read boolean DEFAULT false NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partner_pipelines; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_pipelines (
    id bigint NOT NULL,
    partner_id text NOT NULL,
    amocrm_pipeline_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partner_pipelines_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_pipelines_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_pipelines_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_pipelines_id_seq OWNED BY public.partner_pipelines.id;


--
-- Name: partner_sources; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_sources (
    id bigint NOT NULL,
    partner_id text NOT NULL,
    amocrm_source text NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partner_sources_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_sources_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_sources_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_sources_id_seq OWNED BY public.partner_sources.id;


--
-- Name: partner_tags; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partner_tags (
    id bigint NOT NULL,
    partner_id text NOT NULL,
    amocrm_tag_id bigint NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: partner_tags_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.partner_tags_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: partner_tags_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.partner_tags_id_seq OWNED BY public.partner_tags.id;


--
-- Name: partners; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.partners (
    id text NOT NULL,
    name text NOT NULL,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    labels text[] NOT NULL,
    referred_by_id text,
    country text,
    direction text,
    "partnerType" text
);


--
-- Name: payouts; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.payouts (
    id bigint NOT NULL,
    partner_id text NOT NULL,
    amount numeric(18,2) NOT NULL,
    currency text DEFAULT 'AED'::text NOT NULL,
    status public."PayoutStatus" DEFAULT 'PENDING'::public."PayoutStatus" NOT NULL,
    type public."PayoutType" NOT NULL,
    details jsonb,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL,
    processed_at timestamp(6) with time zone
);


--
-- Name: payouts_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.payouts_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: payouts_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.payouts_id_seq OWNED BY public.payouts.id;


--
-- Name: refresh_sessions; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.refresh_sessions (
    id text NOT NULL,
    user_id text NOT NULL,
    refresh_token_hash text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    revoked_at timestamp with time zone,
    user_agent text,
    ip inet,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ticket_messages; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.ticket_messages (
    id bigint NOT NULL,
    ticket_id text NOT NULL,
    sender_id text NOT NULL,
    message text NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


--
-- Name: ticket_messages_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.ticket_messages_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: ticket_messages_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.ticket_messages_id_seq OWNED BY public.ticket_messages.id;


--
-- Name: tickets; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.tickets (
    id text NOT NULL,
    partner_id text NOT NULL,
    subject text NOT NULL,
    status public."TicketStatus" DEFAULT 'OPEN'::public."TicketStatus" NOT NULL,
    created_at timestamp(6) with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp(6) with time zone NOT NULL
);


--
-- Name: users; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.users (
    id text NOT NULL,
    email text NOT NULL,
    password_hash text NOT NULL,
    role public."UserRole" NOT NULL,
    partner_id text,
    is_active boolean DEFAULT true NOT NULL,
    created_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at timestamp with time zone NOT NULL,
    name text,
    phone text
);


--
-- Name: webhook_events; Type: TABLE; Schema: public; Owner: -
--

CREATE TABLE public.webhook_events (
    id bigint NOT NULL,
    event_id text NOT NULL,
    source text NOT NULL,
    payload jsonb NOT NULL,
    received_at timestamp with time zone NOT NULL,
    processed_at timestamp with time zone,
    status public."WebhookStatus" DEFAULT 'received'::public."WebhookStatus" NOT NULL,
    error_message text
);


--
-- Name: webhook_events_id_seq; Type: SEQUENCE; Schema: public; Owner: -
--

CREATE SEQUENCE public.webhook_events_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


--
-- Name: webhook_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: -
--

ALTER SEQUENCE public.webhook_events_id_seq OWNED BY public.webhook_events.id;


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: commissions id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions ALTER COLUMN id SET DEFAULT nextval('public.commissions_id_seq'::regclass);


--
-- Name: lead_snapshots id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_snapshots ALTER COLUMN id SET DEFAULT nextval('public.lead_snapshots_id_seq'::regclass);


--
-- Name: lead_status_history id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_status_history ALTER COLUMN id SET DEFAULT nextval('public.lead_status_history_id_seq'::regclass);


--
-- Name: partner_pipelines id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_pipelines ALTER COLUMN id SET DEFAULT nextval('public.partner_pipelines_id_seq'::regclass);


--
-- Name: partner_sources id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_sources ALTER COLUMN id SET DEFAULT nextval('public.partner_sources_id_seq'::regclass);


--
-- Name: partner_tags id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_tags ALTER COLUMN id SET DEFAULT nextval('public.partner_tags_id_seq'::regclass);


--
-- Name: payouts id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts ALTER COLUMN id SET DEFAULT nextval('public.payouts_id_seq'::regclass);


--
-- Name: ticket_messages id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages ALTER COLUMN id SET DEFAULT nextval('public.ticket_messages_id_seq'::regclass);


--
-- Name: webhook_events id; Type: DEFAULT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_events ALTER COLUMN id SET DEFAULT nextval('public.webhook_events_id_seq'::regclass);


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
96647a3a-501f-430e-8b4e-3c701ed7ead6	6fd687e9b00b624aaf2f6bf27382239ff8df973efc8ed8e839637e116b6e7dd3	2026-06-09 15:34:06.258327+00	20260418122000_init	\N	\N	2026-06-09 15:34:06.179828+00	1
1cbe9feb-2dba-46bf-8ab0-a84dec4d6e89	df6ffc2b8a851a65baf258ab97f73e5818dff0582db35c43b34c800702d6a46d	2026-06-09 15:34:06.269049+00	20260427130604_add_pipeline_filtering	\N	\N	2026-06-09 15:34:06.260017+00	1
62c5fdec-9df2-4fe1-83a6-46795316aa2f	6cdcebbf83908eeffc1785ba233f216fe3b8e21ddfc48649fa839a818898a9c2	2026-06-09 15:34:06.271775+00	20260505221500_add_partner_labels_column	\N	\N	2026-06-09 15:34:06.269751+00	1
11c1d01d-9255-4985-958f-4395298ff878	fdd1ee3a4316f3091c32e9be35f682783aef1e9d7131647e1683a37ecb42c202	2026-06-09 15:34:06.275296+00	20260505223500_add_missing_lead_snapshot_columns	\N	\N	2026-06-09 15:34:06.273146+00	1
3261be99-f2ac-49a2-a686-df99139b204f	9f197888c9ed3b19e85c6d3f4b65fbea7dc52b36bc740a5c224a4d7a1b6955aa	2026-06-09 15:34:06.277708+00	20260505224500_add_notification_weekly_summary	\N	\N	2026-06-09 15:34:06.275919+00	1
f305c399-b8dc-4a11-b34a-cee217b8899d	b18c61d21dda2c3719d401d8c115f6a9b9f90b14dcbda2647c79ea97f5582a13	2026-06-09 15:34:06.291019+00	20260602192757_add_payouts_and_referrals	\N	\N	2026-06-09 15:34:06.278369+00	1
47061cdf-7e8e-4a47-8f95-0a11a319ba9e	7b79bd6cb69f9232b70330a6073c72ff9f690813b19d46e7aab4f95a3ed32067	2026-06-09 15:34:07.310149+00	20260609153407_add_notifications	\N	\N	2026-06-09 15:34:07.285852+00	1
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.audit_logs (id, request_id, actor_user_id, actor_role, action, entity_type, entity_id, metadata, created_at) FROM stdin;
1	70ff792c-1c7a-4e7e-b0f0-1f57ab46ad4f	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": "App Exception", "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 72, "status_code": 201}	2026-06-09 15:36:00.284+00
2	472aa8a6-9a99-4c58-a015-76e5c55979bf	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": "App Exception", "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 61, "status_code": 201}	2026-06-09 15:36:00.285+00
3	76ee8f3c-adf0-4e2f-a82f-e8401b6c9516	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/login", "error": "App Exception", "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 166, "status_code": 201}	2026-06-09 15:47:03.467+00
4	8da37d2c-5021-45f1-abb0-e1dc4de535e9	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/login", "error": "App Exception", "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 26, "status_code": 201}	2026-06-09 15:47:14.849+00
5	8064f55c-a733-4b8c-883e-a855e82b4554	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/login", "error": "App Exception", "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 23, "status_code": 201}	2026-06-09 15:47:24.367+00
6	13bdb532-2ad6-41ff-81ca-c104a9e26ba4	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 188, "status_code": 201}	2026-06-09 15:48:36.963+00
7	f48564c7-726f-409b-8bae-174220871b08	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 141, "status_code": 201}	2026-06-09 15:50:11.198+00
8	fc339b28-bfca-49e0-bf1c-326376b95124	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 141, "status_code": 201}	2026-06-09 15:50:11.202+00
9	138a2e02-7f1f-4028-8268-67db053e468d	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 180, "status_code": 201}	2026-06-09 15:53:26.981+00
10	ab4a06a8-53e4-44e8-8a09-08c6fb5e53df	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 176, "status_code": 201}	2026-06-09 15:53:26.989+00
11	0390dd1b-0988-4369-a1c0-89afb1bdb4d3	\N	\N	POST:/api/v1/auth/logout	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/logout", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 71, "status_code": 204}	2026-06-09 15:53:29.056+00
12	7b304862-a683-4ed0-8699-dbe2be3516ed	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 172, "status_code": 201}	2026-06-09 15:53:37.868+00
13	9e476388-c0bd-4d10-a390-53749e8b2502	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 282, "status_code": 201}	2026-06-09 20:45:51.116+00
14	2c25cf79-c6bb-4316-940a-147b31587600	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 419, "status_code": 201}	2026-06-09 21:09:43.115+00
15	6054fdbc-a9d9-493a-adea-ec8e49590f1a	619de827-e64c-4ad4-8f30-d275d59a1f1d	admin	PATCH:/api/v1/notifications/:id/read	unknown	2d2a0730-4746-4922-8dea-ec80811cca7f	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/notifications/2d2a0730-4746-4922-8dea-ec80811cca7f/read", "error": null, "method": "PATCH", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 18, "status_code": 200}	2026-06-09 21:09:50.299+00
16	eddbb2d6-36c1-429c-bf24-7b85bd81499f	619de827-e64c-4ad4-8f30-d275d59a1f1d	admin	PATCH:/api/v1/notifications/:id/read	unknown	0dd68789-8beb-4bec-b27d-b1b820e74ad6	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/notifications/0dd68789-8beb-4bec-b27d-b1b820e74ad6/read", "error": null, "method": "PATCH", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 22, "status_code": 200}	2026-06-09 21:09:53.978+00
17	ced10bd3-c38f-4581-b04d-5c99d4c267da	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 165, "status_code": 201}	2026-06-09 21:10:20.427+00
18	b35614e1-74f3-4a5b-a25c-e11bce2e922b	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 155, "status_code": 201}	2026-06-09 21:10:20.431+00
19	5b71bd9e-15ba-4c36-a445-d1c4fb732ef8	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 178, "status_code": 201}	2026-06-09 21:10:20.457+00
20	58630cd9-b4bf-4203-ba65-ca49ceb8ec62	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 129, "status_code": 201}	2026-06-09 21:12:49.15+00
21	51cda0c9-45e4-47eb-b036-20aa55743144	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 132, "status_code": 201}	2026-06-09 21:12:49.156+00
22	cd71aee9-1ef6-4328-ae54-2afb82945d72	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 177, "status_code": 201}	2026-06-09 21:12:49.208+00
23	4d68f0df-7855-4f54-8589-e3aafb13341c	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 151, "status_code": 201}	2026-06-09 21:15:54.412+00
24	461dc9d3-6c99-474d-b5fd-506fb37b559d	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 150, "status_code": 201}	2026-06-09 21:15:54.416+00
25	3ed5bc2b-e4e3-4c5f-b1ff-ec547816518a	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 155, "status_code": 201}	2026-06-09 21:15:54.425+00
26	a55cc5cb-2654-4316-a72e-ecce62ab7b45	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 175, "status_code": 201}	2026-06-09 21:30:00.752+00
27	f7dcf582-4b56-4429-b7e3-1fe0aa50133d	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 169, "status_code": 201}	2026-06-09 21:30:00.766+00
28	2845ff95-2869-4928-9927-005f46e68f08	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 172, "status_code": 201}	2026-06-09 21:30:00.768+00
29	1387e89b-3718-414c-bfd8-894d9a81cf84	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 138, "status_code": 201}	2026-06-09 21:31:45.539+00
30	3463d369-bf3c-4ce5-8e80-f1ee07d5fffd	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 133, "status_code": 201}	2026-06-09 21:31:45.543+00
31	d04d724c-2b83-499a-a49d-92058d538627	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 139, "status_code": 201}	2026-06-09 21:31:45.55+00
32	ab21f09a-a10c-46e0-a459-6db9dce3eaab	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 169, "status_code": 201}	2026-06-09 21:43:09.467+00
33	71b33a5a-7f03-43cf-acf6-b78abf2b3276	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 167, "status_code": 201}	2026-06-09 21:43:09.469+00
34	7a4fac06-fe64-45ef-bb92-68bb82cc2e1b	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 169, "status_code": 201}	2026-06-09 21:43:09.472+00
35	de1f7522-1cce-4043-a32e-b4ec788d3cd1	619de827-e64c-4ad4-8f30-d275d59a1f1d	admin	POST:/api/v1/leads/:id/notes	lead	555003	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/leads/555003/notes", "error": "Failed to add note to amoCRM: Bad Request", "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 636, "status_code": 201}	2026-06-09 21:48:21.63+00
36	260ff525-08df-468c-b6de-40aea0040baf	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 308, "status_code": 201}	2026-06-09 21:56:33.269+00
37	fea49e3e-030b-4d88-a3d2-500ee43dd948	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 314, "status_code": 201}	2026-06-09 21:56:33.271+00
38	8b765843-1312-4109-8cdc-f4ee775f199b	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 479, "status_code": 201}	2026-06-09 21:56:33.286+00
39	4cf54e64-6851-492c-bc82-5b22b8720e6d	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 204, "status_code": 201}	2026-06-09 22:04:51.885+00
40	37985336-2f5d-482e-be4b-696458422ae3	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 237, "status_code": 201}	2026-06-09 22:04:51.889+00
41	898b1167-fa8d-4cab-9068-92a7ec05180e	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 229, "status_code": 201}	2026-06-09 22:04:51.903+00
42	178038f4-8a1a-489a-be9d-46051e41e4fe	619de827-e64c-4ad4-8f30-d275d59a1f1d	admin	POST:/api/v1/support/tickets	unknown	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/support/tickets", "error": "User is not associated with a partner", "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 7, "status_code": 201}	2026-06-09 22:05:47.242+00
43	306e77cf-bed7-4892-95a2-92e0bae4167a	\N	\N	POST:/api/v1/auth/logout	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/logout", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 102, "status_code": 204}	2026-06-09 22:13:18.577+00
44	e7b9e085-92bb-4f49-9b6b-134e1bb96a47	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 165, "status_code": 201}	2026-06-09 22:13:28.653+00
45	dd494248-7e7c-44be-81ce-b735249dbf40	e9819fd9-49d7-4c18-92fc-0770688d0dfd	partner_user	POST:/api/v1/support/tickets	unknown	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/support/tickets", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 65, "status_code": 201}	2026-06-09 22:14:02.79+00
46	3d245dc1-ace4-429d-b392-b18963945e3c	e9819fd9-49d7-4c18-92fc-0770688d0dfd	partner_user	POST:/api/v1/support/tickets	unknown	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/support/tickets", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Mobile Safari/537.36", "duration_ms": 39, "status_code": 201}	2026-06-09 22:14:10.833+00
47	f961dbc7-5734-4670-9123-2b6d202ac0e5	e9819fd9-49d7-4c18-92fc-0770688d0dfd	partner_user	POST:/api/v1/support/tickets	unknown	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/support/tickets", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 27, "status_code": 201}	2026-06-09 22:15:59.677+00
48	f1257be5-737f-4e1d-b425-d9b437de16df	e9819fd9-49d7-4c18-92fc-0770688d0dfd	partner_user	POST:/api/v1/support/tickets	unknown	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/support/tickets", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 16, "status_code": 201}	2026-06-09 22:16:00.346+00
49	bc43ab62-3f7a-4653-b36f-7220f8905fe2	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 181, "status_code": 201}	2026-06-09 22:16:04.687+00
50	ed2d58ab-5772-4c2d-be76-1667ca1c10d8	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 186, "status_code": 201}	2026-06-09 22:16:04.688+00
51	71faf69a-5fa8-4dbb-a060-6a2907fa1269	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 204, "status_code": 201}	2026-06-09 22:16:04.7+00
52	bf096ca4-0245-4401-bbe0-fead464afef7	e9819fd9-49d7-4c18-92fc-0770688d0dfd	partner_user	POST:/api/v1/support/tickets	unknown	\N	{"ip": "::ffff:172.18.0.1", "path": "/api/v1/support/tickets", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 30, "status_code": 201}	2026-06-09 22:16:08.025+00
53	99d61b7b-5f6a-4804-b5bc-d4ffc04ec24b	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 310, "status_code": 201}	2026-06-09 22:44:16.642+00
54	4e546ed1-9c1d-464c-af12-786bc4f1f4bd	e9819fd9-49d7-4c18-92fc-0770688d0dfd	partner_user	POST:/api/v1/support/tickets	unknown	\N	{"ip": "::1", "path": "/api/v1/support/tickets", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 33, "status_code": 201}	2026-06-09 22:44:28.61+00
55	d4255214-4935-448b-8341-855ef85fb30d	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::1", "path": "/api/v1/auth/login", "error": "Bad Request Exception", "method": "POST", "user_agent": "curl/8.9.1", "duration_ms": 15, "status_code": 201}	2026-06-09 22:45:23.556+00
57	f90d1445-cb93-4a01-b109-82985d505580	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 456, "status_code": 201}	2026-06-09 22:47:17.164+00
56	0b3a74cc-f229-4f4a-932c-28a1b39de9b1	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 458, "status_code": 201}	2026-06-09 22:47:17.167+00
58	db6fa76c-bd17-4085-afa1-fdec89103d6f	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 510, "status_code": 201}	2026-06-09 22:47:17.173+00
59	48f03928-66b6-490f-b616-3fb7582ca138	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 157, "status_code": 201}	2026-06-09 22:51:16.438+00
60	b716cd73-0b61-4a07-a5a2-7cc7075f54ad	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 186, "status_code": 201}	2026-06-09 22:51:16.436+00
61	0f428c54-7718-4be0-9a75-766edb9b21cb	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 169, "status_code": 201}	2026-06-09 22:51:16.443+00
62	05aad791-ed2e-47fb-9b2d-7ed80f8a7504	\N	\N	POST:/api/v1/auth/logout	auth	\N	{"ip": "::1", "path": "/api/v1/auth/logout", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 123, "status_code": 204}	2026-06-09 22:54:03.717+00
63	9264856f-d22b-4377-8c2e-f70ae07a0d7b	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 149, "status_code": 201}	2026-06-09 22:54:13.392+00
64	48df8123-6713-4d0f-aa66-22da7239c57a	619de827-e64c-4ad4-8f30-d275d59a1f1d	admin	POST:/api/v1/support/tickets/:id/messages	unknown	656b5d13-8006-417d-afc2-43430161e50d	{"ip": "::1", "path": "/api/v1/support/tickets/656b5d13-8006-417d-afc2-43430161e50d/messages", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 32, "status_code": 201}	2026-06-09 22:54:20.412+00
65	82500004-ee4b-417c-aeaf-7fd798c229cb	619de827-e64c-4ad4-8f30-d275d59a1f1d	admin	POST:/api/v1/support/tickets/:id/messages	unknown	75301d28-3f58-4c19-b93f-9709293ed6a0	{"ip": "::1", "path": "/api/v1/support/tickets/75301d28-3f58-4c19-b93f-9709293ed6a0/messages", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 39, "status_code": 201}	2026-06-09 22:54:29.953+00
66	21dcd374-5e8d-4f64-89ed-ba688208163e	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 190, "status_code": 201}	2026-06-09 22:56:25.488+00
67	8ecb9291-0405-43c1-a6a6-e63c7c4217ea	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 191, "status_code": 201}	2026-06-09 22:56:25.501+00
68	74d52180-529a-4399-80ef-5318d2d8fb23	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 185, "status_code": 201}	2026-06-09 22:56:25.494+00
69	f45b92ca-10f4-4791-984f-8ef3a2cd5aee	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 432, "status_code": 201}	2026-06-09 22:58:56.501+00
70	4de563f5-5c9f-45ec-8af8-111e17243e1a	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 556, "status_code": 201}	2026-06-09 22:58:56.537+00
71	985ad29f-eb47-4614-8114-b4fa14a43c4d	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 499, "status_code": 201}	2026-06-09 22:58:56.554+00
72	5b03e5f8-f836-4516-9208-befd9082b3c8	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 402, "status_code": 201}	2026-06-09 23:16:19.059+00
73	6d810716-7c61-4a58-8449-21dec3a2bb4e	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 172, "status_code": 201}	2026-06-09 23:19:23.443+00
74	9878e045-7c47-4478-b757-3e8323738f9b	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 205, "status_code": 201}	2026-06-09 23:19:23.454+00
75	d18966b9-fb17-47be-8442-79de9617f9df	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 197, "status_code": 201}	2026-06-09 23:19:23.46+00
76	10d93c38-ad6e-46f9-a5e2-21ff0a673c50	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 203, "status_code": 201}	2026-06-09 23:29:35.836+00
77	1b54f2b5-ec78-4d16-9638-04ca9b997e07	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 193, "status_code": 201}	2026-06-09 23:29:35.841+00
78	970138e5-d173-4371-8649-59fb46f72487	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 199, "status_code": 201}	2026-06-09 23:29:35.855+00
79	88dc0035-458a-4793-ab71-558b22b0559c	e9819fd9-49d7-4c18-92fc-0770688d0dfd	partner_user	POST:/api/v1/support/tickets/:id/messages	unknown	75301d28-3f58-4c19-b93f-9709293ed6a0	{"ip": "::1", "path": "/api/v1/support/tickets/75301d28-3f58-4c19-b93f-9709293ed6a0/messages", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 43, "status_code": 201}	2026-06-09 23:30:05.523+00
80	e6e07ca4-32f1-4c02-9c5f-216f5e602790	\N	\N	POST:/api/v1/auth/logout	auth	\N	{"ip": "::1", "path": "/api/v1/auth/logout", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 95, "status_code": 204}	2026-06-09 23:30:08.067+00
81	6f26933c-fc82-4ffd-bf9e-e8ddff2381b8	\N	\N	POST:/api/v1/auth/login	auth	\N	{"ip": "::1", "path": "/api/v1/auth/login", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 149, "status_code": 201}	2026-06-09 23:30:18.519+00
82	49ad8dea-cf94-403f-a235-697e519624bb	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 178, "status_code": 201}	2026-06-09 23:34:32.287+00
83	33745b85-8aa9-4da6-92df-50314a4857c3	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 177, "status_code": 201}	2026-06-09 23:34:32.297+00
84	d0cda5e6-d3ec-4a4f-9a36-b19cab18a7e5	\N	\N	POST:/api/v1/auth/refresh	auth	\N	{"ip": "::1", "path": "/api/v1/auth/refresh", "error": null, "method": "POST", "user_agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36", "duration_ms": 171, "status_code": 201}	2026-06-09 23:34:32.301+00
\.


--
-- Data for Name: commissions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.commissions (id, partner_id, external_lead_id, amount, currency, type, status, description, created_at, updated_at) FROM stdin;
1	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	\N	3000.00	AED	REFERRAL	AVAILABLE	Referral bonus from Referred Partner 1	2026-06-09 23:05:09.475+00	2026-06-09 23:05:09.475+00
2	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	\N	3500.00	AED	REFERRAL	PAID	Referral bonus from Referred Partner 2	2026-06-09 23:05:09.484+00	2026-06-09 23:05:09.484+00
3	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	\N	4000.00	AED	REFERRAL	PAID	Referral bonus from Referred Partner 3	2026-06-09 23:05:09.487+00	2026-06-09 23:05:09.487+00
\.


--
-- Data for Name: lead_snapshots; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lead_snapshots (id, external_lead_id, partner_id, title, status, budget, city, comment, contact_name, contact_phone, contact_email, broker_name, broker_phone, broker_email, amocrm_source, tag_ids, updated_at_source, synced_at, pipeline_id, created_at_source, custom_fields) FROM stdin;
5	555001	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Оренда вілли (Palm Jumeirah)	8696950:74717802	350000.00	Dubai	\N	Олександр Петренко	+380679998877	\N	\N	\N	\N	website	\N	2026-06-09 21:13:57.474+00	2026-06-09 21:13:57.474+00	8696950	2026-06-09 21:13:57.474+00	\N
6	555002	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Купівля апартаментів (Marina)	8696950:74717810	1200000.00	Dubai	\N	Марія Коваль	+380501112233	\N	\N	\N	\N	telegram	\N	2026-06-09 21:13:57.474+00	2026-06-09 21:13:57.474+00	8696950	2026-06-09 21:13:57.474+00	\N
7	555003	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Інвестиція в новобудову (Yas Island)	8696950:74717798	850000.00	Abu Dhabi	\N	Дмитро Шевченко	+380934445566	\N	\N	\N	\N	instagram	\N	2026-06-09 21:13:57.474+00	2026-06-09 21:13:57.474+00	8696950	2026-06-09 21:13:57.474+00	\N
8	47602932	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Аренда виллы (Palm Jumeirah)	8696950:74717798	500000.00	Dubai	\N	John Smith	+380671112233	\N	\N	\N	\N	telegram	\N	2026-06-09 21:29:25.269+00	2026-06-09 21:29:25.269+00	8696950	2026-06-09 21:29:25.269+00	\N
9	47602934	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Покупка апартаментов (Marina)	8696950:74717802	800000.00	Abu Dhabi	\N	Michael Johnson	+380509998877	\N	\N	\N	\N	website	\N	2026-06-09 21:29:25.269+00	2026-06-09 21:29:25.269+00	8696950	2026-06-09 21:29:25.269+00	\N
10	47602936	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Инвестиция в новостройку (Yas Island)	8696950:74717810	1200000.00	Dubai	\N	David Williams	+380635554433	\N	\N	\N	\N	instagram	\N	2026-06-09 21:29:25.269+00	2026-06-09 21:29:25.269+00	8696950	2026-06-09 21:29:25.269+00	\N
11	47602938	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Покупка недвижимости (Ras Al Khaimah)	8696950:142	350000.00	Ras Al Khaimah	\N	Sarah Brown	+380978887766	\N	\N	\N	\N	telegram	\N	2026-06-09 21:29:25.269+00	2026-06-09 21:29:25.269+00	8696950	2026-06-09 21:29:25.269+00	\N
12	47602940	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Аренда квартиры (Dubai)	8696950:143	2500000.00	Dubai	\N	Emily Davis	+380661234567	\N	\N	\N	\N	website	\N	2026-06-09 21:29:25.269+00	2026-06-09 21:29:25.269+00	8696950	2026-06-09 21:29:25.269+00	\N
13	47603032	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Покупка пентхауса (Downtown)	8696950:74717798	1500000.00	Dubai	\N	Oliver Twist	+971501112233	\N	\N	\N	\N	website	\N	2026-06-09 21:42:33.426+00	2026-06-09 21:42:33.426+00	8696950	2026-06-09 21:42:33.426+00	\N
14	47603036	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Инвестиция в JVT	8696950:74717798	450000.00	Dubai	\N	Emma Watson	+971509998877	\N	\N	\N	\N	website	\N	2026-06-09 21:42:36.037+00	2026-06-09 21:42:36.037+00	8696950	2026-06-09 21:42:36.037+00	\N
15	47603038	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Покупка виллы (Saadiyat)	8696950:74717798	2000000.00	Abu Dhabi	\N	Liam Neeson	+971561234567	\N	\N	\N	\N	website	\N	2026-06-09 21:42:38.139+00	2026-06-09 21:42:38.139+00	8696950	2026-06-09 21:42:38.139+00	\N
16	47603040	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Офис (Business Bay)	8696950:74717798	900000.00	Dubai	\N	Sophia Loren	+971554443322	\N	\N	\N	\N	website	\N	2026-06-09 21:42:40.118+00	2026-06-09 21:42:40.118+00	8696950	2026-06-09 21:42:40.118+00	\N
17	47603042	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Покупка особняка (Emirates Hills)	8696950:74717798	3500000.00	Dubai	\N	James Bond	+971500070007	\N	\N	\N	\N	website	\N	2026-06-09 21:42:42.123+00	2026-06-09 21:42:42.123+00	8696950	2026-06-09 21:42:42.123+00	\N
18	47603058	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Покупка виллы (Arabian Ranches)	8696950:74717798	1800000.00	Dubai	\N	William Shakespeare	+971501230001	\N	\N	\N	\N	website	\N	2026-06-09 21:46:11.961+00	2026-06-09 21:46:11.961+00	8696950	2026-06-09 21:46:11.961+00	\N
19	47603060	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Инвестиция в JVC	8696950:74717798	650000.00	Dubai	\N	Tom Hanks	+971501230002	\N	\N	\N	\N	website	\N	2026-06-09 21:46:14.224+00	2026-06-09 21:46:14.224+00	8696950	2026-06-09 21:46:14.224+00	\N
20	47603062	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Пентхаус (Marina)	8696950:74717798	2200000.00	Dubai	\N	Meryl Streep	+971501230003	\N	\N	\N	\N	website	\N	2026-06-09 21:46:16.507+00	2026-06-09 21:46:16.507+00	8696950	2026-06-09 21:46:16.507+00	\N
21	47603064	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Таунхаус (Yas Island)	8696950:74717798	1100000.00	Abu Dhabi	\N	Brad Pitt	+971501230004	\N	\N	\N	\N	website	\N	2026-06-09 21:46:18.861+00	2026-06-09 21:46:18.861+00	8696950	2026-06-09 21:46:18.861+00	\N
22	47603066	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Элитная вилла (Palm Jumeirah)	8696950:74717798	3500000.00	Dubai	\N	Angelina Jolie	+971501230005	\N	\N	\N	\N	website	\N	2026-06-09 21:46:21.008+00	2026-06-09 21:46:21.008+00	8696950	2026-06-09 21:46:21.008+00	\N
23	47603068	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Дом у моря	8696950:74717798	950000.00	Ras Al Khaimah	\N	Leonardo DiCaprio	+971501230006	\N	\N	\N	\N	website	\N	2026-06-09 21:46:23.173+00	2026-06-09 21:46:23.173+00	8696950	2026-06-09 21:46:23.173+00	\N
24	47603070	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Аренда офиса (DIFC)	8696950:74717798	850000.00	Dubai	\N	Scarlett Johansson	+971501230007	\N	\N	\N	\N	website	\N	2026-06-09 21:46:25.373+00	2026-06-09 21:46:25.373+00	8696950	2026-06-09 21:46:25.373+00	\N
25	47603072	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Семейные апартаменты	8696950:74717798	1400000.00	Abu Dhabi	\N	Chris Hemsworth	+971501230008	\N	\N	\N	\N	website	\N	2026-06-09 21:46:27.634+00	2026-06-09 21:46:27.634+00	8696950	2026-06-09 21:46:27.634+00	\N
26	47603074	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Off-plan инвестиция	8696950:74717798	450000.00	Dubai	\N	Natalie Portman	+971501230009	\N	\N	\N	\N	website	\N	2026-06-09 21:46:29.722+00	2026-06-09 21:46:29.722+00	8696950	2026-06-09 21:46:29.722+00	\N
27	47603076	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Покупка здания	8696950:74717798	5500000.00	Dubai	\N	Robert Downey Jr.	+971501230010	\N	\N	\N	\N	website	\N	2026-06-09 21:46:32.079+00	2026-06-09 21:46:32.079+00	8696950	2026-06-09 21:46:32.079+00	\N
28	1781046309457	43b1e292-2406-4b9b-b568-6e14b577b8d8	Referred Deal 1	142	600000.00	Dubai	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-09 23:05:09.456+00	2026-06-09 23:05:09.456+00	\N	2026-06-09 23:05:09.457+00	\N
29	1781046309484	e2d5a804-cdc9-45e8-a8fb-a13ff56f0a0d	Referred Deal 2	142	700000.00	Dubai	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-09 23:05:09.482+00	2026-06-09 23:05:09.482+00	\N	2026-06-09 23:05:09.483+00	\N
30	1781046309487	1f14baca-b6ce-4e0d-9d2c-ebaa3aff36fb	Referred Deal 3	142	800000.00	Dubai	\N	\N	\N	\N	\N	\N	\N	\N	\N	2026-06-09 23:05:09.484+00	2026-06-09 23:05:09.484+00	\N	2026-06-09 23:05:09.485+00	\N
\.


--
-- Data for Name: lead_status_history; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.lead_status_history (id, external_lead_id, partner_id, from_status, to_status, changed_at, changed_by, created_at) FROM stdin;
\.


--
-- Data for Name: notification_prefs; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notification_prefs (user_id, on_status_change, on_broker_change, updated_at, on_weekly_summary) FROM stdin;
e9819fd9-49d7-4c18-92fc-0770688d0dfd	t	t	2026-06-09 15:48:14.421+00	f
\.


--
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.notifications (id, user_id, type, title, message, link, is_read, created_at) FROM stdin;
2d2a0730-4746-4922-8dea-ec80811cca7f	619de827-e64c-4ad4-8f30-d275d59a1f1d	NEW_PARTNER	Новий партнер	Зареєструвався новий партнер: Олексій Смирнов. Прив'яжіть йому теги.	/admin/partners	t	2026-06-09 15:49:41.078+00
0dd68789-8beb-4bec-b27d-b1b820e74ad6	619de827-e64c-4ad4-8f30-d275d59a1f1d	SYSTEM_ALERT	Запит на виплату	Партнер Test Partner 15 запросив виплату на суму 5,000 AED.	/payouts	t	2026-06-09 15:49:41.078+00
\.


--
-- Data for Name: partner_pipelines; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_pipelines (id, partner_id, amocrm_pipeline_id, created_at) FROM stdin;
\.


--
-- Data for Name: partner_sources; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_sources (id, partner_id, amocrm_source, created_at) FROM stdin;
\.


--
-- Data for Name: partner_tags; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partner_tags (id, partner_id, amocrm_tag_id, created_at) FROM stdin;
\.


--
-- Data for Name: partners; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.partners (id, name, is_active, created_at, updated_at, labels, referred_by_id, country, direction, "partnerType") FROM stdin;
fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Klikov	t	2026-06-09 15:48:13.258+00	2026-06-09 15:48:13.258+00	{}	\N	\N	\N	\N
26a55fbd-5e10-41ab-9c7f-a72ae3a11466	Test Partner 1	t	2026-06-09 15:48:13.463+00	2026-06-09 15:48:13.463+00	{}	\N	\N	\N	\N
96c0368d-63e5-4ae4-8b1a-dd77b55f7a36	Referred Partner 1-0	t	2026-06-09 15:48:13.483+00	2026-06-09 15:48:13.483+00	{}	26a55fbd-5e10-41ab-9c7f-a72ae3a11466	\N	\N	\N
fd2ad14e-edac-47c4-bd3c-f34e1a566a65	Referred Partner 1-1	t	2026-06-09 15:48:13.486+00	2026-06-09 15:48:13.486+00	{}	26a55fbd-5e10-41ab-9c7f-a72ae3a11466	\N	\N	\N
b67b0036-fa9b-4099-a858-983b45949a27	Test Partner 2	t	2026-06-09 15:48:13.537+00	2026-06-09 15:48:13.537+00	{}	\N	\N	\N	\N
f54148d6-229c-4314-9e26-883cf769bdfa	Referred Partner 2-0	t	2026-06-09 15:48:13.544+00	2026-06-09 15:48:13.544+00	{}	b67b0036-fa9b-4099-a858-983b45949a27	\N	\N	\N
94ac54f4-10e6-4816-8680-bbae23f4b064	Referred Partner 2-1	t	2026-06-09 15:48:13.55+00	2026-06-09 15:48:13.55+00	{}	b67b0036-fa9b-4099-a858-983b45949a27	\N	\N	\N
1ae87327-48de-4f34-a70d-6a5897b98c5e	Test Partner 3	t	2026-06-09 15:48:13.604+00	2026-06-09 15:48:13.604+00	{}	\N	\N	\N	\N
b73d4052-fb88-479e-a3c1-46fe1e7473d9	Referred Partner 3-0	t	2026-06-09 15:48:13.613+00	2026-06-09 15:48:13.613+00	{}	1ae87327-48de-4f34-a70d-6a5897b98c5e	\N	\N	\N
96ff9ea7-e138-4bba-95f0-e6021116f3a8	Referred Partner 3-1	t	2026-06-09 15:48:13.617+00	2026-06-09 15:48:13.617+00	{}	1ae87327-48de-4f34-a70d-6a5897b98c5e	\N	\N	\N
dd81f7ac-2521-4168-a770-207076cb821f	Referred Partner 3-2	t	2026-06-09 15:48:13.625+00	2026-06-09 15:48:13.625+00	{}	1ae87327-48de-4f34-a70d-6a5897b98c5e	\N	\N	\N
03d11bfd-d521-45f4-88bb-59149622010f	Test Partner 4	t	2026-06-09 15:48:13.683+00	2026-06-09 15:48:13.683+00	{}	\N	\N	\N	\N
ce1cac52-b441-4433-80ba-972117a17ffa	Referred Partner 4-0	t	2026-06-09 15:48:13.692+00	2026-06-09 15:48:13.692+00	{}	03d11bfd-d521-45f4-88bb-59149622010f	\N	\N	\N
1220ea41-1009-4142-a195-7b221e1ec9a7	Referred Partner 4-1	t	2026-06-09 15:48:13.694+00	2026-06-09 15:48:13.694+00	{}	03d11bfd-d521-45f4-88bb-59149622010f	\N	\N	\N
c6de25e6-27f8-4c4c-aace-15e52665ae21	Test Partner 5	t	2026-06-09 15:48:13.746+00	2026-06-09 15:48:13.746+00	{}	\N	\N	\N	\N
917d452c-f92b-407f-8b87-b1658b6ac6ac	Referred Partner 5-0	t	2026-06-09 15:48:13.754+00	2026-06-09 15:48:13.754+00	{}	c6de25e6-27f8-4c4c-aace-15e52665ae21	\N	\N	\N
238ea35b-e1e5-4efe-b585-44296c030632	Referred Partner 5-1	t	2026-06-09 15:48:13.757+00	2026-06-09 15:48:13.757+00	{}	c6de25e6-27f8-4c4c-aace-15e52665ae21	\N	\N	\N
1d3747fc-e10e-416d-ae0e-16a30b91df96	Test Partner 6	t	2026-06-09 15:48:13.809+00	2026-06-09 15:48:13.809+00	{}	\N	\N	\N	\N
02f1bf50-7b89-434b-8df7-f5caad0192aa	Referred Partner 6-0	t	2026-06-09 15:48:13.815+00	2026-06-09 15:48:13.815+00	{}	1d3747fc-e10e-416d-ae0e-16a30b91df96	\N	\N	\N
a7915b59-c086-442e-b732-57100c847245	Referred Partner 6-1	t	2026-06-09 15:48:13.818+00	2026-06-09 15:48:13.818+00	{}	1d3747fc-e10e-416d-ae0e-16a30b91df96	\N	\N	\N
cf5984aa-0a68-4f0c-a4b2-0ae8872deb10	Referred Partner 6-2	t	2026-06-09 15:48:13.823+00	2026-06-09 15:48:13.823+00	{}	1d3747fc-e10e-416d-ae0e-16a30b91df96	\N	\N	\N
108973f6-030c-49da-af5b-81990b754dc3	Test Partner 7	t	2026-06-09 15:48:13.875+00	2026-06-09 15:48:13.875+00	{}	\N	\N	\N	\N
7a2922e7-5a86-4da1-b55c-4ff67a0a503a	Referred Partner 7-0	t	2026-06-09 15:48:13.882+00	2026-06-09 15:48:13.882+00	{}	108973f6-030c-49da-af5b-81990b754dc3	\N	\N	\N
9c68c523-97ca-4dfc-bbb9-2ee97f5c69d9	Test Partner 8	t	2026-06-09 15:48:13.942+00	2026-06-09 15:48:13.942+00	{}	\N	\N	\N	\N
21430b4e-a56a-4f01-95e6-d5218d104619	Referred Partner 8-0	t	2026-06-09 15:48:13.949+00	2026-06-09 15:48:13.949+00	{}	9c68c523-97ca-4dfc-bbb9-2ee97f5c69d9	\N	\N	\N
d0323d60-1909-4850-9fcd-bc4f01ced17e	Referred Partner 8-1	t	2026-06-09 15:48:13.954+00	2026-06-09 15:48:13.954+00	{}	9c68c523-97ca-4dfc-bbb9-2ee97f5c69d9	\N	\N	\N
c12600ca-ea0b-495c-a30d-d0ebfa2e60eb	Test Partner 9	t	2026-06-09 15:48:14.014+00	2026-06-09 15:48:14.014+00	{}	\N	\N	\N	\N
f4291427-078c-44db-9329-5fc4c408137a	Referred Partner 9-0	t	2026-06-09 15:48:14.021+00	2026-06-09 15:48:14.021+00	{}	c12600ca-ea0b-495c-a30d-d0ebfa2e60eb	\N	\N	\N
79de48bf-c2be-43b8-b07c-55a4673141fa	Test Partner 10	t	2026-06-09 15:48:14.074+00	2026-06-09 15:48:14.074+00	{}	\N	\N	\N	\N
27be0fc8-8c08-49f7-8b3e-9b1225b3ff76	Referred Partner 10-0	t	2026-06-09 15:48:14.083+00	2026-06-09 15:48:14.083+00	{}	79de48bf-c2be-43b8-b07c-55a4673141fa	\N	\N	\N
86bb3bc7-4a67-4f39-931e-f124c01372fc	Test Partner 11	t	2026-06-09 15:48:14.135+00	2026-06-09 15:48:14.135+00	{}	\N	\N	\N	\N
6afbd0ea-1c9e-457e-9af7-9c97d2a7638f	Referred Partner 11-0	t	2026-06-09 15:48:14.141+00	2026-06-09 15:48:14.141+00	{}	86bb3bc7-4a67-4f39-931e-f124c01372fc	\N	\N	\N
80ad8fb8-3fd3-4f91-b767-3a61bf817615	Test Partner 12	t	2026-06-09 15:48:14.192+00	2026-06-09 15:48:14.192+00	{}	\N	\N	\N	\N
7ac03170-90e7-4dd7-bfd4-bab121b54eac	Referred Partner 12-0	t	2026-06-09 15:48:14.199+00	2026-06-09 15:48:14.199+00	{}	80ad8fb8-3fd3-4f91-b767-3a61bf817615	\N	\N	\N
4d31781f-0c34-4e6d-b90b-11089b68554a	Test Partner 13	t	2026-06-09 15:48:14.252+00	2026-06-09 15:48:14.252+00	{}	\N	\N	\N	\N
f7445468-73a1-44a2-a60c-1a82ee32f6c5	Referred Partner 13-0	t	2026-06-09 15:48:14.258+00	2026-06-09 15:48:14.258+00	{}	4d31781f-0c34-4e6d-b90b-11089b68554a	\N	\N	\N
2703b39e-5a95-4cc6-b903-7bf871d2251e	Test Partner 14	t	2026-06-09 15:48:14.311+00	2026-06-09 15:48:14.311+00	{}	\N	\N	\N	\N
30f5b41f-4eb3-455c-96e5-88da4c3c226f	Referred Partner 14-0	t	2026-06-09 15:48:14.324+00	2026-06-09 15:48:14.324+00	{}	2703b39e-5a95-4cc6-b903-7bf871d2251e	\N	\N	\N
15994e7f-e62a-40b6-b25b-dd4ab10c7414	Referred Partner 14-1	t	2026-06-09 15:48:14.326+00	2026-06-09 15:48:14.326+00	{}	2703b39e-5a95-4cc6-b903-7bf871d2251e	\N	\N	\N
0d747dad-503f-4908-a056-0db3f67c134f	Referred Partner 14-2	t	2026-06-09 15:48:14.328+00	2026-06-09 15:48:14.328+00	{}	2703b39e-5a95-4cc6-b903-7bf871d2251e	\N	\N	\N
64ba713d-c027-4ff4-9be6-1145f3ab7a9e	Test Partner 15	t	2026-06-09 15:48:14.378+00	2026-06-09 15:48:14.378+00	{}	\N	\N	\N	\N
3d05eefc-ed38-4f34-90aa-ecb18893a275	Referred Partner 15-0	t	2026-06-09 15:48:14.385+00	2026-06-09 15:48:14.385+00	{}	64ba713d-c027-4ff4-9be6-1145f3ab7a9e	\N	\N	\N
c2f45622-7ea9-4b48-ac55-2aa757e7f512	Referred Partner 15-1	t	2026-06-09 15:48:14.387+00	2026-06-09 15:48:14.387+00	{}	64ba713d-c027-4ff4-9be6-1145f3ab7a9e	\N	\N	\N
1999bbbc-502c-46de-872a-6233fd92f922	Referred Partner 15-2	t	2026-06-09 15:48:14.392+00	2026-06-09 15:48:14.392+00	{}	64ba713d-c027-4ff4-9be6-1145f3ab7a9e	\N	\N	\N
43b1e292-2406-4b9b-b568-6e14b577b8d8	Referred Partner 1	t	2026-06-09 23:05:09.44+00	2026-06-09 23:05:09.44+00	{}	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	\N	\N	\N
e2d5a804-cdc9-45e8-a8fb-a13ff56f0a0d	Referred Partner 2	t	2026-06-09 23:05:09.481+00	2026-06-09 23:05:09.481+00	{}	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	\N	\N	\N
1f14baca-b6ce-4e0d-9d2c-ebaa3aff36fb	Referred Partner 3	t	2026-06-09 23:05:09.484+00	2026-06-09 23:05:09.484+00	{}	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	\N	\N	\N
\.


--
-- Data for Name: payouts; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.payouts (id, partner_id, amount, currency, status, type, details, created_at, updated_at, processed_at) FROM stdin;
\.


--
-- Data for Name: refresh_sessions; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.refresh_sessions (id, user_id, refresh_token_hash, expires_at, revoked_at, user_agent, ip, created_at) FROM stdin;
60b97856-c6f4-41ed-a9f0-61261a1f6e5e	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$.g2YqHuwYdNcoDYMEYhk0.J3uzzxFF/qyZy9wwQH4iRx/A4g3PMka	2026-07-09 22:16:04.672+00	2026-06-09 22:54:03.707+00	\N	\N	2026-06-09 22:16:04.675+00
5aea73d5-8a3f-418c-883e-2c0057360201	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$XI51Agp59GpQQTL1b5/hEuhtMR1qNWmSfnZondw..oefHAGoh2MYG	2026-07-09 15:48:36.945+00	2026-06-09 15:50:11.181+00	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::ffff:172.18.0.1	2026-06-09 15:48:36.949+00
992e910c-6db0-4cdb-b0f8-8af4c5f08498	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$l7tJVUZTHSlaS8thA1XLWOesMy.iT8Z2AORSbkS77OQitcsozIWEW	2026-07-09 15:53:26.969+00	\N	\N	\N	2026-06-09 15:53:26.97+00
000a67a8-2b78-4945-b420-85257f864a12	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$Hekw3X/Ulcqg.mTS2tyTeuA.NQkajAvhM6VoSSL.iDBr4Hk.Xtp3K	2026-07-09 15:50:11.182+00	2026-06-09 15:53:26.968+00	\N	\N	2026-06-09 15:50:11.184+00
840a90dd-e840-4275-8d7d-80d23248aa08	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$dIUW4lLbKfpvdlL1QdJinODKYu73R1IuZ.X31f6Si4sAmQKSiGWJS	2026-07-09 15:53:26.968+00	\N	\N	\N	2026-06-09 15:53:26.97+00
481194a0-df90-4170-9329-d59a4268a002	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$Z0u3ak5Wv7Le6iUh.VkLs.lNHertb0V/tRMAf9Eih7cZxp3PijSxO	2026-07-09 15:50:11.181+00	2026-06-09 15:53:29.05+00	\N	\N	2026-06-09 15:50:11.184+00
92183553-c697-486b-a890-6a16b389aeff	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$CD30BkKXLNuvXgxi2elHiu5cLZyJj6wckOMpWh403vYwQeLwSyrWW	2026-07-09 15:53:37.863+00	\N	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::ffff:172.18.0.1	2026-06-09 15:53:37.863+00
fff92459-f1e4-4ff1-b3c1-c0fd61e1cd82	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$4myYQqlwoBSrHulGPuBc0.Hx5uMeGrI/zlaJ2uhNb7BvOTTShJi66	2026-07-09 20:45:51.066+00	2026-06-09 21:09:42.939+00	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::ffff:172.18.0.1	2026-06-09 20:45:51.07+00
f4770cdc-2ef5-4b2c-96d8-c52ce60baac8	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$Pgxm3HRTEgmQBDkfOfE/p.fgpMlWkVR1c1eiNutYGw.jr/wqkbrwe	2026-07-09 22:04:51.839+00	\N	\N	\N	2026-06-09 22:04:51.839+00
f8dfc6d2-83af-40c1-a57a-c5285f48d7a3	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$1U9wKTws6cWh5sGUs/0NvO10SBwJncofA94W/5dpzflp.LckuHn32	2026-07-09 21:10:20.414+00	\N	\N	\N	2026-06-09 21:10:20.415+00
f4d695d9-1d0d-4ca0-a5c1-435345741b6e	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$6rnlq8eIoNgHX/FrKEIeXezJtoUSZI/Z3ZQdHLg/2qy2E/aDgMf8e	2026-07-09 21:31:45.532+00	\N	\N	\N	2026-06-09 21:31:45.533+00
b5dfbea2-bf8a-4ab5-b78d-141e650f8ab4	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$Kr011NJMpFC4z1s33w.oB.aZPBtV8EB76gY0yDZAyX4w./FOtcKZa	2026-07-09 21:10:20.418+00	\N	\N	\N	2026-06-09 21:10:20.419+00
e3d2ec3c-1af7-4a4e-b45b-a54a205acf88	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$C/UKCFoqcveIDpwxbEKFXOrl70ydEKLx2uCAIlSV/reOaASHEZsvy	2026-07-09 21:09:42.939+00	2026-06-09 21:10:20.451+00	\N	\N	2026-06-09 21:09:42.941+00
036ed9f4-c816-4579-b92a-780979fac1da	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$ZlyIaKM0bfn.iLfAmcmzEutvzswDT78B9LQn/5.uoLyoSRdjvuhFq	2026-07-09 21:30:00.752+00	2026-06-09 21:31:45.539+00	\N	\N	2026-06-09 21:30:00.754+00
06b1a2c9-6e6d-40bb-a44a-79043c86c72b	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$z0bGR9cYJtIN/zGc5XiGUeN8jCoyJODRuvgEtrK4AtUm4dtVMUkum	2026-07-09 21:12:49.137+00	\N	\N	\N	2026-06-09 21:12:49.139+00
ef2281a8-1b97-48c1-9ffc-e254c967af27	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$9IVhGzyEl94exjoA3EEY3eEBuHXxJmBTXxL.NMCHnfJnk8FicLHiy	2026-07-09 21:12:49.139+00	\N	\N	\N	2026-06-09 21:12:49.139+00
ae326d7a-2a8c-49bc-a775-e6c2d0dedd25	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$qqRQp.ZSHt2OpTmFYvCA1OqJBYolwUr05Ben.zgKbZjeUdFWUo3za	2026-07-09 21:10:20.452+00	2026-06-09 21:12:49.14+00	\N	\N	2026-06-09 21:10:20.452+00
00deb2c7-4f0d-40c0-b979-eea44bb2a79d	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$cxjuS8gWexSYThoW2MkzRO26CY6B6iZCb1F6y3uWFTBQiWyDVuPm.	2026-07-09 21:15:54.386+00	\N	\N	\N	2026-06-09 21:15:54.387+00
2ca94a5b-7744-4012-a252-7347c97bdb3f	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$N3Y0cszUZGZTGdP/javKk.4DONUTjXbFzEEnU1qW4I1cNsRU0/9mi	2026-07-09 21:43:09.438+00	\N	\N	\N	2026-06-09 21:43:09.44+00
ddbced24-92b6-4e14-8bda-cfd28a27045c	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$.uY.BFx7t6b7ZL77N2Njc.SlHFoP8iGR4kh4ZaDy5HBCQw/a3y.bS	2026-07-09 21:15:54.391+00	\N	\N	\N	2026-06-09 21:15:54.394+00
92ee6fd1-bb41-4f08-bb6f-0999bd4a8211	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$bJyOFHmrH.SzjqYkXGg6PuAXZ2zDrRhQ5e2bGQ5QpC7nX41iTDvTi	2026-07-09 21:12:49.14+00	2026-06-09 21:15:54.403+00	\N	\N	2026-06-09 21:12:49.14+00
a3b15c69-6585-4895-b4ad-11c7c0ad2f59	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$Rd8q77Z60uAof7ckiT/vLOWQPdwJ0EOFaWXUFp9hA03PA6jUeC282	2026-07-09 22:04:51.839+00	\N	\N	\N	2026-06-09 22:04:51.839+00
a4399a5f-3125-41c3-af33-3d83dafb4c7e	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$4npsY60/QLP3ZCBeJ97JRelzZdaWtZgBkrO0duC1IoRekh7Ryle0G	2026-07-09 21:30:00.729+00	\N	\N	\N	2026-06-09 21:30:00.732+00
db0347a2-08c4-4f81-9c53-1e2a6a891c16	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$s9MwcM/.stlw31VBnU1hz.7mj.K0SPtnSWWYtFvOKd/SFX6R.HUta	2026-07-09 21:43:09.463+00	\N	\N	\N	2026-06-09 21:43:09.464+00
bbddaf1b-0c12-4e50-bd1d-d6790b372999	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$60fu8rJF5roaOUdUmgg6qOt0O3McNkkZ11OTrbT7HAh15QyFxApM6	2026-07-09 21:30:00.751+00	\N	\N	\N	2026-06-09 21:30:00.752+00
3bbdfe3f-d242-45d9-824d-04388ef285c3	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$LothWpcpZ3optko/giVpu.aymLig9.a.bxo6lNdol3NX.x1mtFWoi	2026-07-09 21:15:54.403+00	2026-06-09 21:30:00.752+00	\N	\N	2026-06-09 21:15:54.404+00
c510f85b-6ddf-4a48-98d7-2f4a178d2a64	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$IpAuPhh4Ejbp6amIJ/IFWeSMPJC9coGkEvEOVKh4Jj8.SvpJQ/48a	2026-07-09 21:31:45.539+00	2026-06-09 21:43:09.466+00	\N	\N	2026-06-09 21:31:45.54+00
8039e2db-c32e-42de-b7d1-1a127ce7804c	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$5N/ukbwXhuHrbFrsPB1I..2EIWFCtC0pG8B/ypL6ZnYbGv8ayQstG	2026-07-09 21:56:33.188+00	2026-06-09 22:04:51.838+00	\N	\N	2026-06-09 21:56:33.19+00
0b1491e8-be41-4d9f-8150-f8fc3fc41227	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$gCy74Ue7aIolMYyCNb.Ine9iIWp4xAE0Ms.R4u1yYsyUaWAHptjVq	2026-07-09 21:56:33.188+00	\N	\N	\N	2026-06-09 21:56:33.189+00
e4ea91e8-b02f-41d9-a132-6f712288236f	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$y7UkycolpEaIJG2mDvFeqOM470nNbZrtQwtTxHK.NDYcTwbH3VgN6	2026-07-09 22:04:51.838+00	\N	\N	\N	2026-06-09 22:04:51.839+00
4af5b3e6-cd35-4d1c-a184-9f6f460717f5	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$ZDMrbo9/Wu7PnxDL105iWuAMxpLyDArrx.MZpuAR5r1XaVyMWuQIi	2026-07-09 21:56:33.18+00	\N	\N	\N	2026-06-09 21:56:33.189+00
dda5a364-5b7a-4751-991d-ba06c4e05818	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$3wMGd.swroMBuoW6Nkw85eiH4eKJJ0w8/CjD77045rXKP4bZMoGNO	2026-07-09 21:43:09.466+00	2026-06-09 21:56:33.188+00	\N	\N	2026-06-09 21:43:09.467+00
4fe6eda7-a894-4b7c-b179-05f45473624e	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$yEsq.PPqhjsfLPivhB0rE.6mijkw2Dk29.GZuYeXnSRiRwAgA2UaG	2026-07-09 21:31:45.528+00	2026-06-09 22:13:18.555+00	\N	\N	2026-06-09 21:31:45.529+00
ac218b3e-7370-4423-a9b4-905c4f7e76b1	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$rBRdNyJpsfoKYkGR5mk8Cuvxjxc09H.lvSGbwRprG/DXX57gDDnsC	2026-07-09 22:16:04.674+00	2026-06-09 23:30:08.057+00	\N	\N	2026-06-09 22:16:04.676+00
de4cd415-5051-4e26-83c4-67d67db18a1d	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$dC2AWjFsIsXyCP5VNm0BG.VkZUxcL0HIK/wCxJ7Vojtl.dA3oHVNe	2026-07-09 22:13:28.645+00	2026-06-09 22:16:04.673+00	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::ffff:172.18.0.1	2026-06-09 22:13:28.647+00
028f3f85-eba4-47c5-b618-fd0a4459c21f	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$3gv8H/yrNLPjeUIDpS3H8OaTe.RDmZl.6.AvCLoDQOz4qeTBwDEPe	2026-07-09 22:16:04.673+00	\N	\N	\N	2026-06-09 22:16:04.675+00
80182db9-28c7-4318-92ed-8fe515af60ad	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$NMB/mWiavPdh4KdvswaCVe8Aln/ojoLLesel9D4m2l4EqoJBGtbQG	2026-07-09 23:29:35.812+00	\N	\N	\N	2026-06-09 23:29:35.815+00
61a65ee8-dcc5-44e6-bca5-bb015b619878	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$mBnXjCd7QZsU2ek1W.VGguCUkl0eWkT3FNxGpaVWLV/pFt8nGrw6q	2026-07-09 22:47:16.927+00	\N	\N	\N	2026-06-09 22:47:16.938+00
375266ae-e247-4e35-97ae-9ef41cb20e8d	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$tbClsoFUdau/zKD7byqxxe8cOIfU6tZnsKfau2N12M0tHycxFlNUq	2026-07-09 22:44:16.617+00	2026-06-09 22:47:16.936+00	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-09 22:44:16.617+00
a9563ba3-320c-42f2-bd9c-9b9732af6493	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$FwoiPYMBy4vUuIzSkoDxE.jIGrjY284GsER0D9u9MU0laiFASeuJS	2026-07-09 22:47:16.936+00	\N	\N	\N	2026-06-09 22:47:16.938+00
1512cbd6-7365-405e-b1b5-9b36fab2c397	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$j/qYQRwQk.JBOtAHof4.5O2R.p8drV1cykIRiAxZXrOFoLzl7KzAW	2026-07-09 22:51:16.407+00	\N	\N	\N	2026-06-09 22:51:16.41+00
6b30908c-3507-481c-af9a-2aea74851adb	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$yk7XmuGNbJCBB9hsKp5/NO1LMqste2OsgW/tskvgBcYV5gST6quj2	2026-07-09 23:29:35.826+00	\N	\N	\N	2026-06-09 23:29:35.827+00
c87aa56e-ffd7-471c-8490-ec29a90f9868	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$UOPXZYkZF2PFj.C7b.z94.nx2zpPkcsuQEfZpkr.4ohYSiuKEAkAe	2026-07-09 22:51:16.42+00	\N	\N	\N	2026-06-09 22:51:16.42+00
801b01a3-1dc9-4bd5-89ff-8450362a602f	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$BwzC7vmz2JDQ8yvYz80ObeMOolPZiYKQo2YQI9GTRgN3TGiZ59vwy	2026-07-09 22:47:16.936+00	2026-06-09 22:51:16.421+00	\N	\N	2026-06-09 22:47:16.938+00
0c591b6f-3850-4a2f-9663-8d0f2b466b20	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$HjHvf6fxKvtpfAsgQeecOOdS7voxjBKVOZtE5uuXrcx5DLVqWuNWy	2026-07-09 22:51:16.421+00	\N	\N	\N	2026-06-09 22:51:16.421+00
263e6917-9048-444f-810d-c61d839e2ed3	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$rROeQOjrnd1dH3mK/EYTmu00MGWejf44VQFgNiJQxgTcIjXt7KGu6	2026-07-09 23:19:23.422+00	2026-06-09 23:29:35.839+00	\N	\N	2026-06-09 23:19:23.423+00
7b94d60d-b2fb-4215-abb5-f18e89bb07d1	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$L8.l.Y07VPQ/BKnhzEP/LuTn6qqxGLqKxh/NJtOCf8ZNgNfB04u6C	2026-07-09 22:56:25.461+00	\N	\N	\N	2026-06-09 22:56:25.463+00
90e479f3-36aa-46bd-9cf5-946acf763ee3	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$kPir.2DHp7qEeJGuwdWYTel/badaBJ5oO.10hxxdBpCOscmyH6Nvy	2026-07-09 23:29:35.839+00	\N	\N	\N	2026-06-09 23:29:35.841+00
883262d2-1446-481e-9251-973ace021a62	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$q/PbPkuvsyxFpJAA2JteIO6CTaW74mebljqYKf0L7gNsz9djcQOey	2026-07-09 22:56:25.462+00	\N	\N	\N	2026-06-09 22:56:25.463+00
543ae8ac-8692-4a38-b974-6b0656b29fcf	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$j/NE.d/3PyywGe4ZfY9NMeaNKZGYBFqBTxYQREicOXfKqvq5XAzwu	2026-07-09 22:54:13.375+00	2026-06-09 22:56:25.479+00	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-09 22:54:13.377+00
d090a3f6-9088-4c01-bf2b-383ee119ef11	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$yYChTf2JV5N.fOwnWgrKKe9wFt9I7CIEnKuLCJWhM.rCM96KMu5G6	2026-07-09 22:58:56.421+00	\N	\N	\N	2026-06-09 22:58:56.422+00
6dc1b44e-cfb7-4090-a5af-b90acf74bf46	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$NfEHF9AFrllQd6jkaUNt0uY3h.pBVdpa7MaFe0rb/7/dVCXi37b62	2026-07-09 22:58:56.418+00	\N	\N	\N	2026-06-09 22:58:56.421+00
78dc1bd5-bd25-40a2-8bc0-c148bd155223	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$x0r77Hx9WCyjLs7DO8aMW.gV.XpRInH/PJr7CyzhER5.YqJRLWoaK	2026-07-09 22:56:25.479+00	2026-06-09 22:58:56.409+00	\N	\N	2026-06-09 22:56:25.48+00
8a3130eb-a777-408c-b9ce-0de312a8efa8	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$1Yj2Ugw.4bNYKYqSiTSQg.csq/nn/Vnd.ZYfjVPDNbKw2u5HYBoiG	2026-07-09 22:58:56.409+00	\N	\N	\N	2026-06-09 22:58:56.419+00
3f01e36f-7761-4efc-9046-7c54cef127a1	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$tINr5altr2d3cDTPolbRu.fHFvkZ5FjG3tMKBB1PaqguUNF/L//SC	2026-07-09 23:34:32.265+00	\N	\N	\N	2026-06-09 23:34:32.265+00
d10487eb-1763-423c-bdab-d3cb8af91464	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$/cqFQans0B4iiMwo/Lr3Re4X3axhPZq4onrZR9okQR83zpglGZQB2	2026-07-09 23:19:23.415+00	\N	\N	\N	2026-06-09 23:19:23.417+00
042407ba-6b15-4393-b352-5dc75cf1c352	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$5nYx6PfEMfn1.bnoaLpKouuIY3t0JX.GFlB.8hRa2IHz67Qs43k2i	2026-07-09 23:19:23.416+00	\N	\N	\N	2026-06-09 23:19:23.417+00
6e62ab12-1faa-4a8a-ac41-beb5447a643c	e9819fd9-49d7-4c18-92fc-0770688d0dfd	$2b$10$.4bXOkSURgX.RLF5xm7ghuR.Dm0qZArZ2WzuNc1IE1s94jRWiN4qi	2026-07-09 23:16:19.031+00	2026-06-09 23:19:23.422+00	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-09 23:16:19.034+00
9e6a1506-fb34-4ebf-b425-90ac087ee2aa	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$lXyUvwYtxWpTFE6GQG7x0uCqxcI.atiysmAFg3kMEC/fR1AJO6JQa	2026-07-09 23:34:32.272+00	\N	\N	\N	2026-06-09 23:34:32.273+00
407bf84d-3d6e-4781-a7c6-79e430dc6bd4	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$QZQcoYfblCjOvSTXvSlSyuXJP/7CMJ5dBwXRMyVVThu/4Y60HNOhi	2026-07-09 23:30:18.493+00	2026-06-09 23:34:32.273+00	Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/148.0.0.0 Safari/537.36	::1	2026-06-09 23:30:18.494+00
f10dfbc2-06dd-4c92-91c7-c7bb5695ee2d	619de827-e64c-4ad4-8f30-d275d59a1f1d	$2b$10$Awl/pORqxRxBEF221T78Gew1tIp.zIXKCD97W4CF8eL0z2oxh5Jym	2026-07-09 23:34:32.273+00	\N	\N	\N	2026-06-09 23:34:32.274+00
\.


--
-- Data for Name: ticket_messages; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.ticket_messages (id, ticket_id, sender_id, message, created_at) FROM stdin;
1	b434550e-62b0-42fb-ab42-0d53afd948f9	e9819fd9-49d7-4c18-92fc-0770688d0dfd	тест вопрос	2026-06-09 22:14:02.735+00
2	a106b109-efab-4353-ba1b-ac5d750cd52c	e9819fd9-49d7-4c18-92fc-0770688d0dfd	тес	2026-06-09 22:14:10.806+00
3	8906b836-dbf5-4728-b6d9-dcc9e7865420	e9819fd9-49d7-4c18-92fc-0770688d0dfd	тес	2026-06-09 22:15:59.653+00
4	4f5b6ab6-57a0-4828-9463-9a899be0c031	e9819fd9-49d7-4c18-92fc-0770688d0dfd	тес	2026-06-09 22:16:00.33+00
5	75d6dda3-0278-414c-98e1-0aaa7c678c25	e9819fd9-49d7-4c18-92fc-0770688d0dfd	тест	2026-06-09 22:16:08.007+00
6	75301d28-3f58-4c19-b93f-9709293ed6a0	e9819fd9-49d7-4c18-92fc-0770688d0dfd	Test Message	2026-06-09 22:16:27.777+00
7	656b5d13-8006-417d-afc2-43430161e50d	e9819fd9-49d7-4c18-92fc-0770688d0dfd	skjansaj	2026-06-09 22:44:28.583+00
8	656b5d13-8006-417d-afc2-43430161e50d	619de827-e64c-4ad4-8f30-d275d59a1f1d	привет	2026-06-09 22:54:20.392+00
9	75301d28-3f58-4c19-b93f-9709293ed6a0	619de827-e64c-4ad4-8f30-d275d59a1f1d	привет	2026-06-09 22:54:29.922+00
10	75301d28-3f58-4c19-b93f-9709293ed6a0	e9819fd9-49d7-4c18-92fc-0770688d0dfd	ку ку	2026-06-09 23:30:05.489+00
\.


--
-- Data for Name: tickets; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.tickets (id, partner_id, subject, status, created_at, updated_at) FROM stdin;
71631c13-3b61-4c35-97b4-5668e02f6287	64ba713d-c027-4ff4-9be6-1145f3ab7a9e	Проблема с выплатой за виллу	IN_PROGRESS	2026-06-09 15:48:14.415+00	2026-06-09 15:48:14.414+00
9f28b2d1-01ac-4cff-bde9-2d38420c5534	64ba713d-c027-4ff4-9be6-1145f3ab7a9e	Как добавить нового брокера?	CLOSED	2026-06-09 15:48:14.415+00	2026-06-09 15:48:14.414+00
b434550e-62b0-42fb-ab42-0d53afd948f9	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Вопрос по сделке: Покупка здания	OPEN	2026-06-09 22:14:02.735+00	2026-06-09 22:14:02.735+00
a106b109-efab-4353-ba1b-ac5d750cd52c	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Вопрос по сделке: Покупка здания	OPEN	2026-06-09 22:14:10.806+00	2026-06-09 22:14:10.806+00
8906b836-dbf5-4728-b6d9-dcc9e7865420	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Вопрос по сделке: Покупка здания	OPEN	2026-06-09 22:15:59.653+00	2026-06-09 22:15:59.653+00
4f5b6ab6-57a0-4828-9463-9a899be0c031	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Вопрос по сделке: Покупка здания	OPEN	2026-06-09 22:16:00.33+00	2026-06-09 22:16:00.33+00
75d6dda3-0278-414c-98e1-0aaa7c678c25	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Вопрос по сделке: Покупка здания	OPEN	2026-06-09 22:16:08.007+00	2026-06-09 22:16:08.007+00
656b5d13-8006-417d-afc2-43430161e50d	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	ackfnf	OPEN	2026-06-09 22:44:28.583+00	2026-06-09 22:54:20.388+00
75301d28-3f58-4c19-b93f-9709293ed6a0	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	Test Subject	OPEN	2026-06-09 22:16:27.777+00	2026-06-09 23:30:05.487+00
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.users (id, email, password_hash, role, partner_id, is_active, created_at, updated_at, name, phone) FROM stdin;
e9819fd9-49d7-4c18-92fc-0770688d0dfd	klykov_boards@foryou-realestate.com	$2b$10$nnXw/nEOIs9p4g3lULygZeVkV.kZeXGqxyCzrszxLAjH8OzzU8FgC	partner_user	fa655ae9-9157-4d87-b0ba-eb844dcf0ca8	t	2026-06-09 15:48:13.336+00	2026-06-09 15:48:13.336+00	Олексій Кликов	+380501234567
619de827-e64c-4ad4-8f30-d275d59a1f1d	admin@foryou-realestate.com	$2b$10$RKhqMlNxwwF7sHNP1jnOWevpBRlTH9yXqrOpXtsiiphzg7JlyJYqK	admin	\N	t	2026-06-09 15:48:13.409+00	2026-06-09 15:48:13.409+00	Головний Адмін	+380990000000
2a4d3d08-752a-45da-87ef-6c226f7afe0d	admin2@foryou-realestate.com	$2b$10$RKhqMlNxwwF7sHNP1jnOWevpBRlTH9yXqrOpXtsiiphzg7JlyJYqK	admin	\N	t	2026-06-09 15:48:13.412+00	2026-06-09 15:48:13.412+00	Другий Адмін	+380991111111
68b64d4f-d055-4c1c-8629-2e1a18747aba	partner1@foryou-realestate.com	$2b$10$tY..rooPoPfcUKPpQJXuzOunIe90npnQ2ymU1At0pKTMo/ATMhScO	partner_user	26a55fbd-5e10-41ab-9c7f-a72ae3a11466	t	2026-06-09 15:48:13.463+00	2026-06-09 15:48:13.463+00	Test Partner 1	+38050000001
131394ea-c443-41e2-b95c-a3d31db101e2	ref_1_0@example.com	dummy	partner_user	96c0368d-63e5-4ae4-8b1a-dd77b55f7a36	t	2026-06-09 15:48:13.483+00	2026-06-09 15:48:13.483+00	Referred User 0 of 1	\N
f03b4c07-d27d-457d-8341-16cfd550af73	ref_1_1@example.com	dummy	partner_user	fd2ad14e-edac-47c4-bd3c-f34e1a566a65	t	2026-06-09 15:48:13.486+00	2026-06-09 15:48:13.486+00	Referred User 1 of 1	\N
a37ff42d-480d-4f33-bb13-e4ecde0c30a2	partner2@foryou-realestate.com	$2b$10$6Ww4jXWIM888TOhTF6nTiu73XtmuwaKIXidG.MnytMXdffLDEVAMa	partner_user	b67b0036-fa9b-4099-a858-983b45949a27	t	2026-06-09 15:48:13.537+00	2026-06-09 15:48:13.537+00	Test Partner 2	+38050000002
9a28df39-b09b-4fd9-b4ff-002b38e6d8a2	ref_2_0@example.com	dummy	partner_user	f54148d6-229c-4314-9e26-883cf769bdfa	t	2026-06-09 15:48:13.544+00	2026-06-09 15:48:13.544+00	Referred User 0 of 2	\N
c5429961-1c3a-4d01-9766-247a5ad99652	ref_2_1@example.com	dummy	partner_user	94ac54f4-10e6-4816-8680-bbae23f4b064	t	2026-06-09 15:48:13.55+00	2026-06-09 15:48:13.55+00	Referred User 1 of 2	\N
0f2c8334-2949-4bac-b9eb-8c9bef98e2a0	partner3@foryou-realestate.com	$2b$10$UeFV/Poy7h2DimEAN1gatutR8hmPJMfMfuGfcwJHEzwLFxUadu7W6	partner_user	1ae87327-48de-4f34-a70d-6a5897b98c5e	t	2026-06-09 15:48:13.604+00	2026-06-09 15:48:13.604+00	Test Partner 3	+38050000003
47fefa87-02d4-4f1a-ae4a-eb3bae0e53b0	ref_3_0@example.com	dummy	partner_user	b73d4052-fb88-479e-a3c1-46fe1e7473d9	t	2026-06-09 15:48:13.613+00	2026-06-09 15:48:13.613+00	Referred User 0 of 3	\N
040bd62a-96c3-4a01-abdc-6870e469f6ed	ref_3_1@example.com	dummy	partner_user	96ff9ea7-e138-4bba-95f0-e6021116f3a8	t	2026-06-09 15:48:13.617+00	2026-06-09 15:48:13.617+00	Referred User 1 of 3	\N
ec8892b1-6ff3-4131-bb69-fc7d21292f39	ref_3_2@example.com	dummy	partner_user	dd81f7ac-2521-4168-a770-207076cb821f	t	2026-06-09 15:48:13.625+00	2026-06-09 15:48:13.625+00	Referred User 2 of 3	\N
21986e60-57ea-4b9a-9d2e-9032f8d8de7b	partner4@foryou-realestate.com	$2b$10$4WwSmzoTD33WZLzLK35/L.73.7LHlulcKFBmLfV75PBrlALQuQzjW	partner_user	03d11bfd-d521-45f4-88bb-59149622010f	t	2026-06-09 15:48:13.683+00	2026-06-09 15:48:13.683+00	Test Partner 4	+38050000004
c84e5881-af65-4f41-9b8d-42fc3af59462	ref_4_0@example.com	dummy	partner_user	ce1cac52-b441-4433-80ba-972117a17ffa	t	2026-06-09 15:48:13.692+00	2026-06-09 15:48:13.692+00	Referred User 0 of 4	\N
a6e51c34-2cb4-4b34-a750-c18b587f8bf6	ref_4_1@example.com	dummy	partner_user	1220ea41-1009-4142-a195-7b221e1ec9a7	t	2026-06-09 15:48:13.694+00	2026-06-09 15:48:13.694+00	Referred User 1 of 4	\N
06974f25-c4f9-4cb8-99e0-f8aafc63b584	partner5@foryou-realestate.com	$2b$10$RObJ981L50QtBEM5SO.cNuZDq/pm/k36AJnTsqXipNoJ8wUU8B8qO	partner_user	c6de25e6-27f8-4c4c-aace-15e52665ae21	t	2026-06-09 15:48:13.746+00	2026-06-09 15:48:13.746+00	Test Partner 5	+38050000005
078fea97-d82a-4eee-b016-294e6a64479a	ref_5_0@example.com	dummy	partner_user	917d452c-f92b-407f-8b87-b1658b6ac6ac	t	2026-06-09 15:48:13.754+00	2026-06-09 15:48:13.754+00	Referred User 0 of 5	\N
7843e019-a77c-4b12-81de-b4d4d268c81d	ref_5_1@example.com	dummy	partner_user	238ea35b-e1e5-4efe-b585-44296c030632	t	2026-06-09 15:48:13.757+00	2026-06-09 15:48:13.757+00	Referred User 1 of 5	\N
c4a8a17a-a894-4e35-95ff-66e1316ee61e	partner6@foryou-realestate.com	$2b$10$SZ7Lu3N7sczLGmRtkIybO.oC1NzsHD6Udgp5Qx/HOEmCRig0Kq7x6	partner_user	1d3747fc-e10e-416d-ae0e-16a30b91df96	t	2026-06-09 15:48:13.809+00	2026-06-09 15:48:13.809+00	Test Partner 6	+38050000006
fcea69c0-fff2-4e97-b0ea-e15977ba8791	ref_6_0@example.com	dummy	partner_user	02f1bf50-7b89-434b-8df7-f5caad0192aa	t	2026-06-09 15:48:13.815+00	2026-06-09 15:48:13.815+00	Referred User 0 of 6	\N
a2caef70-f27e-4c9b-b4c0-56a448ef8947	ref_6_1@example.com	dummy	partner_user	a7915b59-c086-442e-b732-57100c847245	t	2026-06-09 15:48:13.818+00	2026-06-09 15:48:13.818+00	Referred User 1 of 6	\N
7e29dacd-68bc-4651-89e7-9c43026ba951	ref_6_2@example.com	dummy	partner_user	cf5984aa-0a68-4f0c-a4b2-0ae8872deb10	t	2026-06-09 15:48:13.823+00	2026-06-09 15:48:13.823+00	Referred User 2 of 6	\N
82581858-0863-43e1-b66d-9ad2fdfef196	partner7@foryou-realestate.com	$2b$10$SyjM6UDLvgTZAT3ZJLnlw.05YGHtW9YvyyEWDYfTMnZKvQQgeqlJq	partner_user	108973f6-030c-49da-af5b-81990b754dc3	t	2026-06-09 15:48:13.875+00	2026-06-09 15:48:13.875+00	Test Partner 7	+38050000007
37e7e385-96b9-4b3f-a1e9-6ab9ef9c0b8a	ref_7_0@example.com	dummy	partner_user	7a2922e7-5a86-4da1-b55c-4ff67a0a503a	t	2026-06-09 15:48:13.882+00	2026-06-09 15:48:13.882+00	Referred User 0 of 7	\N
f2485a6a-2d87-42b8-9e01-b576b38b21e7	partner8@foryou-realestate.com	$2b$10$icjdul0IglFeTy5FwvVy1.tRGNkvJkmwOR4LR5JySPffSTs5Oxpim	partner_user	9c68c523-97ca-4dfc-bbb9-2ee97f5c69d9	t	2026-06-09 15:48:13.942+00	2026-06-09 15:48:13.942+00	Test Partner 8	+38050000008
52cf1549-fcd9-48f8-a239-e16b8849204e	ref_8_0@example.com	dummy	partner_user	21430b4e-a56a-4f01-95e6-d5218d104619	t	2026-06-09 15:48:13.949+00	2026-06-09 15:48:13.949+00	Referred User 0 of 8	\N
ed83ebc4-1505-44fe-87a8-18893641840f	ref_8_1@example.com	dummy	partner_user	d0323d60-1909-4850-9fcd-bc4f01ced17e	t	2026-06-09 15:48:13.954+00	2026-06-09 15:48:13.954+00	Referred User 1 of 8	\N
60464613-019a-4b22-922d-5b62a737c91c	partner9@foryou-realestate.com	$2b$10$mrF07pY6sPu9xBN56I0yT.RVjg5JHaKB5rbJekdLHp0ymx0OVO7Eq	partner_user	c12600ca-ea0b-495c-a30d-d0ebfa2e60eb	t	2026-06-09 15:48:14.014+00	2026-06-09 15:48:14.014+00	Test Partner 9	+38050000009
ecfd8089-2d56-48e2-a27e-0cea0843ccce	ref_9_0@example.com	dummy	partner_user	f4291427-078c-44db-9329-5fc4c408137a	t	2026-06-09 15:48:14.021+00	2026-06-09 15:48:14.021+00	Referred User 0 of 9	\N
6af6c42a-24fc-4e5d-95ba-a3f16a720ecf	partner10@foryou-realestate.com	$2b$10$R1Zr.TA2CKXujH0Y8pzmjuH7I03Lk5h.qMV7uySWVmyZcCFbIRWxS	partner_user	79de48bf-c2be-43b8-b07c-55a4673141fa	t	2026-06-09 15:48:14.074+00	2026-06-09 15:48:14.074+00	Test Partner 10	+38050000010
7725c821-4c4f-4c9c-8685-1fe76ca0fbb2	ref_10_0@example.com	dummy	partner_user	27be0fc8-8c08-49f7-8b3e-9b1225b3ff76	t	2026-06-09 15:48:14.083+00	2026-06-09 15:48:14.083+00	Referred User 0 of 10	\N
ef049218-8b08-4e8f-bad1-4d32bcb39a82	partner11@foryou-realestate.com	$2b$10$WuuU659.rX9TfBOpHYFtluMJ7k1DY3kptdtx1Lp1Fcp.73mCbwnWW	partner_user	86bb3bc7-4a67-4f39-931e-f124c01372fc	t	2026-06-09 15:48:14.135+00	2026-06-09 15:48:14.135+00	Test Partner 11	+38050000011
6bc72db1-ee33-4206-8f5c-dc91a06133b8	ref_11_0@example.com	dummy	partner_user	6afbd0ea-1c9e-457e-9af7-9c97d2a7638f	t	2026-06-09 15:48:14.141+00	2026-06-09 15:48:14.141+00	Referred User 0 of 11	\N
e8284f47-cd15-4a72-b2be-fe348a447c66	partner12@foryou-realestate.com	$2b$10$ZRk1QGUD6yq2SslOpKXc5O.oKyRyHikL9iJ0XRpNBWSjpm6SXMiP2	partner_user	80ad8fb8-3fd3-4f91-b767-3a61bf817615	t	2026-06-09 15:48:14.192+00	2026-06-09 15:48:14.192+00	Test Partner 12	+38050000012
e569efb0-a5aa-4393-ace8-0771a3e8e057	ref_12_0@example.com	dummy	partner_user	7ac03170-90e7-4dd7-bfd4-bab121b54eac	t	2026-06-09 15:48:14.199+00	2026-06-09 15:48:14.199+00	Referred User 0 of 12	\N
16114e98-db8f-49db-bdf8-5867c7bcdbcb	partner13@foryou-realestate.com	$2b$10$lO0cLC12z40cajrP17UhTORy9UKs42iqAreXl3xgtGGd6HdhuwrsK	partner_user	4d31781f-0c34-4e6d-b90b-11089b68554a	t	2026-06-09 15:48:14.252+00	2026-06-09 15:48:14.252+00	Test Partner 13	+38050000013
dc9be96f-1b89-4dd6-af0e-32a098762905	ref_13_0@example.com	dummy	partner_user	f7445468-73a1-44a2-a60c-1a82ee32f6c5	t	2026-06-09 15:48:14.258+00	2026-06-09 15:48:14.258+00	Referred User 0 of 13	\N
95d437b2-ee32-473c-85c7-ce63cc65818a	partner14@foryou-realestate.com	$2b$10$vz.hTKIV17lhXBGMW9rvU.NaWS8048EwgRYm3G4VL0himlufZm/..	partner_user	2703b39e-5a95-4cc6-b903-7bf871d2251e	t	2026-06-09 15:48:14.311+00	2026-06-09 15:48:14.311+00	Test Partner 14	+38050000014
61cc921d-1be0-47e7-856b-8201d7bf0bb1	ref_14_0@example.com	dummy	partner_user	30f5b41f-4eb3-455c-96e5-88da4c3c226f	t	2026-06-09 15:48:14.324+00	2026-06-09 15:48:14.324+00	Referred User 0 of 14	\N
c1a8e03e-c03d-4969-87ab-05243207f12f	ref_14_1@example.com	dummy	partner_user	15994e7f-e62a-40b6-b25b-dd4ab10c7414	t	2026-06-09 15:48:14.326+00	2026-06-09 15:48:14.326+00	Referred User 1 of 14	\N
5bacaf13-5e9e-4cb6-9e68-952d851ad104	ref_14_2@example.com	dummy	partner_user	0d747dad-503f-4908-a056-0db3f67c134f	t	2026-06-09 15:48:14.328+00	2026-06-09 15:48:14.328+00	Referred User 2 of 14	\N
f00fee97-d669-480c-83a0-401b3f224dc3	partner15@foryou-realestate.com	$2b$10$37OLRLdYHMB68UqAi2YeLeq7SbxYPmZvlYKQECW7YhVQ9vHipnLLW	partner_user	64ba713d-c027-4ff4-9be6-1145f3ab7a9e	t	2026-06-09 15:48:14.378+00	2026-06-09 15:48:14.378+00	Test Partner 15	+38050000015
039ae803-0116-463a-a2a0-849baba52953	ref_15_0@example.com	dummy	partner_user	3d05eefc-ed38-4f34-90aa-ecb18893a275	t	2026-06-09 15:48:14.385+00	2026-06-09 15:48:14.385+00	Referred User 0 of 15	\N
f5b2afe0-1b9f-4c0e-b62c-9a6681e213e9	ref_15_1@example.com	dummy	partner_user	c2f45622-7ea9-4b48-ac55-2aa757e7f512	t	2026-06-09 15:48:14.387+00	2026-06-09 15:48:14.387+00	Referred User 1 of 15	\N
11c28242-9032-4294-989c-55f5970c5575	ref_15_2@example.com	dummy	partner_user	1999bbbc-502c-46de-872a-6233fd92f922	t	2026-06-09 15:48:14.392+00	2026-06-09 15:48:14.392+00	Referred User 2 of 15	\N
\.


--
-- Data for Name: webhook_events; Type: TABLE DATA; Schema: public; Owner: -
--

COPY public.webhook_events (id, event_id, source, payload, received_at, processed_at, status, error_message) FROM stdin;
\.


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 84, true);


--
-- Name: commissions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.commissions_id_seq', 3, true);


--
-- Name: lead_snapshots_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lead_snapshots_id_seq', 30, true);


--
-- Name: lead_status_history_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.lead_status_history_id_seq', 1, false);


--
-- Name: partner_pipelines_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_pipelines_id_seq', 1, false);


--
-- Name: partner_sources_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_sources_id_seq', 1, false);


--
-- Name: partner_tags_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.partner_tags_id_seq', 1, false);


--
-- Name: payouts_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.payouts_id_seq', 1, false);


--
-- Name: ticket_messages_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.ticket_messages_id_seq', 10, true);


--
-- Name: webhook_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.webhook_events_id_seq', 1, false);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: commissions commissions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_pkey PRIMARY KEY (id);


--
-- Name: lead_snapshots lead_snapshots_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_snapshots
    ADD CONSTRAINT lead_snapshots_pkey PRIMARY KEY (id);


--
-- Name: lead_status_history lead_status_history_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_status_history
    ADD CONSTRAINT lead_status_history_pkey PRIMARY KEY (id);


--
-- Name: notification_prefs notification_prefs_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_prefs
    ADD CONSTRAINT notification_prefs_pkey PRIMARY KEY (user_id);


--
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- Name: partner_pipelines partner_pipelines_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_pipelines
    ADD CONSTRAINT partner_pipelines_pkey PRIMARY KEY (id);


--
-- Name: partner_sources partner_sources_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_sources
    ADD CONSTRAINT partner_sources_pkey PRIMARY KEY (id);


--
-- Name: partner_tags partner_tags_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_tags
    ADD CONSTRAINT partner_tags_pkey PRIMARY KEY (id);


--
-- Name: partners partners_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_pkey PRIMARY KEY (id);


--
-- Name: payouts payouts_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_pkey PRIMARY KEY (id);


--
-- Name: refresh_sessions refresh_sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_sessions
    ADD CONSTRAINT refresh_sessions_pkey PRIMARY KEY (id);


--
-- Name: ticket_messages ticket_messages_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_pkey PRIMARY KEY (id);


--
-- Name: tickets tickets_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: webhook_events webhook_events_pkey; Type: CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.webhook_events
    ADD CONSTRAINT webhook_events_pkey PRIMARY KEY (id);


--
-- Name: audit_logs_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX audit_logs_created_at_idx ON public.audit_logs USING btree (created_at DESC);


--
-- Name: commissions_partner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX commissions_partner_id_idx ON public.commissions USING btree (partner_id);


--
-- Name: lead_snapshots_external_lead_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lead_snapshots_external_lead_id_idx ON public.lead_snapshots USING btree (external_lead_id);


--
-- Name: lead_snapshots_external_lead_id_partner_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX lead_snapshots_external_lead_id_partner_id_key ON public.lead_snapshots USING btree (external_lead_id, partner_id);


--
-- Name: lead_snapshots_partner_id_updated_at_source_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lead_snapshots_partner_id_updated_at_source_idx ON public.lead_snapshots USING btree (partner_id, updated_at_source DESC);


--
-- Name: lead_status_history_partner_id_changed_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX lead_status_history_partner_id_changed_at_idx ON public.lead_status_history USING btree (partner_id, changed_at DESC);


--
-- Name: notifications_user_id_created_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_created_at_idx ON public.notifications USING btree (user_id, created_at DESC);


--
-- Name: notifications_user_id_is_read_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX notifications_user_id_is_read_idx ON public.notifications USING btree (user_id, is_read);


--
-- Name: partner_pipelines_partner_id_amocrm_pipeline_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX partner_pipelines_partner_id_amocrm_pipeline_id_key ON public.partner_pipelines USING btree (partner_id, amocrm_pipeline_id);


--
-- Name: partner_pipelines_partner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX partner_pipelines_partner_id_idx ON public.partner_pipelines USING btree (partner_id);


--
-- Name: partner_sources_partner_id_amocrm_source_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX partner_sources_partner_id_amocrm_source_key ON public.partner_sources USING btree (partner_id, amocrm_source);


--
-- Name: partner_sources_partner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX partner_sources_partner_id_idx ON public.partner_sources USING btree (partner_id);


--
-- Name: partner_tags_partner_id_amocrm_tag_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX partner_tags_partner_id_amocrm_tag_id_key ON public.partner_tags USING btree (partner_id, amocrm_tag_id);


--
-- Name: partner_tags_partner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX partner_tags_partner_id_idx ON public.partner_tags USING btree (partner_id);


--
-- Name: payouts_partner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX payouts_partner_id_idx ON public.payouts USING btree (partner_id);


--
-- Name: refresh_sessions_user_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX refresh_sessions_user_id_idx ON public.refresh_sessions USING btree (user_id);


--
-- Name: ticket_messages_sender_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ticket_messages_sender_id_idx ON public.ticket_messages USING btree (sender_id);


--
-- Name: ticket_messages_ticket_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX ticket_messages_ticket_id_idx ON public.ticket_messages USING btree (ticket_id);


--
-- Name: tickets_partner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX tickets_partner_id_idx ON public.tickets USING btree (partner_id);


--
-- Name: users_email_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX users_email_key ON public.users USING btree (email);


--
-- Name: users_partner_id_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX users_partner_id_idx ON public.users USING btree (partner_id);


--
-- Name: webhook_events_event_id_key; Type: INDEX; Schema: public; Owner: -
--

CREATE UNIQUE INDEX webhook_events_event_id_key ON public.webhook_events USING btree (event_id);


--
-- Name: webhook_events_status_received_at_idx; Type: INDEX; Schema: public; Owner: -
--

CREATE INDEX webhook_events_status_received_at_idx ON public.webhook_events USING btree (status, received_at);


--
-- Name: audit_logs audit_logs_actor_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_actor_user_id_fkey FOREIGN KEY (actor_user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: commissions commissions_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.commissions
    ADD CONSTRAINT commissions_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_snapshots lead_snapshots_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_snapshots
    ADD CONSTRAINT lead_snapshots_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: lead_status_history lead_status_history_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.lead_status_history
    ADD CONSTRAINT lead_status_history_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notification_prefs notification_prefs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notification_prefs
    ADD CONSTRAINT notification_prefs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: notifications notifications_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partner_pipelines partner_pipelines_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_pipelines
    ADD CONSTRAINT partner_pipelines_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partner_sources partner_sources_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_sources
    ADD CONSTRAINT partner_sources_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partner_tags partner_tags_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partner_tags
    ADD CONSTRAINT partner_tags_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: partners partners_referred_by_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.partners
    ADD CONSTRAINT partners_referred_by_id_fkey FOREIGN KEY (referred_by_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: payouts payouts_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.payouts
    ADD CONSTRAINT payouts_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: refresh_sessions refresh_sessions_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.refresh_sessions
    ADD CONSTRAINT refresh_sessions_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_messages ticket_messages_sender_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ticket_messages ticket_messages_ticket_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.ticket_messages
    ADD CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.tickets(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: tickets tickets_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.tickets
    ADD CONSTRAINT tickets_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: users users_partner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: -
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_partner_id_fkey FOREIGN KEY (partner_id) REFERENCES public.partners(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: -
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict SIahobZyr9U0x8gAZ0nMkBlKFuw1xnYO9njZhYTcsms8uxPKqV1DIPRWYE7dZt6

