# Admin Dashboard Plan

## What we're building
A seller-facing admin dashboard added to the Renewals Hub demo. A toggle in the Shell header switches between Buyer View (existing) and Seller View (new). The admin view shows a pipeline list of active deals on the left and a deal detail panel on the right.

## Navigation wiring
`App.jsx` gains a `mode` state (`'buyer'` | `'admin'`). When `'admin'`, renders `<AdminDashboard>` instead of `<Shell>`. Pass `onModeChange` as a prop to both shells.

## New files

### `src/data/adminData.js`
Array of 6–8 fake pipeline deals. One entry matches the existing Urbanbase/LeanData deal from `renewalData.js`. Each deal has:
- `id`, `buyerCompany`, `vendor`, `buyerContact`, `sellerContact`
- `annualValue`, `renewalDate`, `daysToRenewal`
- `stage` (Qualification / Outreach / Proposal / Buyer Evaluation / Closed)
- `engagementScore` (0–100), `portalViews`, `chatMessages`, `lastActive`
- `risk` (`'low'` | `'medium'` | `'high'`)
- `progress` (array of 5 step objects matching shape of `renewalProgress` in `renewalData.js`)

### `src/components/Admin/AdminDashboard.jsx`
Top-level admin layout:
- Admin header: "Account Manager Dashboard" title + "Buyer View →" toggle button
- Two-column body: `w-[380px]` pipeline list (left) + `flex-1` deal detail (right)
- Holds `selectedDealId` state (defaults to Urbanbase deal)

### `src/components/Admin/PipelineList.jsx`
Scrollable list of deal rows. Each row shows:
- Buyer company (serif bold) + vendor (mono muted)
- Days to renewal (green >90d, amber 30–90d, red <30d)
- Engagement score pill + risk badge
- Selected state: clay-100 background + clay-500 left border

### `src/components/Admin/DealDetail.jsx`
Right panel for selected deal. Sections:
1. Header — buyer company, vendor, contract value, renewal date, risk badge
2. Progress tracker — same 5-dot pattern as Shell's ProgressBar (copy render logic)
3. Engagement metrics — Portal Views, Chatbot Messages, Engagement Score, Last Active tiles
4. Contacts — buyer + seller contact cards

## Modified files

### `src/App.jsx`
Add `mode` state, conditionally render AdminDashboard vs Shell, pass `onModeChange`.

### `src/components/Shell.jsx`
Add "Seller View" outline button (right of Quick Renew), accept `onModeChange` prop.

## Design rules
- CSS custom properties for all colors — no Tailwind color classes
- Hover states via onMouseEnter/onMouseLeave
- Fonts: serif for headings, mono for numbers/labels, sans for body
