<script lang="ts">
	import ArrowUpDownIcon from "@lucide/svelte/icons/arrow-up-down";
	import { Button } from "$lib/components/ui/button/index.js";
	import { cn } from "$lib/utils/cn";

	let {
		onclick,
		header,
    justify = "start",
	}: {
		onclick?: (event: unknown) => void;
		header: string;
		justify?: "end" | "start" | "center";
	} = $props();
</script>

<div class={cn("flex", `justify-${justify}`,)}>

<Button variant="ghost" class="has-[>svg]:px-0 hover:bg-transparent" {onclick}>
	{header}
	<ArrowUpDownIcon class="ml-1" />
</Button>
</div>
