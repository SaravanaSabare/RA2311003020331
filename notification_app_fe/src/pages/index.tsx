"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Chip,
  CircularProgress,
  Alert,
  Badge,
  AppBar,
  Toolbar,
  Button,
} from "@mui/material";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useNotifications } from "../hooks/useNotifications";
import { useViewedNotifications } from "../hooks/useViewedNotifications";
import { NotificationCard } from "../components/NotificationCard";
import { Log } from "../utils/logger";

const FILTER_TABS = ["All", "Placement", "Result", "Event"] as const;
type Filter = (typeof FILTER_TABS)[number];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState<Filter>("All");
  const notificationType = activeFilter === "All" ? undefined : activeFilter;

  const { notifications, loading, error, refetch } = useNotifications(notificationType);
  const { isViewed, markAsViewed } = useViewedNotifications();

  useEffect(() => {
    Log("frontend", "info", "page", `Home page loaded | filter=${activeFilter}`);
  }, [activeFilter]);

  const unreadCount = notifications.filter((n) => !isViewed(n.ID)).length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      {/* App Bar */}
      <AppBar position="sticky" elevation={2}>
        <Toolbar sx={{ gap: 2 }}>
          <Badge badgeContent={unreadCount} color="error" max={99}>
            <NotificationsIcon />
          </Badge>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Campus Notifications
          </Typography>
          <Button
            component={Link}
            href="/priority"
            variant="outlined"
            color="inherit"
            size="small"
          >
            Priority Inbox
          </Button>
          <Button variant="outlined" color="inherit" size="small" onClick={refetch}>
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          All Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          {unreadCount} unread · {notifications.length} total
        </Typography>

        {/* Filter Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 3 }}>
          <Tabs
            value={activeFilter}
            onChange={(_e, val) => {
              setActiveFilter(val as Filter);
              Log("frontend", "info", "component", `Filter changed to: ${val}`);
            }}
            aria-label="notification type filter"
          >
            {FILTER_TABS.map((f) => (
              <Tab key={f} label={f} value={f} />
            ))}
          </Tabs>
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info">No notifications found.</Alert>
        )}

        {!loading &&
          notifications.map((n) => (
            <NotificationCard
              key={n.ID}
              notification={n}
              isViewed={isViewed(n.ID)}
              onView={() => markAsViewed(n.ID)}
            />
          ))}
      </Container>
    </Box>
  );
}
