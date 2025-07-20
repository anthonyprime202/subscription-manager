<script lang="ts" module>
	import type { WithElementRef } from "bits-ui";
	import type { HTMLAttributes } from "svelte/elements";
	import type { VariantProps } from "tailwind-variants";
	import { tv } from "tailwind-variants";
	import { cn } from "$lib/utils/cn";

	const pillVariants = tv({
		variants: {
			variant: {
				primary: "bg-primary/10 text-primary border-primary",
				success: "bg-success/10 text-success border-success",
				destructive: "bg-destructrive/10 text-destructive border-destructive",
				default: "bg-foreground/10 text-foreground border-foreground",
			},
		},
		defaultVariants: {
			variant: "default",
		},
	});

	export type PillVariant = VariantProps<typeof pillVariants>["variant"];

	export type PillProps = WithElementRef<HTMLAttributes<HTMLDivElement>> & {
		variant?: PillVariant;
	};
</script>

<script lang="ts">
	let {
		class: className,
		variant = "default",
		ref = $bindable(null),
		children,
		...restProps
	}: PillProps = $props();
</script>

<div
	bind:this={ref}
	class={cn(
		"text-xs rounded-full px-2 py-1 border text-center",
		pillVariants({ variant }),
		className,
	)}
>
	{@render children?.()}
</div>
