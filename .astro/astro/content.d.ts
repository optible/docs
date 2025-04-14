declare module 'astro:content' {
	interface Render {
		'.mdx': Promise<{
			Content: import('astro').MarkdownInstance<{}>['Content'];
			headings: import('astro').MarkdownHeading[];
			remarkPluginFrontmatter: Record<string, any>;
			components: import('astro').MDXInstance<{}>['components'];
		}>;
	}
}

declare module 'astro:content' {
	interface RenderResult {
		Content: import('astro/runtime/server/index.js').AstroComponentFactory;
		headings: import('astro').MarkdownHeading[];
		remarkPluginFrontmatter: Record<string, any>;
	}
	interface Render {
		'.md': Promise<RenderResult>;
	}

	export interface RenderedContent {
		html: string;
		metadata?: {
			imagePaths: Array<string>;
			[key: string]: unknown;
		};
	}
}

declare module 'astro:content' {
	type Flatten<T> = T extends { [K: string]: infer U } ? U : never;

	export type CollectionKey = keyof AnyEntryMap;
	export type CollectionEntry<C extends CollectionKey> = Flatten<AnyEntryMap[C]>;

	export type ContentCollectionKey = keyof ContentEntryMap;
	export type DataCollectionKey = keyof DataEntryMap;

	type AllValuesOf<T> = T extends any ? T[keyof T] : never;
	type ValidContentEntrySlug<C extends keyof ContentEntryMap> = AllValuesOf<
		ContentEntryMap[C]
	>['slug'];

	/** @deprecated Use `getEntry` instead. */
	export function getEntryBySlug<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		// Note that this has to accept a regular string too, for SSR
		entrySlug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;

	/** @deprecated Use `getEntry` instead. */
	export function getDataEntryById<C extends keyof DataEntryMap, E extends keyof DataEntryMap[C]>(
		collection: C,
		entryId: E,
	): Promise<CollectionEntry<C>>;

	export function getCollection<C extends keyof AnyEntryMap, E extends CollectionEntry<C>>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => entry is E,
	): Promise<E[]>;
	export function getCollection<C extends keyof AnyEntryMap>(
		collection: C,
		filter?: (entry: CollectionEntry<C>) => unknown,
	): Promise<CollectionEntry<C>[]>;

	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(entry: {
		collection: C;
		slug: E;
	}): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(entry: {
		collection: C;
		id: E;
	}): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof ContentEntryMap,
		E extends ValidContentEntrySlug<C> | (string & {}),
	>(
		collection: C,
		slug: E,
	): E extends ValidContentEntrySlug<C>
		? Promise<CollectionEntry<C>>
		: Promise<CollectionEntry<C> | undefined>;
	export function getEntry<
		C extends keyof DataEntryMap,
		E extends keyof DataEntryMap[C] | (string & {}),
	>(
		collection: C,
		id: E,
	): E extends keyof DataEntryMap[C]
		? Promise<DataEntryMap[C][E]>
		: Promise<CollectionEntry<C> | undefined>;

	/** Resolve an array of entry references from the same collection */
	export function getEntries<C extends keyof ContentEntryMap>(
		entries: {
			collection: C;
			slug: ValidContentEntrySlug<C>;
		}[],
	): Promise<CollectionEntry<C>[]>;
	export function getEntries<C extends keyof DataEntryMap>(
		entries: {
			collection: C;
			id: keyof DataEntryMap[C];
		}[],
	): Promise<CollectionEntry<C>[]>;

	export function render<C extends keyof AnyEntryMap>(
		entry: AnyEntryMap[C][string],
	): Promise<RenderResult>;

	export function reference<C extends keyof AnyEntryMap>(
		collection: C,
	): import('astro/zod').ZodEffects<
		import('astro/zod').ZodString,
		C extends keyof ContentEntryMap
			? {
					collection: C;
					slug: ValidContentEntrySlug<C>;
				}
			: {
					collection: C;
					id: keyof DataEntryMap[C];
				}
	>;
	// Allow generic `string` to avoid excessive type errors in the config
	// if `dev` is not running to update as you edit.
	// Invalid collection names will be caught at build time.
	export function reference<C extends string>(
		collection: C,
	): import('astro/zod').ZodEffects<import('astro/zod').ZodString, never>;

	type ReturnTypeOrOriginal<T> = T extends (...args: any[]) => infer R ? R : T;
	type InferEntrySchema<C extends keyof AnyEntryMap> = import('astro/zod').infer<
		ReturnTypeOrOriginal<Required<ContentConfig['collections'][C]>['schema']>
	>;

	type ContentEntryMap = {
		"docs": {
"assessors/add-criteria.mdx": {
	id: "assessors/add-criteria.mdx";
  slug: "assessors/add-criteria";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/create-a-grant-program.mdx": {
	id: "assessors/create-a-grant-program.mdx";
  slug: "assessors/create-a-grant-program";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/dashboard/forms.mdx": {
	id: "assessors/dashboard/forms.mdx";
  slug: "assessors/dashboard/forms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/dashboard/grants-list.mdx": {
	id: "assessors/dashboard/grants-list.mdx";
  slug: "assessors/dashboard/grants-list";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/dashboard/reports.mdx": {
	id: "assessors/dashboard/reports.mdx";
  slug: "assessors/dashboard/reports";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/dashboard/settings.mdx": {
	id: "assessors/dashboard/settings.mdx";
  slug: "assessors/dashboard/settings";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/design-and-customise-forms.mdx": {
	id: "assessors/design-and-customise-forms.mdx";
  slug: "assessors/design-and-customise-forms";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/forms/fields.mdx": {
	id: "assessors/forms/fields.mdx";
  slug: "assessors/forms/fields";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/attachments.mdx": {
	id: "assessors/grant/application/attachments.mdx";
  slug: "assessors/grant/application/attachments";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/criteria-ranking.mdx": {
	id: "assessors/grant/application/criteria-ranking.mdx";
  slug: "assessors/grant/application/criteria-ranking";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/expenditures.mdx": {
	id: "assessors/grant/application/expenditures.mdx";
  slug: "assessors/grant/application/expenditures";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/header.mdx": {
	id: "assessors/grant/application/header.mdx";
  slug: "assessors/grant/application/header";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/history-and-comments.mdx": {
	id: "assessors/grant/application/history-and-comments.mdx";
  slug: "assessors/grant/application/history-and-comments";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/index.mdx": {
	id: "assessors/grant/application/index.mdx";
  slug: "assessors/grant/application";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/payments.mdx": {
	id: "assessors/grant/application/payments.mdx";
  slug: "assessors/grant/application/payments";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/post-success-report.mdx": {
	id: "assessors/grant/application/post-success-report.mdx";
  slug: "assessors/grant/application/post-success-report";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/application/smart-insights.mdx": {
	id: "assessors/grant/application/smart-insights.mdx";
  slug: "assessors/grant/application/smart-insights";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-dashboard/advanced-filtering.mdx": {
	id: "assessors/grant/grant-dashboard/advanced-filtering.mdx";
  slug: "assessors/grant/grant-dashboard/advanced-filtering";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-dashboard/dashboard.mdx": {
	id: "assessors/grant/grant-dashboard/dashboard.mdx";
  slug: "assessors/grant/grant-dashboard/dashboard";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-settings/application-report-export.mdx": {
	id: "assessors/grant/grant-settings/application-report-export.mdx";
  slug: "assessors/grant/grant-settings/application-report-export";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-settings/application-stages.mdx": {
	id: "assessors/grant/grant-settings/application-stages.mdx";
  slug: "assessors/grant/grant-settings/application-stages";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-settings/assessors.mdx": {
	id: "assessors/grant/grant-settings/assessors.mdx";
  slug: "assessors/grant/grant-settings/assessors";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-settings/contracts-and-letters.mdx": {
	id: "assessors/grant/grant-settings/contracts-and-letters.mdx";
  slug: "assessors/grant/grant-settings/contracts-and-letters";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-settings/email-templates.mdx": {
	id: "assessors/grant/grant-settings/email-templates.mdx";
  slug: "assessors/grant/grant-settings/email-templates";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-settings/form-templates.mdx": {
	id: "assessors/grant/grant-settings/form-templates.mdx";
  slug: "assessors/grant/grant-settings/form-templates";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"assessors/grant/grant-settings/grant-management.mdx": {
	id: "assessors/grant/grant-settings/grant-management.mdx";
  slug: "assessors/grant/grant-settings/grant-management";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"changelog/index.mdx": {
	id: "changelog/index.mdx";
  slug: "changelog";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"index.mdx": {
	id: "index.mdx";
  slug: "index";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"knowledge-base/clear-cache.mdx": {
	id: "knowledge-base/clear-cache.mdx";
  slug: "knowledge-base/clear-cache";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
"trust-center/compliance.mdx": {
	id: "trust-center/compliance.mdx";
  slug: "trust-center/compliance";
  body: string;
  collection: "docs";
  data: InferEntrySchema<"docs">
} & { render(): Render[".mdx"] };
};

	};

	type DataEntryMap = {
		
	};

	type AnyEntryMap = ContentEntryMap & DataEntryMap;

	export type ContentConfig = typeof import("../../src/content/config.js");
}
