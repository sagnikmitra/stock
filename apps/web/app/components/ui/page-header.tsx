"use client";

import { Box, Paper, Stack, Typography } from "@mui/material";

interface PageHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export function PageHeader({ title, description, children }: PageHeaderProps) {
  return (
    <Paper
      elevation={0}
      sx={{
        mb: 3,
        borderRadius: 1,
        p: { xs: 2, md: 2 },
        border: "1px solid",
        borderColor: "divider",
        backgroundColor: "#fff",
      }}
    >
      <Stack
        direction={{ xs: "column", md: "row" }}
        spacing={2}
        sx={{ alignItems: { md: "center" }, justifyContent: "space-between" }}
      >
        <Box>
          <Typography variant="overline" color="text.secondary" sx={{ fontWeight: 700, letterSpacing: "0.12em" }}>
            Workspace
          </Typography>
          <Typography variant="h4" component="h1" sx={{ mt: 0.25, fontWeight: 700, lineHeight: 1.12 }}>
            {title}
          </Typography>
          {description ? (
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              {description}
            </Typography>
          ) : null}
        </Box>
        {children ? (
          <Stack direction="row" spacing={1.25} sx={{ flexWrap: "wrap" }}>
            {children}
          </Stack>
        ) : null}
      </Stack>
    </Paper>
  );
}
