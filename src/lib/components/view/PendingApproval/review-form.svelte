<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { getContext } from "svelte";
	import type { PendingApprovalData } from "./columns";
	import z from "zod";
	import { createForm } from "felte";
	import { validator } from "@felte/validator-zod";
	import { Label } from "$lib/components/ui/label";
	import * as Select from "$lib/components/ui/select";
	import { Textarea } from "$lib/components/ui/textarea";
	import { Button } from "$lib/components/ui/button";
	import { Tooltip } from "bits-ui";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import { postSheet } from "$lib/api";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { useAuth } from "$lib/state/auth.svelte";
	import { toast } from "svelte-sonner";

	const sheetState = useSheets();
	const authState = useAuth();

	const dialogState: {
		selectedRow: PendingApprovalData;
		open: boolean;
	} = getContext(Symbol.for("dialog-state"));

	const currencyFormatter = Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format;

	const dateFormatter = Intl.DateTimeFormat("en-IN", {
		dateStyle: "medium",
	}).format;

	const schema = z.object({
		approval: z.enum(
			["Approved", "Rejected"],
			"Please select valid approval option",
		),
		note: z.string(),
	});

	const { form, setTouched, data, errors, isSubmitting, reset } = createForm<
		z.infer<typeof schema>
	>({
		extra: [validator({ schema })],
		onSubmit: async (values) => {
			const currentRow = sheetState.subscriptionSheet.find(
				(s) => s.subscriptionNo === dialogState.selectedRow.subscriptionNo,
			)!;
			try {
				await postSheet({
					action: "update",
					rows: [
						{
							...currentRow,
							actual2: new Date().toISOString(),
							approvalStatus: values.approval,
						},
					],
				});
				await postSheet({
					action: "insert",
					rows: [
						{
							sheetName: "APPROVAL",
							timestamp: new Date().toISOString(),
							subscriptionNo: dialogState.selectedRow.subscriptionNo,
							approvedBy: authState.user?.name,
							approvalStatus: values.approval,
							note: values.note,
						},
					],
				});
				dialogState.open = false;
				sheetState.updateSubscription();
				sheetState.updateApproval();
				toast.success("Successfully updated status");
			} catch (e) {
				throw e;
			}
		},
		onError: (e: any) => {
			console.log(e);
			toast.error(e.message);
		},
	});
</script>
	<Dialog.Content class="overflow-auto" onclose={() => reset()}>
		<form use:form class="grid gap-4">
		<Dialog.Header>
			<Dialog.Title>Review Subscription Request</Dialog.Title>
			<Dialog.Description
				>Subscription <span class="font-semibold"
					>{dialogState.selectedRow.subscriptionNo}</span
				></Dialog.Description
			>
		</Dialog.Header>
		<div class="grid sm:grid-cols-2 gap-4">
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Company Name</p>
				<p>{dialogState.selectedRow.companyName}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">
					Subscriber Name
				</p>
				<p>{dialogState.selectedRow.subscriberName}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">
					Subscription Name
				</p>
				<p>{dialogState.selectedRow.subscriptionName}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Price</p>
				<p>{currencyFormatter(parseFloat(dialogState.selectedRow.price))}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Frequency</p>
				<p>{dialogState.selectedRow.frequence}</p>
			</div>
			<div class="grid gap-1">
				<p class="text-sm text-muted-foreground font-semibold">Requstend On</p>
				<p>{dateFormatter(dialogState.selectedRow.requestedOn)}</p>
			</div>
		</div>

		<div class="grid gap-1">
			<p class="text-sm text-muted-foreground font-semibold">
				Purpose of Subscription
			</p>
			<p class="bg-muted border rounded-md p-3 text-wrap">
				{dialogState.selectedRow.purpose}
			</p>
		</div>

		<div class="grid gap-2">
			<Label>Review Subscription</Label>
			<Select.Root
				name="approval"
				type="single"
				bind:value={$data.approval}
				onValueChange={() => setTouched("approval", true)}
			>
				<Tooltip.Root disabled={!$errors.approval}>
					<Tooltip.Trigger>
						<Select.Trigger
							aria-invalid={$errors.approval ? true : undefined}
							class="w-full"
							>{$data.approval
								? $data.approval
								: "Select review option"}</Select.Trigger
						>
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.approval}</Tooltip.Content>
				</Tooltip.Root>
				<Select.Content>
					<Select.Item value="Approved">Approve</Select.Item>
					<Select.Item value="Rejected">Reject</Select.Item>
				</Select.Content>
			</Select.Root>
		</div>
		<div class="grid gap-2">
			<Label for="note">Note (Optional)</Label>
			<Tooltip.Root disabled={!$errors.note}>
				<Tooltip.Trigger>
					<Textarea name="note" id="note" bind:value={$data.note} placeholder="Enter a note" />
				</Tooltip.Trigger>
			</Tooltip.Root>
		</div>
		<Dialog.Footer>
			<Button class="w-full" type="submit" onclick={() => console.log($data)} disabled={$isSubmitting}>
				{#if $isSubmitting}
					<Spinner /> Submitting
				{:else}
					Submit
				{/if}
			</Button>
		</Dialog.Footer>
</form>
	</Dialog.Content>
