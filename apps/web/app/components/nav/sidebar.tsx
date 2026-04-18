"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  AppBar,
  Box,
  Chip,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import {
  LayoutDashboard,
  Newspaper,
  Target,
  Search,
  Globe,
  BookOpen,
  Settings,
  TrendingUp,
  List as ListIcon,
  FlaskConical,
  Eye,
  Calculator,
  Link2,
} from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const NAV_SECTIONS: Array<{ label: string; items: NavItem[] }> = [
  {
    label: "Core",
    items: [
      { href: "/", label: "Dashboard", icon: LayoutDashboard },
      { href: "/digest", label: "Digest Archive", icon: Newspaper },
    ],
  },
  {
    label: "Strategies",
    items: [
      { href: "/strategies", label: "All Strategies", icon: Target },
      { href: "/screener-lab", label: "Screener Lab", icon: Search },
      { href: "/market-context/global-cues", label: "Market Context", icon: Globe },
      { href: "/references", label: "References", icon: Link2 },
    ],
  },
  {
    label: "Research",
    items: [
      { href: "/stocks", label: "Stocks", icon: TrendingUp },
      { href: "/watchlists", label: "Watchlists", icon: ListIcon },
      { href: "/backtest", label: "Backtester", icon: FlaskConical },
    ],
  },
  {
    label: "Learn",
    items: [
      { href: "/learning/sessions", label: "Sessions", icon: BookOpen },
      { href: "/learning/concepts", label: "Concepts", icon: BookOpen },
      { href: "/learning/ambiguities", label: "Ambiguities", icon: Eye },
    ],
  },
  {
    label: "Tools",
    items: [
      { href: "/tools/position-size", label: "Risk Calculator", icon: Calculator },
      { href: "/admin/strategies", label: "Admin", icon: Settings },
      { href: "/admin/cms", label: "Admin CMS", icon: Settings },
      { href: "/admin/observability", label: "Observability", icon: Eye },
      { href: "/admin/references", label: "Admin References", icon: Link2 },
    ],
  },
];

const MOBILE_QUICK_LINKS = [
  { href: "/", label: "Dashboard" },
  { href: "/digest", label: "Digests" },
  { href: "/strategies", label: "Strategies" },
  { href: "/screener-lab", label: "Screeners" },
  { href: "/tools/position-size", label: "Risk" },
  { href: "/admin/strategies", label: "Admin" },
];

const SIDEBAR_WIDTH = 292;

function isActive(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/" && pathname.startsWith(href));
}

export function Sidebar() {
  const pathname = usePathname();

  return (
    <>
      <AppBar
        position="fixed"
        color="inherit"
        elevation={0}
        sx={{
          display: { xs: "block", lg: "none" },
          borderBottom: "1px solid",
          borderColor: "divider",
          backgroundColor: "rgba(255,255,255,0.92)",
          backdropFilter: "blur(8px)",
          zIndex: 1201,
        }}
      >
        <Toolbar sx={{ minHeight: "56px !important", px: 2 }}>
          <Stack direction="row" spacing={2} sx={{ width: "100%", alignItems: "center", justifyContent: "space-between" }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Investment Bible OS
            </Typography>
            <Chip label="Educational use" size="small" />
          </Stack>
        </Toolbar>
        <Box sx={{ px: 1.5, pb: 1.25, display: "flex", gap: 1, overflowX: "auto" }}>
          {MOBILE_QUICK_LINKS.map((item) => (
            <Chip
              key={item.href}
              component={Link}
              href={item.href}
              clickable
              label={item.label}
              color={isActive(pathname, item.href) ? "primary" : "default"}
              variant={isActive(pathname, item.href) ? "filled" : "outlined"}
              sx={{
                height: 40,
                borderRadius: 1.5,
                "& .MuiChip-label": { px: 1.5, fontWeight: 600 },
              }}
            />
          ))}
        </Box>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", lg: "block" },
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: SIDEBAR_WIDTH,
            boxSizing: "border-box",
            borderRight: "1px solid #dbe3ee",
            background: "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
          },
        }}
      >
        <Toolbar
          sx={{
            minHeight: "68px !important",
            borderBottom: "1px solid #e2e8f0",
            px: 2.5,
          }}
        >
          <Stack>
            <Typography variant="h6" sx={{ fontWeight: 800, lineHeight: 1 }}>
              IBO
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Investment Bible OS
            </Typography>
          </Stack>
        </Toolbar>
        <Box sx={{ px: 1.25, py: 1.5, overflowY: "auto" }}>
          {NAV_SECTIONS.map((section, index) => (
            <Box key={section.label} sx={{ mb: 2.5 }}>
              {index > 0 ? <Divider sx={{ mb: 1.25 }} /> : null}
              <Typography
                variant="caption"
                sx={{ px: 1.25, color: "text.secondary", fontWeight: 700, letterSpacing: "0.08em" }}
              >
                {section.label.toUpperCase()}
              </Typography>
              <List dense disablePadding sx={{ mt: 0.5 }}>
                {section.items.map((item) => {
                  const active = isActive(pathname, item.href);
                  const Icon = item.icon;
                  return (
                    <ListItem key={item.href} disablePadding sx={{ mb: 0.25 }}>
                      <ListItemButton
                        component={Link}
                        href={item.href}
                        selected={active}
                        sx={{
                          borderRadius: 2,
                          border: active ? "1px solid #bfdbfe" : "1px solid transparent",
                          backgroundColor: active ? "rgba(13,110,253,0.09)" : "transparent",
                          "&.Mui-selected": {
                            backgroundColor: "rgba(13,110,253,0.09)",
                          },
                          "&:hover": {
                            backgroundColor: active ? "rgba(13,110,253,0.13)" : "rgba(15,23,42,0.04)",
                          },
                        }}
                      >
                        <Box sx={{ width: 22, display: "inline-flex", alignItems: "center" }}>
                          <Icon className="h-4 w-4" />
                        </Box>
                        <ListItemText
                          primary={
                            <Typography sx={{ fontSize: 14, fontWeight: active ? 700 : 500 }}>
                              {item.label}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>
            </Box>
          ))}
        </Box>
      </Drawer>

      <Box sx={{ display: { xs: "block", lg: "none" }, height: 98 }} />
    </>
  );
}
