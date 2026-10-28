/**
 * One setup file for the whole suite. Replaces the previous stack of
 * jest-environment-jsdom + FixJSDOMEnvironment + jest-fetch-mock + babel transforms.
 */
import "fake-indexeddb/auto"; // IndexedDB in jsdom, no environment subclass needed
import "@testing-library/jest-dom/vitest";
