# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Everyday actions

## Development Record

### January 27, 2026
- **Invoice System**:
  - Enhanced `AuthContext` to capture full user profile (name, email) on login for accurate invoice generation.
  - Implemented `Invoice` component data population logic.
- **Cart & Checkout UX**:
  - **Stock Error Handling**: Implemented advanced error parsing to handle aggregated backend stock checks.
  - **Stacked Toasts**: Created a custom DOM-based toast notification system in `Cart.jsx` to display individual alerts for multiple out-of-stock items simultaneously.
- **Barber Dashboard Features**:
  - **Service Management Module**:
    - Developed `ServiceManager` component for creating and viewing services.
    - Implemented mandatory image upload validation for services.
    - Integrated "Services" view into Barber Dashboard and Sidebar navigation.

### January 25, 2026
- **Clothing Shop Enhancements**:
  - Implemented dynamic product image switching based on color selection in `ProductDetail.jsx`.
  - Added support for backend image-color relationships and legacy description parsing.
- **Vendor Dashboard & Routing**:
  - Enabled specific dashboard routing for Clothing Shop vendors (`/vendor/clothesshop`).
  - Fixed login redirects for various clothing-related vendor types.
  - Resolved "No matched routes" warnings for vendor dashboards.
- **Infrastructure**:
  - Updated `react-router-dom` to v6.30.3.
  - Enabled React Router v7 future flags (`v7_startTransition`, `v7_relativeSplatPath`) to resolve deprecation warnings.
- **Real-Time Messaging System**:
  - Implementation of WebSocket-based `Chat` component for live bidirectional communication.
  - Integration of **"Chat with Vendor"** feature in Customer Dashboard (Order History).
  - Deployment of **Message Manager** across all Vendor Dashboards (Barber, Tailor, Bottle, Massage, etc.).
  - UI Styling: Distinct message bubbles (Sender: Pink/Right, Receiver: Black/Left).
  - **Multimedia Attachments & Voice Messaging**:
    - **Voice Notes**: Implemented recording functionality using MediaRecorder API. Added format detection to prefer `audio/mp4` (AAC) for macOS/iOS compatibility, falling back to `audio/webm`.
    - **File Sharing**: Added support for uploading images and document attachments in chat.
    - **Rich Media Rendering**: Chat bubbles now render inline images, HTML5 audio players for voice notes, and download links for generic files.
    - **Previews**: Implemented UI for previewing images and files before sending.
  - **Message Replies**:
    - Implemented "Reply to Message" workflow.
    - Added contextual reply bubbles showing the referenced message content.
    - Visual indicators (Reply Arrow button on hover).
- **Mobile Responsiveness**:
  - Standardized responsive layouts for all Vendor Dashboards (Drink Shop, Clothing Shop, Massage, Tech, etc.).
  - Implemented collapsible Sidebar Navigation with mobile overlay support.
  - Integrated TopBar hamburger menu triggers for seamless mobile UX.

### January 26, 2026
- **Admin Dashboard Overhaul**:
  - **Complete Redesign**: Transitioned to a "Shadcn-style" monochrome aesthetic (Black/White/Gray).
  - **Analytics**: Integrated `recharts` to display Line Charts for "Orders Overview" and "Vendor Growth".
  - **Interactive Reports**: Added Daily, Weekly, and Monthly toggles for analytics graphs.
  - **Management Tabs**: Organized content into "Overview", "Applications" (Vendor Approval), and "Users" tabs.
  - **Security**: Added default `PENDING` status for new vendors requiring admin approval.
  - **User Management**: Implemented "Approve/Reject" for vendors and a hard "Delete User" function.

- **Notification System & Deep Linking**:
  - Implemented **Global Notification System** for Vendor Dashboards.
  - Added real-time polling (30s interval) in `TopBar.jsx`.
  - **Deep Linking Navigation**:
    - Notifications now support specialized actions (e.g. "View Order", "View Message").
    - Clicking a notification dynamically routes to the correct dashboard tab (`?tab=orders`) and passes the resource ID (`&id=123`).
  - **Context-Aware Linking**:
    - **Order Manager**: Automatically filters/scrolls to and highlights the specific relevant order.
    - **Appointment Manager**: Highlights the specific appointment in the schedule.
    - **Message Manager**: Automatically opens the chat conversation with the relevant user.
- **Customer Dashboard Enhancements**:
  - Implemented **Notification Center** in Customer Dashboard (previously missing).
  - Added real-time polling and deep linking for customers:
    - **Messages**: Clicking a "New Message" notification now switches to the Messages tab and auto-selects the conversation with the sender.
    - **Orders/Appointments**: Navigates to respective tabs.
- **Enhanced Media Viewing**:
  - Added **Lightbox Modal** for full-screen image viewing in Chat.
  - Improved Voice Note compatibility (Smart MIME type detection for Safari/iOS support).
