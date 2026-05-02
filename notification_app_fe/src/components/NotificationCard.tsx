import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Tooltip,
  Avatar,
} from "@mui/material";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import { Notification } from "../types/notification";
import { Log } from "../utils/logger";

interface NotificationCardProps {
  notification: Notification;
  isViewed: boolean;
  onView: () => void;
  rank?: number;
  showScore?: boolean;
}

const TYPE_CONFIG = {
  Placement: {
    color: "success" as const,
    icon: <WorkIcon fontSize="small" />,
    bg: "#e8f5e9",
    border: "#4caf50",
  },
  Result: {
    color: "primary" as const,
    icon: <SchoolIcon fontSize="small" />,
    bg: "#e3f2fd",
    border: "#2196f3",
  },
  Event: {
    color: "warning" as const,
    icon: <EventIcon fontSize="small" />,
    bg: "#fff8e1",
    border: "#ff9800",
  },
};

export function NotificationCard({
  notification,
  isViewed,
  onView,
  rank,
  showScore,
}: NotificationCardProps) {
  const config = TYPE_CONFIG[notification.Type] || TYPE_CONFIG.Event;
  const timestamp = new Date(notification.Timestamp);
  const timeAgo = formatTimeAgo(timestamp);

  const handleMark = () => {
    void Log("frontend", "debug", "component", `Marking notification as viewed: ${notification.ID}`);
    onView();
  };

  return (
    <Card
      elevation={isViewed ? 0 : 2}
      sx={{
        mb: 2,
        border: `1.5px solid ${isViewed ? "#e0e0e0" : config.border}`,
        bgcolor: isViewed ? "#fafafa" : config.bg,
        opacity: isViewed ? 0.75 : 1,
        transition: "all 0.2s ease",
        "&:hover": { elevation: 4, transform: "translateY(-1px)" },
      }}
    >
      <CardContent sx={{ pb: "12px !important" }}>
        <Box display="flex" alignItems="flex-start" gap={2}>
          {/* Rank badge */}
          {rank !== undefined && (
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: "secondary.main",
                fontSize: 13,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {rank}
            </Avatar>
          )}

          {/* Icon */}
          <Avatar sx={{ bgcolor: config.border, width: 36, height: 36, flexShrink: 0 }}>
            {config.icon}
          </Avatar>

          {/* Content */}
          <Box flexGrow={1} minWidth={0}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
              <Chip
                label={notification.Type}
                color={config.color}
                size="small"
                variant="filled"
              />
              {!isViewed && (
                <Chip
                  label="NEW"
                  color="error"
                  size="small"
                  icon={<FiberNewIcon />}
                  variant="outlined"
                />
              )}
              {showScore && notification.priorityScore !== undefined && (
                <Chip
                  label={`Score: ${notification.priorityScore.toExponential(3)}`}
                  size="small"
                  variant="outlined"
                  color="secondary"
                />
              )}
              <Typography variant="caption" color="text.secondary" sx={{ ml: "auto" }}>
                {timeAgo}
              </Typography>
            </Box>

            <Typography
              variant="body1"
              fontWeight={isViewed ? 400 : 600}
              sx={{ wordBreak: "break-word" }}
            >
              {notification.Message}
            </Typography>

            <Typography variant="caption" color="text.disabled" mt={0.5} display="block">
              ID: {notification.ID}
            </Typography>
          </Box>

          {/* Mark as read */}
          {!isViewed && (
            <Tooltip title="Mark as read">
              <IconButton size="small" onClick={handleMark} color="primary">
                <CheckCircleIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}
