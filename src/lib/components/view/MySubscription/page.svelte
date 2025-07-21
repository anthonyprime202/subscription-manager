<script lang="ts">
  import { Root as DialogRoot } from "$lib/components/ui/dialog";
  import DataTable from "$lib/components/element/DataTable.svelte";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { subscriptionColumns, type SubscriptionData } from "./columns";
	import type { SubscriptionRow } from "$lib/types/sheets";

  const sheetState = useSheets();

  function getStatus(row: SubscriptionRow): string {
    if (row.renewalStatus !== "Renewed" && row.planned2 !== "" && row.actual2 === "") {
      return "Created"
    } else if (row.renewalStatus === "Renewed" && row.planned2 !== "" && row.actual2 === "") {
      return "Renewal"
    } else if (row.planned3 === "" && row.actual2 !== "" ) {
      return "Rejected"
    } else if (row.planned3 !== "" && row.actual3 === "") {
      return "Approved"
    } else if (row.endDate !== "" && new Date(row.endDate) > new Date()) {
      return "Active"
    } else if (row.planned1 !== "" && row.actual1 === "") {
      return "Ended"
    } else if (row.planned1 !== "" && row.actual1 !== "" && row.renewalStatus !== "Renewed") {
      return "Expied"
    }
    return ""
  }

  let subscriptionData = $derived(
    sheetState.subscriptionSheet.map(s => ({
      companyName: s.companyName,
      endDate: new Date(s.endDate),
      price: s.price,
      subscriberName: s.subscriberName,
      subscriptionName: s.subscriptionName,
      subscriptionNo: s.subscriptionNo,
      status: getStatus(s)
    })) satisfies SubscriptionData[]
  )
  $effect(() => {
    console.log(subscriptionData)
  })
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
