import { LoadingOverlay as MantineLoadingOverlay, Box } from '@mantine/core';

export function LoadingOverlay({ visible }) {
  return (
    <Box pos="relative" style={{ minHeight: 100 }}>
      <MantineLoadingOverlay visible={visible} zIndex={10} overlayProps={{ blur: 2 }} />
    </Box>
  );
}
