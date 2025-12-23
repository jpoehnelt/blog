// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
  namespace App {
    // interface Error {}
    // interface Locals {}
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

declare global {
	interface Document {
		startViewTransition(updateCallback: () => Promise<void> | void): ViewTransition;
	}
}

declare module "*&enhanced" {
  const value: import("@sveltejs/enhanced-img").Picture;
  export default value;
}

declare module "*?enhanced" {
  const value: import("@sveltejs/enhanced-img").Picture;
  export default value;
}

export {};
