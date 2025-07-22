<script lang="ts">
	import * as Card from "$lib/components/ui/card";
	import * as Popover from "$lib/components/ui/popover";
	import { SheetState, useSheets } from "$lib/state/sheets.svelte";
	import {
		CalendarIcon,
		Check,
		ClipboardList,
		IndianRupee,
		RotateCcw,
	} from "@lucide/svelte";
	import { getLocalTimeZone, type DateValue } from "@internationalized/date";
	import { RangeCalendar } from "$lib/components/ui/range-calendar";
	import type { DateRange } from "bits-ui";
	import type { RenewalRow, SubscriptionRow } from "$lib/types/sheets";
	import { cn } from "$lib/utils/cn";
	import { buttonVariants } from "../ui/button";
	import { getStatus } from "$lib/utils/parsers";

	const sheetState = useSheets();

	function filterSheets({ sheetState, dateRange }: { sheetState: SheetState, dateRange?: DateRange }) {
		const inDateRange = (s: SubscriptionRow | RenewalRow) => {
			if (!dateRange) return true;

			let final = true;
			if (dateRange.start && dateRange.start.toDate(getLocalTimeZone()) >= new Date(s.timestamp)) {
				final = false;
			}
			if (dateRange.end && dateRange.end.toDate(getLocalTimeZone()) <= new Date(s.timestamp)) {
				final = false
			}
			return final
		}

		return {
			subscriptionSheet: sheetState.subscriptionSheet.filter(inDateRange),
			renewalSheet: sheetState.renewalSheet.filter(inDateRange),
		}
	}

	let dateRange = $state<DateRange>();
	let dateStartValue = $state<DateValue>();

	let totalSubscriptions = $derived(filterSheets({ sheetState, dateRange }).subscriptionSheet.length)
	let activeSubscrptions = $derived(filterSheets({ sheetState, dateRange }).subscriptionSheet.map(getStatus).filter(s => s === "Active").length)
	let totalRenewalValue = $derived(filterSheets({sheetState, dateRange}).renewalSheet.map(r => parseInt(r.price)).reduce((acc, curr) => acc + curr, 0))
	let totalValue = $derived(filterSheets({sheetState, dateRange}).subscriptionSheet.map(s => {
		const renewalCount = isNaN(parseInt(s.renewalCount)) ? 1 : parseInt(s.renewalCount) + 1;
		const price = parseInt(s.price)
		return price * renewalCount
	}).reduce((acc, curr) => acc + curr, 0))

	const currencyFormatter = Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format;
	const dateFormatter = Intl.DateTimeFormat("en-IN", {
		dateStyle: "medium",
	}).format;
</script>

<div class="grid gap-4 md:px-5 md:pb-5">
	<Card.Root class="bg-background p-2">
		<Card.Content class="p-0">
		<Popover.Root>
			<Popover.Trigger class={cn(buttonVariants({ variant: "outline" }), !dateRange && "text-muted-foreground")}>
				<CalendarIcon class="size-4 mr-2"/>
				{#if dateRange && dateRange.start}
					{#if dateRange.end}
						{dateFormatter(dateRange.start.toDate(getLocalTimeZone()))} - {dateFormatter(
							dateRange.end.toDate(getLocalTimeZone()),
						)}
					{:else}
						{dateFormatter(dateRange.start.toDate(getLocalTimeZone()))}
					{/if}
				{:else if dateStartValue}
					{dateFormatter(dateStartValue.toDate(getLocalTimeZone()))}
				{:else}
					Pick date range
				{/if}
			</Popover.Trigger>
			<Popover.Content class="w-auto p-0" align="start">
				<RangeCalendar
					bind:value={dateRange}
					onStartValueChange={(v) => (dateStartValue = v)}
					numberOfMonths={2}
				/>
			</Popover.Content>
		</Popover.Root>
		</Card.Content>
	</Card.Root>

	<div class="grid gap-4 md:grid-cols-4">
		<Card.Root class="bg-blue-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-blue-500 font-bold flex justify-between items-center"
				>
					<span>Total Values</span>
					<IndianRupee size="14" />
				</div>
				<p class="text-blue-800 text-3xl font-bold">{currencyFormatter(totalValue)}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="bg-purple-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-purple-500 font-bold flex justify-between items-center"
				>
					<span>Total Renewal Values</span>
					<RotateCcw size="14" />
				</div>
				<p class="text-purple-800 text-3xl font-bold">
					{currencyFormatter(totalRenewalValue)}
				</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="bg-orange-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-orange-500 font-bold flex justify-between items-center"
				>
					<span>Total Subscriptions</span>
					<ClipboardList size="14" />
				</div>
				<p class="text-orange-800 text-3xl font-bold">{totalSubscriptions}</p>
			</Card.Content>
		</Card.Root>
		<Card.Root class="bg-green-50">
			<Card.Content class="grid gap-2">
				<div
					class="text-sm text-green-500 font-bold flex justify-between items-center"
				>
					<span>Active Subscriptions</span>
					<Check size="14" />
				</div>
				<p class="text-green-800 text-3xl font-bold">{activeSubscrptions}</p>
			</Card.Content>
		</Card.Root>
	</div>
</div>
