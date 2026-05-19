import "./styles/index.css";
import { lazy } from "react";
import type { ThemeComponents } from "@/features/theme/contract/components";
import { Toaster } from "./components/toaster";
import { config } from "./config";
import { AuthLayout } from "./layouts/auth-layout";
import { PublicLayout } from "./layouts/public-layout";
import { UserLayout } from "./layouts/user-layout";
import { FriendLinksPageSkeleton } from "./pages/friend-links/skeleton";
import { HomePageSkeleton } from "./pages/home/skeleton";
import { PostPageSkeleton } from "./pages/post/skeleton";
import { PostsPageSkeleton } from "./pages/posts/skeleton";
import { getFuwariThemeStyle } from "./theme-style";

const HomePage = lazy(() =>
  import("./pages/home/page").then((module) => ({ default: module.HomePage })),
);
const PostsPage = lazy(() =>
  import("./pages/posts/page").then((module) => ({
    default: module.PostsPage,
  })),
);
const PostPage = lazy(() =>
  import("./pages/post/page").then((module) => ({ default: module.PostPage })),
);
const FriendLinksPage = lazy(() =>
  import("./pages/friend-links/page").then((module) => ({
    default: module.FriendLinksPage,
  })),
);
const AboutPage = lazy(() =>
  import("./pages/about").then((module) => ({ default: module.AboutPage })),
);
const SearchPage = lazy(() =>
  import("./pages/search").then((module) => ({ default: module.SearchPage })),
);
const SubmitFriendLinkPage = lazy(() =>
  import("./pages/submit-friend-link").then((module) => ({
    default: module.SubmitFriendLinkPage,
  })),
);
const LoginPage = lazy(() =>
  import("./pages/auth/login").then((module) => ({
    default: module.LoginPage,
  })),
);
const RegisterPage = lazy(() =>
  import("./pages/auth/register").then((module) => ({
    default: module.RegisterPage,
  })),
);
const ForgotPasswordPage = lazy(() =>
  import("./pages/auth/forgot-password").then((module) => ({
    default: module.ForgotPasswordPage,
  })),
);
const ResetPasswordPage = lazy(() =>
  import("./pages/auth/reset-password").then((module) => ({
    default: module.ResetPasswordPage,
  })),
);
const VerifyEmailPage = lazy(() =>
  import("./pages/auth/verify-email").then((module) => ({
    default: module.VerifyEmailPage,
  })),
);
const TechStackPage = lazy(() =>
  import("./pages/tech-stack").then((module) => ({
    default: module.TechStackPage,
  })),
);
const ProfilePage = lazy(() =>
  import("./pages/user/profile").then((module) => ({
    default: module.ProfilePage,
  })),
);

/**
 * Theme: fuwari — implements the full ThemeComponents contract.
 * TypeScript will error at compile time if any required component is missing.
 */
export default {
  config,
  getDocumentStyle: getFuwariThemeStyle,
  HomePage,
  HomePageSkeleton,
  PostsPage,
  PostsPageSkeleton,
  PostPage,
  PostPageSkeleton,
  PublicLayout,
  AuthLayout,
  UserLayout,
  FriendLinksPage,
  FriendLinksPageSkeleton,
  AboutPage,
  TechStackPage,
  SearchPage,
  SubmitFriendLinkPage,
  LoginPage,
  RegisterPage,
  ForgotPasswordPage,
  ResetPasswordPage,
  VerifyEmailPage,
  ProfilePage,
  Toaster,
} satisfies ThemeComponents;
