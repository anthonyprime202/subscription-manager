<script lang="ts">
	import { Router } from "sv-router";
	import { Toaster } from "$lib/components/ui/sonner";
	import { TooltipProvider } from "$lib/components/ui/tooltip";
	import "$lib/router";
</script>

<TooltipProvider>
	<Router />
</TooltipProvider>
<Toaster richColors closeButton expand />
