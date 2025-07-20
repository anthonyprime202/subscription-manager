<script lang="ts">
	import * as Dialog from "$lib/components/ui/dialog";
	import { getContext } from "svelte";
	import type { PendingPaymentsData } from "./columns";
	import z from "zod";
	import { createForm } from "felte";
	import { validator } from "@felte/validator-zod";
	import { Input } from "$lib/components/ui/input";
	import { Label } from "$lib/components/ui/label";
	import { Button } from "$lib/components/ui/button";
	import * as RadioGroup from "$lib/components/ui/radio-group";
	import * as Tooltip from "$lib/components/ui/tooltip";
	import { cn } from "$lib/utils/cn";
	import { CreditCard, Landmark, Smartphone } from "@lucide/svelte";
	import Spinner from "$lib/components/element/Spinner.svelte";
	import { calculateEndDate } from "$lib/utils/parsers";
	import { postSheet, uploadFile } from "$lib/api";
	import { useSheets } from "$lib/state/sheets.svelte";
	import { toast } from "svelte-sonner";

	const sheetState = useSheets();

	const dialogState: {
		selectedRow: PendingPaymentsData;
		open: boolean;
	} = getContext(Symbol.for("dialog-state"));

	const currencyFormatter = Intl.NumberFormat("en-IN", {
		style: "currency",
		currency: "INR",
	}).format;

	const schema = z.object({
		paymentMethod: z.enum(
			["Credit Card", "Bank Transfer", "UPI"],
			"Please select a valid payment method",
		),
		transactionId: z.string(),
		startDate: z.coerce.date("Please fill the start date"),
		endDate: z.coerce.date("Please fill the end date"),
		insuranceDocument: z.file().optional(),
	});

	const { form, setTouched, reset, setFields, data, errors, isSubmitting } =
		createForm<z.infer<typeof schema>>({
			extend: [validator({ schema })],
			onSubmit: async (values) => {
				try {
					let fileUrl = "";
					if (values.insuranceDocument) {
						fileUrl = await uploadFile(
							values.insuranceDocument,
							import.meta.env.VITE_ATTACHMENT_FOLDER,
						);
					}

					const currentRow = sheetState.subscriptionSheet.find(
						(s) => s.subscriptionNo === dialogState.selectedRow.subscriptionNo,
					)!;
					await postSheet({
						action: "update",
						rows: [
							{
								...currentRow,
								actual3: new Date().toISOString(),
								actual1: "",
								startDate: new Date(values.startDate).toDateString(),
								endDate: new Date(values.endDate).toISOString(),
							},
						],
					});
					await postSheet({
						action: "insert",
						rows: [
							{
								sheetName: "PAYMENT",
								timestamp: new Date().toISOString(),
								subscriptionNo: currentRow.subscriptionNo,
								paymentMode: values.paymentMethod,
								transactionId: values.transactionId || `TSI-${(sheetState.paymentSheet.length + 1).toString().padStart(4, "0")}`,
								startDate: new Date(values.startDate).toISOString(),
								insuranceDocument: fileUrl,
							},
						],
					});

					dialogState.open = false;
					sheetState.updateSubscription();
					sheetState.updatePayment();
					toast.success("Successfully updated payment");
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

<Dialog.Content onclose={() => reset()}>
	<form use:form class="grid gap-4">
		<Dialog.Header>
			<Dialog.Title>Payment for Subscription</Dialog.Title>
			<Dialog.Description
				>Subscription <span class="font-semibold"
					>{dialogState.selectedRow.subscriptionNo}</span
				></Dialog.Description
			>
		</Dialog.Header>
		<div class="grid sm:grid-cols-2 gap-4">
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
				<p>{dialogState.selectedRow.frequency}</p>
			</div>
		</div>

		<div class="grid md:grid-cols-2 gap-4">
			<div class="grid gap-2">
				<Label for="startDate">Start Date</Label>
				<Tooltip.Root disabled={!$errors.startDate}>
					<Tooltip.Trigger>
						<Input
							name="startDate"
							id="startDate"
							type="date"
							onchange={(val: any) =>
								setFields(
									"endDate",
									calculateEndDate(
										val.target.value,
										dialogState.selectedRow.frequency as any,
									) as any,
								)}
						/>
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.startDate}</Tooltip.Content>
				</Tooltip.Root>
			</div>
			<div class="grid gap-2">
				<Label for="endDate">End Date</Label>
				<Tooltip.Root disabled={!$errors.endDate}>
					<Tooltip.Trigger>
						<Input name="endDate" id="endDate" type="date" readonly />
					</Tooltip.Trigger>
					<Tooltip.Content>{$errors.endDate}</Tooltip.Content>
				</Tooltip.Root>
			</div>
		</div>

		<div class="grid gap-2">
			<Label>Payment Method</Label>
			<Tooltip.Root disabled={!$errors.paymentMethod}>
				<Tooltip.Trigger>
					<RadioGroup.Root
						name="paymentMethod"
						class="grid gap-2"
						value={$data.paymentMethod as string}
						onValueChange={(val) => {
							$data.paymentMethod = val as
								| "Credit Card"
								| "Bank Transfer"
								| "UPI";
							setTouched("paymentMethod", true);
						}}
					>
						<div class="w-full">
							<RadioGroup.Item
								value="Credit Card"
								id="credit-card"
								class="hidden"
							/>
							<Label
								class={cn(
									"border text-center px-3 py-2 flex gap-2 items-center text-sm rounded-sm",
									$data.paymentMethod === "Credit Card" &&
										"outline outline-primary bg-primary/5",
									$errors.paymentMethod && "outline outline-destructive",
								)}
								for="credit-card"
								><CreditCard size={18} /><span>Credit Card</span></Label
							>
						</div>
						<div class="w-full">
							<RadioGroup.Item
								value="Bank Transfer"
								id="bank-transfer"
								class="hidden"
							/>
							<Label
								class={cn(
									"border text-center px-3 py-2 flex gap-2 items-center text-sm rounded-sm",
									$data.paymentMethod === "Bank Transfer" &&
										"outline outline-primary bg-primary/5",
									$errors.paymentMethod && "outline outline-destructive",
								)}
								for="bank-transfer"
								><Landmark size={18} /><span>Bank Transfer</span></Label
							>
						</div>
						<div class="w-full">
							<RadioGroup.Item value="UPI" id="upi" class="hidden" />
							<Label
								class={cn(
									"border text-center px-3 py-2 flex gap-2 items-center text-sm rounded-sm",
									$data.paymentMethod === "UPI" &&
										"outline outline-primary bg-primary/5",
									$errors.paymentMethod && "outline outline-destructive",
								)}
								for="upi"><Smartphone size={18} /><span>UPI</span></Label
							>
						</div>
					</RadioGroup.Root>
				</Tooltip.Trigger>
				<Tooltip.Content>{$errors.paymentMethod}</Tooltip.Content>
			</Tooltip.Root>
		</div>
		<div class="grid gap-2">
			<Label for="transactionId">Transction ID</Label>
			<Input
				name="transactionId"
				id="transactionId"
				placeholder="Enter transaction ID, if available"
			/>
		</div>
		<div class="grid gap-2">
			<Label for="insuranceDocument">Upload Insurance Document</Label>
			<Tooltip.Root disabled={!$errors.insuranceDocument}>
				<Tooltip.Trigger>
					<Input
						name="insuranceDocument"
						id="insuranceDocument"
						placeholder="Upload insurance document"
						type="file"
					/>
				</Tooltip.Trigger>
				<Tooltip.Content>{$errors.insuranceDocument}</Tooltip.Content>
			</Tooltip.Root>
		</div>

		<Dialog.Footer>
			<Button class="w-full" type="submit" disabled={$isSubmitting}>
				{#if $isSubmitting}
					<Spinner /> Submitting
				{:else}
					Submit
				{/if}
			</Button>
		</Dialog.Footer>
	</form>
</Dialog.Content>
