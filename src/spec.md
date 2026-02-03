# Specification

## Summary
**Goal:** Build a mobile-first fast-food ordering app with Internet Identity authentication, customer ordering flow, and admin dashboards for managing orders and menu data.

**Planned changes:**
- Add Internet Identity sign-in/out and enforce role-based access (Customer vs Admin) across UI and backend.
- Assign the first authenticated principal as Admin and persist this role in canister state across upgrades.
- Implement backend-served menu data with initial categories (Fries, Bhajia, Meats & Mains, Drinks, Sides & Sauces) and all provided items using placeholder price/description/image fields.
- Create customer menu browsing with category navigation, item cards, item detail view, and add-to-cart actions.
- Implement cart features (add/remove/quantity changes) and an order summary with total cost.
- Add a non-payment checkout that creates an order in the backend, shows an order confirmation, and clears the cart.
- Build an admin orders dashboard to view orders, filter by status, and update status through `Pending → In Progress → Completed → Cancelled` with valid transitions enforced.
- Build an admin menu dashboard to create/edit/delete categories and items, set item fields (name/description/price/category), and toggle item availability (unavailable items not orderable).
- Apply a consistent warm, appetizing, mobile-first visual theme with clear CTAs and easy navigation across customer and admin areas.
- Add and use generated static assets (logo + generic food placeholder) from `frontend/public/assets/generated` for branding and missing item images.

**User-visible outcome:** Users can sign in with Internet Identity, browse the menu by category, view item details, add items to a cart, and place an order (no payments). Admins (first user automatically) can manage menu/categories and view/update order statuses from an admin dashboard.
