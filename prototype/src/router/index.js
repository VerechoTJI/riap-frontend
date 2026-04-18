import { createRouter, createWebHistory } from "vue-router";
import Listings from "../views/Listings.vue";
import ListingDetail from "../views/ListingDetail.vue";
import Login from "../views/Login.vue";
import Messages from "../views/Messages.vue";
import LandlordDashboard from "../views/LandlordDashboard.vue";
import AdminReview from "../views/AdminReview.vue";
import { readCurrentUser } from "../lib/ui";

const routes = [
  { path: "/", component: Listings },
  { path: "/login", component: Login },
  { path: "/listing/:id", component: ListingDetail },
  { path: "/messages", component: Messages, meta: { requiresAuth: true } },
  {
    path: "/landlord",
    component: LandlordDashboard,
    meta: { requiresRole: "landlord" },
  },
  { path: "/admin", component: AdminReview, meta: { requiresRole: "admin" } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to) => {
  const user = readCurrentUser();

  if (to.meta.requiresRole) {
    if (user?.role === to.meta.requiresRole) return true;
    return user
      ? { path: "/" }
      : { path: "/login", query: { redirect: to.fullPath } };
  }

  if (!to.meta.requiresAuth) return true;

  if (user) return true;

  return {
    path: "/login",
    query: { redirect: to.fullPath },
  };
});

export default router;
