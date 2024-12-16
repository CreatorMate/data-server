import {z, ZodSchema} from "zod";
export function typeToZod<T>(type: T) {
    if (typeof type === "string") return z.string();
    if (typeof type === "number") return z.number();
    if (typeof type === "boolean") return z.boolean();
    if (Array.isArray(type)) return z.array(typeToZod(type[0]));
    if (typeof type === "object" && type !== null) {
        const shape: Record<string, ZodSchema> = {};
        for (const key in type) {
            // @ts-ignore
            shape[key] = createZodSchema(type[key]);
        }
        return z.object(shape);
    }
    throw new Error("Unsupported type");
}