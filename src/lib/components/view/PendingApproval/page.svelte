<script lang="ts">
	import { type PendingApprovalData, pendingApprovalColumns } from "./columns";
	import DataTable from "$lib/components/element/DataTable.svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { Root as DialogRoot } from '$lib/components/ui/dialog';
	import { setContext } from "svelte";
	import ReviewForm from "./review-form.svelte";

	const sheetState = useSheets();
	let open = $state(false);
	let selectedRow = $state<PendingApprovalData>();

	setContext(Symbol.for("dialog-state"), {
		get open() { return open },
		set open(value) { open = value },
		get selectedRow() { return selectedRow },
		set selectedRow(value) { selectedRow = value }
	});

	let data = $derived(
		sheetState.subscriptionSheet.filter(s => s.actual2 === "" && s.planned2 !== "").map((sheet) => ({
			subscriptionNo: sheet.subscriptionNo,
			companyName: sheet.companyName,
			subscriberName: sheet.subscriberName,
			subscriptionName: sheet.subscriptionName,
			price: sheet.price,
			frequence: sheet.frequency,
			requestedOn: new Date(sheet.timestamp),
			purpose: sheet.purpose,
		})) satisfies PendingApprovalData[],
	);
</script>

<DialogRoot bind:open>
<div class="bg-background p-5 m-5 rounded-md shadow-md">
	<DataTable {data} columns={pendingApprovalColumns} loading={sheetState.subscriptionLoading}/>
</div>
<ReviewForm />
</DialogRoot>
