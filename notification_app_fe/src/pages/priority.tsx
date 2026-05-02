"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  AppBar,
  Toolbar,
  Button,
  TextField,
  InputAdornment,
  Chip,
} from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { usePriorityNotifications } from "../hooks/useNotifications";
import { useViewedNotifications } from "../hooks/useViewedNotifications";
import { NotificationCard } from "../components/NotificationCard";
import { Log } from "../utils/logger";

export default function PriorityPage() {
  const [n, setN] = useState(10);
  const [inputN, setInputN] = useState("10");

  const { notifications, loading, error, refetch } = usePriorityNotifications(n);
  const { isViewed, markAsViewed } = useViewedNotifications();

  useEffect(() => {
    Log("frontend", "info", "page", `Priority Inbox page loaded | top-N=${n}`);
  }, [n]);

  const handleApplyN = () => {
    const parsed = parseInt(inputN, 10);
    if (!isNaN(parsed) && parsed > 0) {
      setN(parsed);
      Log("frontend", "info", "component", `Priority N updated to ${parsed}`);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "background.default" }}>
      <AppBar position="sticky" elevation={2} sx={{ bgcolor: "secondary.main" }}>
        <Toolbar sx={{ gap: 2 }}>
          <StarIcon />
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 700 }}>
            Priority Inbox
          </Typography>
          <Button
            component={Link}
            href="/"
            variant="outlined"
            color="inherit"
            size="small"
            startIcon={<ArrowBackIcon />}
          >
            All Notifications
          </Button>
          <Button variant="outlined" color="inherit" size="small" onClick={refetch}>
            Refresh
          </Button>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography variant="h5" fontWeight={700} mb={1}>
          Top Priority Notifications
        </Typography>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Ranked by type weight (Placement &gt; Result &gt; Event) and recency
        </Typography>

        {/* N selector */}
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <TextField
            label="Show top N"
            size="small"
            value={inputN}
            onChange={(e) => setInputN(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleApplyN()}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <StarIcon fontSize="small" color="warning" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 140 }}
            type="number"
            inputProps={{ min: 1, max: 100 }}
          />
          <Button variant="contained" color="secondary" onClick={handleApplyN}>
            Apply
          </Button>
          <Chip label={`Showing top ${notifications.length}`} color="warning" size="small" />
        </Box>

        {loading && (
          <Box display="flex" justifyContent="center" py={6}>
            <CircularProgress color="warning" />
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && notifications.length === 0 && (
          <Alert severity="info">No priority notifications found.</Alert>
        )}

        {!loading &&
          notifications.map((notification, idx) => (
            <NotificationCard
              key={notification.ID}
              notification={notification}
              isViewed={isViewed(notification.ID)}
              onView={() => markAsViewed(notification.ID)}
              rank={idx + 1}
              showScore
            />
          ))}
      </Container>
    </Box>
  );
}
