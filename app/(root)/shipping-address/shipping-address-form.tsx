"use client";

import { shippingAddressDefaultValues } from "@/lib/constants";
import { shippingAddressSchema } from "@/lib/validators";
import { ShippingAddressType } from "@/types";
import { useRouter } from "next/navigation";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import z from "zod";
import { useTransition } from "react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader } from "lucide-react";

function ShippingAddressForm({ address }: { address: ShippingAddressType }) {
  const router = useRouter();

  const form = useForm<z.infer<typeof shippingAddressSchema>>({
    resolver: zodResolver(shippingAddressSchema),
    defaultValues: address || shippingAddressDefaultValues,
  });

  const [isPending, startTransition] = useTransition()

  const onSubmit = (values)=>{
    console.log(values)
    return
  }

  return <>
    <div className="max-w-md mx-auto space-y-4">
        <h1 className="h2-bold mt-4">Shipping Address</h1>
        <p className="text-sm text-muted-foreground">
            Please enter an address to ship to
        </p>
        <Form {...form}>
            <form method="post" className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                <div className="flex flex-col md:flex-row gap-5">
                    <FormField
                        control={form.control}
                        name='fullName'
                        render={({field}:{field:ControllerRenderProps<z.infer<typeof shippingAddressSchema>,'fullName'>})=>(
                            <FormItem className="w-full">
                                <FormLabel>Full Name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter full name" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                <FormField
                        control={form.control}
                        name='streetAddress'
                        render={({field}:{field:ControllerRenderProps<z.infer<typeof shippingAddressSchema>,'streetAddress'>})=>(
                            <FormItem className="w-full">
                                <FormLabel>Street Address</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your street address" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                <FormField
                        control={form.control}
                        name='city'
                        render={({field}:{field:ControllerRenderProps<z.infer<typeof shippingAddressSchema>,'city'>})=>(
                            <FormItem className="w-full">
                                <FormLabel>City</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your city" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                <FormField
                        control={form.control}
                        name='postalCode'
                        render={({field}:{field:ControllerRenderProps<z.infer<typeof shippingAddressSchema>,'postalCode'>})=>(
                            <FormItem className="w-full">
                                <FormLabel>Postal Code</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your postal code" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex flex-col md:flex-row gap-5">
                <FormField
                        control={form.control}
                        name='country'
                        render={({field}:{field:ControllerRenderProps<z.infer<typeof shippingAddressSchema>,'country'>})=>(
                            <FormItem className="w-full">
                                <FormLabel>Country</FormLabel>
                                <FormControl>
                                    <Input placeholder="Enter your country" {...field}/>
                                </FormControl>
                            </FormItem>
                        )}
                    />
                </div>
                <div className="flex gap-2">
                    <Button type="submit" disabled={isPending}>
                        {isPending ?(
                            <Loader className="w-4 h-4 animate-spin"/>
                        ):(
                            <ArrowRight className="w-4 h-4" />
                        )} {' '}
                        Continue
                    </Button>
                </div>
            </form>
        </Form>
    </div>
  </>
}

export default ShippingAddressForm;
