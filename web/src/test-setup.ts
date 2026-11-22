// Test setup (vite.config.ts "test.setupFiles"): DOM matchers like toBeInTheDocument()
import "@testing-library/jest-dom/vitest";

// jsdom has no layout engine - the zoomed page scrolls to the clicked point
Element.prototype.scrollTo = () => {};
