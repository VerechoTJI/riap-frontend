import { createRouter, createWebHistory } from "vue-router";
import Listings from "../views/Listings.vue";
import ListingDetail from "../views/ListingDetail.vue";
import Login from "../views/Login.vue";
import Messages from "../views/Messages.vue";
import LandlordDashboard from "../views/LandlordDashboard.vue";
import AdminReview from "../views/AdminReview.vue";

const routes = [
  { path: "/", component: Listings },
  { path: "/login", component: Login },
  { path: "/listing/:id", component: ListingDetail },
  { path: "/messages", component: Messages },
  { path: "/landlord", component: LandlordDashboard },
  { path: "/admin", component: AdminReview },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
