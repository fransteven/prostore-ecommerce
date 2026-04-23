import { z } from "zod";

function formatError(error:any){
  if(error.name =='ZodError'){
    const fieldErrors = Object.keys(error?.errors).map((field)=>error.errors[field].message)
    return fieldErrors.join('. ')
  }
  else if(error.name === 'PrismaClientKnownRequestError' && error.code === 'P2002'){
    const field = error.meta?.target ? error.meta.target[0] : 'Field'
    return `${field.charAt(0).toUpperCase() + field.slice(1)} already exists`
  }
  else {
    return typeof error.message === 'string' ? error.message: JSON.stringify(error.message)
  }
}

const schema = z.object({ name: z.string().min(5, "Name too short") });
try {
  schema.parse({ name: "ab" });
} catch (e) {
  console.log("Zod Error:", formatError(e));
}

const prismaErr = new Error("Prisma error");
prismaErr.name = "PrismaClientKnownRequestError";
(prismaErr as any).code = "P2002";
(prismaErr as any).meta = { target: ["email"] };
console.log("Prisma Error:", formatError(prismaErr));

