# Tasks: Event Notifications

**Input**: Design documents from `/specs/001-event-notifications/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, quickstart.md

**Tests**: Not explicitly requested - skipping test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Project Type**: Next.js App Router (single project)
- **Source**: `src/` at repository root
- **Migrations**: `supabase/migrations/`
- **Edge Functions**: `supabase/functions/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database setup and TypeScript types for notification system

- [x] T001 Create database migration file at `supabase/migrations/20260126000000_notifications.sql` with notifications and notification_preferences tables, indexes, and RLS policies
- [x] T002 Add notification TypeScript types (Notification, NotificationPreference, NotificationType) to `src/lib/database.types.ts`
- [x] T003 [P] Create notification helper functions file at `src/lib/notifications.ts` with createNotification, markAsRead, getUnreadCount utilities
- [x] T004 [P] Enable Supabase Realtime replication for notifications table in Supabase Dashboard

**Checkpoint**: Database schema ready, types defined - foundation for all notification features

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core notification infrastructure that ALL user stories depend on

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T005 Create `src/hooks/useNotifications.ts` hook with Supabase Realtime subscription for new notifications and unread count state
- [x] T006 Create `src/components/NotificationItem.tsx` component displaying single notification with icon, title, message, time ago, read status styling
- [x] T007 Create `src/components/NotificationList.tsx` component with scrollable list, empty state, mark all as read button
- [x] T008 Create `src/components/NotificationBell.tsx` component with bell icon, unread count badge, dropdown menu using NotificationList
- [x] T009 Update `src/components/Navbar.tsx` to include NotificationBell component next to profile dropdown
- [x] T010 Create notifications page at `src/app/notifications/page.tsx` with full notification history, filtering by type, pagination

**Checkpoint**: Foundation ready - users can view notifications, UI components exist, real-time updates work

---

## Phase 3: User Story 1 - Event Reminder Notifications (Priority: P1) 🎯 MVP

**Goal**: Users receive reminder notifications 24h and 1h before events they RSVP'd to

**Independent Test**: RSVP to an event scheduled for tomorrow, verify reminder notification appears at configured intervals

### Implementation for User Story 1

- [x] T011 [US1] Create database function `schedule_event_reminders()` in migration that queries upcoming events and creates reminder notifications for attendees
- [x] T012 [US1] Create Edge Function at `supabase/functions/schedule-reminders/index.ts` that calls schedule_event_reminders and handles batch processing
- [x] T013 [US1] Configure pg_cron job to run schedule-reminders Edge Function every 15 minutes
- [x] T014 [US1] Add reminder notification template in `src/lib/notifications.ts` with formatReminderNotification function (24h vs 1h messaging)
- [x] T015 [US1] Update useNotifications hook to show toast for new reminder notifications using react-hot-toast

**Checkpoint**: User Story 1 complete - reminder notifications are scheduled and delivered automatically

---

## Phase 4: User Story 2 - RSVP Confirmation Notifications (Priority: P2)

**Goal**: Users receive instant confirmation when they RSVP to an event

**Independent Test**: Click RSVP button on any event, verify confirmation notification appears immediately

### Implementation for User Story 2

- [x] T016 [US2] Add confirmation notification template in `src/lib/notifications.ts` with formatConfirmationNotification function
- [x] T017 [US2] Update `src/components/AttendeeButton.tsx` to create confirmation notification on successful RSVP using createNotification helper
- [x] T018 [US2] Add cancellation notification when user un-RSVPs from an event in AttendeeButton.tsx
- [x] T019 [US2] Show immediate toast notification on RSVP success in AttendeeButton.tsx

**Checkpoint**: User Story 2 complete - RSVP actions trigger instant confirmations

---

## Phase 5: User Story 3 - Event Update Notifications (Priority: P3)

**Goal**: Attendees are notified when event details (date, time, location) change or event is cancelled

**Independent Test**: As host, edit event date/time/location, verify all attendees receive update notification

### Implementation for User Story 3

- [x] T020 [US3] Add update notification template in `src/lib/notifications.ts` with formatUpdateNotification function showing old vs new values
- [x] T021 [US3] Add cancellation notification template in `src/lib/notifications.ts` with formatCancellationNotification function
- [x] T022 [US3] Update `src/app/events/[id]/edit/page.tsx` to detect significant changes (date, time, location) and create update notifications for all attendees
- [x] T023 [US3] Add event cancellation flow in DeleteEventButton.tsx that creates cancellation notifications for all attendees before deletion
- [x] T024 [US3] Create helper function `notifyEventAttendees(eventId, notification)` in `src/lib/notifications.ts` to bulk-create notifications

**Checkpoint**: User Story 3 complete - event changes notify all affected attendees

---

## Phase 6: User Story 4 - Notification Preferences Management (Priority: P4)

**Goal**: Users can control their notification settings (email, reminder timing, notification types)

**Independent Test**: Navigate to settings, toggle email notifications off, verify no emails sent on next action

### Implementation for User Story 4

- [x] T025 [US4] Create `src/components/NotificationPreferences.tsx` with form for email_enabled, reminders_enabled, confirmations_enabled, updates_enabled, reminder_hours selection
- [x] T026 [US4] Update `src/app/profile/settings/page.tsx` to include NotificationPreferences component in a new "Notifications" section
- [x] T027 [US4] Add getOrCreatePreferences function in `src/lib/notifications.ts` that returns user preferences or creates defaults
- [x] T028 [US4] Update createNotification in `src/lib/notifications.ts` to check user preferences before creating notification
- [x] T029 [US4] Add preference checks to reminder scheduling (T012) to respect reminders_enabled and reminder_hours settings

**Checkpoint**: User Story 4 complete - users have full control over notification behavior

---

## Phase 7: Email Notifications (Enhancement)

**Purpose**: Send email copies of notifications for users who enable email

- [x] T030 [P] Create Edge Function at `supabase/functions/send-notification-email/index.ts` using Resend API
- [x] T031 [P] Create email templates (HTML + text) for each notification type in Edge Function
- [x] T032 Update createNotification to call send-notification-email Edge Function when email_enabled is true in user preferences
- [x] T033 Add email_sent status tracking in notifications table and update after successful send

**Checkpoint**: Email notifications working for users who opt-in

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting all notification features

- [x] T034 [P] Add loading states to NotificationBell and NotificationList components
- [x] T035 [P] Add empty state illustrations to NotificationList and notifications page
- [x] T036 [P] Add notification sound/vibration option for mobile browsers
- [x] T037 Add "Clear all" button to notifications page for bulk deletion
- [x] T038 Implement 30-day auto-archive for old notifications (database job)
- [x] T039 Update AGENTS.md with new notification components and database tables
- [x] T040 Run quickstart.md validation checklist

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1: Setup
    ↓
Phase 2: Foundational (BLOCKS all user stories)
    ↓
┌───────────────────────────────────────────────────┐
│  User Stories can proceed in parallel OR sequence │
├───────────────────────────────────────────────────┤
│  Phase 3: US1 (P1) - Reminders      🎯 MVP       │
│  Phase 4: US2 (P2) - Confirmations               │
│  Phase 5: US3 (P3) - Updates                     │
│  Phase 6: US4 (P4) - Preferences                 │
└───────────────────────────────────────────────────┘
    ↓
Phase 7: Email (requires US4 for preferences)
    ↓
Phase 8: Polish
```

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 3 (P3)**: Can start after Phase 2 - No dependencies on other stories
- **User Story 4 (P4)**: Can start after Phase 2 - Other stories should check preferences after US4 complete

### Within Each User Story

- Helper functions before UI integration
- Database operations before frontend updates
- Core functionality before enhancements

### Parallel Opportunities

**Phase 1 (Setup)**:
```
T003 (notifications.ts) ∥ T004 (Realtime config)
```

**Phase 2 (Foundational)**:
```
T006 (NotificationItem) ∥ T007 (NotificationList)
After T006+T007: T008 (NotificationBell)
```

**Phase 7 (Email)**:
```
T030 (Edge Function) ∥ T031 (Email templates)
```

**Phase 8 (Polish)**:
```
T034 ∥ T035 ∥ T036
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T010)
3. Complete Phase 3: User Story 1 (T011-T015)
4. **STOP and VALIDATE**: Test reminder notifications independently
5. Deploy/demo if ready - users get core value immediately

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Reminders) → Test → Deploy (MVP!)
3. Add US2 (Confirmations) → Test → Deploy
4. Add US3 (Updates) → Test → Deploy
5. Add US4 (Preferences) → Test → Deploy
6. Add Email → Test → Deploy
7. Polish → Final release

### Suggested Commit Points

- After T004: "feat(db): add notifications schema and types"
- After T010: "feat(ui): add notification bell and list components"
- After T015: "feat(notifications): implement event reminders (US1)"
- After T019: "feat(notifications): add RSVP confirmations (US2)"
- After T024: "feat(notifications): add event update alerts (US3)"
- After T029: "feat(notifications): add user preferences (US4)"
- After T033: "feat(notifications): add email delivery"
- After T040: "feat(notifications): polish and documentation"

---

## Task Summary

| Phase | Tasks | Parallel |
|-------|-------|----------|
| Phase 1: Setup | 4 | 2 |
| Phase 2: Foundational | 6 | 2 |
| Phase 3: US1 Reminders | 5 | 0 |
| Phase 4: US2 Confirmations | 4 | 0 |
| Phase 5: US3 Updates | 5 | 0 |
| Phase 6: US4 Preferences | 5 | 0 |
| Phase 7: Email | 4 | 2 |
| Phase 8: Polish | 7 | 4 |
| **Total** | **40** | **10** |

---

## Notes

- [P] tasks = different files, no dependencies
- [USn] label maps task to specific user story
- Each user story is independently testable
- Commit after each task or logical group
- Stop at any checkpoint to validate
- MVP = Phase 1 + Phase 2 + Phase 3 (US1 only)
