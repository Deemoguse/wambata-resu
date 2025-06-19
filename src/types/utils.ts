export namespace Utils
{
	/**
	 * Utility to improve type display in IDE.
	 */
	export type Prettify <Source> = Source extends object | any[]
		? {} & { [K in keyof Source]: Source[K] }
		: Source

	/**
	 * `Truthy` types.
	 * @see https://developer.mozilla.org/en-US/docs/Glossary/Truthy
	 */
	export type Truthy = {} | null | ''
}