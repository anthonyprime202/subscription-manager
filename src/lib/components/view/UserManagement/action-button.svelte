<script lang="ts">
	import * as Dropdown from "$lib/components/ui/dropdown-menu";
	import { getContext } from "svelte";
	import type { UserData } from "./columns";
	import { Ellipsis, Pencil, Trash } from "@lucide/svelte";

	let { currentRow }: { currentRow: UserData } = $props();
	const dialogState: any = getContext(Symbol.for("dialog-state"));
</script>

<div class="flex justify-center">
	<Dropdown.Root>
		<Dropdown.Trigger><Ellipsis size={18} /></Dropdown.Trigger>
		<Dropdown.Content>
			<Dropdown.Item
				class="flex gap-2"
				onclick={() => {
					dialogState.selectedRow = currentRow;
					dialogState.open = true;
					dialogState.typeForm = "Edit";
				}}><Pencil size={15} color="var(--foreground)" />Edit</Dropdown.Item
			>
			<Dropdown.Item class="flex gap-2 text-destructive" onclick={() => {}}
				><Trash size={15} color="var(--destructive)" />Delete</Dropdown.Item
			>
		</Dropdown.Content>
	</Dropdown.Root>
</div>
