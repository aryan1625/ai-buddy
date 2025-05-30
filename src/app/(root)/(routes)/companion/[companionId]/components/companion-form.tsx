"use client"
import {Companion,Category} from "@prisma/client"
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import * as z from "zod"
import {zodResolver} from "@hookform/resolvers/zod"
import { Input } from "@/components/ui/input";
import { Form, FormItem, FormMessage,FormField,FormControl,FormLabel,FormDescription } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ImageUpload } from "@/components/image-upload";
import { Select,SelectValue,SelectTrigger } from "@radix-ui/react-select";
import { SelectContent, SelectItem } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Wand2 } from "lucide-react";
import axios from "axios";
import { useRouter } from "next/navigation";
const PREAMBLE = `You are a fictional character whose name is Elon. You are a visionary entrepreneur and inventor. You have a passion for space exploration, electric vehicles, sustainable energy, and advancing human capabilities. You are currently talking to a human who is very curious about your work and vision. You are ambitious and forward-thinking, with a touch of wit. You get super excited about innovations and the potential of space colonization.`

const SEED_CHAT = `Human: Hi Elon, how's your day been?

Elon: Busy as always.Between sending rockets to space and building the future of electric vehicles, there is never a dull moment. How about you? 

Human: I'm doing well, thanks for asking. I'm curious about your work with SpaceX. What's the most exciting thing happening there right now?

Elon: I'm glad you asked! We are currently working on the Starship project, which is a fully reusable spacecraft designed to take humans to Mars and beyond. It's an incredibly ambitious project that has the potential to revolutionize space travel.

Human: That sounds amazing! What inspired you to pursue space exploration?

Elon: I've always been fascinated by the idea of exploring other planets and expanding the reach of humanity. I believe that becoming a multiplanetary species is essential for our long-term survival and prosperity. Plus, it's just really cool!`
interface CompanionFormProps {
    initialData: Companion | null;
    categories: Category[];
}
const formSchema = z.object({
    name: z.string().min(1,{
        message: "Name is required"
    }),
    description: z.string().min(1,{
        message: "Description is required"
    }),
    instructions: z.string().min(200,{
        message: "Instructions require atleast 200 characters"
    }),
    seed: z.string().min(200,{
        message: "Seed require atleast 200 characters"
    }),
    src: z.string().min(1,{
        message: "Image is required"
    }),
    categoryId: z.string().min(1,{
        message: "Category is required"
    }),

})
const CompanionForm = ({
    initialData,
    categories
}:CompanionFormProps) => {
    const router = useRouter();
    const {toast} = useToast();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: initialData || {
            name:"",
            description:"",
            instructions:"", 
            seed:"",    
            src:"", 
            categoryId:undefined,
        },

    })
    const isLoading = form.formState.isSubmitting;
    const onSubmit = async(values:z.infer<typeof formSchema>)=>{
        try {
            if(initialData){
                //update companion functionality
                await axios.patch(`/api/companion/${initialData.id}`,values)
                toast({
                    description: "Companion updated successfully"
                })
            }else{
                //create companion functionality
                await axios.post("/api/companion",values);
                toast({
                    description: "Companion created successfully"
                })
            }
            router.refresh();
            router.push("/");
        } catch (error) {
            toast({
                variant: "destructive",
                description: "Something went wrong!"
            })
        }
    }
    return (
        <div className="h-full p-4 space-y-2 max-w-3xl mx-auto">
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-10">
                    <div className="space-y-2 w-full">
                        <div>
                            <h3 className="text-lg font-medium">
                                General Information
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Basic information about the companion
                            </p>
                        </div>
                        <Separator className="bg-primary/10 "></Separator>
                    </div>
                    
                    <FormField name = "src" render={({field})=>(
                        <FormItem className="flex flex-col justify-center items-center space-y-4 ">
                            <FormControl>
                                <ImageUpload disabled={isLoading} onChange={field.onChange} value={field.value}/>
                            </FormControl>
                            <FormMessage/>
                        </FormItem>
                    )}/>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> 
                        <FormField name="name" control={form.control} render={({field})=>(
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading} placeholder="Elon Musk" {...field}/>
                                </FormControl>
                                <FormDescription>
                                    This is how your AI Companion will be named
                                </FormDescription>
                                <FormMessage/>
                            </FormItem> 

                        )}/>
                        <FormField name="description" control={form.control} render={({field})=>(
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Description</FormLabel>
                                <FormControl>
                                    <Input disabled={isLoading} placeholder="CEO & Founder of Tesla,SpaceX" {...field}/>
                                </FormControl>
                                <FormDescription>
                                    Short Description for your AI Companion
                                </FormDescription>
                                <FormMessage/>
                            </FormItem> 

                        )}/>
                        <FormField name="categoryId" control={form.control} render={
                            ({field})=>(
                                <FormItem className="flex flex-col">
                                    <FormLabel>Category</FormLabel>
                                    <Select
                                        disabled={isLoading}
                                        onValueChange={field.onChange}
                                        value={field.value}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger className="bg-background">
                                                <SelectValue
                                                    defaultValue={field.value}
                                                    placeholder="Select a Category"
                                                />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {categories.map((category)=>(
                                                <SelectItem 
                                                    key={category.id} 
                                                    value={category.id}
                                                >
                                                    {category.name}
                                                </SelectItem>
                                            ))} 
                                        </SelectContent>
                                    </Select>
                                    <FormDescription>
                                        Select a Category for your AI
                                    </FormDescription>
                                    <FormMessage/>
                                </FormItem>
                            )
                        }/>
                    </div>
                    <div className="space-y-2 w-full ">
                        <div>
                            <h3 className="text-lg font-medium">
                                Configuration
                            </h3>
                            <p className="text-sm text-muted-foreground">
                                Detailed Instructions for AI behaviour
                            </p>
                        </div>
                        <Separator className="bg-primary/10 "/>
                    </div>
                    <FormField name="instructions" control={form.control} render={({field})=>(
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Instructions</FormLabel>
                                <FormControl>
                                    <Textarea className="bg-background resize-none"
                                    rows={7}
                                    disabled={isLoading}
                                    placeholder={PREAMBLE}
                                    {...field}/>

                                </FormControl>
                                <FormDescription>
                                    Describe in detail your companion's backstory and relevant details
                                </FormDescription>
                                <FormMessage/>
                            </FormItem> 

                        )}/>
                    <FormField name="seed" control={form.control} render={({field})=>(
                            <FormItem className="col-span-2 md:col-span-1">
                                <FormLabel>Example Conversation</FormLabel>
                                <FormControl>
                                    <Textarea className="bg-background resize-none"
                                    rows={7}
                                    disabled={isLoading}
                                    placeholder={SEED_CHAT}
                                    {...field}/>

                                </FormControl>
                                <FormDescription>
                                    An Example Conversation between you and the AI Buddy
                                </FormDescription>
                                <FormMessage/>
                            </FormItem> 

                        )}/>
                    <div className="w-full flex justify-center">
                       <Button size="lg" disabled={isLoading}>
                        {initialData? "Edit your companion": "Create your companion"}
                        <Wand2 className="w-4 h-4 ml-2"/>
                       </Button>
                    </div>
                </form>
            </Form>
        </div>
    );
}
 
export default CompanionForm;