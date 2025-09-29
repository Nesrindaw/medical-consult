// src/theme.js
import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
  fonts: {
    heading: "Cairo, sans-serif",
    body: "Cairo, sans-serif",
  },
  colors: {
    brand: {
      50: "#E6FFFA",   // أفتح درجة
      100: "#B2F5EA",
      200: "#81E6D9",
      300: "#4FD1C5",
      400: "#38B2AC",
      500: "#319795",  // ✅ اللون الأساسي (teal فاتح)
      600: "#2C7A7B",
      700: "#285E61",
      800: "#234E52",
      900: "#1D4044",
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: "brand", // ✅ كل الأزرار تستعمل teal الفاتح
      },
    },
  },
});

export default theme;
