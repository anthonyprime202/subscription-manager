<script lang="ts">
	import { Root as DialogRoot } from "$lib/components/ui/dialog";
	import DataTable from "$lib/components/element/DataTable.svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { subscriptionColumns, type SubscriptionData } from "./columns";
	import type { SubscriptionRow } from "$lib/types/sheets";
	import { getStatus } from "$lib/utils/parsers";

	const sheetState = useSheets();

	let subscriptionData = $derived(
		sheetState.subscriptionSheet.map((s) => ({
			companyName: s.companyName,
			endDate: new Date(s.endDate),
			price: s.price,
			subscriberName: s.subscriberName,
			subscriptionName: s.subscriptionName,
			subscriptionNo: s.subscriptionNo,
			status: getStatus(s),
		})) satisfies SubscriptionData[],
	);
	$effect(() => {
		console.log(subscriptionData);
	});
</script>

<div class="md:p-5 md:pt-0">
	<div class="bg-background p-5 rounded-md shadow-md">
		<DataTable
			columns={subscriptionColumns}
			data={subscriptionData}
			loading={sheetState.subscriptionLoading}
			class="h-[85dvh] md:h-[80dvh]"
		/>
	</div>
</div>
