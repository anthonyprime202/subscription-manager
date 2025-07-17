<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
	import { getContext } from "svelte";
	import type { PendingApprovalData } from "./columns";

	let { currentRow }: { currentRow: PendingApprovalData } = $props();
	const dialogState: any = getContext(Symbol.for("dialog-state"));
</script>

<div class="flex justify-center">
<Button
	onclick={() => {
		dialogState.open = true;
		dialogState.selectedRow = currentRow;
	}}>Review</Button
>

</div>
